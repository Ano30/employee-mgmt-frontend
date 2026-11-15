import { useState } from "react";

export default function EmployeeTable({ employees, onPasswordChange }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  
  // NEW: State for the filter
  const [filterType, setFilterType] = useState("all");

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

  // NEW: Filter Logic
  const filteredEmployees = employees.filter((emp) => {
    if (filterType === "all") return true;
    if (filterType === "inside") return emp.latestClock?.isWithinGeofence === true;
    if (filterType === "outside") return emp.latestClock?.isWithinGeofence === false;
    if (filterType === "on_leave") return emp.isOnLeave === true;
    if (filterType === "supervisors") return emp.role === "supervisor";
    if (filterType === "hr") return emp.role === "hr";
    return true;
  });

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3 style={{ color: "var(--navy-blue)", margin: 0 }}>Company Directory</h3>
        
        {/* NEW: Filter Dropdown */}
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          style={{ width: "auto", marginBottom: 0, padding: "8px 15px", fontWeight: "bold", borderColor: "var(--navy-blue)" }}
        >
          <option value="all">Show: All Users</option>
          <option value="inside">?? Clocked Inside Location</option>
          <option value="outside">? Clocked Outside Location</option>
          <option value="on_leave">?? Currently On Leave</option>
          <option value="supervisors">?? Supervisors Only</option>
          <option value="hr">?? HR Only</option>
        </select>
      </div>
      
      {filteredEmployees.length === 0 ? (
        <p>No employees match this filter.</p>
      ) : (
        <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--navy-blue)" }}>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Latest Clock-in</th>
              <th>Location (GPS)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => {
              const isOnLeave = emp.isOnLeave;
              const latestClock = emp.latestClock;
              
              return (
                <tr key={emp.userId} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px", fontWeight: "bold" }}>{emp.name}</td>
                  <td style={{ padding: "10px" }}>{emp.role.toUpperCase()}</td>
                  <td style={{ padding: "10px", fontWeight: "bold", color: isOnLeave ? "orange" : "var(--green)" }}>
                    {isOnLeave ? "ON LEAVE" : "ACTIVE"}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {latestClock ? (
                      <span>
                        {latestClock.clockType.toUpperCase()} at {new Date(latestClock.clockedAt).toLocaleTimeString()}
                        <br/>
                        <span style={{ fontSize: "12px", color: latestClock.isWithinGeofence ? "var(--green)" : "red", fontWeight: "bold" }}>
                          {latestClock.isWithinGeofence ? "? Inside Geofence" : "? Outside Geofence"}
                        </span>
                      </span>
                    ) : "No clock-ins"}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {latestClock ? (
                      <a 
                        href={`https://www.google.com/maps?q=${latestClock.latitude},${latestClock.longitude}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: "var(--navy-blue)", fontWeight: "bold", textDecoration: "underline" }}
                      >
                        ?? View on Map
                      </a>
                    ) : "N/A"}
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

      {/* Password Reset Modal */}
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
