import React, { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import {
  FiMoreVertical,
  FiTrash2,
  FiClipboard,
  FiEdit,
  FiCopy
} from "react-icons/fi";
import ReactDOM from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { authorizedFetch } from "../../utils/api";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;



function renderModal(title, form, setForm, onSubmit, onClose, customFields = {}) {
  const fieldPlaceholders = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    password: "Password",
    classIds: "Classes",
    studentIds: "Students",
    teacherIds: "Teachers",
  };

  const requiredFields = ["firstName", "lastName", "email", "password"];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white text-black p-6 rounded w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {Object.keys(form).map((field) => {
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
        <button
  onClick={onClose}
 className="border border-gray-400 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition px-4 py-2 rounded text-gray-600"
>
  Cancel
</button>

          <button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
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

  const handleCopy = () => {
    const fullUrl = `${window.location.origin}/${data.classUrl}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Class URL copied!");
    setMenuData(null);
  };

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 bg-gray-900 text-white rounded shadow-lg w-44"
      style={{ top: data.y + 10, left: data.x }}
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
    </div>,
    document.body
  );
}


function DataTable({
  title,
  data,
  columns,
  onAdd,
  onMenuToggle,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  allData,
}) {

  const columnLabels = {
    name:        "Name",
    email:       "Email",
    className:   "Class Name",
    teacherName: "Teacher Name",
    url:         "URL",
    classes:     "Classes",
    teachers:    "Teachers",
  };
  
  const addButtonLabel =
    title.toLowerCase() === "classes" ? "Add Class" : `Add ${title.slice(0, -1)}`;

  return (
    <div className="w-full max-w-6xl mx-auto bg-white bg-opacity-10 p-4 rounded-xl border border-gray-700 backdrop-blur-md shadow-lg">

      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button onClick={onAdd} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
          {addButtonLabel}
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-700 rounded-lg text-white">
        <thead>
        <tr className="bg-gray-900 text-white">
  {columns.map((col) => (
    <th key={col} className="px-4 py-3 text-left">
      {columnLabels[col] || col}
    </th>
  ))}
  <th className="px-3 py-2 text-right"></th>
</tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-4">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const fullUrl =
                row.classUrl && title.toLowerCase() === "classes"
                  ? `${window.location.origin}/${row.classUrl}`
                  : null;
              return (
                <tr key={row.id} className="bg-gray-800 border-b border-gray-700">
                  {columns.map((col) => {
                    if (col === "url") {
                      return (
                        <td key={col} className="px-4 py-3">
                          {fullUrl || "—"}
                        </td>
                      );
                    } else if (col === "classes") {
                      return (
                        <td key={col} className="px-4 py-3">
                          {row.classes?.map((cls) => cls.className).join(", ") || "—"}
                        </td>
                      );
                    } else if (col === "teachers") {
                      return (
                        <td key={col} className="px-4 py-3">
                          {row.teachers?.map((t) => t.name).join(", ") || "—"}
                        </td>
                      );
                    }
                    return (
                      <td key={col} className="px-4 py-3">
                        {row[col] || "—"}
                      </td>
                    );
                  })}
<td className="text-right px-3 py-2">
  <button
    onClick={(e) =>
      onMenuToggle(
        row.id,
        title,
        e,
        title.toLowerCase() === "classes" ? row.classUrl : undefined
      )
    }
    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none"
    title="More actions"
  >
    <FiMoreVertical />
  </button>
</td>

                </tr>
              );
            })
          )}
        </tbody>
      </table>

      
      <div className="flex justify-center items-center mt-4 space-x-2">
       
        <button
          onClick={() =>
            setCurrentPage(prev => ({
              ...prev,
              [title.toLowerCase()]: Math.max(prev[title.toLowerCase()] - 1, 1)
            }))
          }
          disabled={currentPage[title.toLowerCase()] === 1}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md disabled:opacity-50"
        >
          Prev
        </button>

        
        {Array.from(
          { length: Math.ceil((allData.length || 1) / itemsPerPage) },
          (_, i) => i + 1
        ).map(page => (
          <button
            key={page}
            onClick={() =>
              setCurrentPage(prev => ({
                ...prev,
                [title.toLowerCase()]: page
              }))
            }
            className={`px-3 py-1 rounded-md text-white transition ${
              currentPage[title.toLowerCase()] === page
                ? "bg-blue-500"
                : "hover:bg-gray-600 bg-gray-700"
            }`}
          >
            {page}
          </button>
        ))}

       
        <button
          onClick={() =>
            setCurrentPage(prev => ({
              ...prev,
              [title.toLowerCase()]:
                prev[title.toLowerCase()] < Math.ceil(allData.length / itemsPerPage)
                  ? prev[title.toLowerCase()] + 1
                  : prev[title.toLowerCase()]
            }))
          }
          disabled={
            currentPage[title.toLowerCase()] >=
            Math.ceil(allData.length / itemsPerPage)
          }
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>

    </div>
  );
}




function AddTeacherModal({ onClose, onSave, isEdit = false, initialData = {}, classes = [], students = [],
  setShowAddClassModal,
  setShowAddStudentModal, }) {

  
  const [form, setForm] = useState({
    firstName: initialData.name ? initialData.name.split(" ")[0] : "",
    lastName: initialData.name ? initialData.name.split(" ").slice(1).join(" ") : "",
    email: initialData.email || "",
    password: isEdit ? initialData.password || "" : "",
    classIds: initialData.lessons ? initialData.lessons.map((l) => l.id) : (initialData.classIds || []),
    studentIds: initialData.students ? initialData.students.map((s) => s.id) : (initialData.studentIds || []),
  });

  useEffect(() => {
    if (isEdit && initialData?.id) {
      const fetchTeacherData = async () => {
        try {
          const [lessonsRes, studentsRes] = await Promise.all([
            authorizedFetch(`${SERVER_URL}/api/teachers/${initialData.id}/lessons`),
            authorizedFetch(`${SERVER_URL}/api/teacher/${initialData.id}/students`)
          ]);
  
          const lessonsData = await lessonsRes.json();
          const studentsData = await studentsRes.json();
  
          setForm({
            firstName: initialData.name ? initialData.name.split(" ")[0] : "",
            lastName: initialData.name ? initialData.name.split(" ").slice(1).join(" ") : "",
            email: initialData.email || "",
            password: "", 
            classIds: lessonsData.map((l) => l.id),
            studentIds: studentsData.map((s) => s.id)
          });
        } catch (error) {
          console.error("Error fetching teacher-related data:", error);
          toast.error("Failed to load lessons or students");
        }
      };
  
      fetchTeacherData();
    }
  }, [isEdit, initialData]);
  
  const handleCheckbox = (field, id) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((item) => item !== id)
        : [...prev[field], id],
    }));
  };
  

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email || (!isEdit && !form.password)) {
      toast.error("All fields are required");
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
      classIds: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Assign Classes:</label>
          <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white/20">
            {classes.map((cls) => (
              <label key={cls.id} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  value={cls.id}
                  checked={form.classIds.includes(cls.id)}
                  onChange={() => handleCheckbox("classIds", cls.id)}
                />
                {cls.className}
              </label>
            ))}
          </div>
          <button
      className="mt-2 text-blue-500 hover:underline text-sm"
      onClick={() => {
        setShowAddClassModal(true);
        onClose(); 
      }}
    >
      + Add New Class
    </button>
        </div>
      ),
      studentIds: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Assign Students:</label>
          <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white/20">
            {students.map((s) => (
              <label key={s.id} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  value={s.id}
                  checked={form.studentIds.includes(s.id)}
                  onChange={() => handleCheckbox("studentIds", s.id)}
                />
                {s.name}
              </label>
            ))}
          </div>
          <button
      className="mt-2 text-blue-500 hover:underline text-sm"
      onClick={() => {
        setShowAddStudentModal(true);
        onClose(); 
      }}
    >
      + Add New Student
    </button>
        </div>
      ),
    }
  );
}


function AddStudentModal({
  onClose,
  onSave,
  teachers,
  classes,
  isEdit = false,
  initialData = {},
  setShowAddTeacherModal,
  setShowAddClassModal,
}) {

  const initialForm = {
    firstName: initialData.name ? initialData.name.split(" ")[0] : "",
    lastName: initialData.name ? initialData.name.split(" ").slice(1).join(" ") : "",
    email: initialData.email || "",
    classIds: initialData.classes ? initialData.classes.map((cls) => cls.id) : [],
    teacherIds: initialData.teachers ? initialData.teachers.map((t) => t.id) : [],
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (isEdit && initialData.id) {
      authorizedFetch(`${SERVER_URL}/api/student/${initialData.id}/classes`)
        .then((res) => res.json())
        .then((classesData) => {
          setForm((prev) => ({
            ...prev,
            classIds: classesData.map((cls) => cls.id),
          }));
        })
        .catch((err) => {
          console.error("Error fetching student classes:", err);
          toast.error("Failed to load student classes");
        });

        authorizedFetch(`${SERVER_URL}/api/student/teachers/${initialData.id}`)
        .then((res) => res.json())
        .then((teacherData) => {
          const ids = teacherData.map((t) => t.id);
          setForm((prev) => ({
            ...prev,
            teacherIds: ids,
          }));
        })
        .catch((err) => {
          console.error("Error fetching student teachers:", err);
          toast.error("Failed to load teacher info");
        });
      
    }
  }, [isEdit, initialData.id]);

  const handleCheckbox = (field, id) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((item) => item !== id)
        : [...prev[field], id],
    }));
  };

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email || form.teacherIds.length === 0) {
      toast.error("All fields are required, including at least one teacher.");
      return;
    }
    onSave(form);
    onClose();
  };

  return renderModal(
    isEdit ? "Edit Student" : "Add Student",
    form,
    setForm,
    handleSubmit,
    onClose,
    {
      teacherIds: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">
  Assign Teachers<span className="text-red-500 ml-1">*</span>
</label>

          <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white/20">
            {teachers.map((t) => (
              <label key={t.id} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  value={t.id}
                  checked={form.teacherIds.includes(t.id)}
                  onChange={() => handleCheckbox("teacherIds", t.id)}
                />
                {t.name}
              </label>
            ))}
          </div>
          <button
      className="mt-2 text-blue-500 hover:underline text-sm"
      onClick={() => {
        setShowAddTeacherModal(true);
        
      }}
    >
      + Add New Teacher
    </button>
        </div>
      ),
      classIds: (
        <div className="mb-3">
          <label className="block font-semibold mb-1">Assign Classes:</label>
          <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white/20">
            {classes.map((cls) => (
              <label key={cls.id} className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  value={cls.id}
                  checked={form.classIds.includes(cls.id)}
                  onChange={() => handleCheckbox("classIds", cls.id)}
                />
                {cls.className}
              </label>
            ))}
          </div>
          <button
      className="mt-2 text-blue-500 hover:underline text-sm"
      onClick={() => {
        setShowAddClassModal(true);
        onClose();
      }}
    >
      + Add New Class
    </button>

        </div>
      ),
    }
  );
}



function AddClassModal({
  onClose,
  onSave,
  teachers,
  students,
  classes,
  setShowAddClassModal,
  setShowAddStudentModal,
  fetchTeachers,
  fetchStudents,
  isEdit = false,
  initialData = {},
}) {


  const { adminId } = useParams();

  const [form, setForm] = useState({
    className: initialData.className || "",
    meetingId: initialData.meetingId || `meet-${Math.random().toString(36).substring(7)}`,
    teacherId: initialData.teacherId || "",
    studentIds: initialData.studentIds || [],
  });


  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [formNewTeacher, setFormNewTeacher] = useState({});
  const [formNewStudent, setFormNewStudent] = useState({});  
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
const [showAddStudentModalLocal, setShowAddStudentModalLocal] = useState(false);


useEffect(() => {
  if (isEdit && initialData?.id) {
    const fetchLessonData = async () => {
      try {

        const studentsRes = await authorizedFetch(`${SERVER_URL}/api/lessons/${initialData.id}/students`);
        const studentsData = await studentsRes.json();
        const studentIds = studentsData.map((s) => s.id);

   
        const teacherRes = await authorizedFetch(`${SERVER_URL}/api/lessons/${initialData.id}/teacher`);
        const teacherData = await teacherRes.json();


        setForm({
          className: initialData.className || "",
          meetingId: initialData.meetingId || `meet-${Math.random().toString(36).substring(7)}`,
          teacherId: teacherData.id,
          studentIds
        });
      } catch (err) {
        console.error("❌ Error fetching class data:", err);
        toast.error("Failed to load class details");
      }
    };

    fetchLessonData();
  }
}, [isEdit, initialData]);

const handleSaveNewTeacher = async () => {
  const { firstName, lastName, email, password } = formNewTeacher;
  if (!firstName || !lastName || !email || !password) {
    toast.error("Fill all teacher fields");
    return;
  }

  const fullName = `${firstName} ${lastName}`;
  try {
    const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}/teachers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName, email, password }),
    });

    if (res.ok) {
      const newTeacher = await res.json();
      toast.success("Teacher added!");
      setForm({ ...form, teacherId: newTeacher.id });
      setShowTeacherForm(false);
    } else {
      if (res.status === 400) {

        toast.error("Email already exists. Please use a different email.");
      } else {
        toast.error("Error adding teacher");
      }
    }
  } catch (error) {
    console.error(error);
    toast.error("Error adding teacher");
  }
};



const handleSaveNewStudent = async () => {
  const { firstName, lastName, email, password } = formNewStudent;
  if (!firstName || !lastName || !email || !password) {
    toast.error("Fill all student fields");
    return;
  }
  const fullName = `${firstName} ${lastName}`;
  try {
    const res = await authorizedFetch(`${SERVER_URL}/api/admin/${formNewStudent.teacherId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName, email, password }),
    });

    if (res.ok) {
      const newStudent = await res.json();
      toast.success("Student added!");
      setForm({ ...form, studentIds: [...form.studentIds, newStudent.id] });
      setShowStudentForm(false);
    } else {
      if (res.status === 400) {
        toast.error("Email already exists. Please use a different email.");
      } else {
        toast.error("Error adding student");
      }
    }
  } catch (error) {
    console.error(error);
    toast.error("Error adding student");
  }
};



  useEffect(() => {
    if (isEdit && initialData) {
      setForm((prev) => ({
        ...prev,
        className: initialData.className || "",
        meetingId: initialData.meetingId || prev.meetingId,
        teacherId: initialData.teacherId || "",
      }));
      if (initialData.id) {
        const fetchLinkedStudents = async () => {
          try {
            const res = await authorizedFetch(`${SERVER_URL}/api/lessons/${initialData.id}/students`);
            const data = await res.json();
   
            const ids = data.map((s) => s.id);
            setForm((prev) => ({ ...prev, studentIds: ids }));
          } catch (err) {
            console.error("Failed to fetch lesson's students:", err);
          }
        };
        fetchLinkedStudents();
      }
    }
  }, [isEdit, initialData]);

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
    <>
  
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white text-black p-6 rounded w-[450px] max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Class" : "Add Class"}</h2>
          <label className="block font-semibold mb-1">
  Class Name<span className="text-red-500 ml-1">*</span>
