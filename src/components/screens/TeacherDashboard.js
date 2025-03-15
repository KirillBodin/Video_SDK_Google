import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

export default function TeacherDashboard() {
  const { teacherId } = useParams();
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetchLessons();
  }, [teacherId]);

  const fetchLessons = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/${teacherId}/lessons`);
      const data = await res.json();

      if (res.ok) {
        setLessons(data);
      } else {
        toast.error(data.error || "Failed to load lessons");
        setLessons([]);
      }
    } catch (error) {
      toast.error("Server error.");
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const res = await fetch(`${SERVER_URL}/api/lessons/${lessonId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Lesson deleted!");
        fetchLessons();
      } else {
        toast.error(data.error || "Failed to delete lesson.");
      }
    } catch (error) {
      toast.error("Server error.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#111111] to-black text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-10">Teacher Dashboard</h1>

      <div className="w-full max-w-3xl bg-white bg-opacity-10 rounded-xl p-6 shadow-lg border border-gray-700 backdrop-blur-md">
        <h2 className="text-2xl font-semibold mb-4 text-white">Your Lessons:</h2>

        {lessons.length > 0 ? (
          <div className="flex flex-col gap-4">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="bg-white bg-opacity-5 p-4 rounded-xl flex justify-between items-center shadow-md border border-gray-600">
                <div>
                  <h3 className="text-lg font-bold text-white">{lesson.className}</h3>
                  <p className="text-sm text-white">Lesson ID: {lesson.id}</p>
                  <p className="text-sm text-white">Meeting ID: {lesson.meetingId}</p>
                </div>
                <button onClick={() => deleteLesson(lesson.id)} className="text-red-500 hover:text-red-400 text-lg">
                  ❌
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white text-center">No lessons found</p>
        )}
      </div>
    </div>
  );
}
