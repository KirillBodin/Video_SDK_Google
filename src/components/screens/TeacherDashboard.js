import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiMoreVertical, FiCopy, FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { authorizedFetch } from "../../utils/api";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

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
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);


  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const didFetchStudents = useRef(false);

useEffect(() => {
  if (!didFetchStudents.current) {
    fetchStudents();
    didFetchStudents.current = true;
  }
}, []);

  const closeAddStudentForm = () => {
    setShowAddStudentForm(false);
    setFirstName("");
    setLastName("");
    setEmail("");
  };

  const handleSaveNewStudent = async () => {
    try {
      await onSaveStudent({ firstName, lastName, email });
      closeAddStudentForm();
    } catch (error) {
      console.error("Error saving student:", error);
      toast.error("Failed to add student");
    }
  };

  const handleSaveClass = () => {
    onSaveClass({
      className,
      studentIds: selectedStudentIds,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white text-black w-[700px] min-h-[400px] rounded-md p-6 flex">
       
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
<div className="overflow-y-auto border rounded px-3 py-2 mb-4 h-32 space-y-1">
  {students.map((stud) => (
    <label key={stud.id} className="flex items-center space-x-2">
      <input
        type="checkbox"
        value={stud.id}
        checked={selectedStudentIds.includes(String(stud.id))}
        onChange={(e) => {
          const value = e.target.value;
          setSelectedStudentIds((prev) =>
            e.target.checked
              ? [...prev, value]
              : prev.filter((id) => id !== value)
          );
        }}
      />
      <span>{stud.name}</span>
    </label>
  ))}
</div>



          <button
            onClick={() => setShowAddStudentForm(true)}
            className="text-blue-600 hover:text-blue-800 mb-4 underline"
          >
            Add New Student
          </button>

         
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


function EditClassModal({ onClose, lessonToEdit, onUpdateClass }) {
  const [className, setClassName] = useState(lessonToEdit.className);
  const [meetingId, setMeetingId] = useState(lessonToEdit.meetingId);
  const [selectedStudentIds, setSelectedStudentIds] = useState(
    lessonToEdit.selectedStudentIds || []
  );
  const [allStudents, setAllStudents] = useState([]);

  useEffect(() => {
    authorizedFetch(`${SERVER_URL}/api/teacher/${lessonToEdit.teacherId}/students`)
      .then((res) => res.json())
      .then((data) => setAllStudents(data))
      .catch((err) => console.error("Error loading students:", err));
  }, [lessonToEdit.teacherId]);

  const handleSubmit = () => {
    const updatedLesson = {
      id: lessonToEdit.id,
      className,
      meetingId,
      studentsCount: selectedStudentIds.length,
      studentIds: selectedStudentIds,
    };

    onUpdateClass(updatedLesson);
    onClose();
  };

  const handleCheckboxChange = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white text-black w-[600px] min-h-[400px] rounded-md p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Edit Class</h2>

        <label className="mb-1 font-semibold">Class Name</label>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="mb-3 px-3 py-2 border rounded"
          placeholder="Class Name"
        />

        <label className="mb-1 font-semibold">Students</label>
        <div className="overflow-y-auto border rounded px-3 py-2 mb-4 h-32 space-y-1">
          {allStudents.map((stud) => (
            <label key={stud.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={stud.id}
                checked={selectedStudentIds.includes(String(stud.id))}
                onChange={() => handleCheckboxChange(String(stud.id))}
              />
              <span>{stud.name}</span>
            </label>
          ))}
        </div>

        <div className="mt-auto flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-400 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}



/* =================== StudentModal (добавление / редактирование ученика) =================== */
function StudentModal({ onClose, onSave, initialData }) {
  const isEdit = !!initialData;
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [classIds, setClassIds] = useState(initialData?.classIds || []);
  const [lessons, setLessons] = useState([]);

  const teacherId = useParams().teacherId;

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await authorizedFetch(`${SERVER_URL}/api/teachers/${teacherId}/lessons`);
        const data = await res.json();
        setLessons(data || []);
      } catch (err) {
        console.error("Error fetching lessons:", err);
        toast.error("Failed to load lessons");
      }
    };

    fetchLessons();
  }, [teacherId]);

  useEffect(() => {
    if (isEdit && initialData?.id) {
      authorizedFetch(`${SERVER_URL}/api/student/${initialData.id}/classes`)
        .then(res => res.json())
        .then(data => {
          const ids = data.map(cls => cls.id);
          setClassIds(ids);
        })
        .catch(err => {
          console.error("Error fetching student classes:", err);
        });
    }
  }, [initialData?.id, isEdit]);

  const toggleClassId = (id) => {
    setClassIds(prev =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!firstName || !lastName || !email) {
      toast.error("All fields are required");
      return;
    }

    onSave({
      firstName,
      lastName,
      email,
      classIds,
      id: initialData?.id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white text-black rounded-md p-6 w-[400px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit" : "Add"} Student</h2>

        <label className="font-semibold">First Name</label>
        <input
          type="text"
          className="mb-3 px-3 py-2 border rounded w-full"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <label className="font-semibold">Last Name</label>
        <input
          type="text"
          className="mb-3 px-3 py-2 border rounded w-full"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <label className="font-semibold">Email</label>
        <input
          type="email"
          className="mb-4 px-3 py-2 border rounded w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="font-semibold mb-1">Assign to Classes</label>
        <div className="border rounded p-2 mb-4 max-h-40 overflow-y-auto bg-white/10">
          {lessons.map((cls) => (
            <label key={cls.id} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                value={cls.id}
                checked={classIds.includes(cls.id)}
                onChange={() => toggleClassId(cls.id)}
              />
              {cls.className}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-400 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}


/* =================== Основной компонент =================== */
export default function TeacherDashboard() {
  const { teacherId, name } = useParams();

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [studentMenuData, setStudentMenuData] = useState(null);
  
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);

  const [menuData, setMenuData] = useState(null);
  const [teacherEmail, setTeacherEmail] = useState("");

 
  const [activeTab, setActiveTab] = useState("classes");

 
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState(null);

  useEffect(() => {
    document.title = "TAMAMAT Teacher";
  }, []);

  useEffect(() => {
    fetchLessons();
    fetchTeacherEmail();
  }, [teacherId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".portal-menu")) {
        setMenuData(null);
        setStudentMenuData(null); 
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/teacher/${teacherId}/students/${studentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
  
      if (res.ok) {
        toast.success("Student deleted!");
        fetchStudents();
      } else {
        toast.error(data.error || "Failed to delete student.");
      }
    } catch (error) {
      toast.error("Server error.");
    }
    setStudentMenuData(null); 
  };

  
  const handleEditStudentClick = (student) => {
    const [firstName = "", lastName = ""] = student.name.split(" ");
    setStudentToEdit({ id: student.id, firstName, lastName, email: student.email });
    setShowStudentModal(true);
    setStudentMenuData(null);
  };
  
  const handleSaveOrUpdateStudent = async ({ firstName, lastName, email, id }) => {
    if (!firstName || !lastName || !email) {
      toast.error("All fields are required!");
      return;
    }
    try {
      const schoolRes = await authorizedFetch(`${SERVER_URL}/api/teacher/${teacherId}/students`);
      if (!schoolRes.ok) throw new Error("Failed to fetch school");
      
  
      const name = `${firstName.trim()} ${lastName.trim()}`;
  
      if (id) {
        const res = await authorizedFetch(`${SERVER_URL}/api/teacher/${teacherId}/students/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email }),
        });
        if (!res.ok) throw new Error("Failed to update student");
        toast.success(`Student "${name}" updated!`);
      } else {
        const res = await authorizedFetch(`${SERVER_URL}/api/teacher/${teacherId}/students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email }),
        });
        if (!res.ok) throw new Error("Failed to add student");
        toast.success(`Student "${name}" added!`);
      }
  
      fetchStudents();
      setShowStudentModal(false);
      setStudentToEdit(null);
    } catch (error) {
      toast.error(error.message || "Failed to save student");
    }
  };
  


  const fetchLessons = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/teachers/${teacherId}/lessons`);
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

  const fetchTeacherEmail = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/teachers/${teacherId}`);
      const data = await res.json();
      if (res.ok) {
        setTeacherEmail(data.email);
      } else {
        toast.error("Failed to fetch teacher email");
      }
    } catch (error) {
      console.error("❌ Error fetching teacher email:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/teacher/${teacherId}/students`);
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data); 
    } catch (error) {
      console.error("❌ Error fetching students:", error);
      toast.error("Failed to load students");
    }
  };
  

  
  const deleteLesson = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/lessons/${lessonId}`, {
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


  const handleSaveClass = async ({ className, studentIds }) => {
    try {
      if (!teacherEmail) {
        toast.error("Teacher email is missing!");
        return;
      }
  
      const slug = `meet-${Math.random().toString(36).substring(2, 8)}`; 
  
      const body = {
        className, 
        slug,
        teacherEmail,
        studentIds,
      };
  
      const res = await authorizedFetch(`${SERVER_URL}/api/teachers/${teacherId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      if (!res.ok) throw new Error("Failed to create class");
  
      toast.success("Class created!");
      fetchLessons();
    } catch (error) {
      toast.error("Failed to save class");
    }
  };
  
  
  
  const handleSaveStudent = async ({ firstName, lastName, email }) => {
    if (!firstName || !lastName || !email) {
      toast.error("All fields are required!");
      return;
    }
    try {
      const schoolRes = await authorizedFetch(`${SERVER_URL}/api/teacher/${teacherId}/students`);
      if (!schoolRes.ok) throw new Error("Failed to fetch school");
      

      const name = `${firstName.trim()} ${lastName.trim()}`;
      const res = await authorizedFetch(`${SERVER_URL}/api/teacher/${teacherId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          teacherIds: [teacherId], 
        }),
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


  const handleEditLessonClick = async (lessonId) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;
  
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/lessons/${lessonId}/students`);
      const studentData = await res.json();
  
      if (!res.ok) {
        toast.error("Failed to load class students");
        return;
      }
  
      const studentIds = studentData.map((s) => String(s.id));
      setLessonToEdit({ ...lesson, selectedStudentIds: studentIds });
      setShowEditClassModal(true);
      setMenuData(null);
    } catch (error) {
      console.error("Error fetching students for class", error);
      toast.error("Failed to fetch class students");
    }
  };
  


  const handleUpdateClass = async (updatedLesson) => {
    try {
  
      const body = {
        className: updatedLesson.className,
        meetingId: updatedLesson.meetingId,
        studentsCount: updatedLesson.studentsCount,
        studentIds: updatedLesson.studentIds,
      };

      const res = await authorizedFetch(`${SERVER_URL}/api/lessons/${updatedLesson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update lesson");

    
      const data = await res.json();
      toast.success(`Class "${data.className}" updated!`);
      fetchLessons();
    } catch (error) {
      console.error("❌ Error updating lesson:", error);
      toast.error(error.message || "Failed to update lesson");
    }
  };

  return (
    
    <div className="min-h-screen w-full bg-gradient-to-br from-[#111111] to-black text-white p-6 flex flex-col items-center">
      
      <div className="w-full flex justify-end items-center mb-4">
  <span className="text-white font-semibold mr-4">{decodeURIComponent(name)}</span>
  <button
    onClick={() => {
      localStorage.removeItem("teacherEmail");
      window.location.href = `${window.location.origin}/admin/login`;
    }}
    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
  >
    Logout
  </button>
</div>
      <h1 className="text-4xl font-bold text-center mb-10">Teacher Dashboard</h1>

      {/* Вкладки */}
      <div className="flex mb-4 border-b border-gray-700">
        <button
          className={`px-4 py-2 ${activeTab === "classes" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActiveTab("classes")}
        >
          Classes
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "students" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => {
            setActiveTab("students");
            fetchStudents();
          }}
        >
          Students
        </button>
      </div>

      {/* ВКЛАДКА CLASSES */}
      {activeTab === "classes" && (
        <div className="w-full max-w-5xl bg-white bg-opacity-10 rounded-xl p-6 shadow-lg border border-gray-700 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">Your Lessons:</h2>
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
  
  const classURL = new URL(lesson.classUrl, window.location.origin).href + "?role=teacher";

                    return (
                      <tr key={lesson.id} className="bg-gray-800 border-b border-gray-700">
                        <td className="px-4 py-3 font-semibold">{lesson.className}</td>
                        <td className="px-4 py-3 text-center">{lesson.studentsCount || 0}</td>
                        <td className="px-4 py-3 text-blue-400">
                          <a
                            href={classURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
<a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    const url = new URL(lesson.classUrl, window.location.origin);
    url.searchParams.set("role", "teacher");
    localStorage.setItem("teacherEmail", teacherEmail);
    window.open(url.toString(), "_blank");
  }}
  className="underline text-blue-400"
>
  {new URL(lesson.classUrl, window.location.origin).href}
</a>

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
      )}

      {/* ВКЛАДКА STUDENTS */}
{activeTab === "students" && (
  <div className="w-full max-w-5xl bg-white bg-opacity-10 rounded-xl p-6 shadow-lg border border-gray-700 backdrop-blur-md">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-semibold text-white">Your Students:</h2>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        onClick={() => {
          setStudentToEdit(null);
          setShowStudentModal(true);
        }}
      >
        Add Student
      </button>
    </div>

    {students.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-700 rounded-lg">
        <thead>
  <tr className="bg-gray-900 text-white">
    <th className="px-4 py-3 text-left">Student Name</th>
    <th className="px-4 py-3 text-left">Email</th>
    <th className="px-4 py-3 text-left">Class</th>
    <th className="px-4 py-3 text-right">Actions</th>
  </tr>
</thead>

          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="bg-gray-800 border-b border-gray-700">
                <td className="px-4 py-3 font-semibold">{student.name}</td>
                <td className="px-4 py-3">{student.email}</td>
                <td className="px-4 py-3">
  {student.classes?.length > 0
    ? student.classes.map((cls) => cls.className).join(", ")
    : "—"}
</td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setStudentMenuData({
                        student,
                        x: rect.x + rect.width,
                        y: rect.y + window.scrollY,
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
      <p className="text-white text-center">No students found</p>
    )}
  </div>
)}

{/* Модалка Add/Edit Student */}
{showStudentModal && (
  <StudentModal
    onClose={() => setShowStudentModal(false)}
    onSave={handleSaveOrUpdateStudent}
    initialData={studentToEdit}
  />
)}

{/* Контекстное меню для студента */}
{studentMenuData && (
  <div
    className="portal-menu fixed bg-gray-900 text-white shadow-lg rounded-md z-50 w-44"
    style={{ top: studentMenuData.y + 10, left: studentMenuData.x - 10 }}
  >
    <button
      onClick={() => handleEditStudentClick(studentMenuData.student)}
      className="flex items-center px-4 py-2 w-full hover:bg-gray-700 text-left"
    >
      <FiEdit className="mr-2" /> Edit
    </button>
    <button
  onClick={() => handleDeleteStudent(studentMenuData.student.id)}
  className="flex items-center px-4 py-2 w-full text-red-400 hover:bg-gray-700 text-left"
>
  <FiTrash2 className="mr-2" /> Delete
</button>

  </div>
)}

      {/* Контекстное меню «три точки» */}
      {menuData && (
        <MenuPortal
          menuData={menuData}
          copyToClipboard={copyToClipboard}
          deleteLesson={deleteLesson}
          handleEditLessonClick={handleEditLessonClick}
          setMenuData={setMenuData}
        />
      )}

      {/* Модалка «Add Class» */}
      {showAddClassModal && (
        <AddClassModal
          onClose={() => setShowAddClassModal(false)}
          onSaveClass={handleSaveClass}
          onSaveStudent={handleSaveStudent}
          fetchStudents={fetchStudents}
          students={students}
        />
      )}

      {/* Модалка «Edit Class» (все поля) */}
      {showEditClassModal && lessonToEdit && (
        <EditClassModal
          onClose={() => setShowEditClassModal(false)}
          lessonToEdit={lessonToEdit}
          onUpdateClass={handleUpdateClass}
        />
      )}
    </div>
  );
}

/* =================== Контекстное меню (MenuPortal) =================== */
function MenuPortal({
  menuData,
  copyToClipboard,
  deleteLesson,
  handleEditLessonClick,
  setMenuData,
}) {
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
        onClick={() => {
          copyToClipboard(classURL);
        }}
        className="flex items-center px-4 py-2 w-full hover:bg-gray-700 text-left"
      >
        <FiCopy className="mr-2" /> Copy URL
      </button>
      <button
        className="flex items-center px-4 py-2 w-full hover:bg-gray-700 text-left"
        onClick={() => {
          handleEditLessonClick(lessonId);
        }}
      >
        <FiEdit className="mr-2" /> Edit
      </button>
      <button className="flex items-center px-4 py-2 w-full hover:bg-gray-700 text-left">
        <FiEye className="mr-2" /> View
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
