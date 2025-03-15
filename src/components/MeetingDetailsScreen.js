import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import WaitingRoomScreen from "./screens/WaitingRoomScreen";
import { signInWithGoogle } from "../firebase";

// При необходимости можно подключить getToken, validateMeeting и т.д.
// import { getToken, validateMeeting } from "../api";
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";
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
  // Список учителей, если нужен
  const [teachersList, setTeachersList] = useState([]);

  // Флаги, какой шаг в данный момент
  const [isJoinMeetingClicked, setIsJoinMeetingClicked] = useState(false);
  const [isCreateMeetingClicked, setIsCreateMeetingClicked] = useState(false);

  // Опционально: состояние, если нужно показать экран ожидания
  const [isWaitingRoom, setIsWaitingRoom] = useState(false);

  const navigate = useNavigate();
const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";
  // Если нужно загружать список учителей для чего-то ещё (но сейчас не используем)
  useEffect(() => {
    fetch(`${SERVER_URL}/api/school-admins/users`)
      .then((res) => res.json())
      .then((data) => {
        setTeachersList(data.map((teacher) => teacher.email));
      })
      .catch(() => toast.error("Failed to load teachers list"));
  }, []);

  // Если нужно отображать “WaitingRoomScreen”, пока идёт ожидание
  if (isWaitingRoom) {
    return <WaitingRoomScreen meetingId={roomName} />;
  }

  return (
    <div className="flex flex-col justify-center w-full md:p-[6px] sm:p-1 p-1.5 relative">
      {/* Кнопка, ведущая на /admin/login */}
      <button
        className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md z-50"
        onClick={() => navigate("/admin/login")}
      >
        Admin Panel
      </button>

      {/* Поле ввода E-mail */}
      <input
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value.trim())}
        placeholder="Enter your email"
        className="px-4 py-3 bg-gray-650 rounded-xl text-white w-full text-center mb-4"
      />

      {/* Поле ввода className, только если ввели E-mail */}
      {userEmail && (
        <input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value.trim())}
          placeholder="Enter class name (e.g., classroom-101)"
          className="px-4 py-3 bg-gray-650 rounded-xl text-white w-full text-center mb-4"
        />
      )}

      {/* Кнопка Login with Google, если E-mail не введён */}
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

          {/* ШАГ 1: Показываем две кнопки (Create / Join), если НИ одна не нажата */}
          {!isCreateMeetingClicked && !isJoinMeetingClicked && (
            <>
              {/* Кнопка "Create a class" */}
              <button
                className={`w-full px-2 py-3 rounded-xl ${
                  userEmail && roomName
                    ? "bg-purple-350 text-white"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!userEmail || !roomName}
                onClick={() => {
                  console.log("[MeetingDetailsScreen] 🔥 'Create a class' (Step1) clicked!");
                  setIsCreateMeetingClicked(true);
                }}
              >
                Create a class
              </button>

              {/* Кнопка "Join a class" */}
              <button
                className={`
                  w-full bg-gray-650 text-white px-2 py-3 rounded-xl mt-5
                  ${userEmail && roomName ? "" : "cursor-not-allowed opacity-50"}
                `}
                disabled={!userEmail || !roomName}
                onClick={() => {
                  console.log("[MeetingDetailsScreen] 🔥 'Join a class' (Step1) clicked!");
                  setIsJoinMeetingClicked(true);
                }}
              >
                Join a class
              </button>
            </>
          )}

          {/* ШАГ 2А: Подтверждение создания (Confirm & Create), если нажали "Create a class" */}
          {isCreateMeetingClicked && (
            <button
              className={`
                w-full bg-green-500 text-white px-2 py-3 rounded-xl mt-3
                ${!userEmail || !roomName ? "cursor-not-allowed opacity-50" : ""}
              `}
              disabled={!userEmail || !roomName}
              onClick={async () => {
                console.log("[MeetingDetailsScreen] 🔥 'Confirm & Create' clicked!");

                if (!roomName || !userEmail) {
                  toast.error("Please enter your email and class name.");
                  return;
                }

                toast.info("Creating class, please wait...");

                try {
                  // 1) Получаем VideoSDK токен
                  const tokenResponse = await fetch(`${SERVER_URL}/api/get-token`);
                  const { token } = await tokenResponse.json();

                  if (!token) {
                    console.error("[MeetingDetailsScreen] ❌ Токен пуст!");
                    toast.error("Failed to get token!");
                    return;
                  }
                  setToken(token);

                  // 2) Создаём новую встречу
                  const meetingResponse = await fetch(`https://api.videosdk.live/v1/meetings`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: token,
                    },
                    body: JSON.stringify({ userMeetingId: roomName }),
                  });
                  const meetingData = await meetingResponse.json();

                  if (!meetingData.meetingId) {
                    console.error("[MeetingDetailsScreen] ❌ Ошибка при создании:", meetingData);
                    toast.error("Error creating meeting!");
                    return;
                  }
                  const newMeetingId = meetingData.meetingId;
                  console.log("[MeetingDetailsScreen] ✅ Встреча создана:", newMeetingId);

                  // 3) Сохраняем на своём сервере
                  await fetch(`${SERVER_URL}/api/save-meeting`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      className: roomName,
                      meetingId: newMeetingId,
                      teacherEmail: userEmail,
                    }),
                  })
                    .then((res) => res.json())
                    .then((data) => console.log("[MeetingDetailsScreen] ✅ Встреча сохранена:", data))
                    .catch((err) => console.error("[MeetingDetailsScreen] ❌ Ошибка сохранения:", err));

                  // 4) Переход в комнату (onClickStartMeeting)
                  setTimeout(() => {
                    onClickStartMeeting(token, newMeetingId);
                  }, 1000);
                } catch (error) {
                  console.error("[MeetingDetailsScreen] ❌ Ошибка:", error);
                  toast.error("Server error while creating meeting!");
                }
              }}
            >
              Confirm & Create
            </button>
          )}

          {/* ШАГ 2Б: Подтверждение подключения (Confirm & Join), если нажали "Join a class" */}
          {isJoinMeetingClicked && (
            <button
              className={`
                w-full bg-green-500 text-white px-2 py-3 rounded-xl mt-3
                ${!userEmail || !roomName ? "cursor-not-allowed opacity-50" : ""}
              `}
              disabled={!userEmail || !roomName}
              onClick={async () => {
                console.log("[MeetingDetailsScreen] 🔥 'Confirm & Join' clicked!");

                if (!userEmail || !roomName) {
                  toast.error("Please enter your email and class name.");
                  return;
                }

                try {
                  // 1) Получаем meetingId из базы по названию roomName
                  const response = await fetch(`http://${SERVER_URL}/api/get-meeting/${roomName}`);
                  const data = await response.json();

                  if (!data.meetingId) {
                    console.error("[MeetingDetailsScreen] ❌ Урок не найден!");
                    toast.error("Meeting not found!");
                    return;
                  }
                  const meetingId = data.meetingId;
                  console.log("[MeetingDetailsScreen] ✅ Найден meetingId:", meetingId);

                  // 2) Получаем токен
                  const tokenResponse = await fetch(`${SERVER_URL}/api/get-token`);
                  const { token } = await tokenResponse.json();

                  if (!token) {
                    console.error("[MeetingDetailsScreen] ❌ Ошибка: токен пуст!");
                    toast.error("Failed to get token!");
                    return;
                  }
                  setToken(token);
                  console.log("[MeetingDetailsScreen] ✅ Токен получен:", token);

                  // 3) Валидируем встречу на VideoSDK
                  const validateRes = await fetch(`https://api.videosdk.live/v1/meetings/${meetingId}`, {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: token,
                    },
                  });

                  if (!validateRes.ok) {
                    toast.error("Meeting is invalid or does not exist in VideoSDK!");
                    return;
                  }

                  // Подключаемся
                  setMeetingId(meetingId);
                  toast.success("Joining class...");

                  console.log("[MeetingDetailsScreen] 🟢 Вызываем onClickJoin, meetingId:", meetingId, "token:", token);
                  onClickJoin(token, meetingId);

                } catch (error) {
                  console.error("[MeetingDetailsScreen] ❌ Ошибка при поиске встречи:", error);
                  toast.error("Server error while joining!");
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
