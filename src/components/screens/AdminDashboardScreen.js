import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FiMoreVertical, FiTrash2 } from "react-icons/fi";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";
import { authorizedFetch } from "../../utils/api";

const SERVER_URL = "https://backendvideosdk-production.up.railway.app";

export default function AdminDashboard() {
  const { adminId } = useParams();
  const [activeTab, setActiveTab] = useState("teachers");
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [menuData, setMenuData] = useState(null);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [editData, setEditData] = useState(null); // объект с id и type


  useEffect(() => {
    fetchAll();
  }, [adminId]);

  const fetchAll = () => {
    fetchTeachers();
    fetchClasses();
    fetchStudents();
  };

  const fetchTeachers = async () => {
    const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}/teachers`);
    const data = await res.json();
    setTeachers(data || []);
  };

  const fetchClasses = async () => {
    const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}/classes`);
    const data = await res.json();
    setClasses(data || []);
  };

  const fetchStudents = async () => {
    const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}/students`);
    const data = await res.json();
    setStudents(data || []);
  };

  const deleteItem = async (id, type) => {
 
    
    if (!window.confirm("Are you sure you want to delete this?")) return;
  
    let url = "";
  
    switch (type) {
      case "teachers":
        url = `${SERVER_URL}/api/teachers/${id}`;
        break;
  
      case "students": {
        const student = students.find((s) => s.id === id);
        const teacherId = student?.teacherId;
        if (!teacherId) {
          toast.error("Teacher ID not found for this student");
          return;
        }
        url = `${SERVER_URL}/api/teacher/${teacherId}/students/${id}`;
        break;
      }
  
      case "classes": {
        url = `${SERVER_URL}/api/lessons/${id}`; // ✅ Используем только lessonId
        break;
      }
  
      default:
        toast.error("Unknown type");
        return;
    }
  
    try {
      const res = await authorizedFetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
  
      toast.success(`${type.slice(0, -1)} deleted!`);
      fetchAll();
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error("Failed to delete");
    }
  };
  
  const onEdit = (id, type) => {
    setEditData({ id, type });
    setMenuData(null); 
  };
  
  

  const toggleMenu = (id, type, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuData({ id, type, x: rect.x + rect.width, y: rect.y + window.scrollY });
  };

  const handleUpdateTeacher = async ({ id, name, email }) => {
    await authorizedFetch(`${SERVER_URL}/api/teachers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    toast.success("Teacher updated!");
    fetchTeachers();
  };
  
  const handleUpdateStudent = async ({ id, teacherId, name, email }) => {
    await authorizedFetch(`${SERVER_URL}/api/teacher/${teacherId}/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    toast.success("Student updated!");
    fetchStudents();
  };
  
  const handleUpdateClass = async ({ id, className, studentIds }) => {
    await authorizedFetch(`${SERVER_URL}/api/lessons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ className, studentIds }),
    });
    toast.success("Class updated!");
    fetchClasses();
  };
  

  const handleSaveTeacher = async ({ name, email, password }) => {
    const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}/teachers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      toast.success("Teacher added!");
      fetchTeachers();
    }
  };

  const handleSaveStudent = async ({ name, email, teacherId }) => {
    const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, teacherId }),
    });
    if (res.ok) {
      toast.success("Student added!");
      fetchStudents();
    }
  };

  const handleSaveClass = async ({ className, meetingId, teacherId, studentIds }) => {
    const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ className, meetingId, teacherId, studentIds }),
    });
    if (res.ok) {
      toast.success("Class added!");
      fetchClasses();
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-10">Admin Dashboard</h1>

      <div className="flex gap-4 mb-6">
        {["teachers", "classes", "students"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${activeTab === tab ? "bg-blue-600" : "bg-gray-700"}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "teachers" && (
        <DataTable
          title="teachers"
          data={teachers}
          columns={["name", "email"]}
          onAdd={() => setShowAddTeacherModal(true)}
          onMenuToggle={toggleMenu}
        />
      )}
{activeTab === "students" && (
  <DataTable
    title="students"
    data={students}
    columns={["name", "email", "classes"]}
    onAdd={() => setShowAddStudentModal(true)}
    onMenuToggle={toggleMenu}
  />
)}

      {activeTab === "classes" && (
        <DataTable
          title="classes"
          data={classes}
          columns={["className", "meetingId", "teacherName"]}
          onAdd={() => setShowAddClassModal(true)}
          onMenuToggle={toggleMenu}
        />
      )}
{editData?.type === "teachers" && (
  <AddTeacherModal
    onClose={() => setEditData(null)}
    onSave={(data) => handleUpdateTeacher({ ...data, id: editData.id })}
    isEdit
    initialData={teachers.find((t) => t.id === editData.id)}
  />
)}

{editData?.type === "students" && (
  <AddStudentModal
    onClose={() => setEditData(null)}
    onSave={(data) =>
      handleUpdateStudent({ ...data, id: editData.id, teacherId: data.teacherId || students.find((s) => s.id === editData.id)?.teacherId })
    }
    isEdit
    initialData={students.find((s) => s.id === editData.id)}
    teachers={teachers}
  />
)}

{editData?.type === "classes" && (
  <AddClassModal
    onClose={() => setEditData(null)}
    onSave={(data) => handleUpdateClass({ ...data, id: editData.id })}
    isEdit
    initialData={classes.find((c) => c.id === editData.id)}
    teachers={teachers}
    students={students}
  />
)}



      {menuData && (
        <ContextMenu data={menuData} onDelete={deleteItem} setMenuData={setMenuData} onEdit={onEdit}/>
      )}

      {showAddTeacherModal && (
        <AddTeacherModal onClose={() => setShowAddTeacherModal(false)} onSave={handleSaveTeacher} />
      )}
      {showAddStudentModal && (
        <AddStudentModal
          onClose={() => setShowAddStudentModal(false)}
          onSave={handleSaveStudent}
          teachers={teachers}
        />
      )}
      {showAddClassModal && (
        <AddClassModal
          onClose={() => setShowAddClassModal(false)}
          onSave={handleSaveClass}
          teachers={teachers}
          students={students}
        />
      )}
    </div>
  );
}

