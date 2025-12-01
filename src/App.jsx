import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Teachers from "./pages/Teachers.jsx";
import Lectures from "./pages/Lectures.jsx";
import Attendance from "./pages/Attendance.jsx";
import Attend from "./pages/Attend.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN ROUTE */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* DASHBOARD ROUTES */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/lectures" element={<Lectures />} />
        <Route path="/attendance" element={<Attendance />} />

        {/* STUDENT ATTEND PAGE */}
        <Route path="/attend" element={<Attend />} />

        {/* DEFAULT ROUTE = LOGIN */}
        <Route path="/" element={<AdminLogin />} />

      </Routes>
    </BrowserRouter>
  );
}
