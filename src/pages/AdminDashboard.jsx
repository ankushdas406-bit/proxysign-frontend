import React, { useEffect, useState } from "react";
import { API_URL } from "../config.js";
import AdminLayout from "../components/AdminLayout.jsx";
import QRCodeGenerator from "../components/QRCodeGenerator.jsx";
import { useNavigate } from "react-router-dom";
import "../styles/ui.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("You must log in first");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch stats");

        setStats(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStats();
  }, [token]);

  if (error)
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;

  return (
    <AdminLayout>
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* ===================== STATS CARDS ====================== */}
      <div className="stats-grid">
        <div className="stat-card neon-card">
          <h2>{stats.totalTeachers || 0}</h2>
          <p>Total Teachers</p>
        </div>

        <div className="stat-card neon-card">
          <h2>{stats.totalLectures || 0}</h2>
          <p>Total Lectures</p>
        </div>

        <div className="stat-card neon-card">
          <h2>{stats.totalAttendance || 0}</h2>
          <p>Total Attendance Records</p>
        </div>
      </div>

      {/* ==================== QR CODE AREA ====================== */}
      <div className="qr-section neon-card">
        <h3>Today's Lecture QR Code</h3>
        <QRCodeGenerator value="sample-lecture-id-123" />
      </div>

      <div className="quick-actions-grid">

  <div className="quick-card" onClick={() => navigate("/teachers")}>
    <h3>👨‍🏫 Manage Teachers</h3>
    <p>Add, delete & update teachers</p>
  </div>

  <div className="quick-card" onClick={() => navigate("/lectures")}>
    <h3>📚 Manage Lectures</h3>
    <p>Create and manage lecture schedules</p>
  </div>

  <div className="quick-card" onClick={() => navigate("/attendance")}>
    <h3>📊 Attendance Report</h3>
    <p>View and download attendance data</p>
  </div>

</div>

    </AdminLayout>
  );
}
