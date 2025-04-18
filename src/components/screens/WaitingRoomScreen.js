import React, { useEffect, useState } from "react";

function WaitingRoom({ meetingId, token, onJoined }) {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    console.log("🔁 WaitingRoom mounted");
    let interval;
    let wakeLock = null;
  
    // Request wake lock to keep the screen on (especially on mobile)
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
          console.log("📱 Wake Lock is active");
  
          // Reacquire wake lock if it gets released (e.g. on screen lock)
          wakeLock.addEventListener("release", () => {
            console.log("🔋 Wake Lock was released");
          });
        } else {
          console.warn("🚫 Wake Lock API not supported");
        }
      } catch (err) {
        console.error("❌ Failed to acquire wake lock:", err);
      }
    };
  
    const checkParticipants = async () => {
      try {
        console.log("🌐 Checking session for meetingId:", meetingId);
  
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
        console.log("📥 Session data:", sessionData);
  
        const activeSession = sessionData.data?.find(
          (s) => s.status === "ongoing"
        );
  
        if (!activeSession) return;
  
        const participants = activeSession.participants || [];
        console.log("👥 Participants:", participants.length);
  
        if (participants.length > 0) {
          clearInterval(interval);
          console.log("✅ Teacher started session, joining...");
          onJoined();
        }
      } catch (err) {
        console.error("❌ Error checking session:", err);
      }
    };
  
    setChecking(true);
    interval = setInterval(checkParticipants, 5000);
    checkParticipants();
    requestWakeLock();
  
    return () => {
      console.log("🧹 Clearing interval");
      clearInterval(interval);
      if (wakeLock) {
        wakeLock.release().then(() => {
          console.log("🔋 Wake Lock released on cleanup");
        });
      }
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
