import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("director");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
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
      </div>
    </div>
  );
}
