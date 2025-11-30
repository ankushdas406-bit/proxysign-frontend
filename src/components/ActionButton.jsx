import React from "react";

export default function ActionButton({ label, onClick }) {
  return (
    <button className="action-btn" onClick={onClick}>
      {label}
    </button>
  );
}
