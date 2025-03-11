import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function TeacherDashboard() {
  const { teacherId } = useParams();
  const [students, setStudents] = useState([]);
  const [email, setEmail] = useState("");

  // 📡 Загружаем учеников
  useEffect(() => {
    fetch(`http://localhost:5000/api/teacher/${teacherId}/students`)
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch(() => toast.error("Failed to load students"));
  }, [teacherId]);

  // ✅ Добавить ученика
  const addStudent = async () => {
    if (!email) {
      toast.error("Please enter email");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/teacher/${teacherId}/add-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("Student added!");
        setEmail("");
        fetch(`http://localhost:5000/api/teacher/${teacherId}/students`)
          .then((res) => res.json())
          .then((data) => setStudents(data));
      } else {
        toast.error("Failed to add student");
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  return (
    <div className="p-6 text-white bg-gray-900 h-screen">
      <h1 className="text-3xl font-bold mb-6">Teacher Panel</h1>

      <input
        type="email"
        placeholder="Student Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-3 bg-gray-700 rounded-xl text-white w-80 text-center"
      />

      <button
        onClick={addStudent}
        className="w-80 bg-blue-500 text-white px-4 py-3 rounded-xl mt-4"
      >
        Add Student
      </button>
    </div>
  );
}
