import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function HR() {
  const [attendance, setAttendance] = useState([]);
  const [locations, setLocations] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [locForm, setLocForm] = useState({ name: "", latitude: "", longitude: "", radiusMeters: 100 });
  const [empForm, setEmpForm] = useState({ fullName: "", email: "", password: "", employeeCode: "", department: "", supervisorId: "", locationId: "" });

  useEffect(() => {
    if (!token || user.role !== "hr") {
      navigate("/");
    } else {
      fetchAttendance();
      fetchDropdowns();
    }
  }, []);

  const fetchDropdowns = async () => {
    try {
      const locRes = await axios.get("https://employee-mgmt-2ufc.onrender.com/api/hr/locations", { headers: { Authorization: `Bearer ${token}` } });
      const supRes = await axios.get("https://employee-mgmt-2ufc.onrender.com/api/hr/supervisors", { headers: { Authorization: `Bearer ${token}` } });
      setLocations(locRes.data);
      setSupervisors(supRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get("https://employee-mgmt-2ufc.onrender.com/api/hr/attendance", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFindCoordinates = async () => {
    if (!locForm.name) {
      setMessage("Please type a location name first.");
      return;
    }
    setMessage("Searching for location...");
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${locForm.name}`);
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setLocForm({ ...locForm, latitude: lat, longitude: lon });
        setMessage("Coordinates found successfully!");
      } else {
        setMessage("Location not found. Try adding the city name.");
      }
    } catch (err) {
      setMessage("Error searching for location.");
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://employee-mgmt-2ufc.onrender.com/api/hr/locations", locForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Location added successfully!");
      setLocForm({ name: "", latitude: "", longitude: "", radiusMeters: 100 });
      fetchDropdowns();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add location");
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://employee-mgmt-2ufc.onrender.com/api/hr/employees", empForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Employee added successfully!");
      setEmpForm({ fullName: "", email: "", password: "", employeeCode: "", department: "", supervisorId: "", locationId: "" });
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add employee");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
        <h2>HR Dashboard - Welcome, {user.fullName}</h2>
        <button onClick={handleLogout} style={{ padding: "8px 15px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {message && <p style={{ color: message.includes("success") || message.includes("found") ? "green" : "red", fontWeight: "bold" }}>{message}</p>}

      <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
        
        <div style={{ flex: "1 1 300px", border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
          <h3>Add Work Location</h3>
          <form onSubmit={handleAddLocation} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="text" placeholder="Location Name (e.g. Eldoret)" value={locForm.name} onChange={(e) => setLocForm({...locForm, name: e.target.value})} required style={{ padding: "8px" }} />
            
            <button type="button" onClick={handleFindCoordinates} style={{ padding: "8px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
              ?? Find Coordinates Automatically
            </button>

            <input type="number" step="any" placeholder="Latitude" value={locForm.latitude} onChange={(e) => setLocForm({...locForm, latitude: e.target.value})} required style={{ padding: "8px" }} />
            <input type="number" step="any" placeholder="Longitude" value={locForm.longitude} onChange={(e) => setLocForm({...locForm, longitude: e.target.value})} required style={{ padding: "8px" }} />
            <input type="number" placeholder="Radius (meters)" value={locForm.radiusMeters} onChange={(e) => setLocForm({...locForm, radiusMeters: e.target.value})} required style={{ padding: "8px" }} />
            
            <button type="submit" style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Add Location</button>
          </form>
        </div>

        <div style={{ flex: "1 1 300px", border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
          <h3>Add New Employee</h3>
          <form onSubmit={handleAddEmployee} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="text" placeholder="Full Name" value={empForm.fullName} onChange={(e) => setEmpForm({...empForm, fullName: e.target.value})} required style={{ padding: "8px" }} />
            <input type="email" placeholder="Email" value={empForm.email} onChange={(e) => setEmpForm({...empForm, email: e.target.value})} required style={{ padding: "8px" }} />
            <input type="password" placeholder="Password" value={empForm.password} onChange={(e) => setEmpForm({...empForm, password: e.target.value})} required style={{ padding: "8px" }} />
            <input type="text" placeholder="Employee Code (e.g. EMP001)" value={empForm.employeeCode} onChange={(e) => setEmpForm({...empForm, employeeCode: e.target.value})} required style={{ padding: "8px" }} />
            <input type="text" placeholder="Department" value={empForm.department} onChange={(e) => setEmpForm({...empForm, department: e.target.value})} required style={{ padding: "8px" }} />
            
            <select value={empForm.supervisorId} onChange={(e) => setEmpForm({...empForm, supervisorId: e.target.value})} required style={{ padding: "8px" }}>
              <option value="">Select Supervisor...</option>
              {supervisors.map(sup => (
                <option key={sup.id} value={sup.id}>{sup.fullName}</option>
              ))}
            </select>

            <select value={empForm.locationId} onChange={(e) => setEmpForm({...empForm, locationId: e.target.value})} required style={{ padding: "8px" }}>
              <option value="">Select Work Location...</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            
            <button type="submit" style={{ padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Add Employee</button>
          </form>
        </div>

        <div style={{ flex: "1 1 100%", border: "1px solid #ccc", padding: "20px", borderRadius: "8px", marginTop: "20px" }}>
          <h3>Recent Clock-ins</h3>
          {attendance.length === 0 ? (
            <p>No clock-ins yet.</p>
          ) : (
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ccc" }}>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Time</th>
                  <th>Distance (m)</th>
                  <th>Inside Geofence?</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px" }}>{log.employee.user.fullName}</td>
                    <td style={{ padding: "8px" }}>{log.clockType}</td>
                    <td style={{ padding: "8px" }}>{new Date(log.clockedAt).toLocaleString()}</td>
                    <td style={{ padding: "8px" }}>{Math.round(log.distanceMeters)}m</td>
                    <td style={{ padding: "8px", color: log.isWithinGeofence ? "green" : "red", fontWeight: "bold" }}>
                      {log.isWithinGeofence ? "YES" : "NO"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
