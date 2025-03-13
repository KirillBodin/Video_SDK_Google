import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const adminRoles = {
    SUPER_ADMIN: "superadmin",
    SCHOOL_ADMIN: "admin",
    TEACHER: "teacher",
  };
  

export default function AdminLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        toast.success("Login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
  
        if (data.schoolId) {
          localStorage.setItem("schoolId", data.schoolId);
        }
  
        if (data.teacherId) { // ✅ Сохраняем teacherId
          localStorage.setItem("teacherId", data.teacherId);
        }
  
        // 🔄 Перенаправление после входа
        if (data.role === "superadmin") {
          navigate("/admin/super");
        } else if (data.role === "admin") {
          navigate(`/admin/school/${data.schoolId}`);
        } else if (data.role === "teacher") {
          navigate(`/admin/teacher/${data.teacherId}`); // ✅ Теперь teacherId всегда будет корректным
        }
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Server error.");
    }
  };
  
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Login</h1>

      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-3 bg-gray-700 rounded-xl text-white w-80 text-center mb-4"
      />

      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="px-4 py-3 bg-gray-700 rounded-xl text-white w-80 text-center mb-6"
      />

      <button
        onClick={handleLogin}
        className="w-80 bg-blue-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
      >
        Login
      </button>
    </div>
  );
}
