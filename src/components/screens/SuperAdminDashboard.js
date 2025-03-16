import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
// (Если нужно) import { useParams } from "react-router-dom";
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "https://backend-videosdk.onrender.com";

export default function SuperAdminDashboard() {
  // Если нужно брать adminId из URL, можно использовать useParams:
  // const { adminId: routeAdminId } = useParams();

  const [schoolAdmins, setSchoolAdmins] = useState([]);
  const [teachers, setTeachers] = useState({});
  const [lessons, setLessons] = useState({});
  const [adminLessons, setAdminLessons] = useState({});
  const [superAdminLessons, setSuperAdminLessons] = useState([]);

  // Поля для добавления нового School Admin
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");

  // Для добавления учителя к каждому администратору
  const [newTeacherData, setNewTeacherData] = useState({});

  useEffect(() => {
    console.log("Component mounted: fetching admins and super admin lessons");
    fetchAdmins();
    fetchSuperAdminLessons();
  }, []);

  // ======================
  //  ЗАГРУЗКА ДАННЫХ
  // ======================
  const fetchAdmins = async () => {
    console.log("Fetching school admins...");
    try {
      const res = await fetch(`${SERVER_URL}/api/school-admins`);
      const data = await res.json();
      console.log("Received school admins:", data);
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch admins");
      }
      setSchoolAdmins(data);

      // Для каждого админа загружаем его учителей и уроки
      data.forEach((admin) => {
        console.log(`Fetching teachers for schoolId ${admin.schoolId}`);
        fetchTeachers(admin.schoolId);
        console.log(`Fetching lessons for adminId ${admin.id}`);
        fetchAdminLessons(admin.id);
      });
    } catch (err) {
      console.error("Error fetching admins:", err);
      toast.error("Failed to load school admins.");
    }
  };

  const fetchTeachers = async (schoolId) => {
    console.log(`Fetching teachers for schoolId ${schoolId}...`);
    try {
      const res = await fetch(
        `${SERVER_URL}/api/school-admins/${schoolId}/teachers`
      );
      const data = await res.json();
      console.log(`Received teachers for schoolId ${schoolId}:`, data);
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch teachers");
      }
      setTeachers((prev) => ({ ...prev, [schoolId]: data }));
      // Для каждого учителя — грузим уроки
      data.forEach((teacher) => {
        console.log(`Fetching lessons for teacherId ${teacher.id}`);
        fetchLessons(teacher.id);
      });
    } catch (err) {
      console.error(`Error fetching teachers for school ${schoolId}:`, err);
      toast.error(`Failed to load teachers for school ${schoolId}`);
    }
  };

  const fetchLessons = async (teacherId) => {
    console.log(`Fetching lessons for teacherId ${teacherId}...`);
    try {
      const res = await fetch(
        `${SERVER_URL}/api/school-admins/${teacherId}/lessons`
      );
      const data = await res.json();
      console.log(`Received lessons for teacherId ${teacherId}:`, data);
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch lessons");
      }
      setLessons((prev) => ({ ...prev, [teacherId]: data }));
    } catch (err) {
      console.error(`Error fetching lessons for teacher ${teacherId}:`, err);
      toast.error(`Failed to load lessons for teacher ${teacherId}`);
    }
  };

  const fetchAdminLessons = async (adminId) => {
    console.log(`Fetching lessons for adminId ${adminId}...`);
    try {
      const res = await fetch(
        `${SERVER_URL}/api/school-admins/${adminId}/lessons`
      );
      const data = await res.json();
      console.log(`Received admin lessons for adminId ${adminId}:`, data);

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch admin lessons");
      }

      setAdminLessons((prev) => ({
        ...prev,
        [adminId]: data.lessons,
      }));
    } catch (err) {
      console.warn(`No lessons found for adminId=${adminId}:`, err);
    }
  };

  // ======================
  //  УРОКИ СУПЕРАДМИНА
  // ======================
  const fetchSuperAdminLessons = async () => {
    console.log("Fetching super admin lessons...");
    try {
      const superAdminId = localStorage.getItem("adminId") || "1"; 
      console.log("Super admin id:", superAdminId);

      const res = await fetch(
        `${SERVER_URL}/api/school-admins/${superAdminId}/lessons`
      );
      const data = await res.json();
      console.log("Received super admin lessons:", data);
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch super admin lessons");
      }
      setSuperAdminLessons(data.lessons || data);
    } catch (err) {
      console.error("Error fetching super admin lessons:", err);
      toast.error(err.message);
    }
  };

  // ======================
  //  УДАЛЕНИЕ УРОКА СУПЕРАДМИНА
  // ======================
  const handleDeleteSuperAdminLesson = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    console.log("Deleting super admin lesson:", lessonId);

    try {
      // Предполагаем, что на бэкенде есть маршрут DELETE /api/lessons/:lessonId
      const res = await fetch(`${SERVER_URL}/api/lessons/${lessonId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete lesson");
      }
      toast.success("Lesson deleted!");

      // Убираем этот урок из состояния
      setSuperAdminLessons((prev) => prev.filter((l) => l.id !== lessonId));
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error(error.message);
    }
  };

  // ======================
  //  ДОБАВЛЕНИЕ ШКОЛЬНОГО АДМИНА
  // ======================
  const handleAddAdmin = async () => {
    console.log("Adding new school admin...", { name, email, schoolName });
    try {
      const res = await fetch(`${SERVER_URL}/api/school-admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, schoolName }),
      });
      const data = await res.json();
      console.log("Add admin response:", data);
      if (!res.ok) {
        throw new Error(data.error || "Failed to create admin");
      }
      toast.success("School admin added successfully!");
      fetchAdmins();
      // Сбрасываем поля
      setName("");
      setEmail("");
      setSchoolName("");
    } catch (error) {
      console.error("Error adding school admin:", error);
      toast.error(error.message);
    }
  };

  // ======================
