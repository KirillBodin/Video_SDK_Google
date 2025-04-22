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
function renderModal(title, form, setForm, onSubmit, onClose, customFields = {}) {

  const fieldPlaceholders = {
    firstName: "First Name",
    lastName: "Last Name",
    teacherEmail: "Email",
    studentEmail: "Email",
    email: "Email",
    password: "Password",
    className: "Class Name",
  };

  const requiredFields = [
    "firstName",
    "lastName",
    "teacherEmail",
    "studentEmail",
    "email",
    "password",
    "className"
  ];

const mergedFields = [...Object.keys(customFields), ...Object.keys(form).filter(f => !customFields[f])];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return ReactDOM.createPortal(
    <div className={`fixed inset-0 ${customFields.zIndex || 'z-[60]'} bg-black bg-opacity-40 flex items-center justify-center`}>
     <div className="bg-white text-black p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        
        {mergedFields.map((field) => {
          if (customFields[field]) {
            return <React.Fragment key={field}>{customFields[field]}</React.Fragment>;
          }
          return (
            <div key={field} className="mb-3">
              <label className="block font-semibold mb-1">
                {fieldPlaceholders[field] || field}
                {requiredFields.includes(field) && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <input
                name={field}
                placeholder={fieldPlaceholders[field] || field}
                className="w-full px-3 py-2 border rounded"
                value={form[field] || ""}
                onChange={handleChange}
              />
            </div>
          );
        })}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="border border-gray-400 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition px-4 py-2 rounded text-gray-600">
            Cancel
          </button>
          <button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
export default function SuperAdminDashboard() {
  const { name } = useParams();
  const superadminName = name;
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 8;

  const [currentPage, setCurrentPage] = useState({
    teachers: 1,
    students: 1,
    classes: 1,
    schoolAdmins: 1,
  });
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
  const [overlayModal, setOverlayModal] = useState(null); 


  const [newTeacherData, setNewTeacherData] = useState({
    firstName: "",
    lastName: "",
    teacherEmail: "",
    teacherPassword: "",
    adminId: "",
    classIds: [],
    studentIds: [],
  });
  
  const [newClassData, setNewClassData] = useState({
    className: "",
    teacherId: "",
    studentIds: [],
  });
  
  
  
  const [newStudentData, setNewStudentData] = useState({
    firstName: "",
    lastName: "",
    studentEmail: "",
    password: "",
    classIds: [],
    teacherIds: []
  });
  
  
  
  const [newDirectorData, setNewDirectorData] = useState({
    firstName: "",
    lastName: "",
    schoolName: "",
    email: "",
    password: "",
    teacherIds: []
  });

  const paginate = (array, page) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return array.slice(start, start + ITEMS_PER_PAGE);
  };

  
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
    const { firstName, lastName, teacherEmail, teacherPassword, adminId, classIds, studentIds } = newTeacherData;
  
    if (!firstName) {
      toast.error("First name is required.");
      return;
    }
    if (!lastName) {
      toast.error("Last name is required.");
      return;
    }
    if (!teacherEmail) {
      toast.error("Email is required.");
      return;
    }
    if (!teacherPassword) {
      toast.error("Password is required.");
      return;
    }
    if (!adminId) {
      toast.error("Please select a School Admin.");
      return;
    }
  
    try {
      const teacherName = `${firstName} ${lastName}`;
      const payload = {
        teacherName,
        teacherEmail,
        teacherPassword,
        adminId,
        classIds,
        studentIds
      };
  
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data?.error || data?.message || "Failed to create teacher";
        throw new Error(errorMsg);
      }
  
      toast.success("Teacher added successfully!");
      fetchTeachers();
      setNewTeacherData({
        firstName: "",
        lastName: "",
        teacherEmail: "",
        teacherPassword: "",
        adminId: "",
        classIds: [],
        studentIds: []
      });
      setShowTeacherModal(false);
    } catch (err) {
      console.error("Error creating teacher:", err);
      toast.error(err.message);
    }
  };
  
  

  const handleAddClass = async () => {
    const { className, teacherId, studentIds } = newClassData;
  
    if (!className) {
      toast.error("Class name is required.");
      return;
    }
    if (!teacherId) {
      toast.error("Please select a teacher.");
      return;
    }
  
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className, teacherId, studentIds }),
      });
  
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data?.error || data?.message || "Failed to create class";
        throw new Error(errorMsg);
      }
  
      toast.success("Class added successfully!");
      fetchClasses();
      setShowClassModal(false);
      setNewClassData({ className: "", teacherId: "", studentIds: [] });
    } catch (err) {
      console.error("Error creating class:", err);
      toast.error(err.message);
    }
  };
  
  

  const handleAddStudent = async () => {
    const { firstName, lastName, studentEmail, classIds,teacherIds } = newStudentData;
  
    if (!firstName) {
      toast.error("First name is required.");
      return;
    }
    if (!lastName) {
      toast.error("Last name is required.");
      return;
    }
    if (!studentEmail) {
      toast.error("Email is required.");
      return;
    }
    if (!teacherIds.length) {
      toast.error("Please select at least one techer.");
      return;
    }
  
    try {
      const fullName = `${firstName} ${lastName}`;
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: fullName, studentEmail, classIds, teacherIds: newStudentData.teacherIds }),
      });
  
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data?.error || data?.message || "Failed to create student";
        throw new Error(errorMsg);
      }
  
      toast.success("Student added successfully!");
      fetchStudents();
      setNewStudentData({ firstName: "", lastName: "", studentEmail: "", classIds: [], teacherIds: [] });
      setShowStudentModal(false);
    } catch (err) {
      console.error("Error creating student:", err);
      toast.error(err.message);
    }
  };
  
  

  const handleAddDirector = async (form) => {
    const { firstName, lastName, schoolName, email, password, teacherIds } = form;
  
    if (!firstName?.trim()) {
      toast.error("First name is required.");
      return;
    }
    if (!lastName?.trim()) {
      toast.error("Last name is required.");
      return;
    }
    if (!schoolName?.trim()) {
      toast.error("School name is required.");
      return;
    }
    if (!email?.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (!password?.trim()) {
      toast.error("Password is required.");
      return;
    }
  
    const name = `${firstName} ${lastName}`;
  
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, schoolName }),
      });
  
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data?.error || data?.message || "Failed to create director";
        throw new Error(errorMsg);
      }
  
      toast.success("Director added successfully!");
      fetchAdmins();
      setShowDirectorModal(false);
    } catch (err) {
      console.error("Error creating director:", err);
      toast.error(err.message);
    }
  };
  
  
  

  
  const handleUpdateTeacher = async (data) => {
    const {
      id,
      firstName,
      lastName,
      email,
      password,
      adminId,
      classIds,
      studentIds,
    } = data;
  
    try {
      const fullName = `${firstName} ${lastName}`;
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherName: fullName,
          teacherEmail: email,
          teacherPassword: password,
          adminId,
          classIds,
          studentIds,
          id
        }),
      });
  
      const responseData = await res.json();
      if (!res.ok) {
        const errorMsg = responseData?.error || responseData?.message || "Failed to update teacher";
        throw new Error(errorMsg);
      }
  
      toast.success("Teacher updated!");
      fetchTeachers();
      setEditData(null);
    } catch (err) {
      console.error("Error updating teacher:", err);
      toast.error(err.message);
    }
  };
  

  const handleUpdateClass = async (data) => {
    const { id, className, teacherId, studentIds } = data;
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className, teacherId, studentIds }),
      });
      const data = await res.json();
