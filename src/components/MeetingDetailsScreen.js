import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode"; 
import { useParams } from "react-router-dom";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import WaitingRoomScreen from "./screens/WaitingRoomScreen";


const SERVER_URL = process.env.REACT_APP_SERVER_URL;


export function MeetingDetailsScreen({
  setMeetingId,
  setToken,
  onClickJoin,
  onClickStartMeeting,
  setParticipantName,
}) {
  const [roomName, setRoomName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isCreateMeetingClicked, setIsCreateMeetingClicked] = useState(false);
  const [isJoinMeetingClicked, setIsJoinMeetingClicked] = useState(false);
  const { name,className } = useParams();
  
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
      
      toast.error("Server error while checking email.");
      return false;
    }
  };
  useEffect(() => {
    document.title = "TAMAMAT - Teaching Platform";
  }, []);

  useEffect(() => {
    
  
    const wasEnded = sessionStorage.getItem("meetingWasEnded");
    
  
    if (wasEnded) {
      sessionStorage.removeItem("meetingWasEnded");
      const prevToken = sessionStorage.getItem("waitingToken");
      const prevRoomName = sessionStorage.getItem("waitingRoomName");
  
    
  
      if (prevToken && prevRoomName) {
        setLocalToken(prevToken);
        setRoomName(prevRoomName);
        setWaitingRoomVisible(true);
        
      } else {
        toast.error("Missing meeting data. Please rejoin manually.");
      }
    }
  
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    
  
    if (tokenFromUrl) {
      sessionStorage.setItem("sessionToken", tokenFromUrl);
      const redirectAfterLogin = sessionStorage.getItem("redirectAfterLogin");
      
      if (redirectAfterLogin) {
        navigate(redirectAfterLogin);
        sessionStorage.removeItem("redirectAfterLogin");
      } else {
        const currentPath = window.location.pathname;
        window.history.replaceState({}, document.title, currentPath);
      }
    }
  
    const token = sessionStorage.getItem("sessionToken");
    
  
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
  
        if (decoded.email) setUserEmail(decoded.email);
        if (decoded.name) setUserName(decoded.name);
      } catch (error) {
        console.error("❌ Invalid token:", error);
      }
    }
  
    const googleLoginAction = sessionStorage.getItem("googleLoginAction");
    
  
    if (googleLoginAction === "create") {
      setIsCreateMeetingClicked(true);
    } else if (googleLoginAction === "join") {
      setIsJoinMeetingClicked(true);
    }
  
    sessionStorage.removeItem("googleLoginAction");
  
    const email = sessionStorage.getItem("teacherEmail");
    const storedTeacherName = sessionStorage.getItem("teacherName");
  
   
  
    if (email) setUserEmail(email);
    if (storedTeacherName) setUserName(storedTeacherName);
  
    if (className) {
     
      setRoomName(className);
    }
  }, [className, navigate]);
  
  
  



  const loginWithGoogle = async (actionType) => {
    try {
      const currentPath = window.location.pathname;
      sessionStorage.setItem("redirectAfterLogin", currentPath);
  
      if (actionType) {
        sessionStorage.setItem("googleLoginAction", actionType);
      }
  
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
  roomName={roomName}
  token={localToken}
  userName={userName}
  role="student"
  onJoined={(newMeetingId) => {
    onClickStartMeeting(localToken, newMeetingId, userName); 
  }}
/>

      </div>
    );
  }
  

return (
  <div className="flex flex-col justify-center items-center w-full p-6">
    
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


{(isCreateMeetingClicked || isJoinMeetingClicked) && (
  <div className="w-full max-w-md mt-6">
    <input
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Enter your name"
        className="w-full px-4 py-3 bg-gray-650 rounded-xl text-white text-center mb-4"
      />
    <input
      value={userEmail}
      onChange={(e) => setUserEmail(e.target.value)}
      placeholder="Enter your email"
      className="w-full px-4 py-3 bg-gray-650 rounded-xl text-white text-center mb-4"
    />
    
    {!className && (
      <input
        value={roomName}
        onChange={(e) => setRoomName(e.target.value.trim())}
        placeholder="Enter class name (e.g., classroom-101)"
        className="w-full px-4 py-3 bg-gray-650 rounded-xl text-white text-center mb-4"
      />
    )}

{!userEmail && (
  <button
    className="w-full bg-red-500 text-white px-2 py-3 rounded-xl"
    onClick={() => loginWithGoogle(isCreateMeetingClicked ? "create" : "join")}
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
            teacherName: userName, 
          }),
        });

       
        setParticipantName(userName);
         setTimeout(() => {
             sessionStorage.setItem("participantRole", "teacher");
             onClickStartMeeting(
               token,
               meetingData.meetingId,
               userName        
             );
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

                const meetingId = data.meeting ? data.meeting.meetingId : null;
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
                sessionStorage.setItem("waitingToken", token);
                sessionStorage.setItem("waitingRoomName", roomName);
                toast.success("Joining class...");
                setParticipantName(userName);
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