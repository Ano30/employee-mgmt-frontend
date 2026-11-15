import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Developer() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ companyName: "", directorName: "", directorEmail: "", directorPassword: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token || user.role !== "developer") navigate("/");
    else fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const res = await axios.get("https://employee-mgmt-2ufc.onrender.com/api/developer/companies", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCompanies(res.data);
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://employee-mgmt-2ufc.onrender.com/api/developer/companies", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Company and Director created successfully!");
      setForm({ companyName: "", directorName: "", directorEmail: "", directorPassword: "" });
      fetchCompanies();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to create company");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "var(--navy-blue)", color: "white", padding: "15px", borderRadius: "8px" }}>
        <h2>Developer Portal - Welcome, {user.fullName}</h2>
        <button onClick={() => { localStorage.clear(); navigate("/"); }} className="btn-danger">Logout</button>
      </div>

      {message && <p style={{ color: message.includes("success") ? "var(--green)" : "red", fontWeight: "bold" }}>{message}</p>}

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ color: "var(--navy-blue)" }}>Create New Company</h3>
          <form onSubmit={handleAddCompany}>
            <input type="text" placeholder="Company Name" value={form.companyName} onChange={(e) => setForm({...form, companyName: e.target.value})} required />
            <input type="text" placeholder="Director Full Name" value={form.directorName} onChange={(e) => setForm({...form, directorName: e.target.value})} required />
            <input type="email" placeholder="Director Email" value={form.directorEmail} onChange={(e) => setForm({...form, directorEmail: e.target.value})} required />
            <input type="password" placeholder="Director Password" value={form.directorPassword} onChange={(e) => setForm({...form, directorPassword: e.target.value})} required />
            <button type="submit" className="btn-primary" style={{ width: "100%" }}>Create Company & Director</button>
          </form>
        </div>

        <div className="card" style={{ flex: 2 }}>
          <h3 style={{ color: "var(--navy-blue)" }}>Registered Companies</h3>
          {companies.length === 0 ? <p>No companies yet.</p> : (
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--navy-blue)" }}>
                  <th>Company Name</th>
                  <th>Director Name</th>
                  <th>Director Email</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px" }}>{c.name}</td>
                    <td style={{ padding: "10px" }}>{c.users[0]?.fullName || "N/A"}</td>
                    <td style={{ padding: "10px" }}>{c.users[0]?.email || "N/A"}</td>
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
