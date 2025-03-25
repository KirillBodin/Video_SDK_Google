import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const adminRoles = {
  SUPER_ADMIN: "superadmin",
  SCHOOL_ADMIN: "admin",
  TEACHER: "teacher",
};
const SERVER_URL = "http://localhost:5000";
console.log(process.env.REACT_APP_SERVER_URL);
console.log(window.process?.env?.REACT_APP_SERVER_URL);


export default function AdminLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", data.token);
        toast.success("Login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("schoolId", data.schoolId || "");
        localStorage.setItem("adminId", data.adminId || "");
        localStorage.setItem("teacherId", data.teacherId || "");
        localStorage.setItem("superAdminId", data.adminId || ""); 
        localStorage.setItem("name", data.name || "");
  
        let rolePath = "";
        let userId = "";
  
        if (data.role === "superadmin") {
          rolePath = "superadmin";
          userId = data.adminId; 
        } else if (data.role === "admin") {
          rolePath = "admin";
          userId = data.adminId; 
        } else if (data.role === "teacher") {
          rolePath = "teacher";
          userId = data.teacherId; 
        }
  
        navigate(`/${rolePath}/${userId}/${data.name}`);
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Server error.");
    }
  };
  
  
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      {/* "Карточка" формы */}
      <div className="w-full max-w-md p-8 bg-black rounded-lg shadow-lg">
        <h1 className="text-center text-3xl font-bold text-white mb-8">
          Admin Login
        </h1>

        {/* Поле Email */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-300">
            Email
          </label>
          <div className="relative">
            {/* Иконка слева */}
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.94 6.33L10 10.59l7.06-4.26A2 2 0 0016.93 4H3.07a2 2 0 00-.13 2.33zM18 8.48l-7.55 4.55a1 1 0 01-1 0L2 8.48V14a2 2 0 002 2h12a2 2 0 002-2V8.48z" />
              </svg>
            </span>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md text-white placeholder-gray-500 
                         bg-gray-800 border border-gray-700 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Поле Password */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-300">
            Password
          </label>
          <div className="relative">
            {/* Иконка слева */}
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 8a3 3 0 116 0v1h1a2 2 0 012 2v5a2 2 0 01-2 
                     2H4a2 2 0 01-2-2v-5a2 2 0 
                     012-2h1V8zm2-2a1 1 0 00-1 
                     1v1h2V7a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md text-white placeholder-gray-500 
                         bg-gray-800 border border-gray-700 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Кнопка Login */}
        <button
          onClick={handleLogin}
          className="w-full py-3 bg-blue-600 rounded-md font-semibold text-white 
                     hover:bg-blue-700 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
