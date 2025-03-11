import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const adminRoles = {
  SUPER_ADMIN: "super_admin",
  SCHOOL_ADMIN: "school_admin",
  TEACHER: "teacher",
};

export default function AdminLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password!");
      return;
    }

    try {
      // 📡 Отправляем запрос на сервер для проверки данных
      const response = await fetch("http://localhost:5000/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.role) {
        toast.success("Login successful!");

        // 🔀 Перенаправляем в зависимости от роли
        switch (data.role) {
          case adminRoles.SUPER_ADMIN:
            navigate("/admin/super");
            break;
          case adminRoles.SCHOOL_ADMIN:
            navigate(`/admin/school/${data.schoolId}`);
            break;
          case adminRoles.TEACHER:
            navigate(`/admin/teacher/${data.teacherId}`);
            break;
          default:
            toast.error("Unknown role. Contact support.");
        }
      } else {
        toast.error("Invalid credentials!");
      }
    } catch (error) {
      console.error("[AdminLoginScreen] ❌ Error:", error);
      toast.error("Server error. Try again later.");
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