if (!res.ok) {
  const errorMsg = data?.error || data?.message || "Failed to update class";
  throw new Error(errorMsg);
}

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
      const data = await res.json();
if (!res.ok) {
  const errorMsg = data?.error || data?.message || "Failed to update student";
  throw new Error(errorMsg);
}

      toast.success("Student updated!");
      fetchStudents();
      setEditData(null);
    } catch (err) {
      console.error("Error updating student:", err);
      toast.error(err.message);
    }
  };

  const handleUpdateDirector = async (data) => {
    const { id, firstName, lastName, schoolName, email, password, teacherIds } = data;
const name = `${firstName} ${lastName}`;

    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/admins/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, schoolName }),
      });
      const data = await res.json();
if (!res.ok) {
  const errorMsg = data?.error || data?.message || "Failed to update director";
  throw new Error(errorMsg);
}

      toast.success("Director updated!");
      fetchAdmins();
      setEditData(null);
    } catch (err) {
      console.error("Error updating director:", err);
      toast.error(err.message);
    }
  };

  const handleEditItem = async (id, type) => {
    setMenuData(null);
  
    if (type === "teachers") {
      try {
        const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/teachers/${id}/details`);
        if (!res.ok) throw new Error("Failed to load teacher details");
        const data = await res.json();
  
        const { firstName, lastName, email, adminName, classIds, studentIds } = data;
        const matchedAdmin = admins.find((a) => a.name === adminName);
        const admin = matchedAdmin ? matchedAdmin.id : "";
        setEditData({
          id,
          type,
          teacherInfo: {
            firstName,
            lastName,
            email,
            adminId: admin,
            classIds,
            studentIds,
            schoolName: data.schoolName || "",
          }
        });
        
      } catch (err) {
        toast.error("Failed to load teacher data.");
      }
    } else if (type === "classes") {
      try {
        const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/classes/${id}/details`);
        if (!res.ok) throw new Error("Failed to load class details");
        const data = await res.json();
    
        setEditData({
          id,
          type,
          classInfo: {
            className: data.className,
            teacherId: data.teacherId,
            studentIds: data.studentIds || [],
          }
        });
      } catch (err) {
        toast.error("Failed to load class data.");
      }
    }
    else if (type === "students") {
      try {
        const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/students/${id}/details`);
        if (!res.ok) throw new Error("Failed to load student details");
        const data = await res.json();
    
        setEditData({
          id,
          type,
          studentInfo: {
            firstName: data.firstName,
            lastName: data.lastName,
            studentEmail: data.email,
            classIds: data.classIds || [],
            teacherIds: data.teacherIds || []
          }
        });
      } catch (err) {
        toast.error("Failed to load student data.");
      }
    }
    else if (type === "schoolAdmins") {
      try {
        const res = await authorizedFetch(`${SERVER_URL}/api/super-admin/admins/${id}/details`);
        if (!res.ok) throw new Error("Failed to load admin details");
        const data = await res.json();
    
        const [firstName, ...rest] = (data.name || "").split(" ");
        const lastName = rest.join(" ");
    
        setEditData({
          id,
          type,
          directorInfo: {
            firstName,
            lastName,
            schoolName: data.schoolName || "",
            email: data.email || "",
            password: "",
            teacherIds: data.teacherIds || []
          }
        });
    
      } catch (err) {
        console.error("Error loading school admin details:", err);
        toast.error("Failed to load admin data.");
      }
    }
    
    
    
    
    
  };
  

  const deleteItem = async (id, type) => {
  
    const singularMap = {
      teachers: "Teacher",
      students: "Student",
      classes: "Class",
      schooladmins: "School Admin"
    };
    
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
  
    try {
      const normalizedType = type.toLowerCase();
      let url = "";
      
      if (normalizedType === "teachers") {
        url = `${SERVER_URL}/api/super-admin/teachers/${id}`;
      } else if (normalizedType === "classes") {
        url = `${SERVER_URL}/api/super-admin/classes/${id}`;
      } else if (normalizedType === "students") {
        url = `${SERVER_URL}/api/super-admin/students/${id}`;
      } else if (normalizedType === "schooladmins") {
        url = `${SERVER_URL}/api/super-admin/admins/${id}`;
      }
      
  
    
  
      const res = await authorizedFetch(url, { method: "DELETE" });
  
  
      if (!res.ok) throw new Error(`Failed to delete ${type}`);
      toast.success(`${singularMap[type] || "Item"} deleted successfully!`);
  
      if (type === "teachers") setTeachers((prev) => prev.filter((t) => t.id !== id));
      if (type === "classes") setClasses((prev) => prev.filter((c) => c.id !== id));
      if (type === "students") setStudents((prev) => prev.filter((s) => s.id !== id));
      if (type === "schooladmins") setAdmins((prev) => prev.filter((d) => d.id !== id));
      
  
    } catch (err) {
      console.error("❌ Error in deleteItem:", err);
      toast.error(err.message);
    }
  };
  
  const toggleMenu = ({ id, type, x, y, classUrl }) => {
    setMenuData({
      id,
      type: type.toLowerCase(), 
      x,
      y,
      classUrl,
    });
  };
  
  
  
  
  
  
  
  
  

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#111111] to-black text-white p-6">
    
    <div className="w-full flex justify-end items-center mb-6 px-4">
  <div className="flex items-center gap-4">
    <span className="text-lg font-semibold text-white">
      {superadminName?.split("_").slice(1).join(" ")}
    </span>
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition text-white px-4 py-2 rounded-md"
    >
      Log Out
    </button>
  </div>
</div>
<h1 className="text-4xl font-bold text-center mb-10">Super Admin Dashboard</h1>


      {/* Tabs */}
      <div className="flex gap-4 mb-6 justify-center">
  {["teachers", "classes", "students", "schoolAdmins"].map((tab) => {
    const isActive = activeTab === tab;
    return (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 rounded-md text-white transition-all duration-150
          ${isActive ? "bg-gray-800 border-b-2 border-blue-500" : "hover:bg-gray-700"}
        `}
      >
        {tab === "schoolAdmins" ? "School Admins" : tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>
    );
  })}