</label>
<input
  className="w-full mb-3 px-3 py-2 border rounded"
  placeholder="Class Name"
            value={form.className}
            onChange={(e) => setForm({ ...form, className: e.target.value })}
          />
          <div className="mb-3">
          <label className="block font-semibold mb-1">
  Select Teacher<span className="text-red-500 ml-1">*</span>
</label>

  <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white/20">
    {teachers.map((t) => (
      <label key={t.id} className="flex items-center gap-2 mb-1">
<input
  type="radio"
  name="teacher"
  value={t.id}
  checked={form.teacherId === t.id}
  onChange={() =>
    setForm((prev) => ({
      ...prev,
      teacherId: t.id,
    }))
  }
/>

        {t.name}
      </label>
    ))}
  </div>
</div>

       
<button
  className="mt-2 text-blue-500 hover:underline text-sm"
  onClick={() => setShowAddTeacherModal(true)}
>
  + Add New Teacher
</button>

          <div className="mb-3">
            <label className="block font-semibold mb-1">Select Students:</label>
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
        
          <button
  className="mt-2 text-blue-500 hover:underline text-sm"
  onClick={() => setShowAddStudentModalLocal(true)}
>
  + Add New Student
</button>

          <div className="flex justify-end gap-2">
          <button
  onClick={onClose}
  className="border border-gray-400 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition px-4 py-2 rounded text-gray-600"
