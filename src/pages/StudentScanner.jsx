import React, { useRef, useState } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { API_URL } from '../config.js';
import '../styles/ui.css';

// You must include jsQR in index.html or install and import it.
// If you included <script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"></script> in index.html, jsQR will be global.
export default function StudentScanner(){
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [studentName, setStudentName] = useState('');
  let streamRef = null;
  let scanInterval = null;

  const startScan = async () => {
    setMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setScanning(true);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      scanInterval = setInterval(() => {
        if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) return;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // jsQR global
        const code = window.jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          stopScan();
          handleScanned(code.data);
        }
      }, 500);

    } catch (err) {
      setMessage('Camera access denied or not available.');
    }
  };

  const stopScan = () => {
    setScanning(false);
    if (scanInterval) { clearInterval(scanInterval); scanInterval = null; }
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject.getTracks() || []).forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleScanned = async (raw) => {
    setMessage('QR scanned — processing...');
    // QR may be JSON {"token":"..."} or a raw token string
    let parsed;
    try { parsed = JSON.parse(raw); } catch(e){ parsed = raw; }

    const token = parsed && parsed.token ? parsed.token : (typeof parsed === 'string' ? parsed : null);
    if (!token) return setMessage('Invalid QR payload.');

    // get geo
    if (!navigator.geolocation) return setMessage('Geolocation not supported.');
    setMessage('Requesting location permission...');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // send attendance
      try {
        const res = await fetch(`${API_URL}/api/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, name: studentName || 'Student', lat, lon })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Attendance failed');
        setMessage('Attendance recorded — ' + (data.message || 'OK'));
      } catch (err) {
        setMessage(err.message);
      }

    }, (err) => {
      setMessage('Location permission denied.');
    }, { timeout: 10000 });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Student Scanner</h2>
      <p className="muted">Enter your name (optional), then scan the QR shown by admin.</p>

      <div style={{ marginBottom: 12 }}>
        <input placeholder="Your name" value={studentName} onChange={(e)=>setStudentName(e.target.value)} style={{ padding:8 }} />
        <button onClick={startScan} style={{ marginLeft: 8 }} className="primary-btn">Start Camera</button>
        <button onClick={stopScan} style={{ marginLeft: 8 }} className="danger-btn">Stop</button>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <video ref={videoRef} style={{ width: 320, borderRadius: 12, background:'#000' }} autoPlay muted playsInline></video>
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ color: message.includes('failed') || message.includes('denied') ? 'salmon' : '#9beaff' }}>{message}</div>
      </div>
    </div>
  );
}
