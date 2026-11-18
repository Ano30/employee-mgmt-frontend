import { useState, useEffect } from "react";

export default function EmployeeTable({ employees, onPasswordChange, onEdit, onDelete, supervisors, locations, currentUserRole, currentUserId }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

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
      setMessage(err.response?.data?.error || "Failed to update password.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await onEdit(editUser.userId, editUser);
      setEditUser(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update user.");
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    if (searchTerm && !emp.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterRole !== "all" && emp.role !== filterRole) return false;
    if (filterLocation !== "all" && emp.location !== filterLocation) return false;
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
        <input type="text" placeholder="?? Search by Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: "1 1 200px", marginBottom: 0 }} />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ flex: "1 1 150px", marginBottom: 0 }}>
          <option value="all">All Statuses</option>
          <option value="on_leave">?? On Leave</option>
          <option value="inside">? Clocked In (Inside)</option>
          <option value="outside">? Clocked In (Outside)</option>
          <option value="not_clocked_in">? Not Clocked In</option>
        </select>
        <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ flex: "1 1 150px", marginBottom: 0 }}>
          <option value="all">All Locations</option>
          {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
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
        {filteredEmployees.length === 0 ? <p>No employees match your filters.</p> : (
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--navy-blue)", backgroundColor: "#f4f6f8" }}>
                <th style={{ padding: "10px" }}>Name</th>
                <th style={{ padding: "10px" }}>Role</th>
                <th style={{ padding: "10px" }}>Location</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Latest Clock-in</th>
                <th style={{ padding: "10px" }}>GPS Map</th>
                <th style={{ padding: "10px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => {
                const isProtected = emp.role === "developer" || emp.userId === currentUserId;
                
                return (
                  <tr key={emp.userId} style={{ borderBottom: "1px solid #eee", backgroundColor: isProtected ? "#fafafa" : "transparent" }}>
                    <td style={{ padding: "10px", fontWeight: "bold" }}>{emp.name}</td>
                    <td style={{ padding: "10px" }}>{emp.role.toUpperCase()}</td>
                    <td style={{ padding: "10px" }}>{emp.location}</td>
                    <td style={{ padding: "10px", fontWeight: "bold", color: emp.isOnLeave ? "orange" : "var(--green)" }}>
                      {emp.isOnLeave ? "ON LEAVE" : "ACTIVE"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {emp.latestClock ? (
                        <span>
                          {emp.latestClock.clockType.toUpperCase()} at {new Date(emp.latestClock.clockedAt).toLocaleTimeString()}
                          <br/>
                          <span style={{ fontSize: "12px", color: emp.latestClock.isWithinGeofence ? "var(--green)" : "red", fontWeight: "bold" }}>
                            {emp.latestClock.isWithinGeofence ? "? Inside" : "? Outside"}
                          </span>
                        </span>
                      ) : "No clock-ins"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {emp.latestClock ? (
                        <a href={`https://www.google.com/maps?q=${emp.latestClock.latitude},${emp.latestClock.longitude}`} target="_blank" rel="noreferrer" style={{ color: "var(--navy-blue)", fontWeight: "bold" }}>
                          ?? Map
                        </a>
                      ) : "N/A"}
                    </td>
                    <td style={{ padding: "10px", display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      {!isProtected ? (
                        <>
                          <button onClick={() => setSelectedUser(emp.userId)} className="btn-navy" style={{ padding: "5px 10px", fontSize: "12px" }}>
                            ?? Password
                          </button>
                          <button onClick={() => setEditUser(emp)} className="btn-primary" style={{ padding: "5px 10px", fontSize: "12px" }}>
                            ?? Edit
                          </button>
                          <button onClick={() => { if(window.confirm("Deactivate this user? They will no longer be able to log in.")) onDelete(emp.userId) }} className="btn-danger" style={{ padding: "5px 10px", fontSize: "12px" }}>
                            ??? Delete
                          </button>
                        </>
                      ) : (
                        <span style={{ color: "gray", fontSize: "12px", fontStyle: "italic" }}>Protected</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT USER MODAL - UPDATED FOR HR TO EDIT EVERYTHING */}
      {editUser && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: "400px", backgroundColor: "white", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ color: "var(--navy-blue)" }}>Edit User</h3>
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              
              <label style={{ fontSize: "12px", color: "#555", marginBottom: "-5px" }}>Full Name:</label>
              <input type="text" value={editUser.name} onChange={(e) => setEditUser({...editUser, name: e.target.value})} required />
              
              <label style={{ fontSize: "12px", color: "#555", marginBottom: "-5px" }}>Email Address:</label>
              <input type="email" value={editUser.email} onChange={(e) => setEditUser({...editUser, email: e.target.value})} required />
              
              {editUser.role === "employee" && (
                <>
                  <label style={{ fontSize: "12px", color: "#555", marginBottom: "-5px" }}>Assigned Supervisor:</label>
                  <select value={editUser.supervisorId || ""} onChange={(e) => setEditUser({...editUser, supervisorId: e.target.value})} required>
                    <option value="">Select Supervisor...</option>
                    {supervisors?.map(sup => <option key={sup.id} value={sup.id}>{sup.fullName}</option>)}
                  </select>
                  
                  <label style={{ fontSize: "12px", color: "#555", marginBottom: "-5px" }}>Assigned Work Location:</label>
                  <select value={editUser.locationId || ""} onChange={(e) => setEditUser({...editUser, locationId: e.target.value})} required>
                    <option value="">Select Location...</option>
                    {locations?.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                  </select>
                </>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditUser(null)} className="btn-danger" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {selectedUser && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="card" style={{ width: "300px", backgroundColor: "white" }}>
            <h3 style={{ color: "var(--navy-blue)" }}>Change Password</h3>
            {message && <p style={{ color: message.includes("success") ? "var(--green)" : "red" }}>{message}</p>}
            <form onSubmit={handleResetPassword}>
              <input type="text" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
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
