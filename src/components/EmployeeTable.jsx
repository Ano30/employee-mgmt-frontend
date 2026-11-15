import { useState } from "react";

export default function EmployeeTable({ employees, onPasswordChange }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await onPasswordChange(selectedUser, newPassword);
      setMessage("Password updated successfully!");
      setNewPassword("");
      setTimeout(() => { setSelectedUser(null); setMessage(""); }, 2000);
    } catch (err) {
      setMessage("Failed to update password.");
    }
  };

  return (
    <div className="card">
      <h3 style={{ color: "var(--navy-blue)" }}>Employee Directory</h3>
      
      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--navy-blue)" }}>
              <th>Name</th>
              <th>Role</th>
              <th>Location</th>
              <th>Status</th>
              <th>Latest Clock-in</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const isOnLeave = emp.leaves.length > 0;
              const latestClock = emp.attendance[0];
              
              return (
                <tr key={emp.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px", fontWeight: "bold" }}>{emp.user.fullName}</td>
                  <td style={{ padding: "10px" }}>{emp.user.role.toUpperCase()}</td>
                  <td style={{ padding: "10px" }}>{emp.location?.name || "N/A"}</td>
                  <td style={{ padding: "10px", fontWeight: "bold", color: isOnLeave ? "orange" : "var(--green)" }}>
                    {isOnLeave ? "ON LEAVE" : "ACTIVE"}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {latestClock ? (
                      <span>
                        {latestClock.clockType.toUpperCase()} at {new Date(latestClock.clockedAt).toLocaleTimeString()}
                      </span>
                    ) : "No clock-ins"}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <button 
                      onClick={() => setSelectedUser(emp.userId)}
                      className="btn-navy" 
                      style={{ padding: "5px 10px", fontSize: "12px" }}
                    >
                      Change Password
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {selectedUser && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: "300px", backgroundColor: "white" }}>
            <h3 style={{ color: "var(--navy-blue)" }}>Change Password</h3>
            {message && <p style={{ color: message.includes("success") ? "var(--green)" : "red" }}>{message}</p>}
            <form onSubmit={handleResetPassword}>
              <input 
                type="text" 
                placeholder="New Password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save</button>
                <button type="button" onClick={() => setSelectedUser(null)} className="btn-danger" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
