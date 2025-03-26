import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiMoreVertical, FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import ReactDOM from "react-dom";
import { authorizedFetch } from "../../utils/api";

const SERVER_URL = "https://backendvideosdk-production.up.railway.app";

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("teachers");

  // Data
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]); 

  // Loading & context menu
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState(null);

  // Modal states
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false); 
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showDirectorModal, setShowDirectorModal] = useState(false);
  // Form data
  const [newTeacherData, setNewTeacherData] = useState({
    teacherName: "",
    teacherEmail: "",
    teacherPassword: "",
    adminId: "",
  });
  const [newClassData, setNewClassData] = useState({
    className: "",
    teacherId: "",
  });
  const [newStudentData, setNewStudentData] = useState({
    studentName: "",
    studentEmail: "",
    classId: "",
  });


   const [newDirectorData, setNewDirectorData] = useState({
       name: "",
      email: "",
       password: ""
     });

  useEffect(() => {
    // Fetch all data (teachers, classes, students, admins)
    fetchAllData();
    fetchAdmins(); // get admins
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".portal-menu")) {
        setMenuData(null);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  

  // Fetch all data in parallel
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

  // Fetch admins
  const fetchAdmins = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/admins`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch admins");
      }
      setAdmins(data);
    } catch (err) {
      console.error("Error fetching admins:", err);
      toast.error("Failed to fetch admins.");
    }
  };

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/teachers`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch teachers");
      }
      setTeachers(data);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      toast.error("Failed to fetch teachers.");
    }
  };

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/classes`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch classes");
      }
      setClasses(data);
    } catch (err) {
      console.error("Error fetching classes:", err);
      toast.error("Failed to fetch classes.");
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/students`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch students");
      }
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Failed to fetch students.");
    }
  };

  // Add new teacher
  const handleAddTeacher = async () => {
    const { teacherName, teacherEmail, teacherPassword, adminId } = newTeacherData;
    if (!teacherName || !teacherEmail || !teacherPassword || !adminId) {
      toast.info("Please fill in all teacher fields (including Admin)!");
      return;
    }
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeacherData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create teacher");
      }
      toast.success("Teacher added successfully!");
      fetchTeachers();
      setNewTeacherData({
        teacherName: "",
        teacherEmail: "",
        teacherPassword: "",
        adminId: "",
      });
      setShowTeacherModal(false);
    } catch (err) {
      console.error("Error creating teacher:", err);
      toast.error(err.message);
    }
  };

  // Add new class
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
      if (!res.ok) {
        throw new Error(data.error || "Failed to create class");
      }
      toast.success("Class added successfully!");
      fetchClasses();
      setNewClassData({ className: "", teacherId: "" });
      setShowClassModal(false);
    } catch (err) {
      console.error("Error creating class:", err);
      toast.error(err.message);
    }
  };

  // Add new student
  const handleAddStudent = async () => {
    const { studentName, studentEmail, classId } = newStudentData;
    if (!studentName || !studentEmail || !classId) {
      toast.info("Please fill in student name, email, and select a class!");
      return;
    }
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudentData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create student");
      }
      toast.success("Student added successfully!");
      fetchStudents();
      setNewStudentData({ studentName: "", studentEmail: "", classId: "" });
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
      if (!res.ok) {
        throw new Error(data.error || "Failed to create director");
      }
  
      toast.success("Director added successfully!");
      fetchAdmins(); 
      setNewDirectorData({ name: "", email: "", password: "" });
      setShowDirectorModal(false);
    } catch (err) {
      console.error("Error creating director:", err);
      toast.error(err.message);
    }
  };
  



 const handleEditItem = (data) => {
  setMenuData(null);

  if (data.type === "teachers") {
   
  } else if (data.type === "classes") {
   
  } else if (data.type === "students") {
    
  } else if (data.type === "directors") {
   
    const director = admins.find((d) => d.id === data.id);
    if (!director) return;

    
    setNewDirectorData({
      name: director.name || "",
      email: director.email || "",
      password: ""
    });

   
    setShowDirectorModal(true);

  
  }
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
      }
      else if (type === "directors") {
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

 
  const toggleMenu = (id, type, event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    if (menuData?.id === id) {
      setMenuData(null);
    } else {
      setMenuData({
        id,
        type,
        x: rect.x + rect.width,
        y: rect.y + window.scrollY,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#111111] to-black text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-10">Super Admin Dashboard</h1>

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
            actions={{ view: true, edit: true, delete: true }}
            onMenuToggle={toggleMenu}
          />
        </div>
      )}

      {/* Classes Tab */}
      {activeTab === "classes" && (
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Classes</h3>
            {/* Button to add class is removed as per request */}
          </div>
          <DataTable
            title="Classes"
            data={classes}
            columns={[
              { label: "Class Name", key: "className" },
              { label: "# of Students", key: "numberOfStudents" },
              { label: "Class URL", key: "classUrl" },
            ]}
            actions={{ view: true, edit: true, delete: true }}
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
            actions={{ view: true, edit: true, delete: true }}
            onMenuToggle={toggleMenu}
          />
        </div>
      )}
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
      actions={{ view: true, edit: true, delete: true }}
      onMenuToggle={toggleMenu}
    />
  </div>
)}

      {/* Modals */}
      <TeacherModal
        visible={showTeacherModal}
        onClose={() => setShowTeacherModal(false)}
        onSave={handleAddTeacher}
        formData={newTeacherData}
        setFormData={setNewTeacherData}
        admins={admins} // pass admins here
      />
      <ClassModal
        visible={showClassModal}
        onClose={() => setShowClassModal(false)}
        onSave={handleAddClass}
        formData={newClassData}
        setFormData={setNewClassData}
        teachers={teachers}
      />
      <StudentModal
        visible={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        onSave={handleAddStudent}
        formData={newStudentData}
        setFormData={setNewStudentData}
        classes={classes}
      />

<DirectorModal
  visible={showDirectorModal}
  onClose={() => setShowDirectorModal(false)}
  onSave={handleAddDirector}
  formData={newDirectorData}
  setFormData={setNewDirectorData}
/>


      {menuData && (
        <ContextMenu
          data={menuData}
          onDelete={deleteItem}
          onEdit={handleEditItem}
          onView={() => console.log("View", menuData)}
          setMenuData={setMenuData}
        />
      )}
    </div>
  );
}

