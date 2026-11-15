import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EmployeeTable from "../components/EmployeeTable";

export default function Supervisor() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token || user.role !== "supervisor") navigate("/");
    else {
      fetchMyTeam();
      fetchLeaves();
    }
  }, []);

  const fetchMyTeam = async () => {
    try {
      const res = await axios.get("https://employee-mgmt-2ufc.onrender.com/api/supervisor/my-employees", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("https://employee-mgmt-2ufc.onrender.com/api/supervisor/leaves", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordChange = async (userId, newPassword) => {
    await axios.post("https://employee-mgmt-2ufc.onrender.com/api/supervisor/change-password", 
      { userId, newPassword }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleLeaveAction = async (id, action) => {
    setMessage("");
    try {
      if (action === "recall") {
        await axios.post(`https://employee-mgmt-2ufc.onrender.com/api/supervisor/leaves/${id}/recall`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage("Employee recalled successfully.");
      } else {
        await axios.patch(`https://employee-mgmt-2ufc.onrender.com/api/supervisor/leaves/${id}`, { status: action }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage(`Leave ${action} successfully.`);
      }
      fetchLeaves();
    } catch (err) {
      setMessage(err.response?.data?.error || "Action failed.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "var(--navy-blue)", color: "white", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <h2>Supervisor Dashboard - {user.fullName}</h2>
        <button onClick={() => { localStorage.clear(); navigate("/"); }} className="btn-danger">Logout</button>
      </div>

      {message && <p style={{ color: message.includes("success") ? "var(--green)" : "red", fontWeight: "bold" }}>{message}</p>}

      {/* 1. Assigned Employees Table (with Password Reset) */}
      <EmployeeTable employees={employees} onPasswordChange={handlePasswordChange} />

      {/* 2. Leave Requests Table */}
      <div className="card" style={{ marginTop: "30px" }}>
        <h3 style={{ color: "var(--navy-blue)" }}>Team Leave Requests</h3>
        {leaves.length === 0 ? (
          <p>No leave requests from your team.</p>
        ) : (
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--navy-blue)" }}>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{leave.employee.user.fullName}</td>
                  <td style={{ padding: "10px" }}>{leave.leaveType}</td>
                  <td style={{ padding: "10px" }}>
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "10px", fontWeight: "bold", color: leave.status === "approved" ? "var(--green)" : leave.status === "rejected" ? "red" : "orange" }}>
                    {leave.status.toUpperCase()}
                  </td>
                  <td style={{ padding: "10px", display: "flex", gap: "5px" }}>
                    {leave.status === "pending" && (
                      <>
                        <button onClick={() => handleLeaveAction(leave.id, "approved")} className="btn-primary" style={{ padding: "5px 10px" }}>Approve</button>
                        <button onClick={() => handleLeaveAction(leave.id, "rejected")} className="btn-danger" style={{ padding: "5px 10px" }}>Reject</button>
                      </>
                    )}
                    {leave.status === "approved" && (
                      <button onClick={() => handleLeaveAction(leave.id, "recall")} style={{ padding: "5px 10px", backgroundColor: "#ffc107", color: "black", fontWeight: "bold", border: "none", borderRadius: "4px", cursor: "pointer" }}>Recall</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