</div>


      {/* Teachers Tab */}
      {activeTab === "teachers" && (
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold"></h3>
            <button
              className="bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition px-4 py-2 rounded"
              onClick={() => setShowTeacherModal(true)}
            >
              Add Teacher
            </button>
          </div>
          <DataTable
  title="Teachers"
  data={paginate(teachers, currentPage.teachers)}
  columns={[
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "# of Classes", key: "numberOfClasses" },
    { label: "# of Students", key: "numberOfStudents" },
  ]}
  onMenuToggle={toggleMenu}
  totalItems={teachers.length}
  currentPage={currentPage.teachers}
  onPageChange={(page) =>
    setCurrentPage((prev) => ({ ...prev, teachers: page }))
  }
/>

        </div>
      )}

      {/* Classes Tab */}
      {activeTab === "classes" && (
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4">
  <h3 className="text-xl font-semibold"></h3>
  <button
    className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
    onClick={() => setShowClassModal(true)}
  >
    Add Class
  </button>
</div>

          <div className="flex justify-between items-center mb-4">
            
          </div>
          <DataTable
  title="Classes"
  data={paginate(classes, currentPage.classes)}
  columns={[
    { label: "Class Name", key: "className" },
    { label: "# of Students", key: "numberOfStudents" },
    { label: "URL", key: "classUrl" },
  ]}
  onMenuToggle={toggleMenu}
  totalItems={classes.length}
  currentPage={currentPage.classes}
  onPageChange={(page) =>
    setCurrentPage((prev) => ({ ...prev, classes: page }))
  }
  ITEMS_PER_PAGE={ITEMS_PER_PAGE}
/>


        </div>
      )}

      {/* Students Tab */}
      {activeTab === "students" && (
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold"></h3>
            <button
              className="bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition px-4 py-2 rounded"
              onClick={() => setShowStudentModal(true)}
            >
              Add Student
            </button>
          </div>
          <DataTable
  title="Students"
  data={paginate(students, currentPage.students)}
  columns={[
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Teacher", key: "teacherName" },
    { label: "Class", key: "className" },
  ]}
  onMenuToggle={toggleMenu}
  totalItems={students.length}
  currentPage={currentPage.students}
  onPageChange={(page) =>
    setCurrentPage((prev) => ({ ...prev, students: page }))
  }
/>


        </div>
      )}

      {/* schooladmins Tab */}
      {activeTab === "schoolAdmins" && (
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold"></h3>
            <button
              className="bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition px-4 py-2 rounded"
              onClick={() => setShowDirectorModal(true)}
            >
              Add School Admin
            </button>
          </div>
          <DataTable
  title="School Admins"
  data={paginate(admins, currentPage.schoolAdmins)}
  columns={[
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "School Name", key: "schoolName" }
  ]}
  onMenuToggle={toggleMenu}
  totalItems={admins.length}
  currentPage={currentPage.schoolAdmins}
  onPageChange={(page) =>
    setCurrentPage((prev) => ({ ...prev, schoolAdmins: page }))
  }
/>

        </div>
      )}

     
{editData?.type === "teachers" && editData.teacherInfo && (
  <TeacherModal
    visible={true}
    isEdit={true}
    onClose={() => setEditData(null)}
    onSave={(data) => handleUpdateTeacher({ ...data, id: editData.id })}
    initialData={editData.teacherInfo}
    admins={admins}
    classes={classes}
    students={students}
  />
)}

