import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import  jwtDecode  from "jwt-decode"; 
import { useParams } from "react-router-dom";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import WaitingRoomScreen from "./screens/WaitingRoomScreen";


const SERVER_URL = process.env.REACT_APP_SERVER_URL;


export function MeetingDetailsScreen({
  setMeetingId,
  setToken,
  onClickJoin,
  onClickStartMeeting,
}) {
  const [roomName, setRoomName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isCreateMeetingClicked, setIsCreateMeetingClicked] = useState(false);
  const [isJoinMeetingClicked, setIsJoinMeetingClicked] = useState(false);
  const { className } = useParams();
  const navigate = useNavigate();
  const { isMicrophonePermissionAllowed } = useMeetingAppContext();
  const [waitingRoomVisible, setWaitingRoomVisible] = useState(false);
  const [localToken, setLocalToken] = useState("");
  const [meetingId, setMeetingIdLocal] = useState("");


  const checkEmail = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/school-admins/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();
      return data.exists; 
    } catch (error) {
      console.error("❌ Email verification error:", error);
      toast.error("Server error while checking email.");
      return false;
    }
  };


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
  
    if (tokenFromUrl) {
      localStorage.setItem("sessionToken", tokenFromUrl); 
      window.history.replaceState({}, document.title, window.location.pathname); 
    }
  
    const token = localStorage.getItem("sessionToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email);
      } catch (error) {
        console.error("❌ Invalid token:", error);
      }
    }
  

const email = localStorage.getItem("teacherEmail");
if (email) {
  setUserEmail(email);
}

    if (className) {
      setRoomName(className); 
    }
  }, [className]);

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get("token");

  if (tokenFromUrl) {
    localStorage.setItem("sessionToken", tokenFromUrl); 
    window.history.replaceState({}, document.title, "/"); 
  }

  const token = localStorage.getItem("sessionToken");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      setUserEmail(decoded.email);
   
    } catch (error) {
      console.error("❌ Invalid token:", error);
    }
  }
}, []);

const loginWithGoogle = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/auth/google/url`);
    const data = await response.json();

    if (data.authUrl) {
      window.location.href = data.authUrl; 
    } else {
      throw new Error("Failed to get authorization URL");
    }
  } catch (error) {
    console.error("❌ Error getting Google URL:", error);
    toast.error("Google authorization error.");
  }
};
 
if (waitingRoomVisible) {
  const role = "student";
  return (
    <div className="fixed inset-0 z-50">
      <WaitingRoomScreen
        meetingId={meetingId}
        token={localToken}
        userName={userEmail}
        role="student"
        onJoined={() => {
          onClickStartMeeting(localToken, meetingId);
        }}
      />
    </div>
  );
  
}

return (
  <div className="flex flex-col justify-center items-center w-full p-6">
    {/* Показываем выбор: Start or Join */}
    {!isCreateMeetingClicked && !isJoinMeetingClicked && (
      <>
        <button
          className="w-full bg-purple-500 text-white px-4 py-3 rounded-xl mb-4"
          onClick={() => setIsCreateMeetingClicked(true)}
        >
          Start a Class
        </button>
        <button
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl"
          onClick={() => setIsJoinMeetingClicked(true)}
        >
          Join a Class
        </button>
      </>
    )}

    {/* Общая форма для обеих опций */}
    {(isCreateMeetingClicked || isJoinMeetingClicked) && (
      <div className="w-full max-w-md mt-6">
        <input
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 bg-gray-650 rounded-xl text-white text-center mb-4"
        />
        <input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value.trim())}
          placeholder="Enter class name (e.g., classroom-101)"
          className="w-full px-4 py-3 bg-gray-650 rounded-xl text-white text-center mb-4"
        />

        {!userEmail && (
          <button
            className="w-full bg-red-500 text-white px-2 py-3 rounded-xl mb-4"
            onClick={loginWithGoogle}
          >
            Login with Google
          </button>
        )}

        {isCreateMeetingClicked && (
          <button
            className="w-full bg-green-500 text-white px-2 py-3 rounded-xl"
            onClick={async () => {
              if (!isMicrophonePermissionAllowed) {
                toast.error("Please allow microphone access to continue.");
                return;
              }

              const isValid = await checkEmail();
              if (!isValid) {
                toast.error("❌ Email not found. Access denied.");
                return;
              }

              try {
                const tokenResponse = await fetch(`${SERVER_URL}/api/get-token`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    permissions: [
                      "allow_join",
                      "allow_mod",
                      "allow_create",
                      "allow_publish",
                      "allow_subscribe",
                      "allow_join",
                    ],
                  }),
                });
                const { token } = await tokenResponse.json();

                if (!token) {
                  toast.error("Failed to get token!");
                  return;
                }

                setToken(token);

                const meetingResponse = await fetch("https://api.videosdk.live/v1/meetings", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `${token}`,
                  },
                  body: JSON.stringify({ userMeetingId: roomName, lobby: true }),
                });

                const meetingData = await meetingResponse.json();

                if (!meetingData.meetingId) {
                  toast.error("Error creating meeting!");
                  return;
                }

                await fetch(`${SERVER_URL}/api/savemeeting/new`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    className: roomName,
                    meetingId: meetingData.meetingId,
                    teacherEmail: userEmail,
                  }),
                });

                setTimeout(() => {
                  sessionStorage.setItem("participantRole", "teacher");
                  onClickStartMeeting(token, meetingData.meetingId);
                }, 2000);
              } catch (error) {
                toast.error("Server error while creating meeting!");
              }
            }}
          >
            Confirm
          </button>
        )}

        {isJoinMeetingClicked && (
          <button
            className="w-full bg-green-500 text-white px-2 py-3 rounded-xl"
            onClick={async () => {
              if (!isMicrophonePermissionAllowed) {
                toast.error("Please allow microphone access to continue.");
                return;
              }

              try {
                const response = await fetch(`${SERVER_URL}/api/getmeeting/by-classname/${roomName}`);
                const data = await response.json();

                const meetingId = data.meeting?.meetingId;
                if (!meetingId) {
                  toast.error("Meeting not found or data incomplete!");
                  return;
                }

                const tokenResponse = await fetch(`${SERVER_URL}/api/get-token`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ permissions: ["ask_join"] }),
                });

                const { token } = await tokenResponse.json();
                if (!token) {
                  toast.error("Failed to get token!");
                  return;
                }

                sessionStorage.setItem("participantRole", "student");
                setToken(token);
                setLocalToken(token);
                setMeetingIdLocal(meetingId);
                toast.success("Joining class...");
                setWaitingRoomVisible(true);
              } catch (error) {
                toast.error("Server error while joining!");
              }
            }}
          >
            Confirm
          </button>
        )}
      </div>
    )}
  </div>
);
}