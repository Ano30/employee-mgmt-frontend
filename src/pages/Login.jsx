import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("director");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("https://employee-mgmt-2ufc.onrender.com/api/auth/login", { 
        email, password, role 
      });
      
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (role === "developer") navigate("/developer");
      else if (role === "director") navigate("/director");
      else if (role === "hr") navigate("/hr");
      else if (role === "supervisor") navigate("/supervisor");
      else navigate("/employee");

    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a192f 0%, #112240 50%, #10b981 100%)",
      padding: "20px"
    }}>
      
      <div style={{ 
        width: "100%", 
        maxWidth: "400px", 
        backgroundColor: "rgba(255, 255, 255, 0.95)", 
        padding: "30px", 
        borderRadius: "16px", 
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)" 
      }}>
        <h2 style={{ textAlign: "center", color: "var(--navy-blue)", marginBottom: "20px" }}>Employee Login</h2>
        {error && <p style={{ color: "red", textAlign: "center", fontWeight: "bold" }}>{error}</p>}
        
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }}>
            <option value="developer">Developer</option>
            <option value="director">Director</option>
            <option value="hr">HR</option>
            <option value="supervisor">Supervisor</option>
            <option value="employee">Employee</option>
          </select>
          
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc" }} />
          
          <div style={{ position: "relative" }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: "100%", padding: "12px", paddingRight: "60px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "15px", top: "14px", cursor: "pointer", fontSize: "12px", color: "var(--navy-blue)", fontWeight: "bold" }}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </span>
          </div>

          <button type="submit" className="btn-navy" style={{ width: "100%", marginTop: "10px", padding: "12px", fontSize: "16px" }}>Login</button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px" }}>
          <span style={{ color: "var(--navy-blue)", cursor: "pointer", textDecoration: "underline", fontWeight: "bold" }} onClick={() => setShowTerms(true)}>
            Terms & Conditions
          </span>
        </div>
      </div>

      {/* CONTACT INFO & COPYRIGHT FOOTER */}
      <div style={{ marginTop: "30px", textAlign: "center", fontSize: "14px", color: "#ffffff" }}>
        <p style={{ margin: "5px 0" }}>?? mbandaarnold23@gmail.com</p>
        <p style={{ margin: "5px 0" }}>?? 0725348277</p>
        <p style={{ marginTop: "15px", fontSize: "12px", color: "#8892b0" }}>
          ? {new Date().getFullYear()} Employee Management System. All rights reserved.
        </p>
      </div>

      {showTerms && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "500px", maxHeight: "80vh", overflowY: "auto", backgroundColor: "white", padding: "25px", borderRadius: "12px" }}>
            <h3 style={{ color: "var(--navy-blue)", marginTop: 0 }}>Terms and Conditions</h3>
            <hr style={{ margin: "15px 0", border: "none", borderTop: "1px solid #eee" }}/>
            <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
              Welcome to the Employee Management System. By logging in, you agree to the following terms:
            </p>
            <ul style={{ fontSize: "14px", lineHeight: "1.6", color: "#333", paddingLeft: "20px" }}>
              <li>You will not share your login credentials with anyone.</li>
              <li>GPS location will be recorded during clock-in for attendance verification.</li>
              <li>False clock-ins or manipulating location data will result in disciplinary action.</li>
              <li>Personal data is strictly used for HR and company management purposes.</li>
              <li>Leave requests must be submitted in advance and approved by your supervisor.</li>
            </ul>
            <button onClick={() => setShowTerms(false)} className="btn-navy" style={{ width: "100%", marginTop: "20px", padding: "12px" }}>
              Close and I Agree
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