{editData?.type === "classes" && editData.classInfo && (
  <ClassModal
    visible={true}
    isEdit={true}
    onClose={() => setEditData(null)}
    onSave={(data) => handleUpdateClass({ ...data, id: editData.id })}
    initialData={editData.classInfo}
    teachers={teachers}
    students={students}
    admins={admins}
  />
)}


{editData?.type === "students" && editData.studentInfo && renderModal(
  "Edit Student",
  editData.studentInfo,
  (form) => setEditData((prev) => ({ ...prev, studentInfo: form })),
  () => handleUpdateStudent({ ...editData.studentInfo, id: editData.id }),
  () => setEditData(null),
  {
    firstName: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">First Name<span className="text-red-500 ml-1">*</span></label>
        <input
          name="firstName"
          className="w-full px-3 py-2 border rounded"
          placeholder="First Name"
          value={editData.studentInfo.firstName}
          onChange={(e) =>
            setEditData((prev) => ({
              ...prev,
              studentInfo: { ...prev.studentInfo, firstName: e.target.value },
            }))
          }
        />
      </div>
    ),
    lastName: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">Last Name<span className="text-red-500 ml-1">*</span></label>
        <input
          name="lastName"
          className="w-full px-3 py-2 border rounded"
          placeholder="Last Name"
          value={editData.studentInfo.lastName}
          onChange={(e) =>
            setEditData((prev) => ({
              ...prev,
              studentInfo: { ...prev.studentInfo, lastName: e.target.value },
            }))
          }
        />
      </div>
    ),
    studentEmail: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">Email<span className="text-red-500 ml-1">*</span></label>
        <input
          type="email"
          name="studentEmail"
          className="w-full px-3 py-2 border rounded"
          placeholder="Email"
          value={editData.studentInfo.studentEmail}
          onChange={(e) =>
            setEditData((prev) => ({
              ...prev,
              studentInfo: { ...prev.studentInfo, studentEmail: e.target.value },
            }))
          }
        />
      </div>
    ),
    classIds: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">
          Select Classes<span className="text-red-500 ml-1">*</span>
        </label>
        <div className="border rounded p-2 max-h-40 overflow-y-auto">
          {classes.map((cls) => (
            <label key={cls.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={cls.id}
                checked={editData.studentInfo.classIds?.includes(cls.id)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setEditData((prev) => ({
                    ...prev,
                    studentInfo: {
                      ...prev.studentInfo,
                      classIds: e.target.checked
                        ? [...(prev.studentInfo.classIds || []), val]
                        : prev.studentInfo.classIds.filter((id) => id !== val),
                    },
                  }));
                }}
              />
              {cls.className}
            </label>
          ))}
        </div>
        <button
          className="text-blue-500 hover:underline text-sm mt-2"
          onClick={() => setShowClassModal(true)}
        >
          + Add New Class
        </button>
      </div>
    ),
    
    
    teacherIds: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">Select Teachers</label>
        <div className="border rounded p-2 max-h-40 overflow-y-auto">
          {teachers.map((t) => (
            <label key={t.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={t.id}
                checked={editData.studentInfo.teacherIds?.includes(t.id)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setEditData((prev) => ({
                    ...prev,
                    studentInfo: {
                      ...prev.studentInfo,
                      teacherIds: e.target.checked
                        ? [...(prev.studentInfo.teacherIds || []), val]
                        : prev.studentInfo.teacherIds.filter((id) => id !== val),
                    },
                  }));
                }}
              />
              <span>{t.name}</span>
            </label>
          ))}
        </div>
        <button
          className="text-blue-500 hover:underline text-sm mt-2"
          onClick={() => setShowTeacherModal(true)}
        >
          + Add New Teacher
        </button>
      </div>
    ),
    
    
    
  }
)}

{editData?.type === "schoolAdmins" && (
  renderModal(
    "Edit School Admin",
    editData.directorInfo,
    (form) => setEditData((prev) => ({ ...prev, directorInfo: form })),
    () => handleUpdateDirector({ ...editData.directorInfo, id: editData.id }),
    () => setEditData(null),
    {
      firstName: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">First Name<span className="text-red-500 ml-1">*</span></label>
          <input
            name="firstName"
            className="w-full px-3 py-2 border rounded"
            placeholder="First Name"
            value={editData.directorInfo.firstName}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                directorInfo: { ...prev.directorInfo, firstName: e.target.value },
              }))
            }
          />
        </div>
      ),
      lastName: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Last Name<span className="text-red-500 ml-1">*</span></label>
          <input
            name="lastName"
            className="w-full px-3 py-2 border rounded"
            placeholder="Last Name"
            value={editData.directorInfo.lastName}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                directorInfo: { ...prev.directorInfo, lastName: e.target.value },
              }))
            }
          />
        </div>
      ),
      schoolName: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">School Name<span className="text-red-500 ml-1">*</span></label>
          <input
            name="schoolName"
            className="w-full px-3 py-2 border rounded"
            placeholder="School Name"
            value={editData.directorInfo.schoolName}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                directorInfo: { ...prev.directorInfo, schoolName: e.target.value },
              }))
            }
          />
        </div>
      ),
      email: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Email<span className="text-red-500 ml-1">*</span></label>
          <input
            type="email"
            name="email"
            className="w-full px-3 py-2 border rounded"
            placeholder="Email"
            value={editData.directorInfo.email}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                directorInfo: { ...prev.directorInfo, email: e.target.value },
              }))
            }
          />
        </div>
      ),
      password: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Password</label>
          <input
  type="password"
  name="password"
  autoComplete="new-password"
  className="w-full px-3 py-2 border rounded"
  placeholder="Password"
  value={editData.directorInfo.password || ""}
  onChange={(e) =>
    setEditData((prev) => ({
      ...prev,
      directorInfo: { ...prev.directorInfo, password: e.target.value },
    }))
  }