>
  Cancel
</button>

            <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Save
            </button>
          </div>
        </div>
      </div>

     
      {showTeacherForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
    <div className="bg-white text-black p-6 rounded w-[450px] max-h-[90vh] overflow-y-auto shadow-xl">
      <h2 className="text-lg font-bold mb-4">Add Teacher</h2>

      {/* First Name */}
      <input
        className="w-full mb-2 px-3 py-2 border rounded"
        placeholder="First Name"
        onChange={(e) =>
          setFormNewTeacher({ ...formNewTeacher, firstName: e.target.value })
        }
      />

      {/* Last Name */}
      <input
        className="w-full mb-2 px-3 py-2 border rounded"
        placeholder="Last Name"
        onChange={(e) =>
          setFormNewTeacher({ ...formNewTeacher, lastName: e.target.value })
        }
      />

      {/* Email */}
      <input
        className="w-full mb-2 px-3 py-2 border rounded"
        placeholder="Email"
        onChange={(e) =>
          setFormNewTeacher({ ...formNewTeacher, email: e.target.value })
        }
      />

      {/* Password */}
      <input
        type="password"
        className="w-full mb-4 px-3 py-2 border rounded"
        placeholder="Password"
        onChange={(e) =>
          setFormNewTeacher({ ...formNewTeacher, password: e.target.value })
        }
      />

      {/* Select Classes */}
      <div className="mb-3">
        <label className="block font-semibold mb-1">Assign Classes:</label>
        <div className="border rounded p-2 max-h-40 overflow-y-auto">
          {classes.map((cls) => (
            <label key={cls.id} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                value={cls.id}
                checked={formNewTeacher.classIds?.includes(cls.id)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormNewTeacher((prev) => ({
                    ...prev,
                    classIds: e.target.checked
                      ? [...(prev.classIds || []), val]
                      : prev.classIds.filter((id) => id !== val),
                  }));
                }}
              />
              {cls.className}
            </label>
          ))}
        </div>

        {/* Button to open Add Class modal */}
        <button
          className="mt-2 text-blue-500 hover:underline text-sm"
          onClick={() => {
            setShowTeacherForm(false);
            setShowAddClassModal(true);
          }}
        >
          + Add New Class
        </button>
      </div>

      {/* Select Students */}
      <div className="mb-3">
        <label className="block font-semibold mb-1">Assign Students:</label>
        <div className="border rounded p-2 max-h-40 overflow-y-auto">
          {students.map((s) => (
            <label key={s.id} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                value={s.id}
                checked={formNewTeacher.studentIds?.includes(s.id)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormNewTeacher((prev) => ({
                    ...prev,
                    studentIds: e.target.checked
                      ? [...(prev.studentIds || []), val]
                      : prev.studentIds.filter((id) => id !== val),
                  }));
                }}
              />
              {s.name}
            </label>
          ))}
        </div>

        {/* Button to open Add Student modal */}
        <button
          className="mt-2 text-blue-500 hover:underline text-sm"
          onClick={() => {
            setShowTeacherForm(false);
            setShowAddStudentModal(true);
          }}
        >
          + Add New Student
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={() => setShowTeacherForm(false)}
         className="border border-gray-400 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition px-4 py-2 rounded text-gray-600"
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={handleSaveNewTeacher}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

