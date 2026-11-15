import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Supervisor() {
  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token || user.role !== "supervisor") {
      navigate("/");
    } else {
      fetchLeaves();
    }
  }, []);

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

  const handleAction = async (id, action) => {
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
        <h2>Supervisor Dashboard - Welcome, {user.fullName}</h2>
        <button onClick={handleLogout} style={{ padding: "8px 15px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {message && <p style={{ color: message.includes("success") ? "green" : "red", fontWeight: "bold", marginTop: "10px" }}>{message}</p>}

      <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
        <h3>Team Leave Requests</h3>
        {leaves.length === 0 ? (
          <p>No leave requests from your team.</p>
        ) : (
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc" }}>
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
                  <td style={{ padding: "8px" }}>{leave.employee.user.fullName}</td>
                  <td style={{ padding: "8px" }}>{leave.leaveType}</td>
                  <td style={{ padding: "8px" }}>
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "8px", fontWeight: "bold", color: leave.status === "approved" ? "green" : leave.status === "rejected" ? "red" : "orange" }}>
                    {leave.status.toUpperCase()}
                  </td>
                  <td style={{ padding: "8px", display: "flex", gap: "5px" }}>
                    {leave.status === "pending" && (
                      <>
                        <button onClick={() => handleAction(leave.id, "approved")} style={{ padding: "5px 10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}>Approve</button>
                        <button onClick={() => handleAction(leave.id, "rejected")} style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}>Reject</button>
                      </>
                    )}
                    {leave.status === "approved" && (
                      <button onClick={() => handleAction(leave.id, "recall")} style={{ padding: "5px 10px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "3px", cursor: "pointer" }}>Recall</button>
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
