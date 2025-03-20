import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiMoreVertical, FiCopy, FiEye, FiEdit, FiTrash2 } from "react-icons/fi";

const SERVER_URL = "http://localhost:5000";

/* ================================
   МОДАЛЬНОЕ ОКНО "ADD CLASS"
================================ */
function AddClassModal({
  onClose,
  onSaveClass,
  onSaveStudent,
  fetchStudents,
  students,
}) {
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [className, setClassName] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [teacherEmail, setTeacherEmail] = useState(""); 

  // Поля формы "Add Student"
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // ❌ Старый вариант, который вызывал бесконечный цикл:
  // useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ✅ Новый вариант: вызывать один раз при первом рендере модалки
  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, []); 

  // Закрыть форму "Add Student" и сбросить поля
  const closeAddStudentForm = () => {
    setShowAddStudentForm(false);
    setFirstName("");
    setLastName("");
    setEmail("");
  };

  // Сохранить нового студента (логика вызова API заготовлена)
  const handleSaveNewStudent = async () => {
    try {
      await onSaveStudent({ firstName, lastName, email });
      // После сохранения сбрасываем форму
      closeAddStudentForm();
    } catch (error) {
      console.error("Error saving student:", error);
      toast.error("Failed to add student");
    }
  };

  // Сохранить класс (логика вызова API заготовлена)
  const handleSaveClass = () => {
    onSaveClass({
      className,
      studentId: selectedStudentId || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white text-black w-[700px] min-h-[400px] rounded-md p-6 flex">
        {/* Левая часть: форма "Add Class" */}
        <div className="w-1/2 pr-4 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Enter Class Name</h2>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Enter Class Name"
            className="mb-4 px-3 py-2 border rounded"
          />

          <label className="font-semibold mb-2">Select or Add Student</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="mb-4 px-3 py-2 border rounded"
          >
            <option value="">-- Select Student --</option>
            {students.map((stud) => (
              <option key={stud.id} value={stud.id}>
                {stud.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddStudentForm(true)}
            className="text-blue-600 hover:text-blue-800 mb-4 underline"
          >
            Add New Student
          </button>

          {/* Кнопки Cancel / Save */}
          <div className="mt-auto flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-400 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClass}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </div>

        {/* Правая часть: форма "Add Student" (показывается, если showAddStudentForm) */}
        {showAddStudentForm && (
          <div className="w-1/2 border-l pl-4 flex flex-col">
            <h2 className="text-xl font-bold mb-4">Add New Student</h2>
            <label className="mb-1 font-semibold">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mb-4 px-3 py-2 border rounded"
              placeholder="First Name"
            />

            <label className="mb-1 font-semibold">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mb-4 px-3 py-2 border rounded"
              placeholder="Last Name"
            />

            <label className="mb-1 font-semibold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 px-3 py-2 border rounded"
              placeholder="Email Address"
            />

            <div className="mt-auto flex gap-2">
              <button
                onClick={closeAddStudentForm}
                className="px-4 py-2 rounded border border-gray-400 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewStudent}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================
   ОСНОВНОЙ КОМПОНЕНТ DASHBOARD
================================ */
export default function TeacherDashboard() {
  const { teacherId } = useParams();

  // ===== Существующий код =====
  const [lessons, setLessons] = useState([]);
  const [menuData, setMenuData] = useState(null);
  const [teacherEmail, setTeacherEmail] = useState(""); 
  useEffect(() => {
    fetchLessons();
    fetchTeacherEmail(); // ✅ Запрос email при загрузке
  }, [teacherId]);
  

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest(".portal-menu")) return;
      setMenuData(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/teachers/${teacherId}/lessons`);
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
    setMenuData(null);
  };

  const toggleMenu = (lessonId, e, classURL) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    if (menuData?.lessonId === lessonId) {
      setMenuData(null);
    } else {
      setMenuData({
        lessonId,
        x: rect.x + rect.width,
        y: rect.y + window.scrollY,
        classURL,
      });
    }
  };

  // ===== КОНЕЦ существующего кода таблицы и портала =====

  // ===== Новая логика для "Add Class" =====
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [students, setStudents] = useState([]);

  // Получаем список студентов (при открытии модалки)
  const fetchStudents = async () => {
    try {
      // Допустим, у нас есть эндпоинт: GET /api/teacher/:teacherId/students
      // Или если нужно, GET /api/school-admins/:schoolId/students
      // Тут пример запроса:
      const res = await fetch(`${SERVER_URL}/api/teacher/${teacherId}/students`);
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error("❌ Error fetching students:", error);
      toast.error("Failed to load students");
    }
  };

  // Сохранение класса (заготовка)
  const handleSaveClass = async ({ className }) => {
    try {
      if (!teacherEmail) {
        toast.error("Teacher email is missing!");
        return;
      }

      const meetingId = `meet-${Math.random().toString(36).substring(7)}`;
      const body = { className, meetingId, teacherEmail };

      const res = await fetch(`${SERVER_URL}/api/teachers/${teacherId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create class");

      const data = await res.json();
      toast.success(`Class "${data.lesson.className}" created!`);
      fetchLessons();
    } catch (error) {
      console.error("❌ Error saving class:", error);
      toast.error("Failed to save class");
    }
  };
  // ✅ Получаем email учителя
  const fetchTeacherEmail = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/teachers/${teacherId}`);
      const data = await res.json();

      if (res.ok) {
        setTeacherEmail(data.email); // ✅ Сохраняем email
      } else {
        toast.error("Failed to fetch teacher email");
      }
    } catch (error) {
      console.error("❌ Error fetching teacher email:", error);
    }
  };


  const handleSaveStudent = async ({ firstName, lastName, email }) => {
    if (!firstName || !lastName || !email) {
      toast.error("All fields are required!");
      return;
    }
  
    try {
      // 🔹 Запрашиваем реальный schoolId учителя
      const schoolRes = await fetch(`${SERVER_URL}/api/teachers/${teacherId}/school`);
      if (!schoolRes.ok) throw new Error("Failed to fetch school");
      
      const { schoolId } = await schoolRes.json();
      if (!schoolId) throw new Error("School ID is missing");
  
      // ✅ Теперь `name` точно не будет `null`
      const name = `${firstName.trim()} ${lastName.trim()}`;
  
      // 🔹 Отправляем запрос на сервер
      const res = await fetch(`${SERVER_URL}/api/teacher/${teacherId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, schoolId }),
      });
  
      if (!res.ok) throw new Error("Failed to add student");
  
      const newStudent = await res.json();
      toast.success(`Student "${newStudent.name}" added!`);
      setStudents((prev) => [...prev, newStudent]);
    } catch (error) {
      console.error("❌ Error saving student:", error);
      toast.error(error.message || "Failed to save student");
    }
  };
  
  
  

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#111111] to-black text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-10">Teacher Dashboard</h1>

      {/* ======= ТВОЯ ТАБЛИЦА УРОКОВ ======= */}
      <div className="w-full max-w-5xl bg-white bg-opacity-10 rounded-xl p-6 shadow-lg border border-gray-700 backdrop-blur-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white">Your Lessons:</h2>
          {/* Кнопка Add New Class открывает модалку */}
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            onClick={() => setShowAddClassModal(true)}
          >
            Add New Class
          </button>
        </div>

        {lessons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="px-4 py-3 text-left">Class Name</th>
                  <th className="px-4 py-3 text-center"># of Students</th>
                  <th className="px-4 py-3 text-left">Class URL</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => {
                  const classURL = `https://meet.tamamat.com/${lesson.meetingId}/Teacher_Two/${lesson.className}`;

                  return (
                    <tr key={lesson.id} className="bg-gray-800 border-b border-gray-700">
                      <td className="px-4 py-3 font-semibold">{lesson.className}</td>
                      <td className="px-4 py-3 text-center">{lesson.studentsCount || 0}</td>
                      <td className="px-4 py-3 text-blue-400">
                        <a href={classURL} target="_blank" rel="noopener noreferrer" className="underline">
                          {classURL}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => toggleMenu(lesson.id, e, classURL)}
                          className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none"
                        >
                          <FiMoreVertical className="text-white text-lg" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-white text-center">No lessons found</p>
        )}
      </div>

      {/* ====== Портал Меню (без изменений) ====== */}
      {menuData && (
        <MenuPortal
          menuData={menuData}
          copyToClipboard={copyToClipboard}
          deleteLesson={deleteLesson}
          setMenuData={setMenuData}
        />
      )}

      {/* ====== Модальное окно "Add Class" ====== */}
      {showAddClassModal && (
        <AddClassModal
          onClose={() => setShowAddClassModal(false)}
          onSaveClass={handleSaveClass}
          onSaveStudent={handleSaveStudent}
          fetchStudents={fetchStudents}
          students={students}
        />
      )}
    </div>
  );
}

/* ================================
   ПОРТАЛ МЕНЮ (БЕЗ ИЗМЕНЕНИЙ)
================================ */
function MenuPortal({ menuData, copyToClipboard, deleteLesson, setMenuData }) {
  const { lessonId, x, y, classURL } = menuData;

  const menu = (
    <div
      className="portal-menu fixed bg-gray-900 text-white shadow-lg rounded-md z-50 w-44"
      style={{
        top: y + 10,
        left: x - 10,
      }}
    >
      <button
        onClick={() => copyToClipboard(classURL)}
        className="flex items-center px-4 py-2 w-full hover:bg-gray-700 text-left"
      >
        <FiCopy className="mr-2" /> Copy URL
      </button>
      <button className="flex items-center px-4 py-2 w-full hover:bg-gray-700 text-left">
        <FiEye className="mr-2" /> View
      </button>
      <button className="flex items-center px-4 py-2 w-full hover:bg-gray-700 text-left">
        <FiEdit className="mr-2" /> Edit
      </button>
      <button
        onClick={() => {
          deleteLesson(lessonId);
          setMenuData(null);
        }}
        className="flex items-center px-4 py-2 w-full text-red-400 hover:bg-gray-700 text-left"
      >
        <FiTrash2 className="mr-2" /> Delete
      </button>
    </div>
  );

  return ReactDOM.createPortal(menu, document.body);
}
