import React from "react";
import "../styles/ui.css";
import { Search } from "lucide-react"; // optional icon - install lucide-react

export default function Topbar({ title, sub }) {
  return (
    <div className="topbar">
      <div>
        <div className="h1">{title}</div>
        <div className="h2">{sub}</div>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div className="search">
          <Search size={16} />
          <input placeholder="Search (coming soon)" style={{background:"transparent",border:0,color:"inherit",outline:"none"}}/>
        </div>
        <div className="avatar">A</div>
      </div>
    </div>
  );
}
