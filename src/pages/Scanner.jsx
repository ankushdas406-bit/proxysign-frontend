import React, { useRef, useState } from "react";
import jsQR from "jsqr/dist/jsQR.js";
import { API_URL } from "../config.js";

export default function Scanner() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [message, setMessage] = useState("");
  const [studentName, setStudentName] = useState("");

  // Start camera
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
    scanLoop();
  };

  // Process frames
  const scanLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const qr = jsQR(imageData.data, canvas.width, canvas.height);
        if (qr) {
          handlePayload(qr.data);
        }
      }
      requestAnimationFrame(scan);
    };

    scan();
  };

  // Handle scanned QR data
  const handlePayload = async (raw) => {
    try {
      const payload = JSON.parse(raw);
      if (!payload.lectureId) return setMessage("Invalid QR");

      // Get GPS
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej)
      );

      const studentLat = pos.coords.latitude;
      const studentLon = pos.coords.longitude;

      // Submit attendance
      const res = await fetch(`${API_URL}/api/attendance/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          lectureId: payload.lectureId,
          lat: studentLat,
          lon: studentLon,
          timestamp: payload.secureStamp,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("Attendance marked successfully!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>QR Attendance Scanner</h1>

      <input
        placeholder="Enter your name"
        className="input-field"
        onChange={(e) => setStudentName(e.target.value)}
        style={{ marginBottom: "20px" }}
      />

      <button className="primary-btn" onClick={startCamera}>
        Start Scanner
      </button>

      <div style={{ marginTop: "20px" }}>
        <video ref={videoRef} style={{ width: "100%", borderRadius: "10px" }} />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      <p style={{ marginTop: "20px", fontSize: "18px" }}>{message}</p>
    </div>
  );
}
