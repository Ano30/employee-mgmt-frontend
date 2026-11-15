import { useState, useEffect } from "react";

export default function EmployeeTable({ employees, onPasswordChange }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  // Extract unique locations for the dropdown
  const [uniqueLocations, setUniqueLocations] = useState([]);
  useEffect(() => {
    const locs = [...new Set(employees.map(emp => emp.location))];
    setUniqueLocations(locs.filter(loc => loc !== "N/A"));
  }, [employees]);

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

  // Advanced Filter Logic
  const filteredEmployees = employees.filter((emp) => {
    // 1. Search by Name
    if (searchTerm && !emp.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // 2. Filter by Role
    if (filterRole !== "all" && emp.role !== filterRole) return false;
    
    // 3. Filter by Location
    if (filterLocation !== "all" && emp.location !== filterLocation) return false;

    // 4. Filter by Status
    if (filterStatus !== "all") {
      const hasClockedIn = emp.latestClock && emp.latestClock.clockType === "in";
      
      if (filterStatus === "on_leave") return emp.isOnLeave === true;
      if (filterStatus === "inside") return !emp.isOnLeave && hasClockedIn && emp.latestClock.isWithinGeofence === true;
      if (filterStatus === "outside") return !emp.isOnLeave && hasClockedIn && emp.latestClock.isWithinGeofence === false;
      if (filterStatus === "not_clocked_in") return !emp.isOnLeave && !hasClockedIn;
    }

    return true;
  });

  return (
    <div className="card">
      <h3 style={{ color: "var(--navy-blue)", marginBottom: "15px" }}>Company Directory</h3>
      
      {/* FILTER BAR */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
        
        <input 
          type="text" 
          placeholder="?? Search by Name..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 200px", marginBottom: 0 }}
        />

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ flex: "1 1 150px", marginBottom: 0 }}>
          <option value="all">All Statuses</option>
          <option value="on_leave">?? On Leave</option>
          <option value="inside">? Clocked In (Inside)</option>
          <option value="outside">? Clocked In (Outside)</option>
          <option value="not_clocked_in">? Not Clocked In</option>
        </select>

        <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ flex: "1 1 150px", marginBottom: 0 }}>
          <option value="all">All Locations</option>
          {uniqueLocations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ flex: "1 1 150px", marginBottom: 0 }}>
          <option value="all">All Roles</option>
          <option value="employee">Employees</option>
          <option value="supervisor">Supervisors</option>
          <option value="hr">HR Managers</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={{ overflowX: "auto" }}>
        {filteredEmployees.length === 0 ? (
          <p>No employees match your filters.</p>
        ) : (
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--navy-blue)", backgroundColor: "#f4f6f8" }}>
                <th style={{ padding: "10px" }}>Name</th>
                <th style={{ padding: "10px" }}>Role</th>
                <th style={{ padding: "10px" }}>Assigned Location</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Latest Clock-in</th>
                <th style={{ padding: "10px" }}>GPS Map</th>
                <th style={{ padding: "10px" }}>Actions</th>
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
                    <td style={{ padding: "10px" }}>{emp.location}</td>
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
                          ?? View Map
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
      </div>

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
