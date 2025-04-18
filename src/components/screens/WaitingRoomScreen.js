import React, { useEffect, useState } from "react";

function WaitingRoom({ meetingId, token, onJoined }) {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    console.log("🔁 WaitingRoom mounted");
  
    
    let wakeLock = null;
  
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          // Request a screen wake lock
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('🔒 Screen wake lock acquired');
  
         
          wakeLock.addEventListener('release', () => {
            console.warn('🔓 Screen wake lock released');
          });
        }
      } catch (err) {
        console.error('❌ Could not obtain wake lock:', err);
      }
    };
  
    requestWakeLock();
  
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
   
  
    let intervalId = null;
  
    const checkParticipants = async () => {
      try {
        
      } catch (err) {
        console.error('❌ Error checking session:', err);
      }
    };
  
    setChecking(true);
    intervalId = setInterval(checkParticipants, 5000);
    checkParticipants();
  
    return () => {
      console.log('🧹 Clearing interval and releasing wake lock');
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release().catch(err => {
          console.error('❌ Error releasing wake lock:', err);
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
