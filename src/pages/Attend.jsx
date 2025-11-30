import React, { useEffect, useState } from "react";
import { API_URL } from "../config.js";

export default function Attend() {
  const [message, setMessage] = useState("Processing attendance...");

  useEffect(() => {
    const url = new URL(window.location.href);
    const lectureId = url.searchParams.get("lecture");
    const stamp = url.searchParams.get("t");

    if (!lectureId) {
      setMessage("Invalid QR code.");
      return;
    }

    const submitAttendance = async () => {
      try {
        // Get student location
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej)
        );

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const name = prompt("Enter your name:");

        const res = await fetch(`${API_URL}/api/attendance/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentName: name,
            lectureId,
            lat,
            lon,
            timestamp: stamp,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setMessage("Attendance marked successfully!");
      } catch (err) {
        setMessage(err.message);
      }
    };

    submitAttendance();
  }, []);

  return (
    <div style={{ padding: 30, fontSize: 22, textAlign: "center" }}>
      {message}
    </div>
  );
}
