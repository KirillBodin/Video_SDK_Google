import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SchoolAdminDashboard() {
  const { schoolId } = useParams();
  const [teachers, setTeachers] = useState([]);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  // 📡 Загружаем учителей школы
  useEffect(() => {
    fetch(`http://localhost:5000/api/school/${schoolId}/teachers`)
      .then((res) => res.json())
      .then((data) => setTeachers(data))
      .catch(() => toast.error("Failed to load teachers"));
  }, [schoolId]);

  // ✅ Добавить учителя
  const addTeacher = async () => {
    if (!email) {
      toast.error("Please enter email");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/school/${schoolId}/add-teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("Teacher added!");
        setEmail("");
        fetch(`http://localhost:5000/api/school/${schoolId}/teachers`)
          .then((res) => res.json())
          .then((data) => setTeachers(data));
      } else {
        toast.error("Failed to add teacher");
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  return (
    <div className="p-6 text-white bg-gray-900 h-screen">
      <h1 className="text-3xl font-bold mb-6">School Admin Panel</h1>

      <input
        type="email"
        placeholder="Teacher Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-3 bg-gray-700 rounded-xl text-white w-80 text-center"
      />

      <button
        onClick={addTeacher}
        className="w-80 bg-blue-500 text-white px-4 py-3 rounded-xl mt-4"
      >
        Add Teacher
      </button>

      <h2 className="text-xl font-bold mt-6">Teachers:</h2>
      <ul>
        {teachers.map((teacher) => (
          <li key={teacher.id} className="mt-2">
            {teacher.email}{" "}
            <button
              className="text-blue-300"
              onClick={() => navigate(`/admin/teacher/${teacher.id}`)}
            >
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
