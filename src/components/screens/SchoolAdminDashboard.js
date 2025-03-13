import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function SchoolAdminDashboard() {
  const { schoolId } = useParams();
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedTeacher, setEditedTeacher] = useState({});

  // 📡 Загружаем список учителей
  const fetchTeachers = () => {
    fetch(`http://localhost:5000/api/school-admins/${schoolId}/teachers`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTeachers(data);
        } else {
          toast.error("Invalid response from server: expected an array.");
          setTeachers([]);
        }
      })
      .catch(() => toast.error("Failed to load teachers"));
  };

  useEffect(() => {
    fetchTeachers();
  }, [schoolId]);

  // ✅ Добавить учителя
  const addTeacher = async () => {
    if (!name || !email) {
      toast.error("Please enter name and email");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/school-admins/${schoolId}/add-teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (res.ok) {
        toast.success("Teacher added!");
        setName("");
        setEmail("");
        fetchTeachers();
      } else {
        toast.error("Failed to add teacher");
      }
    } catch (error) {
      toast.error("Server error.");
    }
  };

  // ✅ Удалить учителя
  const deleteTeacher = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/school-admins/${schoolId}/delete-teacher/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Teacher deleted!");
        fetchTeachers();
      } else {
        toast.error("Failed to delete teacher.");
      }
    } catch (error) {
      toast.error("Server error.");
    }
  };

  // ✅ Включение режима редактирования
  const startEditing = (teacher) => {
    setEditingId(teacher.id);
    setEditedTeacher({ ...teacher });
  };

  // ✅ Обновить значение в инпуте при редактировании
  const handleEditChange = (e, field) => {
    setEditedTeacher((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // ✅ Подтверждение редактирования
  const saveTeacherChanges = async () => {
    try {
      const { id, name, email } = editedTeacher;
      const res = await fetch(`http://localhost:5000/api/school-admins/${schoolId}/update-teacher/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (res.ok) {
        toast.success("Teacher updated!");
        setEditingId(null);
        fetchTeachers();
      } else {
        toast.error("Failed to update teacher.");
      }
    } catch (error) {
      toast.error("Server error.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-lg p-6 bg-gray-800 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">School Admin Panel - School {schoolId}</h1>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Teacher Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 bg-gray-700 rounded-xl text-white text-center w-full"
          />

          <input
            type="email"
            placeholder="Teacher Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 bg-gray-700 rounded-xl text-white text-center w-full"
          />

          <button
            onClick={addTeacher}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
          >
            Add Teacher
          </button>
        </div>

        <h2 className="text-xl font-bold mt-6">Teachers:</h2>
        <ul className="mt-4">
          {teachers.length > 0 ? (
            teachers.map((teacher) => (
              <li key={teacher.id} className="bg-gray-700 rounded-xl p-4 mb-2 flex justify-between items-center">
                <div>
                  {editingId === teacher.id ? (
                    <>
                      <input
                        type="text"
                        value={editedTeacher.name}
                        onChange={(e) => handleEditChange(e, "name")}
                        className="px-2 py-1 bg-gray-600 rounded text-white w-full mb-2"
                      />
                      <input
                        type="email"
                        value={editedTeacher.email}
                        onChange={(e) => handleEditChange(e, "email")}
                        className="px-2 py-1 bg-gray-600 rounded text-white w-full"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-semibold">{teacher.name}</span>
                      <span className="block text-gray-300 text-sm">{teacher.email}</span>
                    </>
                  )}
                </div>
                <div className="flex gap-3">
                  {editingId === teacher.id ? (
                    <button
                      className="text-green-400 hover:text-green-300"
                      onClick={saveTeacherChanges}
                    >
                      💾 Save
                    </button>
                  ) : (
                    <button
                      className="text-yellow-400 hover:text-yellow-300"
                      onClick={() => startEditing(teacher)}
                    >
                      ✏ Edit
                    </button>
                  )}
                  <button
                    className="text-red-500 hover:text-red-400"
                    onClick={() => deleteTeacher(teacher.id)}
                  >
                    ❌ Delete
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-400">No teachers found</p>
          )}
        </ul>
      </div>
    </div>
  );
}