{showAddTeacherModal && (
  <AddTeacherModal
    onClose={() => setShowAddTeacherModal(false)}
    onSave={() => {
      fetchTeachers(); // чтобы обновить список
      setShowAddTeacherModal(false);
    }}
    classes={classes}
    students={students}
    setShowAddClassModal={setShowAddClassModal}
    setShowAddStudentModal={setShowAddStudentModal}
  />
)}

{showAddStudentModalLocal && (
  <AddStudentModal
    onClose={() => setShowAddStudentModalLocal(false)}
    onSave={() => {
      fetchStudents();
      setShowAddStudentModalLocal(false);
    }}
    teachers={teachers}
    classes={classes}
    setShowAddTeacherModal={setShowAddTeacherModal}
    setShowAddClassModal={setShowAddClassModal}
  />
)}


{showStudentForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white text-black p-6 rounded w-[450px] max-h-[90vh] overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Add Student</h2>
      <input
        className="w-full mb-2 px-3 py-2 border rounded"
        placeholder="First Name"
        onChange={(e) =>
          setFormNewStudent({ ...formNewStudent, firstName: e.target.value })
        }
      />
      <input
        className="w-full mb-2 px-3 py-2 border rounded"
        placeholder="Last Name"
        onChange={(e) =>
          setFormNewStudent({ ...formNewStudent, lastName: e.target.value })
        }
      />
      <input
        className="w-full mb-2 px-3 py-2 border rounded"
        placeholder="Email"
        onChange={(e) =>
          setFormNewStudent({ ...formNewStudent, email: e.target.value })
        }
      />
      <input
        type="password"
        className="w-full mb-4 px-3 py-2 border rounded"
        placeholder="Password"
        onChange={(e) =>
          setFormNewStudent({ ...formNewStudent, password: e.target.value })
        }
      />
    
      <div className="mb-3">
        <label className="block font-semibold mb-1">Select Teacher:</label>
        <select
          className="w-full px-3 py-2 border rounded"
          onChange={(e) =>
            setFormNewStudent({ ...formNewStudent, teacherId: e.target.value })
          }
        >
          <option value="">Select teacher</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
     
      <div className="flex justify-between">
        <button
          onClick={() => setShowStudentForm(false)}
          className="border border-gray-400 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition px-4 py-2 rounded text-gray-600"
        >
          Cancel
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleSaveNewStudent}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </>,
    document.body
  );
}