/* -------------------------------------------
   DataTable component
   - Adds domain to Class URL
------------------------------------------- */
function DataTable({ title, data, columns, actions, onMenuToggle }) {
  return (
    <div className="w-full bg-white bg-opacity-10 rounded-xl p-6 shadow-lg border border-gray-700 backdrop-blur-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">{title}:</h2>
      </div>
      {data.length > 0 ? (
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
              {data.map((item) => {
                return (
                  <tr key={item.id} className="bg-gray-800 border-b border-gray-700">
                    {columns.map((col) => {
                      let value = item[col.key] ?? "-";

                      // If column is "classUrl", prepend domain
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
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-white text-center">No {title.toLowerCase()} found</p>
      )}
    </div>
  );
}

/* -------------------------------------------
   ContextMenu component
------------------------------------------- */
function ContextMenu({ data, onDelete, onEdit, onView, setMenuData }) {
  return ReactDOM.createPortal(
    <div
      className="portal-menu fixed bg-gray-900 text-white shadow-lg rounded-md z-50 w-44"
      style={{ top: data.y + 10, left: data.x - 10 }}
    >
      <button className="flex items-center px-4 py-2 w-full hover:bg-gray-700 text-left" onClick={() => onView(data)}>
        <FiEye className="mr-2" /> View
      </button>
      <button className="flex items-center px-4 py-2 w-full hover:bg-gray-700 text-left" onClick={() => onEdit(data)}>
        <FiEdit className="mr-2" /> Edit
      </button>
      <button
        className="flex items-center px-4 py-2 w-full text-red-400 hover:bg-gray-700 text-left"
        onClick={() => onDelete(data.id, data.type)}
      >
        <FiTrash2 className="mr-2" /> Delete
      </button>
    </div>,
    document.body
  );
}

/* -------------------------------------------
   Modals
------------------------------------------- */

/* TeacherModal 
   - now includes a dropdown for Admin
*/
function TeacherModal({ visible, onClose, onSave, formData, setFormData, admins }) {
  if (!visible) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      {/* Modal content */}
      <div className="relative bg-gray-800 text-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">Add Teacher</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name"
            className="px-4 py-2 rounded bg-gray-700"
            value={formData.teacherName}
            onChange={(e) =>
              setFormData({ ...formData, teacherName: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 rounded bg-gray-700"
            value={formData.teacherEmail}
            onChange={(e) =>
              setFormData({ ...formData, teacherEmail: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-2 rounded bg-gray-700"
            value={formData.teacherPassword}
            onChange={(e) =>
              setFormData({ ...formData, teacherPassword: e.target.value })
            }
          />
          {/* Select Admin */}
          <select
            className="px-4 py-2 rounded bg-gray-700"
            value={formData.adminId}
            onChange={(e) =>
              setFormData({ ...formData, adminId: e.target.value })
            }
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
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ClassModal 
   - The "Add Class" button is removed from the UI, 
     but the modal is still here in case it's needed.
*/
function ClassModal({ visible, onClose, onSave, formData, setFormData, teachers }) {
  if (!visible) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-gray-800 text-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">Add Class</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Class Name"
            className="px-4 py-2 rounded bg-gray-700"
            value={formData.className}
            onChange={(e) =>
              setFormData({ ...formData, className: e.target.value })
            }
          />
          <select
            className="px-4 py-2 rounded bg-gray-700"
            value={formData.teacherId}
            onChange={(e) =>
              setFormData({ ...formData, teacherId: e.target.value })
            }
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
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* StudentModal */
function StudentModal({ visible, onClose, onSave, formData, setFormData, classes }) {
  if (!visible) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-gray-800 text-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">Add Student</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name"
            className="px-4 py-2 rounded bg-gray-700"
            value={formData.studentName}
            onChange={(e) =>
              setFormData({ ...formData, studentName: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 rounded bg-gray-700"
            value={formData.studentEmail}
            onChange={(e) =>
              setFormData({ ...formData, studentEmail: e.target.value })
            }
          />
          <select
            className="px-4 py-2 rounded bg-gray-700"
            value={formData.classId}
            onChange={(e) =>
              setFormData({ ...formData, classId: e.target.value })
            }
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
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
function DirectorModal({ visible, onClose, onSave, formData, setFormData }) {
  if (!visible) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      {/* Modal content */}
      <div className="relative bg-gray-800 text-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">Add / Edit Director</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Director Name"
            className="px-4 py-2 rounded bg-gray-700"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Director Email"
            className="px-4 py-2 rounded bg-gray-700"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-2 rounded bg-gray-700"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