//  ДОБАВЛЕНИЕ УЧИТЕЛЯ К АДМИНУ
// ======================
const handleAddTeacher = async (schoolId) => {
  const { teacherName, teacherEmail, teacherPassword } =
    newTeacherData[schoolId] || {};

  console.log(`Adding teacher to school ${schoolId}...`, {
    teacherName,
    teacherEmail,
    teacherPassword,
  });

  if (!teacherName || !teacherEmail || !teacherPassword) {
    toast.info("Fill in teacher name, email, and password first!");
    return;
  }

  try {
    const res = await fetch(
      `${SERVER_URL}/api/school-admins/${schoolId}/teachers`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teacherName,
          email: teacherEmail,
          password: teacherPassword, // ✅ Добавляем пароль
        }),
      }
    );
    const data = await res.json();
    console.log(`Add teacher response for school ${schoolId}:`, data);
    if (!res.ok) {
      throw new Error(data.error || "Failed to add teacher");
    }
    toast.success(`Teacher added to school ${schoolId}!`);
    fetchTeachers(schoolId);

    // Сбрасываем поля ввода
    setNewTeacherData((prev) => ({
      ...prev,
      [schoolId]: { teacherName: "", teacherEmail: "", teacherPassword: "" },
    }));
  } catch (err) {
    console.error(`Error adding teacher to school ${schoolId}:`, err);
    toast.error(err.message);
  }
};