/>

{editData?.type === "schoolAdmins" && (
  <p className="text-sm text-gray-500 mt-1">
    Leave blank to keep current password
  </p>
)}



        </div>
      ),teacherIds: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Assign Teachers</label>
          <div className="border rounded p-2 max-h-40 overflow-y-auto mb-2">
            {teachers.map((t) => (
              <label key={t.id} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  value={t.id}
                  checked={editData.directorInfo.teacherIds?.includes(t.id)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setEditData((prev) => ({
                      ...prev,
                      directorInfo: {
                        ...prev.directorInfo,
                        teacherIds: e.target.checked
                          ? [...(prev.directorInfo.teacherIds || []), val]
                          : prev.directorInfo.teacherIds.filter((id) => id !== val),
                      },
                    }));
                  }}
                />
                {t.name}
              </label>
            ))}
          </div>
          <button
            className="text-blue-500 hover:underline text-sm"
            onClick={() => setShowTeacherModal(true)}
          >
            + Add New Teacher
          </button>
        </div>
      )
      
    }
  )
)}





     
{showTeacherModal && renderModal(
  "Add Teacher",
  newTeacherData,
  setNewTeacherData,
  handleAddTeacher,
  () => setShowTeacherModal(false),
  {
    firstName: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">
          First Name<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          name="firstName"
          className="w-full px-3 py-2 border rounded"
          placeholder="First Name"
          value={newTeacherData.firstName}
          onChange={(e) => setNewTeacherData({ ...newTeacherData, firstName: e.target.value })}
        />
      </div>
    ),
    lastName: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">
          Last Name<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          name="lastName"
          className="w-full px-3 py-2 border rounded"
          placeholder="Last Name"
          value={newTeacherData.lastName}
          onChange={(e) => setNewTeacherData({ ...newTeacherData, lastName: e.target.value })}
        />
      </div>
    ),
    teacherEmail: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">
          Email<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="email"
          name="teacherEmail"
          className="w-full px-3 py-2 border rounded"
          placeholder="Email"
          value={newTeacherData.teacherEmail}
          onChange={(e) => setNewTeacherData({ ...newTeacherData, teacherEmail: e.target.value })}
        />
      </div>
    ),
    teacherPassword: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">
          Password<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="password"
          name="teacherPassword"
          className="w-full px-3 py-2 border rounded"
          placeholder="Password"
          value={newTeacherData.teacherPassword}
          onChange={(e) => setNewTeacherData({ ...newTeacherData, teacherPassword: e.target.value })}
        />
        <p className="text-sm text-gray-500 mt-1">
          Leave blank to keep current password
        </p>
      </div>
    ),
    adminId: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">
          Select Admin<span className="text-red-500 ml-1">*</span>
        </label>
        <select
          name="adminId"
          className="w-full px-3 py-2 border rounded"
          value={newTeacherData.adminId}
          onChange={(e) => setNewTeacherData({ ...newTeacherData, adminId: e.target.value })}
        >
          <option value="">Select Admin</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>{admin.name}</option>
          ))}
        </select>
        <button
          className="mt-2 text-blue-500 hover:underline text-sm"
          onClick={() => {
            setShowDirectorModal(true);
          }}
          
        >
          + Add New Admin
        </button>
      </div>
    ),
    classIds: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">Assign Classes</label>
        <div className="border rounded p-2 max-h-40 overflow-y-auto mb-2">
          {classes.map((cls) => (
            <label key={cls.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={cls.id}
                checked={newTeacherData.classIds.includes(cls.id)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setNewTeacherData((prev) => ({
                    ...prev,
                    classIds: e.target.checked
                      ? [...prev.classIds, val]
                      : prev.classIds.filter((id) => id !== val),
                  }));
                }}
              />
              {cls.className}
            </label>
          ))}
        </div>
        <button
          className="text-blue-500 hover:underline text-sm"
          onClick={() => {
            setShowDirectorModal(true);
          }}
          
        >
          + Add New Class
        </button>
      </div>
    ),
    studentIds: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">Assign Students</label>
        <div className="border rounded p-2 max-h-40 overflow-y-auto mb-2">
          {students.map((s) => (
            <label key={s.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={s.id}
                checked={newTeacherData.studentIds.includes(s.id)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setNewTeacherData((prev) => ({
                    ...prev,
                    studentIds: e.target.checked
                      ? [...prev.studentIds, val]
                      : prev.studentIds.filter((id) => id !== val),
                  }));
                }}
              />
              {s.name}
            </label>
          ))}
        </div>
        <button
          className="text-blue-500 hover:underline text-sm"
          onClick={() => {
            setShowDirectorModal(true);
          }}
          
        >
          + Add New Student
        </button>
      </div>
    )
  }
)}



