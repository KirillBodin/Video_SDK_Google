import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SuperAdminDashboard() {
  const [schoolAdmins, setSchoolAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const navigate = useNavigate();

  // 📡 Загружаем директоров
  useEffect(() => {
    fetch("http://localhost:5000/api/school-admins")
      .then((res) => res.json())
      .then((data) => setSchoolAdmins(data))
      .catch(() => toast.error("Failed to load school admins"));
  }, []);

  // ✅ Добавить директора
  const addSchoolAdmin = async () => {
    if (!email || !schoolName) {
      toast.error("Please enter email and school name");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/add-school-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, schoolName }),
      });

      if (res.ok) {
        toast.success("School admin added!");
        setEmail("");
        setSchoolName("");
        fetch("http://localhost:5000/api/school-admins")
          .then((res) => res.json())
          .then((data) => setSchoolAdmins(data));
      } else {
        toast.error("Failed to add school admin");
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  return (
    <div className="p-6 text-white bg-gray-900 h-screen">
      <h1 className="text-3xl font-bold mb-6">Super Admin Panel</h1>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="School Name"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          className="px-4 py-3 bg-gray-700 rounded-xl text-white w-80 text-center"
        />

        <input
          type="email"
          placeholder="Director Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 bg-gray-700 rounded-xl text-white w-80 text-center"
        />

        <button
          onClick={addSchoolAdmin}
          className="w-80 bg-blue-500 text-white px-4 py-3 rounded-xl"
        >
          Add School Admin
        </button>
      </div>

      <h2 className="text-xl font-bold mt-6">School Admins:</h2>
      <ul>
        {schoolAdmins.map((admin) => (
          <li key={admin.id} className="mt-2">
            {admin.schoolName} - {admin.email}{" "}
            <button
              className="text-blue-300"
              onClick={() => navigate(`/admin/school/${admin.id}`)}
            >
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
