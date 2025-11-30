import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import { API_URL } from "../config.js";
import "../styles/ui.css";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [filter, setFilter] = useState("all");
  const token = localStorage.getItem("token");

  // Fetch attendance
  const loadAttendance = async () => {
    const res = await fetch(`${API_URL}/api/attendance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setRecords(data);
  };

  // Fetch lectures for filtering
  const loadLectures = async () => {
    const res = await fetch(`${API_URL}/api/lectures`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setLectures(data);
  };

  useEffect(() => {
    loadAttendance();
    loadLectures();
  }, []);

  const filteredRecords =
    filter === "all"
      ? records
      : records.filter((r) => r.lectureId === filter);

  return (
    <AdminLayout>
      <h1 className="dashboard-title">Attendance Report</h1>

      <div className="neon-card" style={{ marginBottom: "20px" }}>
        <h3>Filter by Lecture</h3>
        <select
          className="input-field"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: "250px", marginTop: "10px" }}
        >
          <option value="all">All Lectures</option>
          {lectures.map((lec) => (
            <option key={lec._id} value={lec._id}>
              {lec.title}
            </option>
          ))}
        </select>
      </div>

      <div className="neon-card">
        <h3>Attendance Records</h3>

        {filteredRecords.length === 0 ? (
          <p>No records found.</p>
        ) : (
          <div className="lecture-list">
            {filteredRecords.map((r) => (
              <div key={r._id} className="list-item neon-subcard">
                <div>
                  <strong>{r.studentName}</strong>
                  <p style={{ opacity: 0.7 }}>
                    {new Date(r.time).toLocaleString()}
                  </p>
                  <p style={{ opacity: 0.7 }}>
                    Lecture: {r.lectureId}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
