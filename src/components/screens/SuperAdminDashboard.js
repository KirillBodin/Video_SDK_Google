import React, { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import {
  FiMoreVertical,
  FiEdit,
  FiEye,
  FiTrash2,
  FiClipboard
} from "react-icons/fi";
import ReactDOM from "react-dom";
import { authorizedFetch } from "../../utils/api";
import { useParams, useNavigate } from "react-router-dom";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function SuperAdminDashboard() {
  const { name } = useParams();
  const superadminName = name;
  const navigate = useNavigate();

  useEffect(() => {
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach((track) => track.stop());
    }
    document.title = "TAMAMAT SuperAdmin";
  }, []);

  const [activeTab, setActiveTab] = useState("teachers");

  // Data
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);

  // Loading & context menu
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState(null);

  
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showDirectorModal, setShowDirectorModal] = useState(false);

  
  const [newTeacherData, setNewTeacherData] = useState({
    firstName: "",
    lastName: "",
    teacherEmail: "",
    teacherPassword: "",
    adminId: "",
  });
  const [newClassData, setNewClassData] = useState({
    className: "",
    teacherId: "",
  });
  const [newStudentData, setNewStudentData] = useState({
    firstName: "",
    lastName: "",
    studentEmail: "",
    classId: "",
  });
  const [newDirectorData, setNewDirectorData] = useState({
    name: "",
    email: "",
    password: ""
  });

  
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchAllData();
    fetchAdmins();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".portal-menu")) {
        setMenuData(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    window.location.href = `${window.location.origin}/admin/login`;
  };  

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTeachers(), fetchClasses(), fetchStudents()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/admins`);
      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch admins");
      setAdmins(data || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
      toast.error("Failed to fetch admins.");
    }
  };
  const fetchTeachers = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/teachers`);
      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch teachers");
      setTeachers(data || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      toast.error("Failed to fetch teachers.");
    }
  };
  

  const fetchClasses = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/classes`);
      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch classes");
      setClasses(data || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
      toast.error("Failed to fetch classes.");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/students`);
      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch students");
      setStudents(data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Failed to fetch students.");
    }
  };

  
  const handleAddTeacher = async () => {
    const { firstName, lastName, teacherEmail, teacherPassword, adminId } = newTeacherData;
    if (!firstName || !lastName || !teacherEmail || !teacherPassword || !adminId) {
      toast.info("Please fill in all teacher fields (including Admin)!");
      return;
    }
    try {
      const fullName = `${firstName} ${lastName}`;
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherName: fullName, teacherEmail, teacherPassword, adminId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create teacher");
      toast.success("Teacher added successfully!");
      fetchTeachers();
      setNewTeacherData({ firstName: "", lastName: "", teacherEmail: "", teacherPassword: "", adminId: "" });
      setShowTeacherModal(false);
    } catch (err) {
      console.error("Error creating teacher:", err);
      toast.error(err.message);
    }
  };

  const handleAddClass = async () => {
    const { className, teacherId } = newClassData;
    if (!className || !teacherId) {
      toast.info("Please fill in the class name and select a teacher!");
      return;
    }
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClassData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create class");
      toast.success("Class added successfully!");
      fetchClasses();
      setNewClassData({ className: "", teacherId: "" });
      setShowClassModal(false);
    } catch (err) {
      console.error("Error creating class:", err);
      toast.error(err.message);
    }
  };

  const handleAddStudent = async () => {
    const { firstName, lastName, studentEmail, classId } = newStudentData;
    if (!firstName || !lastName || !studentEmail || !classId) {
      toast.info("Please fill in student fields and select a class!");
      return;
    }
    try {
      const fullName = `${firstName} ${lastName}`;
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: fullName, studentEmail, classId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create student");
      toast.success("Student added successfully!");
      fetchStudents();
      setNewStudentData({ firstName: "", lastName: "", studentEmail: "", classId: "" });
      setShowStudentModal(false);
    } catch (err) {
      console.error("Error creating student:", err);
      toast.error(err.message);
    }
  };

  const handleAddDirector = async () => {
    const { name, email, password } = newDirectorData;
    if (!name || !email || !password) {
      toast.info("Please fill in all director fields!");
      return;
    }
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create director");
      toast.success("Director added successfully!");
      fetchAdmins();
      setNewDirectorData({ name: "", email: "", password: "" });
      setShowDirectorModal(false);
    } catch (err) {
      console.error("Error creating director:", err);
      toast.error(err.message);
    }
  };

  
  const handleUpdateTeacher = async (data) => {
    const { id, firstName, lastName, teacherEmail, teacherPassword, adminId } = data;
    try {
      const fullName = `${firstName} ${lastName}`;
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherName: fullName, teacherEmail, teacherPassword, adminId }),
      });
      if (!res.ok) throw new Error("Failed to update teacher");
      toast.success("Teacher updated!");
      fetchTeachers();
      setEditData(null);
    } catch (err) {
      console.error("Error updating teacher:", err);
      toast.error(err.message);
    }
  };

  const handleUpdateClass = async (data) => {
    const { id, className, teacherId } = data;
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className, teacherId }),
      });
      if (!res.ok) throw new Error("Failed to update class");
      toast.success("Class updated!");
      fetchClasses();
      setEditData(null);
    } catch (err) {
      console.error("Error updating class:", err);
      toast.error(err.message);
    }
  };

  const handleUpdateStudent = async (data) => {
    const { id, firstName, lastName, studentEmail, classId } = data;
    try {
      const fullName = `${firstName} ${lastName}`;
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: fullName, studentEmail, classId }),
      });
      if (!res.ok) throw new Error("Failed to update student");
      toast.success("Student updated!");
      fetchStudents();
      setEditData(null);
    } catch (err) {
      console.error("Error updating student:", err);
      toast.error(err.message);
    }
  };

  const handleUpdateDirector = async (data) => {
    const { id, name, email, password } = data;
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/admins/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error("Failed to update director");
      toast.success("Director updated!");
      fetchAdmins();
      setEditData(null);
    } catch (err) {
      console.error("Error updating director:", err);
      toast.error(err.message);
    }
  };

  const handleEditItem = (id, type) => {
    setEditData({ id, type });
    setMenuData(null);
  };

  const deleteItem = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      let url = "";
      if (type === "teachers") {
        url = `${SERVER_URL}/api/super-admin/teachers/${id}`;
      } else if (type === "classes") {
        url = `${SERVER_URL}/api/super-admin/classes/${id}`;
      } else if (type === "students") {
        url = `${SERVER_URL}/api/super-admin/students/${id}`;
      } else if (type === "directors") {
        url = `${SERVER_URL}/api/super-admin/admins/${id}`;
      }
      const res = await authorizedFetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete ${type}`);
      toast.success(`${type} deleted successfully!`);
      if (type === "teachers") setTeachers((prev) => prev.filter((t) => t.id !== id));
      if (type === "classes") setClasses((prev) => prev.filter((c) => c.id !== id));
      if (type === "students") setStudents((prev) => prev.filter((s) => s.id !== id));
      if (type === "directors") setAdmins((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleMenu = (id, type, event, classUrl) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuData({
      id,
      type: type.toLowerCase(),
      x: rect.x + rect.width,
      y: rect.y + window.scrollY,
      classUrl,
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#111111] to-black text-white p-6">
      {/* Заголовок */}
      <div className="grid grid-cols-3 items-center mb-10">
        <div></div>
        <h1 className="text-4xl font-bold text-center">SuperAdmin Page</h1>
        <div className="flex justify-end items-center gap-4">
          <span>{superadminName}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-700">
        {["teachers", "classes", "students", "directors"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 ${activeTab === tab ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Teachers Tab */}
      {activeTab === "teachers" && (
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Teachers</h3>
            <button
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
              onClick={() => setShowTeacherModal(true)}
            >
              Add Teacher
            </button>
          </div>
          <DataTable
            title="Teachers"
            data={teachers}
            columns={[
              { label: "Name", key: "name" },
              { label: "Email", key: "email" },
              { label: "# of Classes", key: "numberOfClasses" },
              { label: "# of Students", key: "numberOfStudents" },
            ]}
            onMenuToggle={toggleMenu}
          />
        </div>
      )}

      {/* Classes Tab */}
      {activeTab === "classes" && (
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Classes</h3>
          </div>
          <DataTable
            title="Classes"
            data={classes}
            columns={[
              { label: "Class Name", key: "className" },
              { label: "# of Students", key: "numberOfStudents" },
              { label: "Class URL", key: "classUrl" },
            ]}
            onMenuToggle={toggleMenu}
          />
        </div>
      )}

      {/* Students Tab */}
      {activeTab === "students" && (
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Students</h3>
            <button
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
              onClick={() => setShowStudentModal(true)}
            >
              Add Student
            </button>
          </div>
          <DataTable
            title="Students"
            data={students}
            columns={[
              { label: "Name", key: "name" },
              { label: "Email", key: "email" },
              { label: "Teacher", key: "teacherName" },
              { label: "Class", key: "className" },
            ]}
            onMenuToggle={toggleMenu}
          />
        </div>
      )}

      {/* Directors Tab */}
      {activeTab === "directors" && (
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Directors</h3>
            <button
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
              onClick={() => setShowDirectorModal(true)}
            >
              Add Director
            </button>
          </div>
          <DataTable
            title="Directors"
            data={admins}
            columns={[
              { label: "Name", key: "name" },
              { label: "Email", key: "email" },
            ]}
            onMenuToggle={toggleMenu}
          />
        </div>
      )}

      {/* Модальные окна для редактирования */}
      {editData?.type === "teachers" && (
        <TeacherModal
          visible={true}
          isEdit={true}
          onClose={() => setEditData(null)}
          onSave={(data) => handleUpdateTeacher({ ...data, id: editData.id })}
          initialData={teachers.find((t) => t.id === editData.id) || {}}
          admins={admins}
        />
      )}
      {editData?.type === "classes" && (
        <ClassModal
          visible={true}
          isEdit={true}
          onClose={() => setEditData(null)}
          onSave={(data) => handleUpdateClass({ ...data, id: editData.id })}
          initialData={classes.find((c) => c.id === editData.id) || {}}
          teachers={teachers}
        />
      )}
      {editData?.type === "students" && (
        <StudentModal
          visible={true}
          isEdit={true}
          onClose={() => setEditData(null)}
          onSave={(data) => handleUpdateStudent({ ...data, id: editData.id })}
          initialData={students.find((s) => s.id === editData.id) || {}}
          classes={classes}
        />
      )}
      {editData?.type === "directors" && (
        <DirectorModal
          visible={true}
          isEdit={true}
          onClose={() => setEditData(null)}
          onSave={(data) => handleUpdateDirector({ ...data, id: editData.id })}
          initialData={admins.find((d) => d.id === editData.id) || {}}
        />
      )}

      {/* Модальные окна для добавления */}
      {showTeacherModal && (
        <TeacherModal
          visible={true}
          onClose={() => setShowTeacherModal(false)}
          onSave={handleAddTeacher}
          initialData={{}}
          admins={admins}
        />
      )}
      {showClassModal && (
        <ClassModal
          visible={true}
          onClose={() => setShowClassModal(false)}
          onSave={handleAddClass}
          initialData={{}}
          teachers={teachers}
        />
      )}
      {showStudentModal && (
        <StudentModal
          visible={true}
          onClose={() => setShowStudentModal(false)}
          onSave={handleAddStudent}
          initialData={{}}
          classes={classes}
        />
      )}
      {showDirectorModal && (
        <DirectorModal
          visible={true}
          onClose={() => setShowDirectorModal(false)}
          onSave={handleAddDirector}
          initialData={{}}
        />
      )}

      {menuData && (
        <ContextMenu
          data={menuData}
          onDelete={deleteItem}
          onEdit={(id, type) => handleEditItem(id, type)}
          onView={() => console.log("View", menuData)}
          setMenuData={setMenuData}
        />
      )}
    </div>
  );
}

function DataTable({ title, data, columns, onMenuToggle }) {
  return (
    <div className="w-full bg-white bg-opacity-10 rounded-xl p-6 shadow-lg border border-gray-700 backdrop-blur-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">{title}:</h2>
      </div>
      {data && data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-900 text-white">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="bg-gray-800 border-b border-gray-700">
                  {columns.map((col) => {
                    let value = item[col.key] ?? "-";
                    if (col.key === "classUrl" && value !== "-") {
                      value = window.location.origin + "/" + value;
                    }
                    return (
                      <td key={col.key} className="px-4 py-3">
                        {value}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => onMenuToggle(item.id, title.toLowerCase(), e)}
                      className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none"
                    >
                      <FiMoreVertical className="text-white text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-white text-center">No {title.toLowerCase()} found</p>
      )}
    </div>
  );
}



function ContextMenu({ data, onDelete, onEdit, onView, setMenuData }) {
  const menuRef = useRef();
  useEffect(() => {
    const click = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuData(null);
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, [setMenuData]);
  const handleCopy = () => {
    if (data.classUrl) {
      const fullUrl = `${window.location.origin}/class/${data.classUrl}`;
      navigator.clipboard.writeText(fullUrl);
      toast.success("Class URL copied!");
    }
    setMenuData(null);
  };
  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      className="portal-menu fixed bg-gray-900 text-white shadow-lg rounded-md z-50 w-44"
      style={{ top: data.y + 10, left: data.x - 10 }}
    >
      {data.type === "classes" && data.classUrl && (
        <button
          className="px-4 py-2 w-full text-left hover:bg-gray-700 flex items-center gap-2"
          onClick={handleCopy}
        >
          <FiClipboard />
          Copy URL
        </button>
      )}
      <button
        className="px-4 py-2 w-full text-left hover:bg-gray-700"
        onClick={() => {
          onDelete(data.id, data.type);
          setMenuData(null);
        }}
      >
        <FiTrash2 className="inline mr-2" /> Delete
      </button>
      <button
        className="px-4 py-2 w-full text-left hover:bg-gray-700"
        onClick={() => {
          onEdit(data.id, data.type);
          setMenuData(null);
        }}
      >
        <FiEdit className="inline mr-2" /> Edit
      </button>
      <button
        className="px-4 py-2 w-full text-left hover:bg-gray-700"
        onClick={() => {
          onView(data);
          setMenuData(null);
        }}
      >
        <FiEye className="inline mr-2" /> View
      </button>
    </div>,
    document.body
  );
}

/* --------------------- Модальные окна --------------------- */

/* TeacherModal – теперь разделяет имя на firstName и lastName.
   При редактировании дополнительно выполняется запрос для получения директора,
   к которому привязан учитель.
*/
function TeacherModal({ visible, onClose, onSave, initialData, admins, isEdit = false }) {
  const [form, setForm] = useState({
    firstName: initialData.name ? initialData.name.split(" ")[0] : "",
    lastName: initialData.name ? initialData.name.split(" ").slice(1).join(" ") : "",
    teacherEmail: initialData.email || "",
    teacherPassword: "",
    adminId: initialData.adminId || "",
  });

  
  useEffect(() => {
    setForm({
      firstName: initialData.name ? initialData.name.split(" ")[0] : "",
      lastName: initialData.name ? initialData.name.split(" ").slice(1).join(" ") : "",
      teacherEmail: initialData.email || "",
      teacherPassword: "",
      adminId: initialData.adminId || "",
    });
    if (isEdit && initialData.id) {
      authorizedFetch(`${SERVER_URL}/api/teacher/${initialData.id}/admin`)
        .then((res) => res.json())
        .then((directorData) => {
          if (directorData && directorData.id) {
            setForm((prev) => ({ ...prev, adminId: directorData.id }));
          }
        })
        .catch((err) => console.error("Error fetching teacher director:", err));
    }
  }, [initialData, isEdit]);

  if (!visible) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-gray-800 text-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">{isEdit ? "Edit Teacher" : "Add Teacher"}</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="First Name"
            className="px-4 py-2 rounded bg-gray-700"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Last Name"
            className="px-4 py-2 rounded bg-gray-700"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 rounded bg-gray-700"
            value={form.teacherEmail}
            onChange={(e) => setForm({ ...form, teacherEmail: e.target.value })}
          />
          <input
            type="password"
            placeholder={isEdit ? "Leave blank to keep current" : "Password"}
            className="px-4 py-2 rounded bg-gray-700"
            value={form.teacherPassword}
            onChange={(e) => setForm({ ...form, teacherPassword: e.target.value })}
          />
          <select
            className="px-4 py-2 rounded bg-gray-700"
            value={form.adminId}
            onChange={(e) => setForm({ ...form, adminId: e.target.value })}
          >
            <option value="">Select Admin</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">
            Cancel
          </button>
          <button onClick={() => onSave(form)} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ClassModal – поддерживает режим редактирования */
function ClassModal({ visible, onClose, onSave, initialData, teachers, isEdit = false }) {
  const [form, setForm] = useState({
    className: initialData.className || "",
    teacherId: initialData.teacherId || "",
  });

  useEffect(() => {
    setForm({
      className: initialData.className || "",
      teacherId: initialData.teacherId || "",
    });
  }, [initialData]);

  if (!visible) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-gray-800 text-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">{isEdit ? "Edit Class" : "Add Class"}</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Class Name"
            className="px-4 py-2 rounded bg-gray-700"
            value={form.className}
            onChange={(e) => setForm({ ...form, className: e.target.value })}
          />
          <select
            className="px-4 py-2 rounded bg-gray-700"
            value={form.teacherId}
            onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">
            Cancel
          </button>
          <button onClick={() => onSave(form)} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* StudentModal – теперь разделяет имя на firstName и lastName */
function StudentModal({ visible, onClose, onSave, initialData, classes, isEdit = false }) {
  const [form, setForm] = useState({
    firstName: initialData.name ? initialData.name.split(" ")[0] : "",
    lastName: initialData.name ? initialData.name.split(" ").slice(1).join(" ") : "",
    studentEmail: initialData.email || "",
    classId: initialData.classId || "",
  });

  useEffect(() => {
    setForm({
      firstName: initialData.name ? initialData.name.split(" ")[0] : "",
      lastName: initialData.name ? initialData.name.split(" ").slice(1).join(" ") : "",
      studentEmail: initialData.email || "",
      classId: initialData.classId || "",
    });
  }, [initialData]);

  if (!visible) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-gray-800 text-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">{isEdit ? "Edit Student" : "Add Student"}</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="First Name"
            className="px-4 py-2 rounded bg-gray-700"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Last Name"
            className="px-4 py-2 rounded bg-gray-700"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 rounded bg-gray-700"
            value={form.studentEmail}
            onChange={(e) => setForm({ ...form, studentEmail: e.target.value })}
          />
          <select
            className="px-4 py-2 rounded bg-gray-700"
            value={form.classId}
            onChange={(e) => setForm({ ...form, classId: e.target.value })}
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">
            Cancel
          </button>
          <button onClick={() => onSave(form)} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* DirectorModal – поддерживает режим редактирования */
function DirectorModal({ visible, onClose, onSave, initialData, isEdit = false }) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    password: "",
  });

  useEffect(() => {
    setForm({
      name: initialData.name || "",
      email: initialData.email || "",
      password: "",
    });
  }, [initialData]);

  if (!visible) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-gray-800 text-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">{isEdit ? "Edit Director" : "Add Director"}</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Director Name"
            className="px-4 py-2 rounded bg-gray-700"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Director Email"
            className="px-4 py-2 rounded bg-gray-700"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder={isEdit ? "Leave blank to keep current" : "Password"}
            className="px-4 py-2 rounded bg-gray-700"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">
            Cancel
          </button>
          <button onClick={() => onSave(form)} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