function DataTable({ title, data, columns, onAdd, onMenuToggle }) {
  return (
    <div className="bg-white bg-opacity-10 p-4 rounded-lg border border-gray-700 w-full max-w-5xl mx-auto mb-10">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold capitalize">{title}</h2>
        <button onClick={onAdd} className="bg-blue-600 px-4 py-2 rounded text-white">
          Add {title.slice(0, -1)}
        </button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} className="capitalize px-3 py-2">{col}</th>
            ))}
            <th className="px-3 py-2 text-right"></th> 
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
    {columns.map((col) => (
  <td key={col} className="px-3 py-2">
    {col === "classes"
      ? row.classes?.map((cls) => cls.className).join(", ")
      : row[col]}
  </td>
))}

              <td className="text-right px-3 py-2">
                <button
                  onClick={(e) => onMenuToggle(row.id, title, e)}
                  className="text-white"
                >
                  <FiMoreVertical />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContextMenu({ data, onDelete, setMenuData, onEdit }) {
  const menuRef = useRef();
  useEffect(() => {
    const click = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuData(null);
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, [setMenuData]);

  const type =
    data.type === "teachers" ? "teachers" :
    data.type === "students" ? "students" : "classes";

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 bg-gray-900 text-white rounded shadow-lg w-44"
      style={{ top: data.y + 10, left: data.x }}
    >
      <button
        className="px-4 py-2 w-full text-left hover:bg-gray-700"
        onClick={() => onDelete(data.id, type)}
      >
        <FiTrash2 className="inline mr-2" /> Delete
      </button>
      <button
  className="px-4 py-2 w-full text-left hover:bg-gray-700"
  onClick={() => onEdit(data.id, type)}
>
  ✏️ Edit
</button>

    </div>,
    document.body
  );
}

function AddTeacherModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }
    onSave(form);
    onClose();
  };

  return renderModal("Add Teacher", form, setForm, handleSubmit, onClose);
}

function AddStudentModal({ onClose, onSave, teachers }) {
  const [form, setForm] = useState({ name: "", email: "", teacherId: "" });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.teacherId) {
      toast.error("All fields are required");
      return;
    }
    onSave(form);
    onClose();
  };

  return renderModal("Add Student", form, setForm, handleSubmit, onClose, {
    teacherId: (
      <select
        name="teacherId"
        value={form.teacherId}
        onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
        className="w-full mb-3 px-3 py-2 border rounded"
      >
        <option value="">Select teacher</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
    ),
  });
}

function AddClassModal({
  onClose,
  onSave,
  teachers,
  students,
  isEdit = false,
  initialData = {}
}) {
  const [form, setForm] = useState({
    className: initialData.className || "",
    meetingId: initialData.meetingId || `meet-${Math.random().toString(36).substring(7)}`,
    teacherId: initialData.teacherId || "",
    studentIds: [],
  });


useEffect(() => {
  const fetchLinkedStudents = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/lessons/${initialData.id}/students`);
      const data = await res.json();
      const ids = data.map((s) => s.id); 
      setForm((prev) => ({ ...prev, studentIds: ids }));
    } catch (err) {
      console.error("❌ Failed to fetch lesson's students:", err);
    }
  };

  if (isEdit && initialData.id) {
    fetchLinkedStudents();
  }
}, [isEdit, initialData.id]);



  useEffect(() => {
    if (!isEdit) {
      const generatedId = `meet-${Math.random().toString(36).substring(7)}`;
      setForm((prev) => ({ ...prev, meetingId: generatedId }));
    }
  }, [isEdit]);

  const handleCheckbox = (id) => {
    setForm((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(id)
        ? prev.studentIds.filter((s) => s !== id)
        : [...prev.studentIds, id],
    }));
  };

  const handleSubmit = () => {
    if (!form.className || !form.teacherId) {
      toast.error("Class name and teacher are required");
      return;
    }
    onSave(form);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white text-black p-6 rounded w-[450px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Class" : "Add Class"}</h2>
        <input
          className="w-full mb-3 px-3 py-2 border rounded"
          placeholder="Class Name"
          value={form.className}
          onChange={(e) => setForm({ ...form, className: e.target.value })}
        />

        <select
          value={form.teacherId}
          onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
          className="w-full mb-3 px-3 py-2 border rounded"
        >
          <option value="">Select teacher</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <div className="mb-3">
          <label className="block font-semibold mb-1">Select students:</label>
          <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white/20">
            {students.map((s) => (
              <label key={s.id} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  value={s.id}
                  checked={form.studentIds.includes(s.id)}
                  onChange={() => handleCheckbox(s.id)}
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="border px-4 py-2 rounded text-gray-600">
            Cancel
          </button>
          <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}




function renderModal(title, form, setForm, onSubmit, onClose, customFields = {}) {
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white text-black p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {Object.keys(form).map((field) => {
          if (customFields[field]) return customFields[field];
          return (
            <input
              key={field}
              name={field}
              placeholder={field}
              className="w-full mb-3 px-3 py-2 border rounded"
              value={form[field] || ""}
              onChange={handleChange}
            />
          );
        })}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="border px-4 py-2 rounded text-gray-600">
            Cancel
          </button>
          <button onClick={onSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
