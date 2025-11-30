import React, { useState, useEffect } from "react";
import { API_URL } from "../config";
import AdminLayout from "../components/AdminLayout.jsx";
import QRCodeGenerator from "../components/QRCodeGenerator";
import "../styles/ui.css";

export default function Lectures() {
  const [lectures, setLectures] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ===================== FETCH ALL LECTURES =====================
  const fetchLectures = async () => {
    try {
      const res = await fetch(`${API_URL}/api/lectures`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch lectures");

      setLectures(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  // DELETE LECTURE

  const deleteLecture = async (id) => {
  if (!window.confirm("Delete this lecture?")) return;

  try {
    const res = await fetch(`${API_URL}/api/lectures/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Delete failed");

    // Update UI instantly
    setLectures((prev) => prev.filter((lec) => lec._id !== id));
  } catch (err) {
    alert(err.message);
  }
};


  // ====================== CREATE LECTURE =======================
  const createLecture = async () => {
    setError("");

    if (!title.trim()) {
      setError("Lecture title is required");
      return;
    }

    let lat = null;
    let lon = null;


    // FIXED LOCATION HANDLING
    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 3000,
        })
      );

      lat = position.coords.latitude;
      lon = position.coords.longitude;
      console.log("Location success:", lat, lon);
    } catch (err) {
      console.warn("⚠ Location failed:", err.message);
      // We ALLOW lecture to be created WITHOUT location
    }

    // SEND TO BACKEND
    try {
      const res = await fetch(`${API_URL}/api/lectures`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          lat,
          lon,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create lecture");

      alert("Lecture Created Successfully!");
      setTitle("");
      fetchLectures();
    } catch (err) {
      console.error("Create lecture error:", err);
      setError(err.message);
    }
  };

  return (
    <AdminLayout>
      <h1 className="dashboard-title">Manage Lectures</h1>

      {/* CREATE LECTURE FORM */}
      <div className="panel neon-card" style={{ padding: "20px", marginBottom: "25px" }}>
        <h2>Create New Lecture</h2>

        <input
          type="text"
          placeholder="Lecture Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          style={{ width: "100%", marginTop: "10px" }}
        />

        <button onClick={createLecture} className="action-btn" style={{ marginTop: "15px" }}>
          Create Lecture
        </button>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </div>

      {/* ALL LECTURES LIST */}
      <div className="panel neon-card" style={{ padding: "20px" }}>
        <h2>All Lectures</h2>

        {lectures.length === 0 && <p>No lectures created yet.</p>}

        <div className="lecture-list">
          {lectures.map((lec) => (
            <div key={lec._id} className="lecture-item neon-card">
  <h3>{lec.title}</h3>

  <small>
    Created: {new Date(lec.createdAt).toLocaleString()}
  </small>

  <p>
    Location:{" "}
    {lec.lat && lec.lon ? `${lec.lat.toFixed(5)}, ${lec.lon.toFixed(5)}` : "Not Captured"}
  </p>

  <QRCodeGenerator value={`${window.location.origin}/attend?lecture=${lec._id}`} />

  {/* DELETE BUTTON */}
  <button
    className="action-btn delete-btn"
    style={{ background: "#ff4d4d", marginTop: "10px" }}
    onClick={() => deleteLecture(lec._id)}
  >
    Delete Lecture
  </button>
</div>

          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