{showClassModal &&
  renderModal(
    "Add Class",
    newClassData,
    setNewClassData,
    handleAddClass,
    () => setShowClassModal(false),
    {
     
      teacherId: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
            Select Teacher<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="teacherId"
            className="w-full px-3 py-2 border rounded"
            value={newClassData.teacherId}
            onChange={(e) =>
              setNewClassData({ ...newClassData, teacherId: e.target.value })
            }
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            className="mt-2 text-blue-500 hover:underline text-sm"
            onClick={() => {
         
              setShowTeacherModal(true); 
            }}
          >
            + Add New Teacher
          </button>
        </div>
      ),

      studentIds: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Select Students</label>
          <div className="border rounded p-2 h-32 overflow-y-auto mb-2">
            {students.map((s) => (
              <label key={s.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={s.id}
                  checked={newClassData.studentIds.includes(s.id)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setNewClassData((prev) => ({
                      ...prev,
                      studentIds: e.target.checked
                        ? [...prev.studentIds, val]
                        : prev.studentIds.filter((id) => id !== val),
                    }));
                  }}
                />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
          <button
            className="text-blue-500 hover:underline text-sm"
            onClick={() => {
              setShowStudentModal(true); // поверх класса
            }}
          >
            + Add New Student
          </button>
        </div>
      ),
    }
  )
}



{showStudentModal && renderModal(
  "Add Student",
  newStudentData,
  setNewStudentData,
  handleAddStudent,
  () => setShowStudentModal(false),
  {
    firstName: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">
          First Name<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          name="firstName"
          className="w-full px-3 py-2 border rounded"
          placeholder="First Name"
          value={newStudentData.firstName}
          onChange={(e) =>
            setNewStudentData({ ...newStudentData, firstName: e.target.value })
          }
        />
      </div>
    ),
    lastName: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">
          Last Name<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          name="lastName"
          className="w-full px-3 py-2 border rounded"
          placeholder="Last Name"
          value={newStudentData.lastName}
          onChange={(e) =>
            setNewStudentData({ ...newStudentData, lastName: e.target.value })
          }
        />
      </div>
    ),
    studentEmail: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">
          Email<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          name="studentEmail"
          className="w-full px-3 py-2 border rounded"
          placeholder="Email"
          value={newStudentData.studentEmail}
          onChange={(e) =>
            setNewStudentData({ ...newStudentData, studentEmail: e.target.value })
          }
        />
      </div>
    ),
    password: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">
          Password<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="password"
          name="password"
          className="w-full px-3 py-2 border rounded"
          placeholder="Password"
          value={newStudentData.password || ""}
          onChange={(e) =>
            setNewStudentData({ ...newStudentData, password: e.target.value })
          }
        />
        <p className="text-sm text-gray-500 mt-1">
          Leave blank to keep current password
        </p>
      </div>
    ),
    classIds: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">
          Select Classes
        </label>
        <div className="border rounded p-2 max-h-40 overflow-y-auto mb-2">
          {classes.map((cls) => (
            <label key={cls.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={cls.id}
                checked={newStudentData.classIds.includes(cls.id)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setNewStudentData((prev) => ({
                    ...prev,
                    classIds: e.target.checked
                      ? [...prev.classIds, val]
                      : prev.classIds.filter((id) => id !== val),
                  }));
                }}
              />
              {cls.className}
            </label>
          ))}
        </div>
        <button
          className="text-blue-500 hover:underline text-sm"
          onClick={() => {
           
            setShowClassModal(true);
          }}
        >
          + Add New Class
        </button>
      </div>
    ),
    teacherIds: (
      <div className="mb-3">
        <label className="block font-semibold mb-1">
          Select Teachers<span className="text-red-500 ml-1">*</span>
        </label>
        <div className="border rounded p-2 max-h-40 overflow-y-auto mb-2">
          {teachers.map((t) => (
            <label key={t.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={t.id}
                checked={newStudentData.teacherIds?.includes(t.id)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setNewStudentData((prev) => ({
                    ...prev,
                    teacherIds: e.target.checked
                      ? [...(prev.teacherIds || []), val]
                      : prev.teacherIds.filter((id) => id !== val),
                  }));
                }}
              />
              <span>{t.name}</span>
            </label>
          ))}
        </div>
        <button
          className="text-blue-500 hover:underline text-sm"
          onClick={() => {
           
            setShowTeacherModal(true);
          }}
        >
          + Add New Teacher
        </button>
      </div>
    ),
  }
)}


