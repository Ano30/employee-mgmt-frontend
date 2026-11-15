import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EmployeeTable from "../components/EmployeeTable";

export default function HR() {
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [message, setMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false); 
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Forms state
  const [locForm, setLocForm] = useState({ name: "", latitude: "", longitude: "", radiusMeters: 100 });
  const [empForm, setEmpForm] = useState({ fullName: "", email: "", password: "", employeeCode: "", department: "", supervisorId: "", locationId: "" });

  useEffect(() => {
    if (!token || user.role !== "hr") navigate("/");
    else {
      fetchEmployees();
      fetchDropdowns();
    }
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

  const handleFindCoordinates = async () => {
    if (!locForm.name) return setMessage("Please type a location name first.");
    setMessage("Searching...");
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${locForm.name}`);
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setLocForm({ ...locForm, latitude: lat, longitude: lon });
        setMessage("Coordinates found!");
      } else setMessage("Location not found.");
    } catch (err) {
      setMessage("Error finding location.");
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://employee-mgmt-2ufc.onrender.com/api/hr/locations", locForm, { headers: { Authorization: `Bearer ${token}` } });
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
      await axios.post("https://employee-mgmt-2ufc.onrender.com/api/hr/employees", empForm, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("Employee added successfully!");
      setEmpForm({ fullName: "", email: "", password: "", employeeCode: "", department: "", supervisorId: "", locationId: "" });
      fetchEmployees();
      setShowAddForm(false);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add employee");
    }
  };

  const handlePasswordChange = async (userId, newPassword) => {
    await axios.post("https://employee-mgmt-2ufc.onrender.com/api/director/change-password", 
      { userId, newPassword }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleEditUser = async (userId, updatedData) => {
    await axios.put(`https://employee-mgmt-2ufc.onrender.com/api/director/users/${userId}`, {
      fullName: updatedData.name,
      email: updatedData.email,
      role: updatedData.role,
      supervisorId: updatedData.supervisorId,
      locationId: updatedData.locationId
    }, { headers: { Authorization: `Bearer ${token}` } });
    fetchEmployees();
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`https://employee-mgmt-2ufc.onrender.com/api/director/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchEmployees();
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "var(--navy-blue)", color: "white", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <h2>HR Dashboard - {user.fullName}</h2>
        <button onClick={() => { localStorage.clear(); navigate("/"); }} className="btn-danger">Logout</button>
      </div>

      {message && <p style={{ color: message.includes("success") || message.includes("found") ? "var(--green)" : "red", fontWeight: "bold" }}>{message}</p>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3 style={{ color: "var(--navy-blue)", margin: 0 }}>Employee Directory</h3>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
          {showAddForm ? "Close Form" : "+ Add New Employee"}
        </button>
      </div>

      {showAddForm && (
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div className="card" style={{ flex: 1 }}>
            <h4 style={{ color: "var(--navy-blue)" }}>Add Work Location</h4>
            <form onSubmit={handleAddLocation} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Location Name" value={locForm.name} onChange={(e) => setLocForm({...locForm, name: e.target.value})} required />
              <button type="button" onClick={handleFindCoordinates} style={{ backgroundColor: "#ffc107", color: "black", fontWeight: "bold" }}>?? Find Coordinates</button>
              <input type="number" step="any" placeholder="Latitude" value={locForm.latitude} onChange={(e) => setLocForm({...locForm, latitude: e.target.value})} required />
              <input type="number" step="any" placeholder="Longitude" value={locForm.longitude} onChange={(e) => setLocForm({...locForm, longitude: e.target.value})} required />
              <input type="number" placeholder="Radius (m)" value={locForm.radiusMeters} onChange={(e) => setLocForm({...locForm, radiusMeters: e.target.value})} required />
              <button type="submit" className="btn-navy">Add Location</button>
            </form>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <h4 style={{ color: "var(--navy-blue)" }}>Add New Employee</h4>
            <form onSubmit={handleAddEmployee} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Full Name" value={empForm.fullName} onChange={(e) => setEmpForm({...empForm, fullName: e.target.value})} required />
              <input type="email" placeholder="Email" value={empForm.email} onChange={(e) => setEmpForm({...empForm, email: e.target.value})} required />
              <input type="password" placeholder="Password" value={empForm.password} onChange={(e) => setEmpForm({...empForm, password: e.target.value})} required />
              <input type="text" placeholder="Employee Code" value={empForm.employeeCode} onChange={(e) => setEmpForm({...empForm, employeeCode: e.target.value})} required />
              <input type="text" placeholder="Department" value={empForm.department} onChange={(e) => setEmpForm({...empForm, department: e.target.value})} required />
              <select value={empForm.supervisorId} onChange={(e) => setEmpForm({...empForm, supervisorId: e.target.value})} required>
                <option value="">Select Supervisor...</option>
                {supervisors.map(sup => <option key={sup.id} value={sup.id}>{sup.fullName}</option>)}
              </select>
              <select value={empForm.locationId} onChange={(e) => setEmpForm({...empForm, locationId: e.target.value})} required>
                <option value="">Select Work Location...</option>
                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
              <button type="submit" className="btn-primary">Add Employee</button>
            </form>
          </div>
        </div>
      )}

      {/* CRUCIAL UPDATE: Passing the role and actions */}
      <EmployeeTable 
        employees={employees} 
        onPasswordChange={handlePasswordChange} 
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        supervisors={supervisors}
        locations={locations}
        currentUserRole="hr"
        currentUserId={user.id}
      />
    </div>
  );
}

