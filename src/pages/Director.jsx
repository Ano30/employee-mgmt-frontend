import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EmployeeTable from "../components/EmployeeTable";

export default function Director() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "hr" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token || user.role !== "director") navigate("/");
    else fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("https://employee-mgmt-2ufc.onrender.com/api/director/all-employees", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
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
      fetchEmployees();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to create user");
    }
  };

  const handlePasswordChange = async (userId, newPassword) => {
    await axios.post("https://employee-mgmt-2ufc.onrender.com/api/director/change-password", 
      { userId, newPassword }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "var(--navy-blue)", color: "white", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <h2>Director Dashboard - {user.fullName}</h2>
        <button onClick={() => { localStorage.clear(); navigate("/"); }} className="btn-danger">Logout</button>
      </div>

      {message && <p style={{ color: message.includes("success") ? "var(--green)" : "red", fontWeight: "bold" }}>{message}</p>}

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ color: "var(--navy-blue)" }}>Create HR Account</h3>
          <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="text" placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} required />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required />
            <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
              <option value="hr">HR Manager</option>
              <option value="supervisor">Supervisor</option>
            </select>
            <button type="submit" className="btn-primary">Create User</button>
          </form>
        </div>
      </div>

      <EmployeeTable employees={employees} onPasswordChange={handlePasswordChange} />
    </div>
  );
}
