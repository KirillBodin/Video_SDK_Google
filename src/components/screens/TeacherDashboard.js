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
  setReturnToStudentModal,
  setShowAddClassModal,
}) {
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [className, setClassName] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);


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
    <div className="bg-white text-black rounded-md p-6 w-[500px] max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Add Class</h2>
  
      <label className="block font-semibold mb-1">Class Name</label>
      <input
        className="w-full mb-4 px-3 py-2 border rounded"
        placeholder="Enter Class Name"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
      />
  
      <label className="block font-semibold mb-1">Assign Students</label>
      <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white/20 mb-4">
        {students.map((s) => (
          <label key={s.id} className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              value={s.id}
              checked={selectedStudentIds.includes(String(s.id))}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedStudentIds((prev) =>
                  e.target.checked
                    ? [...prev, value]
                    : prev.filter((id) => id !== value)
                );
              }}
            />
            {s.name}
          </label>
        ))}
      </div>
  
      <button
        onClick={() => setShowStudentModal(true)}
        className="text-blue-600 hover:underline mb-4 text-sm"
      >
        + Add New Student
      </button>
  
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded border border-gray-400 text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveClass}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Save
        </button>
      </div>
  
      {showStudentModal && (
        <StudentModal
          onClose={() => setShowStudentModal(false)}
          onSave={onSaveStudent}
          setReturnToStudentModal={setReturnToStudentModal}
    setShowAddClassModal={setShowAddClassModal}
        />
      )}
    </div>
  </div>
  
  );
}


function EditClassModal({
  onClose,
  lessonToEdit,
  onUpdateClass,
  students,
  onSaveStudent,
  setReturnToStudentModal,
  setShowAddClassModal,
}) {

  const [showStudentModal, setShowStudentModal] = useState(false);

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
      <div className="bg-white text-black rounded-md p-6 w-[500px] max-h-[90vh] overflow-y-auto">
  
        <h2 className="text-xl font-bold mb-4">Add Class</h2>
  
        <label className="block font-semibold mb-1">Class Name</label>
        <input
          className="w-full mb-4 px-3 py-2 border rounded"
          placeholder="Enter Class Name"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
  
        <label className="block font-semibold mb-1">Assign Students</label>
        <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white/20 mb-4">
          {students.map((s) => (
            <label key={s.id} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                value={s.id}
                checked={selectedStudentIds.includes(String(s.id))}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedStudentIds((prev) =>
                    e.target.checked
                      ? [...prev, value]
                      : prev.filter((id) => id !== value)
                  );
                }}
              />
              {s.name}
            </label>
          ))}
        </div>
  
        <button
          onClick={() => setShowStudentModal(true)}
          className="text-blue-600 hover:underline mb-4 text-sm"
        >
          + Add New Student
        </button>
  
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-400 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
  onClick={handleSubmit}
  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
>
  Save
</button>

        </div>
  
        {showStudentModal && (
          <StudentModal
            onClose={() => setShowStudentModal(false)}
            onSave={onSaveStudent}
            setReturnToStudentModal={setReturnToStudentModal}
    setShowAddClassModal={setShowAddClassModal}
          />
        )}
      </div>
    </div>
  );
  
}




function StudentModal({ onClose, onSave, initialData, setReturnToStudentModal, setShowAddClassModal }) {
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
        if (res.status === 401) {
          toast.error("Your session has expired. Please log in again.");
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to load lessons");
          setLessons([]);
        } else {
          setLessons(data);
        }
      } catch (error) {
        toast.error("Server error.");
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
      <div className="bg-white text-black rounded-md p-6 w-[500px] max-h-[90vh] overflow-y-auto shadow-lg">
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
        <div className="border rounded p-2 mb-2 max-h-40 overflow-y-auto bg-white/10">
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
  
        {/* 👇 New button to open Add Class Modal (you can add logic to show modal above) */}
        <button
  onClick={() => {
    onClose(); 
    setReturnToStudentModal(true); 
    setShowAddClassModal(true); 
  }}
  className="text-blue-600 hover:underline text-sm mb-4"
>
  + Add New Class
</button>

  
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-400 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
  
}



export default function TeacherDashboard() {
  const { teacherId, name } = useParams();

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [studentMenuData, setStudentMenuData] = useState(null);
  
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);


  const itemsPerPage = 10;
  const indexOfLastStudent = currentPage * itemsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);

  const [classPage, setClassPage] = useState(1);
