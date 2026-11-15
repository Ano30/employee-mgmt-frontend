import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Developer from "./pages/Developer";
import Director from "./pages/Director";
import HR from "./pages/HR";
import Supervisor from "./pages/Supervisor";
import Employee from "./pages/Employee";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/developer" element={<Developer />} />
        <Route path="/director" element={<Director />} />
        <Route path="/hr" element={<HR />} />
        <Route path="/supervisor" element={<Supervisor />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
