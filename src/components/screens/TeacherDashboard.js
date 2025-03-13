import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function TeacherDashboard() {
  const { teacherId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [lessonName, setLessonName] = useState("");

  // 📡 Загружаем уроки учителя
  useEffect(() => {
    fetchLessons();
  }, [teacherId]);

  const fetchLessons = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/school-admins/${teacherId}/lessons`);
      const data = await res.json();
      setLessons(data);
    } catch {
      toast.error("Failed to load lessons");
    }
  };

  // ✅ Добавить урок
  const addLesson = async () => {
    if (!lessonName) {
      toast.error("Please enter lesson name");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/school-admins/${teacherId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className: lessonName, teacherId }),
      });

      if (res.ok) {
        toast.success("Lesson added!");
        setLessonName("");
        fetchLessons();
      } else {
        toast.error("Failed to add lesson.");
      }
    } catch (error) {
      toast.error("Server error.");
    }
  };

  // ❌ Удалить урок
  const deleteLesson = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/lessons/${lessonId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Lesson deleted!");
        fetchLessons();
      } else {
        toast.error("Failed to delete lesson.");
      }
    } catch (error) {
      toast.error("Server error.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-lg p-6 bg-gray-800 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Teacher Dashboard</h1>

        {/* Форма для добавления нового урока */}
        <div className="flex flex-col gap-4 mb-6">
          <input
            type="text"
            placeholder="Lesson Name"
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            className="px-4 py-3 bg-gray-700 rounded-xl text-white text-center w-full"
          />
          <button
            onClick={addLesson}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
          >
            Add Lesson
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">Your Lessons:</h2>

        {/* Отображение списка уроков */}
        <ul className="space-y-4">
          {lessons.length > 0 ? (
            lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="bg-gray-700 rounded-xl p-4 flex justify-between items-center shadow-lg"
              >
                <div>
                  <p className="text-lg font-semibold text-white">{lesson.className}</p>
                  <p className="text-gray-300 text-sm">Lesson ID: {lesson.id}</p>
                  <p className="text-gray-300 text-sm">Meeting ID: {lesson.meetingId}</p>
                </div>
                <button
                  onClick={() => deleteLesson(lesson.id)}
                  className="text-red-500 text-lg hover:text-red-400"
                >
                  ❌
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-400 text-center">No lessons found</p>
          )}
        </ul>
      </div>
    </div>
  );
}