const classesPerPage = 10;
const indexOfLastClass = classPage * classesPerPage;
const indexOfFirstClass = indexOfLastClass - classesPerPage;
const currentLessons = lessons.slice(indexOfFirstClass, indexOfLastClass);
const [returnToStudentModal, setReturnToStudentModal] = useState(false);

  
  const [menuData, setMenuData] = useState(null);
  const [teacherEmail, setTeacherEmail] = useState("");

 
  const [activeTab, setActiveTab] = useState("classes");

 
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState(null);

  useEffect(() => {
    if (!showAddClassModal && returnToStudentModal) {
      setShowStudentModal(true);
      setReturnToStudentModal(false);
    }
  }, [showAddClassModal, returnToStudentModal]);
  

  useEffect((
  ) => {
    const handleOpenAddClass = () => {
      setShowAddClassModal(true);
    };
    window.addEventListener("open-add-class-modal", handleOpenAddClass);
  
    return () => {
      window.removeEventListener("open-add-class-modal", handleOpenAddClass);
    };
  }, []);
  

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
  
  const handleSaveOrUpdateStudent = async ({ firstName, lastName, email, classIds, id }) => {
    if (!firstName || !lastName || !email) {
      toast.error("All fields are required!");
      return;
    }
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`;
  
      if (id) {
       
        const res = await authorizedFetch(`${SERVER_URL}/api/teacher/${teacherId}/students/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, classIds }),
        });
  
        if (!res.ok) {
          if (res.status === 400) {
            toast.error("Email already exists. Please use a different email.");
            return; 
          }
          throw new Error("Failed to update student");
        }
  
        toast.success(`Student "${name}" updated!`);
  
      } else {
     
        const res = await authorizedFetch(`${SERVER_URL}/api/teacher/${teacherId}/students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            teacherIds: [teacherId],
            classIds,
          }),
        });
  
        if (!res.ok) {
          if (res.status === 400) {
            toast.error("Email already exists. Please use a different email.");
            return;
          }
          throw new Error("Failed to add student");
        }
  
        const newStudent = await res.json();
        toast.success(`Student "${newStudent.name}" added!`);
        setStudents((prev) => [...prev, newStudent]);
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
      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch students");
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
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

  const toggleMenu = (id, type, event, classUrl) => {
    event.stopPropagation();
  
    const rect = event.currentTarget.getBoundingClientRect();
    const scrollContainer = document.querySelector(".overflow-x-auto") || window;
    const scrollTop = scrollContainer.scrollTop || window.scrollY;
    const scrollLeft = scrollContainer.scrollLeft || window.scrollX;
  
    setMenuData({
      id,
      type: type.toLowerCase(),
      x: rect.left + rect.width + scrollLeft,
      y: rect.top + scrollTop,
      classUrl,
    });
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
  
    
      if (!res.ok) {
        if (res.status === 400) {
 
          toast.error("Email already exists. Please use a different email.");
        } else {
          throw new Error("Failed to add student");
        }
        return;
      }
  
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
                {currentLessons.map((lesson) => {
  
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
    sessionStorage.setItem("teacherEmail", teacherEmail);
    sessionStorage.setItem("teacherName", name);
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
              <div className="flex justify-center mt-4">
  <button
    onClick={() => setClassPage((prev) => Math.max(prev - 1, 1))}
    disabled={classPage === 1}
    className="px-3 py-1 mx-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
  >
    Prev
  </button>
  <span className="px-3 py-1 mx-1 text-white">
    Page {classPage} of {Math.ceil(lessons.length / classesPerPage)}
  </span>
  <button
    onClick={() =>
      setClassPage((prev) =>
        prev < Math.ceil(lessons.length / classesPerPage) ? prev + 1 : prev
      )
    }
    disabled={classPage >= Math.ceil(lessons.length / classesPerPage)}
    className="px-3 py-1 mx-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
  >
    Next
  </button>
</div>

            </div>
          ) : (
            <p className="text-white text-center">No lessons found</p>
          )}
        </div>
      )}

     
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
          {currentStudents.map((student) => (
              <tr key={student.id} className="bg-gray-800 border-b border-gray-700">
                <td className="px-4 py-3 font-semibold">{student.name}</td>
                <td className="px-4 py-3">{student.email}</td>
                <td className="px-4 py-3">
  {student.classNames?.length > 0
    ? student.classNames.join(", ")
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
        <div className="flex justify-center mt-4">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className="px-3 py-1 mx-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
  >
    Prev
  </button>
  <span className="px-3 py-1 mx-1 text-white">
    Page {currentPage} of {Math.ceil(students.length / itemsPerPage)}
  </span>
  <button
    onClick={() =>
      setCurrentPage((prev) =>
        prev < Math.ceil(students.length / itemsPerPage) ? prev + 1 : prev
      )
    }
    disabled={currentPage >= Math.ceil(students.length / itemsPerPage)}
    className="px-3 py-1 mx-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
  >
    Next
  </button>
</div>

      </div>
    ) : (
      <p className="text-white text-center">No students found</p>
    )}
  </div>
)}


{showStudentModal && (
  <StudentModal
    onClose={() => setShowStudentModal(false)}
    onSave={handleSaveOrUpdateStudent}
    initialData={studentToEdit}
    setReturnToStudentModal={setReturnToStudentModal}
    setShowAddClassModal={setShowAddClassModal}
  />
)}


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

    
      {menuData && (
        <MenuPortal
          menuData={menuData}
          copyToClipboard={copyToClipboard}
          deleteLesson={deleteLesson}
          handleEditLessonClick={handleEditLessonClick}
          setMenuData={setMenuData}
        />
      )}

     
{showAddClassModal && (
  <AddClassModal
    onClose={() => setShowAddClassModal(false)}
    onSaveClass={handleSaveClass}
    onSaveStudent={handleSaveStudent}
    fetchStudents={fetchStudents}
    students={students}
    setReturnToStudentModal={setReturnToStudentModal}
    setShowAddClassModal={setShowAddClassModal}
  />
)}


     
{showEditClassModal && lessonToEdit && (
  <EditClassModal
  onClose={() => setShowEditClassModal(false)}
  lessonToEdit={lessonToEdit}
  onUpdateClass={handleUpdateClass}
  students={students}
  onSaveStudent={handleSaveStudent}
  setReturnToStudentModal={setReturnToStudentModal}
  setShowAddClassModal={setShowAddClassModal}
/>

)}

    </div>
  );
}


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
