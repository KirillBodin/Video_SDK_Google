import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode"; 



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

  const navigate = useNavigate();


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
 
  

  return (
    <div className="flex flex-col justify-center w-full md:p-[6px] sm:p-1 p-1.5 relative">
  

    
      <input
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
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
          onClick={loginWithGoogle}
        >
          Login with Google
        </button>
      )}

      <div className="w-full md:mt-4 mt-4 flex flex-col">
        <div className="flex items-center justify-center flex-col w-full">
          {!isCreateMeetingClicked && !isJoinMeetingClicked && (
            <>

              <button
                className={`
                  w-full px-2 py-3 rounded-xl ${
                    userEmail && roomName ? "bg-purple-350 text-white" : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                disabled={!userEmail || !roomName}
                onClick={async () => {
       
                  const isValid = await checkEmail();

                  if (!isValid) {
                    toast.error("❌ Email not found. Access denied.");
                    return;
                  }

                  setIsCreateMeetingClicked(true);

                }}
              >
                Create a class
              </button>

  
              <button
                className={`
                  w-full bg-gray-650 text-white px-2 py-3 rounded-xl mt-5
                  ${userEmail && roomName ? "" : "cursor-not-allowed opacity-50"}
                `}
                disabled={!userEmail || !roomName}
                onClick={() => setIsJoinMeetingClicked(true)}
              >
                Join a class
              </button>
            </>
          )}

          {isCreateMeetingClicked && (
            <button
              className="w-full bg-green-500 text-white px-2 py-3 rounded-xl mt-3"
              onClick={async () => {
                console.log("[MeetingDetailsScreen] 🔥 'Confirm & Create' clicked!");

                try {
                  const tokenResponse = await fetch(`${SERVER_URL}/api/get-token`);
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
                    body: JSON.stringify({ userMeetingId: roomName,
                      lobby: true  }),
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
                    onClickStartMeeting(token, meetingData.meetingId);
                  }, 2000);
                } catch (error) {
                  toast.error("Server error while creating meeting!");
                }
              }}
            >
              Confirm & Create
            </button>
          )}

  
          {isJoinMeetingClicked && (
            <button
              className="w-full bg-green-500 text-white px-2 py-3 rounded-xl mt-3"
              onClick={async () => {
                try {
                  const response = await fetch(`${SERVER_URL}/api/savemeeting/byclassname/${roomName}`);
                  const data = await response.json();
              
                  const { meetingId, slug, className, teacherName } = data;
              
                  if (!meetingId || !slug || !className || !teacherName) {
                    toast.error("Meeting not found or data incomplete!");
                    return;
                  }
              
                  const tokenResponse = await fetch(`${SERVER_URL}/api/get-token`);
                  const { token } = await tokenResponse.json();
              
                  if (!token) {
                    toast.error("Failed to get token!");
                    return;
                  }
              
                  setToken(token);
                  setMeetingId(meetingId);
                  toast.success("Joining class...");
              
              
                  navigate(`/${slug}/${teacherName}/${className}`);
                } catch (error) {
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
