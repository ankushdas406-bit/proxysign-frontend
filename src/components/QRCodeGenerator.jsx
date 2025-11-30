import React from "react";
import QRCode from "react-qr-code";

const QRCodeGenerator = ({ lecture }) => {
  if (!lecture) return <p>No lecture data</p>;

  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  const qrValue = `${frontendUrl}/attend?lecture=${lecture._id}`;
  
  return (
    <div>
      <QRCode value={qrValue} size={200} />
    </div>
  );
};

export default QRCodeGenerator;
