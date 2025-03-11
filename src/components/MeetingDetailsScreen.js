import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Для перехода на страницу админа
import { toast } from "react-toastify";
import { getToken, validateMeeting } from "../api";
import WaitingRoomScreen from "./screens/WaitingRoomScreen"; // Екран очікування
import { signInWithGoogle } from "../firebase";

const ALLOWED_EMAILS = ["tamamatinfo@gmail.com", "meet.tamamat@gmail.com"];

export function MeetingDetailsScreen({
    setMeetingId,
    setToken, 
    onClickJoin,
    onClickStartMeeting,
    participantName,
    setParticipantName,
    videoTrack,
    setVideoTrack,
    setIsAdminView,
}) {
    const [roomName, setRoomName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [isJoinMeetingClicked, setIsJoinMeetingClicked] = useState(false);
    const [isWaitingRoom, setIsWaitingRoom] = useState(false);
    
    const navigate = useNavigate(); // Для перехода на страницу админа

    return isWaitingRoom ? (
        <WaitingRoomScreen meetingId={roomName} />
    ) : (
        <div className="flex flex-col justify-center w-full md:p-[6px] sm:p-1 p-1.5 relative">
            {/* 🔥 Кнопка перехода в Admin Panel */}
            <button
  className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md z-50"
  onClick={() => navigate("/admin/login")} // ✅ Теперь ведёт на страницу входа
>
  Admin Panel
</button>


            {/* Поле ввода email */}
            <input
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value.trim())}
                placeholder="Enter your email"
                className="px-4 py-3 bg-gray-650 rounded-xl text-white w-full text-center mb-4"
            />

            {userEmail && (
                <input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value.trim())}
                    placeholder="Enter class name (e.g., classroom-101)"
                    className="px-4 py-3 bg-gray-650 rounded-xl text-white w-full text-center mb-4"
                />
            )}

            {!userEmail && (
                <button
                    className="w-full bg-red-500 text-white px-2 py-3 rounded-xl"
                    onClick={async () => {
                        try {
                            const user = await signInWithGoogle();
                            if (user && user.email) {
                                setUserEmail(user.email.trim());
                                toast.success(`Signed in as ${user.email}`, {
                                    position: "bottom-left",
                                    autoClose: 3000,
                                    hideProgressBar: true,
                                });
                            }
                        } catch (error) {
                            toast.error("Google Sign-In Error", {
                                position: "bottom-left",
                                autoClose: 4000,
                                hideProgressBar: true,
                            });
                        }
                    }}
                >
                    Login with Google
                </button>
            )}

            <div className="w-full md:mt-4 mt-4 flex flex-col">
                <div className="flex items-center justify-center flex-col w-full">
                    {!isJoinMeetingClicked && (
                        <button
                            className={`w-full px-2 py-3 rounded-xl ${
                                userEmail && roomName
                                    ? "bg-purple-350 text-white"
                                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                            }`}
                            disabled={!userEmail || !roomName}
                            onClick={async () => {
                                console.log("[MeetingDetailsScreen] 🔥 Кликнута кнопка 'Create a class'!");
                                if (!ALLOWED_EMAILS.includes(userEmail)) {
                                  toast.error(`Access denied: ${userEmail} is not authorized to create meetings.`);
                                  return;
                                }
                              
                                toast.info("Creating class, please wait...");
                              
                                try {
                                  console.log("[MeetingDetailsScreen] 🔍 Получаем токен...");
                                  const token = await getToken();
                              
                                  if (!token) {
                                    console.error("[MeetingDetailsScreen] ❌ Ошибка: токен пуст!");
                                    return;
                                  }
                              
                                  setToken(token);
                                  console.log("[MeetingDetailsScreen] ✅ Токен установлен.");
                              
                                  const { meetingId, err } = await validateMeeting({ roomId: roomName });
                              
                                  if (meetingId) {
                                    console.log("[MeetingDetailsScreen] ✅ Комната найдена:", meetingId);
                                    setMeetingId(meetingId);
                                    toast.success(`Class created: ${meetingId}`);
                              
                                    // ✅ Сохранение встречи в базу данных
await fetch("http://localhost:5000/api/save-meeting", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        className: roomName,
        meetingId: meetingId,
        teacherId: 1,  // ЗАМЕНИ НА ID УЧИТЕЛЯ
    }),
})
    .then(res => res.json())
    .then(data => console.log("[MeetingDetailsScreen] ✅ Встреча сохранена в базе:", data))
    .catch(err => console.error("[MeetingDetailsScreen] ❌ Ошибка при сохранении встречи:", err));

setTimeout(() => {
    onClickStartMeeting(token, meetingId);
}, 2000);

                                  } else {
                                    console.error("[MeetingDetailsScreen] ❌ Ошибка при создании:", err);
                                  }
                                } catch (error) {
                                  console.error("[MeetingDetailsScreen] ❌ Ошибка:", error);
                                }
                              }}
                              
                        >
                            Create a class
                        </button>
                    )}

                    {!isJoinMeetingClicked ? (
                        <button
                            className="w-full bg-gray-650 text-white px-2 py-3 rounded-xl mt-5"
                            onClick={() => setIsJoinMeetingClicked(true)}
                        >
                            Join a class
                        </button>
                    ) : (
                        <button
                        className="w-full bg-green-500 text-white px-2 py-3 rounded-xl mt-3"
                        onClick={async () => {
                            console.log("[MeetingDetailsScreen] 🔥 Кликнута кнопка 'Confirm & Join'!");

                            if (!userEmail || !roomName) {
                                console.error("[MeetingDetailsScreen] ❌ Ошибка: Email или имя комнаты пусты!");
                                return;
                            }

                            try {
                                // ✅ Запрос к серверу для получения `meetingId` по `className`
                                const response = await fetch(`http://localhost:5000/api/get-meeting/${roomName}`);
                                const data = await response.json();

                                if (!data.meetingId) {
                                    console.error("[MeetingDetailsScreen] ❌ Ошибка: Встреча не найдена!");
                                    toast.error("Meeting not found!");
                                    return;
                                }

                                const meetingId = data.meetingId;
                                console.log("[MeetingDetailsScreen] ✅ Найден `meetingId`:", meetingId);

                                // ✅ Теперь используем `meetingId` для входа
                                setMeetingId(meetingId);
                                toast.success("Joining class...");
                                
                                setTimeout(() => {
                                    onClickJoin(meetingId);
                                }, 2000);
                            } catch (error) {
                                console.error("[MeetingDetailsScreen] ❌ Ошибка при поиске встречи:", error);
                                toast.error("Server error!");
                            }
                        }}
                    >
                        Confirm & Join
                    </button>
                    )}
                </div>
            </div>
        </div>
    );
}
