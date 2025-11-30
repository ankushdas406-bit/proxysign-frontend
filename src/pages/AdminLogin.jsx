import React, { useState } from 'react';
import { API_URL } from '../config.js';
import { useNavigate } from 'react-router-dom'; // <-- import

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // <-- hook for navigation

  const loginAdmin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) return setError(data.error || "Invalid credentials");

    // ✅ Store the token in localStorage
    localStorage.setItem('token', data.token);
    
    navigate("/admin-dashboard");

    alert("Login Successful");

    // ✅ Redirect to dashboard
    window.location.href = '/admin-dashboard';

  } catch (err) {
    setError("Network error. Backend may be offline.");
  }
};


  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Admin Login</h2>
      <form onSubmit={loginAdmin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: 'block', margin: '10px 0', padding: '10px', width: '100%' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: 'block', margin: '10px 0', padding: '10px', width: '100%' }}
        />
        <button type="submit" style={{ padding: '10px', width: '100%' }}>
          Login
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
