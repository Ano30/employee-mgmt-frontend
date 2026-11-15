import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("director");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("https://employee-mgmt-2ufc.onrender.com/api/auth/login", {
        email,
        password,
        role,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (role === "director") navigate("/director");
      else if (role === "hr") navigate("/hr");
      else if (role === "supervisor") navigate("/supervisor");
      else navigate("/employee");

    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", fontFamily: "Arial" }}>
      <h2>Employee Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label>Role: </label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", padding: "8px" }}>
            <option value="director">Director</option>
            <option value="hr">HR</option>
            <option value="supervisor">Supervisor</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        <div>
          <label>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "8px" }} />
        </div>

        <div>
          <label>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "8px" }} />
        </div>

        <button type="submit" style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Login
        </button>
      </form>
    </div>
  );
}
