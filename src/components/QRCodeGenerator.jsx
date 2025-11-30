import React from "react";
import QRCode from "react-qr-code";
const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
const qrValue = `${frontendUrl}/attend?lecture=${lecture._id}`;


export default function QRCodeGenerator({ value }) {
  return (
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      <QRCode 
        value={value} 
        size={128} 
        level="H" 
        bgColor="#ffffff" 
        fgColor="#000000" 
      />
    </div>
  );
}
