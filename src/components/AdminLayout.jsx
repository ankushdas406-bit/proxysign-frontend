import React from "react";

export default function AdminLayout({ children }) {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <header style={{ marginBottom: "20px" }}>
        <h1>Admin Panel</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
