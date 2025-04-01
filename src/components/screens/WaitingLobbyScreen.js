import React, { useEffect, useRef, useState } from "react";
import { MeetingProvider, useMeeting } from "@videosdk.live/react-sdk";

function WaitingRoomContent({ onJoined }) {
  const hasRequestedRef = useRef(false); // 🔒 не даём вызывать join() повторно
  const [denied, setDenied] = useState(false);

  const { join } = useMeeting({
    onMeetingJoined: () => {
    
      onJoined();
    },
    onEntryResponded: (data) => {
     
      if (data.status === "denied") {
        console.warn("❌ Entry DENIED by host.");
        setDenied(true);
      } else if (data.status === "allowed") {
        
      } else {
        console.log("ℹ️ Unknown entry response status:", data.status);
      }
    },
    onError: (err) => {
      console.error("❌ Error in useMeeting:", err);
    },
  });

  useEffect(() => {
    if (!hasRequestedRef.current) {
      
      join();
      hasRequestedRef.current = true;
    }
  }, [join]);

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">
          {denied ? "⛔ Access Denied" : "Waiting for host to let you in..."}
        </h1>
        <p className="text-gray-400">
          {denied
            ? "You were not allowed to join the meeting."
            : "Please wait, you'll be connected once approved."}
        </p>
      </div>
    </div>
  );
}

export default function WaitingLobbyScreen({ meetingId, token, userName, role, onJoined }) {

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: false,
        webcamEnabled: false,
        name: userName,
        multiStream: true,
        role,
      }}
      token={token}
    >
      <WaitingRoomContent onJoined={onJoined} />
    </MeetingProvider>
  );
}
