import React, { useEffect, useState } from "react";

function WaitingRoom({ meetingId, token, onJoined }) {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    console.log("🔁 WaitingRoom mounted");
  
    
    const checkParticipants = async () => {
      try {
        const sessionRes = await fetch(
          `https://api.videosdk.live/v2/sessions/?roomId=${meetingId}`,
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );
        const sessionData = await sessionRes.json();
        const activeSession = sessionData.data?.find(s => s.status === "ongoing");
        if (activeSession) {
          const participants = activeSession.participants || [];
          console.log("👥 Participants:", participants.length);
          if (participants.length > 0) {
            clearInterval(intervalId);
            console.log("✅ Teacher started session, joining...");
            onJoined();
          }
        }
      } catch (err) {
        console.error("❌ Error checking session:", err);
      }
    };
  
    
    setChecking(true);
    const intervalId = setInterval(checkParticipants, 5000);
    checkParticipants();
  
   
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          const wake = await navigator.wakeLock.request("screen");
          console.log("🔒 Wake lock acquired");
          
          wake.addEventListener("release", () => {
            console.warn("🔓 Wake lock released");
          });
        }
      } catch (err) {
        
        console.warn("⚠️ Wake lock failed (ignored):", err);
      }
    };
    requestWakeLock();
  
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
  
   
    return () => {
      console.log("🧹 Cleaning up WaitingRoom effect");
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [meetingId, token, onJoined]);
  
  
  

  return (
    <div className="h-screen w-screen bg-black text-white flex items-center justify-center">
      <h2 className="text-xl font-bold">
        {checking ? "Waiting for the teacher to start the meeting..." : "Loading..."}
      </h2>
    </div>
  );
}

export default function WaitingLobbyScreen({
  roomName,
  token,
  userName,
  role,
  onJoined,
}) {
  const [resolvedMeetingId, setResolvedMeetingId] = useState("");

  
  useEffect(() => {
    console.log("🧭 WaitingLobbyScreen", { roomName, token, userName, role });

    const fetchMeetingId = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/getmeeting/by-classname/${roomName}`
        );
        const data = await res.json();
        const foundId = data.meeting?.meetingId;
        if (foundId) {
          console.log("🔍 Found meetingId =", foundId);
          setResolvedMeetingId(foundId);
        } else {
          console.warn("❌ Meeting not yet created");
        }
      } catch (e) {
        console.error("❌ Failed to fetch meetingId:", e);
      }
    };

    fetchMeetingId();
  }, [roomName]);

  return resolvedMeetingId ? (
<WaitingRoom
  meetingId={resolvedMeetingId}
  token={token}
 onJoined={() =>
    onJoined(
      resolvedMeetingId,  
      userName,           
      role                
    )
  }
/>
  ) : (
    <div className="h-screen w-screen bg-black text-white flex items-center justify-center">
      <h2 className="text-xl font-bold">Waiting for the teacher to create the meeting...</h2>
    </div>
  );
}