// ======================
//  УДАЛЕНИЕ УЧИТЕЛЯ
// ======================
const handleDeleteTeacher = async (teacherId, schoolId) => {
  if (!window.confirm("Are you sure you want to delete this teacher?")) return;
  console.log(`Deleting teacher ${teacherId} from school ${schoolId}...`);

  try {
    const res = await fetch(
      `${SERVER_URL}/api/school-admins/${schoolId}/teachers/${teacherId}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      throw new Error("Failed to delete teacher");
    }

    toast.success("Teacher deleted successfully!");
    
    // Обновляем список учителей
    setTeachers((prev) => ({
      ...prev,
      [schoolId]: prev[schoolId].filter((teacher) => teacher.id !== teacherId),
    }));
  } catch (error) {
    console.error(`Error deleting teacher ${teacherId}:`, error);
    toast.error("Failed to delete teacher.");
  }
};

// ======================
//  УДАЛЕНИЕ АДМИНИСТРАТОРА ШКОЛЫ
// ======================
const handleDeleteAdmin = async (adminId) => {
  if (!window.confirm("Are you sure you want to delete this admin?")) return;
  console.log(`Deleting admin ${adminId}...`);

  try {
    const res = await fetch(
      `${SERVER_URL}/api/school-admins/${adminId}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      throw new Error("Failed to delete admin");
    }

    toast.success("Admin deleted successfully!");

    // Обновляем список администраторов
    setSchoolAdmins((prev) => prev.filter((admin) => admin.id !== adminId));
  } catch (error) {
    console.error(`Error deleting admin ${adminId}:`, error);
    toast.error("Failed to delete admin.");
  }
};

  // ======================
  //  ПОЛЯ ВВОДА ДЛЯ УЧИТЕЛЯ
  // ======================
  const handleTeacherInputChange = (schoolId, field, value) => {
    console.log(
      `Updating new teacher data for school ${schoolId}:`,
      field,
      value
    );
    setNewTeacherData((prev) => ({
      ...prev,
      [schoolId]: {
        ...prev[schoolId],
        [field]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen w-full bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-10">
        Super Admin Dashboard
      </h1>

      {/* 
        СЕКЦИЯ: Уроки текущего суперадмина 
        - Сделаем «карточки» вместо списка 
      */}
      {superAdminLessons.length > 0 && (
        <div className="max-w-5xl mx-auto bg-gray-800 p-4 rounded-xl mb-6">
          <h2 className="text-2xl font-bold mb-4">Super Admin's Lessons:</h2>
          <div className="flex flex-col gap-4">
            {superAdminLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-gray-700 p-4 rounded flex justify-between items-center"
              >
                <div>
                  <h4 className="text-lg font-bold">{lesson.className}</h4>
                  <p className="text-sm text-gray-300">
                    Meeting ID: {lesson.meetingId}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteSuperAdminLesson(lesson.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Форма для добавления нового School Admin */}
      <div className="max-w-xl mx-auto bg-gray-800 rounded-xl p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-4">Add New School Admin</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Admin Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 bg-gray-700 rounded-xl text-white placeholder-gray-400"
          />
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 bg-gray-700 rounded-xl text-white placeholder-gray-400"
          />
          <input
            type="text"
            placeholder="School Name"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="px-4 py-3 bg-gray-700 rounded-xl text-white placeholder-gray-400"
          />
          <button
            onClick={handleAddAdmin}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-semibold"
          >
            Add School Admin
          </button>
        </div>
      </div>

      {/* Список админов */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">All School Admins:</h2>
        {schoolAdmins.map((admin) => (
          <div
            key={admin.id}
            className="bg-gray-800 rounded-xl p-6 mb-6 shadow-md"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  {admin.name}
                  <span className="text-sm text-gray-400 ml-2">
                    ({admin.schoolName || "No School"})
                  </span>
                </h3>
                <p className="text-gray-400">Email: {admin.email}</p>
              </div>
              <button
          className="text-red-400 mt-2 md:mt-0 hover:text-red-300"
          onClick={() => handleDeleteAdmin(admin.id)}
        >
          ❌ Delete Admin
        </button>
            </div>

            {/* Уроки админа, если есть */}
            {adminLessons[admin.id]?.length > 0 && (
              <div className="mt-4 bg-gray-700 p-4 rounded">
                <h4 className="font-semibold mb-2">Admin's Lessons:</h4>
                <ul className="list-disc list-inside">
                  {adminLessons[admin.id].map((lesson) => (
                    <li key={lesson.id} className="text-gray-200">
                      {lesson.className} (Meeting ID: {lesson.meetingId})
                    </li>
                  ))}
                </ul>
              </div>
            )}
{/* Добавление учителя к администратору */}
<div className="mt-4 p-4 bg-gray-700 rounded">
              <h4 className="font-semibold mb-2">Add Teacher:</h4>
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Teacher Name"
                  value={newTeacherData[admin.schoolId]?.teacherName || ""}
                  onChange={(e) =>
                    setNewTeacherData((prev) => ({
                      ...prev,
                      [admin.schoolId]: {
                        ...prev[admin.schoolId],
                        teacherName: e.target.value,
                      },
                    }))
                  }
                  className="flex-1 px-4 py-2 rounded bg-gray-600 placeholder-gray-400"
                />
                <input
                  type="email"
                  placeholder="Teacher Email"
                  value={newTeacherData[admin.schoolId]?.teacherEmail || ""}
                  onChange={(e) =>
                    setNewTeacherData((prev) => ({
                      ...prev,
                      [admin.schoolId]: {
                        ...prev[admin.schoolId],
                        teacherEmail: e.target.value,
                      },
                    }))
                  }
                  className="flex-1 px-4 py-2 rounded bg-gray-600 placeholder-gray-400"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newTeacherData[admin.schoolId]?.teacherPassword || ""}
                  onChange={(e) =>
                    setNewTeacherData((prev) => ({
                      ...prev,
                      [admin.schoolId]: {
                        ...prev[admin.schoolId],
                        teacherPassword: e.target.value,
                      },
                    }))
                  }
                  className="flex-1 px-4 py-2 rounded bg-gray-600 placeholder-gray-400"
                />
                <button
                  onClick={() => handleAddTeacher(admin.schoolId)}
                  className="bg-blue-500 hover:bg-blue-600 rounded px-4 py-2 font-semibold"
                >
                  Add Teacher
                </button>
              </div>
            </div>
 {/* Список учителей у данного админа */}
 <div className="mt-6">
              <h4 className="text-lg font-semibold">Teachers:</h4>
              {teachers[admin.schoolId]?.length ? (
                teachers[admin.schoolId].map((teacher) => (
                  <div key={teacher.id} className="bg-gray-700 p-4 mt-2 rounded">
                    <div className="flex justify-between items-center">
                      <span>
                        <strong>{teacher.name}</strong> — {teacher.email}
                      </span>
                      <button
                        className="text-red-400"
                        onClick={() => handleDeleteTeacher(teacher.id, admin.schoolId)}
          >
            ❌
          </button>
        </div>

                    {/* Уроки конкретного учителя */}
                    <div className="mt-2 ml-4">
                      <h5 className="font-semibold text-gray-300">Lessons:</h5>
                      {lessons[teacher.id]?.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {lessons[teacher.id].map((lesson) => (
                            <li key={lesson.id} className="text-sm text-gray-200">
                              {lesson.className} (Meeting ID: {lesson.meetingId})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400">
                          No lessons assigned
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 mt-2">
                  No teachers found for this admin.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