{showDirectorModal &&
  renderModal(
    "Add School Admin",
    newDirectorData,
    setNewDirectorData,
    () => handleAddDirector(newDirectorData),
    () => setShowDirectorModal(false),
    {
    
      firstName: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
            First Name<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            name="firstName"
            className="w-full px-3 py-2 border rounded"
            placeholder="First Name"
            value={newDirectorData.firstName}
            onChange={(e) =>
              setNewDirectorData({ ...newDirectorData, firstName: e.target.value })
            }
          />
        </div>
      ),
      lastName: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
            Last Name<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            name="lastName"
            className="w-full px-3 py-2 border rounded"
            placeholder="Last Name"
            value={newDirectorData.lastName}
            onChange={(e) =>
              setNewDirectorData({ ...newDirectorData, lastName: e.target.value })
            }
          />
        </div>
      ),
      schoolName: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
            School Name<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            name="schoolName"
            className="w-full px-3 py-2 border rounded"
            placeholder="School Name"
            value={newDirectorData.schoolName}
            onChange={(e) =>
              setNewDirectorData({ ...newDirectorData, schoolName: e.target.value })
            }
          />
        </div>
      ),
      email: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
            Email<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            name="email"
            className="w-full px-3 py-2 border rounded"
            placeholder="Email"
            value={newDirectorData.email}
            onChange={(e) =>
              setNewDirectorData({ ...newDirectorData, email: e.target.value })
            }
          />
        </div>
      ),
      password: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
            Password<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="password"
            name="password"
            className="w-full px-3 py-2 border rounded"
            placeholder="Password"
            value={newDirectorData.password}
            onChange={(e) =>
              setNewDirectorData({ ...newDirectorData, password: e.target.value })
            }
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave blank to keep current password
          </p>
        </div>
      ),
      teacherIds: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Assign Teachers</label>
          <div className="border rounded p-2 max-h-40 overflow-y-auto mb-2">
            {teachers.map((t) => (
              <label key={t.id} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  value={t.id}
                  checked={newDirectorData.teacherIds.includes(t.id)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setNewDirectorData((prev) => ({
                      ...prev,
                      teacherIds: e.target.checked
                        ? [...prev.teacherIds, val]
                        : prev.teacherIds.filter((id) => id !== val),
                    }));
                  }}
                />
                {t.name}
              </label>
            ))}
          </div>
          <button
            className="text-blue-500 hover:underline text-sm"
            onClick={() => setShowTeacherModal(true)} // ⬅️ открываем Teacher поверх
          >
            + Add New Teacher
          </button>
        </div>
      ),
    }
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

function DataTable({ title, data, columns, onMenuToggle, currentPage = 1, totalItems = 0, onPageChange, ITEMS_PER_PAGE = 10 }) {
  return (
    <div className="w-full max-w-5xl mx-auto bg-white bg-opacity-10 rounded-xl p-6 shadow-lg border border-gray-700 backdrop-blur-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
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
                      onClick={(e) => {
                        const button = e.currentTarget;
                        const rect = button.getBoundingClientRect();
                        const scrollable = button.closest(".overflow-x-auto") || document.documentElement;
                        const scrollX = scrollable.scrollLeft || 0;
                        const scrollY = scrollable.scrollTop || 0;
                        onMenuToggle({
                          id: item.id,
                          type:
  title === "School Admins" ? "schoolAdmins" :
  title === "Teachers" ? "teachers" :
  title === "Students" ? "students" :
  title === "Classes" ? "classes" :
  title.toLowerCase(),
                          x: rect.left + scrollX,
                          y: rect.top + scrollY + 35,
                          classUrl: item.classUrl,
                        });
                      }}
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

{onPageChange && (
  <div className="mt-4 flex justify-center items-center gap-2">
    {/* Prev */}
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md disabled:opacity-50"
    >
      Prev
    </button>

    {/* Page numbers */}
    {Array.from({ length: Math.ceil(totalItems / ITEMS_PER_PAGE) }, (_, i) => (
      <button
        key={i}
        onClick={() => onPageChange(i + 1)}
        className={`px-3 py-1 rounded transition ${
          currentPage === i + 1
            ? "bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        }`}
      >
        {i + 1}
      </button>
    ))}

    {/* Next */}
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === Math.ceil(totalItems / ITEMS_PER_PAGE)}
      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md disabled:opacity-50"
    >
      Next
    </button>
  </div>
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
    style={{ top: `${data.y}px`, left: `${data.x}px` }}
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


function TeacherModal({ visible, onClose, onSave, initialData, admins, isEdit = false, classes, students  }) {
  const [form, setForm] = useState({
    
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    
    email: initialData.email || "",
    password: isEdit ? "" : "",
    adminId: initialData.adminId || "",
    classIds: initialData.classIds || [],
    studentIds: initialData.studentIds || [],
  });
  const [showClassForm, setShowClassForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  useEffect(() => {
    setForm({
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      
      email: initialData.email || "",
      password: "",
      adminId: initialData.adminId || "",
      classIds: initialData.classIds || [],
      studentIds: initialData.studentIds || [],
    });
  }, [initialData]);
  

  
  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email || (!isEdit && !form.password) || !form.adminId) {
      toast.error("All fields are required.");
      return;
    }
    onSave(form);
    onClose();
  };

  return renderModal(
    isEdit ? "Edit Teacher" : "Add Teacher",
    form,
    setForm,
    handleSubmit,
    onClose,
    {
      firstName: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
            First Name<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            name="firstName"
            className="w-full px-3 py-2 border rounded"
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </div>
      ),
      lastName: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
            Last Name<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            name="lastName"
            className="w-full px-3 py-2 border rounded"
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
      ),
      email: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
            Email<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="email"
            name="email"
            className="w-full px-3 py-2 border rounded"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      ),
      password: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
            Password{!isEdit && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="password"
            name="password"
            className="w-full px-3 py-2 border rounded"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave blank to keep current password
          </p>
        </div>
      ),
      adminId: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
            Select Admin<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="adminId"
            className="w-full px-3 py-2 border rounded"
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
          <button
            className="text-blue-500 hover:underline text-sm mt-1"
            onClick={() => setShowAdminForm(true)}
          >
            + Add New Admin
          </button>
        </div>
      ),
      classIds: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Assign Classes</label>
          <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white/20">
            {classes.map((cls) => (
              <label key={cls.id} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={form.classIds?.includes(cls.id)}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      classIds: prev.classIds?.includes(cls.id)
                        ? prev.classIds.filter((id) => id !== cls.id)
                        : [...(prev.classIds || []), cls.id],
                    }))
                  }
                />
                {cls.className}
              </label>
            ))}
          </div>
          <button
            className="text-blue-500 hover:underline text-sm mt-1"
            onClick={() => setShowClassForm(true)}
          >
            + Add New Class
          </button>
        </div>
      ),
      studentIds: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Assign Students</label>
          <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white/20">
            {students.map((s) => (
              <label key={s.id} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={form.studentIds?.includes(s.id)}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      studentIds: prev.studentIds?.includes(s.id)
                        ? prev.studentIds.filter((id) => id !== s.id)
                        : [...(prev.studentIds || []), s.id],
                    }))
                  }
                />
                {s.name}
              </label>
            ))}
          </div>
          <button
            className="text-blue-500 hover:underline text-sm mt-1"
            onClick={() => setShowStudentForm(true)}
          >
            + Add New Student
          </button>
        </div>
      ),
    }
  );
  
  {showClassForm && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white text-black p-6 rounded w-[450px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Add Class</h2>
        {/* Здесь можешь вставить поля класса */}
        <button onClick={() => setShowClassForm(false)} className="mt-4 bg-gray-500 px-4 py-2 rounded text-white">
          Close
        </button>
      </div>
    </div>
  )}
  
  {showStudentForm && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white text-black p-6 rounded w-[450px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Add Student</h2>
        {/* Здесь можешь вставить поля студента */}
        <button onClick={() => setShowStudentForm(false)} className="mt-4 bg-gray-500 px-4 py-2 rounded text-white">
          Close
        </button>
      </div>
    </div>
  )}
  
  {showAdminForm && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white text-black p-6 rounded w-[450px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Add Admin</h2>
        {/* Здесь можешь вставить поля School Admin */}
        <button onClick={() => setShowAdminForm(false)} className="mt-4 bg-gray-500 px-4 py-2 rounded text-white">
          Close
        </button>
      </div>
    </div>
  )}
}