export default function PrincipalDashboardScreen() {
  const { adminId, name } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "TAMAMAT School Admin";
  }, []);
  const [activeTab, setActiveTab] = useState("teachers");
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [menuData, setMenuData] = useState(null);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddTeacherModalLocal, setShowAddTeacherModalLocal] = useState(false);
const [showAddClassModalLocal, setShowAddClassModalLocal] = useState(false);

  const [editData, setEditData] = useState(null);
  const [schoolName, setSchoolName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [currentPage, setCurrentPage] = useState({
    teachers: 1,
    students: 1,
    classes: 1,
  });
  const itemsPerPage = 8;
  
  const principalName = name;
  const paginatedData = {
    teachers: teachers.slice(
      (currentPage.teachers - 1) * itemsPerPage,
      currentPage.teachers * itemsPerPage
    ),
    students: students.slice(
      (currentPage.students - 1) * itemsPerPage,
      currentPage.students * itemsPerPage
    ),
    classes: classes.slice(
      (currentPage.classes - 1) * itemsPerPage,
      currentPage.classes * itemsPerPage
    ),
  };
  
  useEffect(() => {
    fetchAll();
  }, [adminId]);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}`);
        const data = await res.json();
        setSchoolName(data.schoolName || "Your School");
        setAdminName(
          data.name && data.name.split(" ").slice(-1)[0]
        );
        
      } catch (err) {
        console.error("❌ Failed to fetch admin info:", err);
      }
    };
    fetchAdminInfo();
  }, [adminId]);
  

  const fetchAll = () => {
    fetchTeachers();
    fetchClasses();
    fetchStudents();
  };

  const fetchTeachers = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}/teachers`);
      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }
      const data = await res.json();
      console.log("Fetched teachers:", data);
      setTeachers(data || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      toast.error("Failed to load teachers");
    }
  };
  
  const fetchClasses = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}/classes`);
      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }
      const data = await res.json();
      console.log("Fetched classes:", data);
      setClasses(data || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
      toast.error("Failed to load classes");
    }
  };
  
  const fetchStudents = async () => {
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}/students`);
      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }
      const data = await res.json();
      console.log("Fetched students:", data);
      setStudents(data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Failed to load students");
    }
  };
  

  const deleteItem = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    let url = "";
    switch (type) {
      case "teachers":
        url = `${SERVER_URL}/api/teachers/${id}`;
        break;
      case "students": {
        url = `${SERVER_URL}/api/admin/students/${id}`;
        break;
      }
      case "classes":
        url = `${SERVER_URL}/api/admin/classes/${id}`;
        break;
      default:
        toast.error("Unknown type");
        return;
    }
    try {
      const res = await authorizedFetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success(`Successfully deleted!`);
      fetchAll();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete");
    }
  };

  const toggleMenu = (id, type, e, classUrl) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuData({
      id,
      type: type.toLowerCase(),
      x: rect.x + rect.width,
      y: rect.y + window.scrollY,
      classUrl,
    });
  };

  const onEdit = (id, type) => {
    setEditData({ id, type });
    setMenuData(null);
  };

 
  const handleUpdateTeacher = async (data) => {
    await handleUpdateTeacherInternal(data);
  };

  const handleUpdateTeacherInternal = async ({
    id,
    firstName,
    lastName,
    email,
    password,
    classIds,
    studentIds,
  }) => {
    const fullName = `${firstName} ${lastName}`;
  
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: fullName,
          email,
          password,
          classIds,
          studentIds,
        }),
      });
  
      if (res.ok) {
        toast.success("Teacher updated!");
        fetchTeachers();
      } else if (res.status === 400) {
        toast.error("Email already exists. Please use a different email.");
      } else {
        toast.error("Failed to update teacher. Server error.");
      }
    } catch (error) {
      console.error("❌ handleUpdateTeacherInternal error:", error);
      toast.error(error.message || "Something went wrong while updating teacher.");
    }
  };
  

  const handleSaveTeacher = async (data) => {
    const { firstName, lastName, email, password, classIds, studentIds } = data;
    const fullName = `${firstName} ${lastName}`;
  
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password, classIds, studentIds }),
      });
  
      if (res.ok) {
        toast.success("Teacher added!");
        fetchTeachers();
        fetchAll(); 
      } else if (res.status === 400) {
        toast.error("Email already exists. Please use a different email.");
      } else {
        toast.error("Failed to add teacher. Server error.");
      }
    } catch (error) {
      console.error("❌ handleSaveTeacher error:", error);
      toast.error(error.message || "Something went wrong while adding teacher.");
    }
  };
  
  const handleUpdateStudent = async (data) => {
    const { id, teacherIds, firstName, lastName, email, password, classIds } = data;
    const fullName = `${firstName} ${lastName}`;
  
    try {
      const res = await authorizedFetch(
        `${SERVER_URL}/api/admin/${adminId}/students/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            email,
            password,
            classIds,
            teacherIds,
          }),
        }
      );
  
      if (res.ok) {
        toast.success("Student updated!");
        fetchStudents();
      } else if (res.status === 400) {
        toast.error("Email already exists. Please use a different email.");
      } else {
        toast.error("Failed to update student. Server error.");
      }
    } catch (error) {
      console.error("❌ handleUpdateStudent error:", error);
      toast.error(error.message || "Something went wrong while updating student.");
    }
  };
  

  const handleSaveStudent = async (data) => {
    const { id, teacherIds, firstName, lastName, email, password, classIds } = data;
    const fullName = `${firstName} ${lastName}`;
  
    try {
      const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password, classIds, teacherIds }),
      });
  

      if (res.ok) {
        toast.success("Student added!");
        fetchStudents();
        fetchAll();
        return;
      }
  
  
      if (res.status === 400) {
   
        toast.error("Email already exists. Please use a different email.");
      } else {
        toast.error("Failed to add student. Server returned an error.");
      }
    } catch (error) {
      console.error("❌ handleSaveStudent error:", error);
      toast.error(error.message || "Something went wrong.");
    }
  };
  

 
  const handleUpdateClass = async (data) => {
    const { id, className, studentIds, teacherId, meetingId } = data;
  
    if (!teacherId) {
      toast.error("A class must have a teacher assigned.");
      return;
    }
  
    const formattedMeetingId = meetingId.replace(/\s+/g, "_");
    const formattedClassName = className.replace(/\s+/g, "_");
  
    try {
      await authorizedFetch(`${SERVER_URL}/api/lessons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className: formattedClassName,
          meetingId: formattedMeetingId,
          teacherId,
          studentIds,
        }),
      });
      toast.success("Class updated!");
      fetchClasses();
    } catch (error) {
      console.error("❌ Failed to update class:", error);
      toast.error("Failed to update class.");
    }
  };
  
  

  const handleSaveClass = async (data) => {
    const { className, meetingId, teacherId, studentIds } = data;
  
    if (!teacherId) {
      toast.error("A class must have a teacher assigned.");
      return;
    }
  
    const formattedMeetingId = meetingId.replace(/\s+/g, "_");
    const formattedClassName = className.replace(/\s+/g, "_");
  
    const res = await authorizedFetch(`${SERVER_URL}/api/admin/${adminId}/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        className: formattedClassName,
        meetingId: formattedMeetingId,
        teacherId,
        studentIds,
      }),
    });
  
    if (res.ok) {
      toast.success("Class added!");
      fetchClasses();
      fetchAll();
    } else {
      toast.error("Failed to add class.");
    }
  };
  


  const handleLogout = () => {
    window.location.href = `${window.location.origin}/admin/login`;
  };  

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#111111] to-black text-white p-6 flex flex-col items-center">
     <div className="w-full flex justify-end items-center mb-6">
  <div className="flex items-center gap-4">
  <span className="text-lg font-semibold">
  {adminName} — {schoolName}
</span>

    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
    >
      Log Out
    </button>
  </div>
</div>
<h1 className="text-4xl font-bold text-center mb-10">School Admin Dashboard</h1>

<div className="flex gap-4 mb-6">
  {["Teachers", "Classes", "Students"].map((tab) => {
    const isActive = activeTab === tab.toLowerCase();
    return (
      <button
        key={tab}
        onClick={() => setActiveTab(tab.toLowerCase())}
        className={`px-4 py-2 rounded-md text-white transition-all duration-150
          ${isActive ? "bg-gray-800 border-b-2 border-blue-500" : "hover:bg-gray-700"}
        `}
      >
        {tab}
      </button>
    );
  })}
</div>

      {activeTab === "teachers" && (
        <DataTable
          title="Teachers"
          data={paginatedData.teachers}
          columns={["name", "email"]}
          onAdd={() => setShowAddTeacherModal(true)}
          onMenuToggle={toggleMenu}
          currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  itemsPerPage={itemsPerPage}
  allData={teachers}
        />
      )}
      {activeTab === "students" && (
        <DataTable
        title="Students"
        data={paginatedData.students}
        columns={["name", "email", "classes", "teachers"]}
          onAdd={() => setShowAddStudentModal(true)}
          onMenuToggle={toggleMenu}
          currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  itemsPerPage={itemsPerPage}
  allData={teachers}
        />
      )}
      {activeTab === "classes" && (
        <DataTable
          title="Classes"
          data={paginatedData.classes}
          columns={["className", "teacherName", "url"]}
          onAdd={() => setShowAddClassModal(true)}
          onMenuToggle={(id, title, e, classUrl) => toggleMenu(id, title, e, classUrl)}
          currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  itemsPerPage={itemsPerPage}
  allData={teachers}
        />
      )}
      {editData?.type === "teachers" && (
        <AddTeacherModal
          onClose={() => setEditData(null)}
          onSave={(data) => handleUpdateTeacher({ ...data, id: editData.id })}
          isEdit
          initialData={teachers.find((t) => t.id === editData.id) || {}}
          classes={classes}
          students={students}
          setShowAddClassModal={setShowAddClassModal}
          setShowAddStudentModal={setShowAddStudentModal}
        />
      )}
      {editData?.type === "students" && (
        <AddStudentModal
          onClose={() => setEditData(null)}
          onSave={(data) =>
            handleUpdateStudent({
              ...data,
              id: editData.id,
              teacherId:
                data.teacherId || (students.find((s) => s.id === editData.id)?.teacherId),
            })
          }
          isEdit
          initialData={students.find((s) => s.id === editData.id) || {}}
          teachers={teachers}
          classes={classes}
          setShowAddTeacherModal={setShowAddTeacherModal}
          setShowAddClassModal={setShowAddClassModal}
        />
      )}
      {editData?.type === "classes" && (
        <AddClassModal
          onClose={() => setEditData(null)}
          onSave={(data) => handleUpdateClass({ ...data, id: editData.id })}
          isEdit
          initialData={classes.find((c) => c.id === editData.id) || {}}
          teachers={teachers}
          students={students}
          classes={classes}
          setShowAddClassModal={setShowAddClassModal}
          setShowAddStudentModal={setShowAddStudentModal}
          fetchTeachers={fetchTeachers}
          fetchStudents={fetchStudents}
        />
      )}
      {showAddTeacherModal && (
        <AddTeacherModal
  onClose={() => setShowAddTeacherModal(false)}
  onSave={handleSaveTeacher}
  classes={classes}
  students={students}
  setShowAddClassModal={setShowAddClassModal}
  setShowAddStudentModal={setShowAddStudentModal}
/>

      )}

{showAddTeacherModalLocal && (
  <AddTeacherModal
    onClose={() => setShowAddTeacherModalLocal(false)}
    onSave={() => {
      fetchTeachers();
      setShowAddTeacherModalLocal(false);
    }}
    classes={classes}
    students={students}
    setShowAddClassModal={setShowAddClassModalLocal}
    setShowAddStudentModal={() => {
      setShowAddTeacherModalLocal(false);
      setShowAddStudentModal(true);
    }}
  />
)}

{showAddClassModalLocal && (
  <AddClassModal
    onClose={() => setShowAddClassModalLocal(false)}
    onSave={() => {
      fetchClasses();
      setShowAddClassModalLocal(false);
    }}
    teachers={teachers}
    students={students}
    classes={classes}
    setShowAddClassModal={setShowAddClassModalLocal}
    setShowAddStudentModal={() => {
      setShowAddClassModalLocal(false);
      setShowAddStudentModal(true);
    }}
    fetchTeachers={fetchTeachers}
    fetchStudents={fetchStudents}
  />
)}

      {showAddStudentModal && (
        <AddStudentModal
          onClose={() => setShowAddStudentModal(false)}
          onSave={handleSaveStudent}
          teachers={teachers}
          classes={classes}
          setShowAddTeacherModal={setShowAddTeacherModal}
          setShowAddClassModal={setShowAddClassModal}
        />
      )}
      {showAddClassModal && (
        <AddClassModal
          onClose={() => setShowAddClassModal(false)}
          onSave={handleSaveClass}
          teachers={teachers}
          students={students}
          classes={classes}
          setShowAddClassModal={setShowAddClassModal}
          setShowAddStudentModal={setShowAddStudentModal}
          fetchTeachers={fetchTeachers}
          fetchStudents={fetchStudents}
          
        />
      )}
      {menuData && (
        <ContextMenu
          data={menuData}
          onDelete={deleteItem}
          setMenuData={setMenuData}
          onEdit={onEdit}
        />
      )}
    </div>
  );
}

export { renderModal };
