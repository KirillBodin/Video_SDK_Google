import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function SchoolAdminDashboard() {
  const { adminId } = useParams();

  const [teachers, setTeachers] = useState([]);
  const [lessons, setLessons] = useState({});
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const SERVER_URL = "https://backend-videosdk.onrender.com" || "http://localhost:5000";

  // 📡 Загружаем список учителей
  const fetchTeachers = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/${adminId}/teachers`);
      const data = await res.json();
  
      if (res.ok) {
        setTeachers(data);
        fetchLessons(); // Загружаем все уроки для этой школы
      } else {
        toast.error(data.error || "Failed to load teachers");
        setTeachers([]);
      }
    } catch (error) {
      toast.error("Server error.");
    }
  };
  

  const fetchLessons = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/${adminId}/lessons`);
      const data = await res.json();
  
      if (res.ok) {
        // Группируем уроки по учителям
        const groupedLessons = {};
        data.forEach((lesson) => {
          if (!groupedLessons[lesson.teacherId]) {
            groupedLessons[lesson.teacherId] = [];
          }
          groupedLessons[lesson.teacherId].push(lesson);
        });
  
        setLessons(groupedLessons);
      } else {
        setLessons({});
      }
    } catch (error) {
      setLessons({});
    }
  };
  

  useEffect(() => {
    fetchTeachers();
  }, [adminId]);

  // ✅ Добавить учителя
  const addTeacher = async () => {
    if (!teacherName || !teacherEmail || !teacherPassword) {
      toast.error("Please enter name, email, and password");
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/${adminId}/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teacherName,
          email: teacherEmail,
          password: teacherPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Teacher added!");
        setTeacherName("");
        setTeacherEmail("");
        setTeacherPassword("");
        fetchTeachers();
      } else {
        toast.error(data.error || "Failed to add teacher");
      }
    } catch (error) {
      toast.error("Server error.");
    }
  };

  // ✅ Удалить учителя
  const deleteTeacher = async (teacherId) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;

    try {
      const res = await fetch(`${SERVER_URL}/api/${adminId}/teachers/${teacherId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Teacher deleted!");
        fetchTeachers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete teacher.");
      }
    } catch (error) {
      toast.error("Server error.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#111111] to-black text-white p-6">
      <h1 className="text-5xl font-extrabold text-center mb-10 tracking-wide">
        School Admin Panel - School {adminId}
      </h1>

      <div className="max-w-xl mx-auto bg-white bg-opacity-10 border border-white/20 rounded-xl p-6 shadow-md backdrop-blur-md">
        <h2 className="text-2xl font-semibold mb-4">Add a New Teacher</h2>
        <div className="flex flex-col gap-4 mb-8">
          <input
            type="text"
            placeholder="Teacher Name"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="px-4 py-2 bg-white bg-opacity-5 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <input
            type="email"
            placeholder="Teacher Email"
            value={teacherEmail}
            onChange={(e) => setTeacherEmail(e.target.value)}
            className="px-4 py-2 bg-white bg-opacity-5 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <input
            type="password"
            placeholder="Teacher Password"
            value={teacherPassword}
            onChange={(e) => setTeacherPassword(e.target.value)}
            className="px-4 py-2 bg-white bg-opacity-5 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={addTeacher}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
          >
            Add Teacher
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4">Teachers and Lessons:</h2>
<ul className="space-y-4">
  {teachers.length > 0 ? (
    teachers.map((teacher) => (
      <li
        key={teacher.id}
        className="bg-white bg-opacity-5 border border-white/20 rounded p-4 shadow flex justify-between items-center"
      >
        <div>
          <h3 className="text-lg font-semibold">{teacher.name}</h3>
          <p className="text-sm text-white/80">{teacher.email}</p>

          <div className="mt-3">
            <h4 className="text-md font-semibold">Lessons:</h4>
            {lessons[teacher.id]?.length > 0 ? (
              <ul className="list-disc pl-5 text-sm">
                {lessons[teacher.id].map((lesson) => (
                  <li key={lesson.id}>
                    {lesson.className} (ID: {lesson.id})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No lessons available</p>
            )}
          </div>
        </div>
        <button
          onClick={() => deleteTeacher(teacher.id)}
          className="text-red-500 hover:text-red-400 text-lg"
        >
          ❌
        </button>
      </li>
    ))
  ) : (
    <p>No teachers found</p>
  )}
</ul>

      </div>
    </div>
  );
}
