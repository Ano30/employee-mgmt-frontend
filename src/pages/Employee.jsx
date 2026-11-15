import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Employee() {
  const [clockType, setClockType] = useState("in");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [myLeaves, setMyLeaves] = useState([]);
  
  const [leaveForm, setLeaveForm] = useState({ leaveType: "annual", startDate: "", endDate: "", reason: "" });
  const [leaveMsg, setLeaveMsg] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token || user.role !== "employee") {
      navigate("/");
    } else {
      fetchMyLeaves();
    }
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const res = await axios.get("https://employee-mgmt-2ufc.onrender.com/api/employee/leaves", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockIn = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setStatus("Getting your GPS location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStatus("Sending location to server...");
        
        try {
          const res = await axios.post("https://employee-mgmt-2ufc.onrender.com/api/employee/clock", 
            { clockType, latitude, longitude },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (res.data.isWithinGeofence) {
            setStatus(`? Success! You clocked ${clockType} within the allowed area. (Distance: ${Math.round(res.data.distanceMeters)}m)`);
          } else {
            setStatus(`?? Warning: You are outside the work area! You are ${Math.round(res.data.distanceMeters)}m away. Logged anyway.`);
          }
        } catch (err) {
          setStatus(err.response?.data?.error || "Failed to clock in.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setStatus("Error getting location: " + error.message);
        setLoading(false);
      }
    );
  };

  const handleRequestLeave = async (e) => {
    e.preventDefault();
    setLeaveMsg("Submitting...");
    try {
      await axios.post("https://employee-mgmt-2ufc.onrender.com/api/employee/leaves", leaveForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveMsg("? Leave request submitted successfully!");
      setLeaveForm({ leaveType: "annual", startDate: "", endDate: "", reason: "" });
      fetchMyLeaves(); // Refresh table
    } catch (err) {
      setLeaveMsg("? Failed to submit leave request.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
        <h2>Employee Portal</h2>
        <button onClick={handleLogout} style={{ padding: "8px 15px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <h3>Welcome, {user.fullName}</h3>
        <p>Role: {user.role}</p>
      </div>

      {/* Clock In / Out */}
      <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", textAlign: "center" }}>
        <h3>Clock In / Out</h3>
        
        <select value={clockType} onChange={(e) => setClockType(e.target.value)} style={{ padding: "10px", fontSize: "16px", marginBottom: "20px", width: "100%" }}>
          <option value="in">Clock IN</option>
          <option value="out">Clock OUT</option>
        </select>

        <button onClick={handleClockIn} disabled={loading} style={{ width: "100%", padding: "15px", fontSize: "18px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Processing..." : "?? Get Location & Clock"}
        </button>

        {status && (
          <p style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px", color: status.includes("?") ? "green" : status.includes("??") ? "orange" : "black" }}>
            {status}
          </p>
        )}
      </div>

      {/* Leave Request Form */}
      <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h3>Request Leave</h3>
        {leaveMsg && <p style={{ color: leaveMsg.includes("?") ? "green" : "red" }}>{leaveMsg}</p>}
        
        <form onSubmit={handleRequestLeave} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <select value={leaveForm.leaveType} onChange={(e) => setLeaveForm({...leaveForm, leaveType: e.target.value})} style={{ padding: "8px" }}>
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
          
          <label style={{ fontSize: "14px", color: "#555" }}>Start Date:</label>
          <input type="date" required value={leaveForm.startDate} onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})} style={{ padding: "8px" }} />
          
          <label style={{ fontSize: "14px", color: "#555" }}>End Date:</label>
          <input type="date" required value={leaveForm.endDate} onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})} style={{ padding: "8px" }} />
          
          <input type="text" placeholder="Reason for leave" required value={leaveForm.reason} onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})} style={{ padding: "8px" }} />
          
          <button type="submit" style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Submit Leave Request
          </button>
        </form>
      </div>

      {/* Leave History */}
      <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h3>My Leave Requests</h3>
        {myLeaves.length === 0 ? (
          <p>You have no leave requests.</p>
        ) : (
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc" }}>
                <th>Type</th>
                <th>Dates</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.map((leave) => (
                <tr key={leave.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>{leave.leaveType}</td>
                  <td style={{ padding: "8px" }}>
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td style={{ 
                    padding: "8px", fontWeight: "bold", 
                    color: leave.status === "approved" ? "green" : leave.status === "rejected" ? "red" : leave.status === "recalled" ? "purple" : "orange" 
                  }}>
                    {leave.status.toUpperCase()}
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
