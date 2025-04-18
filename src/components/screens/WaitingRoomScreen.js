import React, { useEffect, useState } from "react";

function WaitingRoom({ meetingId, token, onJoined }) {
  const [checking, setChecking] = useState(false);




  useEffect(() => {
    
    let interval;
    let wakeLock = null;
  
    const wasJustEnded = sessionStorage.getItem("meetingWasEnded") === "true";
    if (wasJustEnded) sessionStorage.removeItem("meetingWasEnded");
  
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
          
          wakeLock.addEventListener("release", () => {
            
          });
        }
      } catch (err) {
        console.error("❌ Failed to acquire wake lock:", err);
      }
    };
  
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
       
  
        const activeSession = sessionData.data?.find((s) => s.status === "ongoing");
        if (!activeSession) return;
  
        const participants = activeSession.participants || [];
        
       
  
        if (participants.length > 0) {
          
          setChecking("joining");
  
          setTimeout(() => {
            clearInterval(interval);
            onJoined();
          }, 1500);
        }
      } catch (err) {
        console.error("❌ Error checking session:", err);
      }
    };
  
    // 🕓 Задержка перед первой проверкой — минимум 15 секунд
    setChecking("initial-wait");
    const startupDelay = setTimeout(() => {
      // Если до этого было "meetingWasEnded", учитываем это
      if (wasJustEnded) {
       
        setChecking("cooldown");
        const cooldownDelay = setTimeout(() => {
          setChecking(true);
          interval = setInterval(checkParticipants, 5000);
          checkParticipants();
        }, 15000);
        return () => clearTimeout(cooldownDelay);
      } else {
        setChecking(true);
        interval = setInterval(checkParticipants, 5000);
        checkParticipants();
      }
    }, 15000);
  
    requestWakeLock();
  
    return () => {
      clearTimeout(startupDelay);
      clearInterval(interval);
      if (wakeLock) {
        wakeLock.release().then(() => {
          
        });
      }
    };
  }, [meetingId, token, onJoined]);
  
  
  
  

  return (
    <div className="h-screen w-screen bg-black text-white flex items-center justify-center">
<h2 className="text-xl font-bold">
  {checking === "joining"
    ? "Please wait, connecting to the class..."
    : checking === "cooldown"
    ? "Meeting just ended. Please wait 15 seconds..."
    : checking === "initial-wait"
    ? "Waiting for the teacher to start the meeting..."
    : "Waiting for the teacher to start the meeting..."}
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
    

    const fetchMeetingId = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/getmeeting/by-classname/${roomName}`
        );
        const data = await res.json();
        const foundId = data.meeting?.meetingId;
        if (foundId) {
          
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
