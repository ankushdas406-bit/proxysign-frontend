import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import { API_URL } from "../config.js";
import "../styles/ui.css";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const token = localStorage.getItem("token");

  // Fetch teachers
  const loadTeachers = async () => {
    const res = await fetch(`${API_URL}/api/teachers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setTeachers(data);
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  // Add teacher
  const addTeacher = async () => {
    if (!name || !email) return alert("Enter name & email");

    const res = await fetch(`${API_URL}/api/teachers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();
    if (res.ok) {
      setName("");
      setEmail("");
      loadTeachers();
    } else {
      alert(data.error);
    }
  };

  // Delete teacher
  const deleteTeacher = async (id) => {
    const res = await fetch(`${API_URL}/api/teachers/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) {
      setTeachers(teachers.filter((t) => t._id !== id));
    } else {
      alert(data.error);
    }
  };

  return (
    <AdminLayout>
      <h1 className="dashboard-title">Manage Teachers</h1>

      {/* ADD TEACHER CARD */}
      <div className="neon-card" style={{ marginBottom: "30px" }}>
        <h3>Add New Teacher</h3>

        <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
          <input
            className="input-field"
            placeholder="Teacher Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input-field"
            placeholder="Teacher Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="primary-btn" onClick={addTeacher}>
            Add
          </button>
        </div>
      </div>

      {/* TEACHER LIST */}
      <div className="neon-card">
        <h3>All Teachers</h3>

        <div className="list-container">
          {teachers.length === 0 ? (
            <p>No teachers found.</p>
          ) : (
            teachers.map((t) => (
              <div className="list-item" key={t._id}>
                <div>
                  <strong>{t.name}</strong>
                  <p style={{ opacity: 0.6 }}>{t.email}</p>
                </div>

                <button className="danger-btn" onClick={() => deleteTeacher(t._id)}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
