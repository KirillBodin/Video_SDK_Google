import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiMoreVertical, FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";

const SERVER_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("teachers");

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const { adminId } = useParams();
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState(null);

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
    fetchStudents();
  }, [adminId]);

 
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/admin/${adminId}/teachers`);
      const data = await response.json();
      setTeachers(
        data.map(t => ({
          id: t.id,
          name: t.name || "-",
          email: t.email || "-"
        }))
      );
    } catch (error) {
      toast.error("Failed to load teachers!");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/admin/${adminId}/classes`);
      const data = await response.json();
      console.log("📌 Полученные данные классов:", data);
      setClasses(
        data.map(cls => ({
          id: cls.id,
          classname: cls.className || "-",
          teacher: cls.teacher?.name || "-",
         
          students: cls.students && cls.students.length > 0 
            ? cls.students.map(s => s.name).join(", ") 
            : "-"
        }))
      );
    } catch (error) {
      console.error("❌ Ошибка загрузки классов:", error);
      toast.error("Failed to load classes!");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/admin/${adminId}/students`);
      const data = await response.json();
      console.log("📌 Полученные данные студентов:", data);
      setStudents(
        data.map(student => ({
          id: student.id,
          name: student.name || "-",
          email: student.email || "-",
      
          class: student.classes && student.classes.length > 0 
            ? student.classes.map(cls => cls.className).join(", ") 
            : "-"
        }))
      );
    } catch (error) {
      console.error("❌ Ошибка загрузки студентов:", error);
      toast.error("Failed to load students!");
    } finally {
      setLoading(false);
    }
  };

 
  const deleteItem = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const response = await fetch(`${SERVER_URL}/api/${type}/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success(`${type} deleted!`);
        if (type === "teachers") fetchTeachers();
        if (type === "classes") fetchClasses();
        if (type === "students") fetchStudents();
      } else {
        toast.error(`Failed to delete ${type}!`);
      }
    } catch (error) {
      toast.error("Server error!");
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
      <h1 className="text-4xl font-bold text-center mb-10">Admin Dashboard</h1>

      {/* Вкладки */}
      <div className="flex mb-4 border-b border-gray-700">
        {["teachers", "classes", "students"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 ${activeTab === tab ? "border-b-2 border-blue-500" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

   
      {activeTab === "teachers" && (
        <DataTable
          title="Teachers"
          data={teachers}
          columns={["Name", "Email"]}
          actions={{ view: true, edit: true, delete: true }}
          onMenuToggle={toggleMenu}
          onAdd={() => console.log("Open Add Teacher Modal")}
        />
      )}

    
      {activeTab === "classes" && (
        <DataTable
          title="Classes"
          data={classes}
          columns={["Class Name", "Teacher", "Students"]}
          actions={{ view: true, edit: true, delete: true }}
          onMenuToggle={toggleMenu}
          onAdd={() => console.log("Open Add Class Modal")}
        />
      )}

   
      {activeTab === "students" && (
        <DataTable
          title="Students"
          data={students}
          columns={["Name", "Email", "Class"]}
          actions={{ view: true, edit: true, delete: true }}
          onMenuToggle={toggleMenu}
          onAdd={() => console.log("Open Add Student Modal")}
        />
      )}

     
      {menuData && (
        <ContextMenu
          data={menuData}
          onDelete={deleteItem}
          onEdit={() => console.log("Edit", menuData)}
          onView={() => console.log("View", menuData)}
          setMenuData={setMenuData}
        />
      )}
    </div>
  );
}


function DataTable({ title, data, columns, actions, onMenuToggle, onAdd }) {
  console.log(`📌 Данные для таблицы "${title}":`, data);

  return (
    <div className="w-full max-w-5xl bg-white bg-opacity-10 rounded-xl p-6 shadow-lg border border-gray-700 backdrop-blur-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">{title}:</h2>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={onAdd}
        >
          Add {title.slice(0, -1)}
        </button>
      </div>

      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-900 text-white">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-3 text-left">{col}</th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="bg-gray-800 border-b border-gray-700">
                  {columns.map((col, index) => {
                    
                    const key = col.toLowerCase().replace(/\s/g, ""); 
                    let value = item[key];

                    console.log(`📌 Колонка: ${col}, Ключ: ${key}, Значение:`, value);

                    if (typeof value === "object" && value !== null) {
                      value = value.name || "-";
                    }

                    return <td key={index} className="px-4 py-3">{value || "-"}</td>;
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
  return ReactDOM.createPortal(
    <div className="portal-menu fixed bg-gray-900 text-white shadow-lg rounded-md z-50 w-44"
         style={{ top: data.y + 10, left: data.x - 10 }}>
      <button className="flex items-center px-4 py-2 w-full hover:bg-gray-700 text-left" onClick={() => onView(data)}>
        <FiEye className="mr-2" /> View
      </button>
      <button className="flex items-center px-4 py-2 w-full hover:bg-gray-700 text-left" onClick={() => onEdit(data)}>
        <FiEdit className="mr-2" /> Edit
      </button>
      <button className="flex items-center px-4 py-2 w-full text-red-400 hover:bg-gray-700 text-left" onClick={() => onDelete(data.id, data.type)}>
        <FiTrash2 className="mr-2" /> Delete
      </button>
    </div>,
    document.body
  );
}
