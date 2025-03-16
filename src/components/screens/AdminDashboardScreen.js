import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AdminDashboardScreen() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const SERVER_URL = process.env.REACT_APP_SERVER_URL || "https://backend-videosdk.onrender.com";

    // ✅ Получение всех встреч из базы
    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${SERVER_URL}/api/meetings`);
            const data = await response.json();
            setMeetings(data);
        } catch (error) {
            console.error("[Admin] ❌ Ошибка при загрузке встреч:", error);
            toast.error("Failed to load meetings!");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Удаление встречи
    const deleteMeeting = async (meetingId) => {
        if (!window.confirm("Are you sure you want to delete this meeting?")) return;

        try {
            const response = await fetch(`${SERVER_URL}/api/delete-meeting/${meetingId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                toast.success("Meeting deleted!");
                fetchMeetings(); // Обновляем список после удаления
            } else {
                toast.error("Failed to delete meeting!");
            }
        } catch (error) {
            console.error("[Admin] ❌ Ошибка при удалении:", error);
            toast.error("Server error!");
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    return (
        <div className="flex flex-col items-center p-6">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

            {loading ? (
                <p>Loading meetings...</p>
            ) : (
                <table className="w-full max-w-3xl border-collapse border border-gray-600">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="p-2 border border-gray-600">Class Name</th>
                            <th className="p-2 border border-gray-600">Meeting ID</th>
                            <th className="p-2 border border-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meetings.length > 0 ? (
                            meetings.map((meeting) => (
                                <tr key={meeting.meetingId} className="border border-gray-600">
                                    <td className="p-2 border border-gray-600">{meeting.className}</td>
                                    <td className="p-2 border border-gray-600">{meeting.meetingId}</td>
                                    <td className="p-2 border border-gray-600">
                                        <button
                                            className="bg-red-500 text-white px-3 py-1 rounded"
                                            onClick={() => deleteMeeting(meeting.meetingId)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center p-4">
                                    No meetings found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
