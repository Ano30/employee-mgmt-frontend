import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Director() {
  const [onLeave, setOnLeave] = useState([]);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "hr" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token || user.role !== "director") {
      navigate("/");
    } else {
      fetchOnLeave();
    }
  }, []);

  const fetchOnLeave = async () => {
    try {
      const res = await axios.get("https://employee-mgmt-2ufc.onrender.com/api/director/on-leave", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOnLeave(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post("https://employee-mgmt-2ufc.onrender.com/api/director/users", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("User created successfully!");
      setForm({ fullName: "", email: "", password: "", role: "hr" });
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to create user");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
        <h2>Director Dashboard - Welcome, {user.fullName}</h2>
        <button onClick={handleLogout} style={{ padding: "8px 15px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      <div style={{ display: "flex", gap: "40px", marginTop: "20px" }}>
        
        <div style={{ flex: 1, border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
          <h3>Employees Currently on Leave</h3>
          {onLeave.length === 0 ? (
            <p>No one is currently on leave.</p>
          ) : (
            <ul>
              {onLeave.map((leave) => (
                <li key={leave.id} style={{ marginBottom: "10px" }}>
                  <strong>{leave.employee.user.fullName}</strong> - {leave.leaveType} (Until {new Date(leave.endDate).toLocaleDateString()})
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ flex: 1, border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
          <h3>Create HR or Supervisor Account</h3>
          {message && <p style={{ color: message.includes("success") ? "green" : "red" }}>{message}</p>}
          
          <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="text" placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} required style={{ padding: "8px" }} />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required style={{ padding: "8px" }} />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required style={{ padding: "8px" }} />
            
            <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} style={{ padding: "8px" }}>
              <option value="hr">HR Manager</option>
              <option value="supervisor">Supervisor</option>
            </select>

            <button type="submit" style={{ padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              Create User
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
