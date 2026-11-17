import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("director");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false); // State for Terms Modal
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
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      
      <div className="card" style={{ width: "100%", maxWidth: "400px", paddingBottom: "20px" }}>
        <h2 style={{ textAlign: "center", color: "var(--navy-blue)" }}>Employee Login</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="developer">Developer</option>
            <option value="director">Director</option>
            <option value="hr">HR</option>
            <option value="supervisor">Supervisor</option>
            <option value="employee">Employee</option>
          </select>
          
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          
          <div style={{ position: "relative" }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ marginBottom: 0, paddingRight: "60px" }}
            />
            <span 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "10px", top: "12px", cursor: "pointer", fontSize: "12px", color: "var(--navy-blue)", fontWeight: "bold" }}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </span>
          </div>

          <button type="submit" className="btn-navy" style={{ width: "100%", marginTop: "10px" }}>Login</button>
        </form>

        {/* TERMS & CONDITIONS TOGGLE */}
        <div style={{ textAlign: "center", marginTop: "15px", fontSize: "12px" }}>
          <span style={{ color: "var(--navy-blue)", cursor: "pointer", textDecoration: "underline" }} onClick={() => setShowTerms(true)}>
            Terms & Conditions
          </span>
        </div>
      </div>

      {/* FOOTER WITH CONTACT INFO */}
      <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#555" }}>
        <p style={{ margin: "5px 0" }}>?? support@yourcompany.com</p>
        <p style={{ margin: "5px 0" }}>?? +254 700 000 000</p>
      </div>

      {/* TERMS MODAL POPUP */}
      {showTerms && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px", maxHeight: "80vh", overflowY: "auto", backgroundColor: "white" }}>
            <h3 style={{ color: "var(--navy-blue)" }}>Terms and Conditions</h3>
            <hr style={{ margin: "10px 0" }}/>
            <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
              Welcome to the Employee Management System. By logging in, you agree to the following terms:
            </p>
            <ul style={{ fontSize: "14px", lineHeight: "1.6", paddingLeft: "20px" }}>
              <li>You will not share your login credentials with anyone.</li>
              <li>GPS location will be recorded during clock-in for attendance verification.</li>
              <li>False clock-ins or manipulating location data will result in disciplinary action.</li>
              <li>Personal data is strictly used for HR and company management purposes.</li>
              <li>Leave requests must be submitted in advance and approved by your supervisor.</li>
            </ul>
            <button onClick={() => setShowTerms(false)} className="btn-navy" style={{ width: "100%", marginTop: "20px" }}>
              Close and I Agree
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
