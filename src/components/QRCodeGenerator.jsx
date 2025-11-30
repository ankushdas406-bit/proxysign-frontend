// frontend/src/components/QRCodeGenerator.jsx
import React from "react";
import QRCode from "react-qr-code";

const QRCodeGenerator = ({ lecture }) => {
  // defensive check
  if (!lecture || !lecture._id) {
    return <div className="p-2 text-sm text-red-600">QR not available (lecture missing)</div>;
  }

  // prefer env var VITE_FRONTEND_URL, fallback to current origin
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
  const qrValue = `${frontendUrl.replace(/\/$/, '')}/attend?lecture=${lecture._id}`;

  return (
    <div style={{ background: "#fff", padding: 8, display: "inline-block", borderRadius: 8 }}>
      <QRCode value={qrValue} size={180} />
      <div className="mt-2 text-xs break-all">{qrValue}</div>
    </div>
  );
};

export default QRCodeGenerator;
