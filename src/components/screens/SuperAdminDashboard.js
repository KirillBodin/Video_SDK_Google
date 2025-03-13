import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function SuperAdminDashboard() {
  const [schoolAdmins, setSchoolAdmins] = useState([]);
  const [teachers, setTeachers] = useState({});
  const [lessons, setLessons] = useState({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [lessonName, setLessonName] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/school-admins");
      const data = await res.json();
      setSchoolAdmins(data);
      data.forEach((admin) => fetchTeachers(admin.schoolId));
    } catch (err) {
      toast.error("Failed to load school admins.");
    }
  };

  const fetchTeachers = async (schoolId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/school-admins/${schoolId}/teachers`);
      const data = await res.json();
      setTeachers((prev) => ({ ...prev, [schoolId]: data }));
      data.forEach((teacher) => fetchLessons(teacher.id));
    } catch (err) {
      toast.error(`Failed to load teachers for school ${schoolId}`);
    }
  };

  const fetchLessons = async (teacherId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/school-admins/${teacherId}/lessons`);
      const data = await res.json();
      setLessons((prev) => ({ ...prev, [teacherId]: data }));
    } catch (err) {
      toast.error(`Failed to load lessons for teacher ${teacherId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-lg p-6 bg-gray-800 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Super Admin Panel</h1>

        {/* Форма для добавления нового администратора */}
        <div className="flex flex-col gap-4 mb-4">
          <input
            type="text"
            placeholder="Admin Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 bg-gray-700 rounded-xl text-white text-center w-full"
          />
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 bg-gray-700 rounded-xl text-white text-center w-full"
          />
          <input
            type="text"
            placeholder="School Name"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="px-4 py-3 bg-gray-700 rounded-xl text-white text-center w-full"
          />
          <button
            onClick={() => toast.info("Add admin logic not implemented")}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
          >
            Add School Admin
          </button>
        </div>

        <h2 className="text-xl font-bold mt-6">School Admins:</h2>
        <ul className="mt-4">
          {schoolAdmins.map((admin) => (
            <li key={admin.id} className="bg-gray-700 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">{admin.name} ({admin.schoolName || "No School"})</span>
                <button className="text-red-500" onClick={() => toast.info("Delete admin logic not implemented")}>❌</button>
              </div>

              {/* Отображение учителей */}
              <h3 className="text-md font-bold text-gray-400 mt-3">Teachers:</h3>
              {teachers[admin.schoolId]?.map((teacher) => (
                <div key={teacher.id} className="bg-gray-600 p-3 mt-2 rounded">
                  <div className="flex justify-between items-center">
                    <span>{teacher.name} - {teacher.email}</span>
                    <button className="text-red-500 ml-4" onClick={() => toast.info("Delete teacher logic not implemented")}>❌</button>
                  </div>

                  {/* Отображение уроков учителя */}
                  <h4 className="text-sm font-bold text-gray-300 mt-2">Lessons:</h4>
                  {lessons[teacher.id]?.length > 0 ? (
                    <ul className="list-disc pl-4">
                      {lessons[teacher.id].map((lesson) => (
                        <li key={lesson.id} className="text-gray-200 text-sm">
                          {lesson.className} (Meeting ID: {lesson.meetingId})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">No lessons assigned</p>
                  )}
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