function ClassModal({ visible, onClose, onSave, initialData, teachers, students = [], admins = [], isEdit = false }) {
  const [form, setForm] = useState({
    className: initialData.className || "",
    teacherId: initialData.teacherId || "",
    studentIds: initialData.studentIds || [],
  });

  useEffect(() => {
    setForm({
      className: initialData.className || "",
      teacherId: initialData.teacherId || "",
      studentIds: initialData.studentIds || [],
    });
  }, [initialData]);

  const handleSubmit = () => {
    if (!form.className || !form.teacherId) {
      toast.error("Please fill in class name and select teacher.");
      return;
    }
    onSave(form);
    onClose();
  };

  if (!visible) return null;

  return renderModal(
    isEdit ? "Edit Class" : "Add Class",
    form,
    setForm,
    handleSubmit,
    onClose,
    {
      className: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
            Class Name<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            name="className"
            className="w-full px-3 py-2 border rounded"
            placeholder="Class Name"
            value={form.className}
            onChange={(e) => setForm({ ...form, className: e.target.value })}
          />
        </div>
      ),
      teacherId: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
            Select Teacher<span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="teacherId"
            className="w-full px-3 py-2 border rounded"
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
      ),
      studentIds: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Select Students</label>
          <div className="border rounded p-2 max-h-40 overflow-y-auto">
            {students.map((s) => (
              <label key={s.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={s.id}
                  checked={form.studentIds.includes(s.id)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setForm((prev) => ({
                      ...prev,
                      studentIds: e.target.checked
                        ? [...prev.studentIds, val]
                        : prev.studentIds.filter((id) => id !== val),
                    }));
                  }}
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>
      )
    }
  );
}



function StudentModal({ visible, onClose, onSave, initialData, classes, isEdit = false }) {
  const [form, setForm] = useState({
    firstName: initialData.name ? initialData.name.split(" ")[0] : "",
    lastName: initialData.name ? initialData.name.split(" ").slice(1).join(" ") : "",
    studentEmail: initialData.email || "",
    classIds: initialData.classIds || [],
    adminId: initialData.adminId || "",
  });

  useEffect(() => {
    setForm({
      firstName: initialData.name ? initialData.name.split(" ")[0] : "",
      lastName: initialData.name ? initialData.name.split(" ").slice(1).join(" ") : "",
      studentEmail: initialData.email || "",
      classIds: initialData.classIds || [],
  adminId: initialData.adminId || "",
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
          <button onClick={onClose} className="border border-gray-400 px-4 py-2 rounded text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
            Cancel
          </button>
          <button onClick={() => onSave(form)} className="bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}


function DirectorModal({ visible, onClose, onSave, initialData, isEdit = false }) {
  const [form, setForm] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    schoolName: initialData.schoolName || "",
    email: initialData.email || "",
    password: "",
  });
  
  useEffect(() => {
    setForm({
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      schoolName: initialData.schoolName || "",
      email: initialData.email || "",
      password: "",
    });
  }, [initialData]);
  

  if (!visible) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-gray-800 text-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">{isEdit ? "Edit School Admin" : "Add School Admin"}</h2>
        <div className="flex flex-col gap-3">
          <input
  type="text"
  placeholder="First Name"
  className="..."
  value={form.firstName}
  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
/>
<input
  type="text"
  placeholder="Last Name"
  className="..."
  value={form.lastName}
  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
/>
<input
  type="text"
  placeholder="School Name"
  className="..."
  value={form.schoolName}
  onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
/>

          <input
            type="email"
            placeholder="School Admin Email"
            className="px-4 py-2 rounded bg-gray-700"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-2 rounded bg-gray-700"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className="border border-gray-400 px-4 py-2 rounded text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
            Cancel
          </button>
          <button onClick={() => onSave(form)} className="bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

