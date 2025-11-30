import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin.jsx";    
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Teachers from "./pages/Teachers.jsx";
import Lectures from "./pages/Lectures.jsx";
import Attendance from "./pages/Attendance.jsx";
import StudentScanner from './pages/StudentScanner.jsx';
import Scanner from "./pages/Scanner.jsx";
import Attend from "./pages/Attend.jsx";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/lectures" element={<Lectures />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/scan" element={<StudentScanner />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/attend" element={<Attend />} />

        
        {/* Admin Login Route */}
        <Route path="/" element={<AdminLogin />} />

        {/* Admin Dashboard */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;
