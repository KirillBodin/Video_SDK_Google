import React, { useEffect, useState } from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";

function WaitingRoom({ meetingId, token, onJoined }) {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let interval;

    const checkParticipants = async () => {
      try {
        console.log("🔁 Checking active sessions...");
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
        console.log("📦 Sessions data:", sessionData);

        const activeSession = sessionData.data?.find(
          (s) => s.status === "ongoing"
        );

        if (!activeSession) {
          console.log("🕓 No active session yet.");
          return;
        }

        const participants = activeSession.participants || [];
        console.log(`👥 Found ${participants.length} participant(s)`);

        if (participants.length > 0) {
          clearInterval(interval);
          onJoined();
        } else {
          console.log("🕓 Session started but no participants.");
        }
      } catch (err) {
        console.error("❌ Error checking session:", err);
      }
    };

    setChecking(true);
    interval = setInterval(checkParticipants, 5000);
    checkParticipants(); // initial

    return () => clearInterval(interval);
  }, [meetingId, token, onJoined]);

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex items-center justify-center">
      <h2 className="text-xl font-bold">
        {checking ? "Waiting for the teacher to start the meeting..." : "Loading..."}
      </h2>
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
      <WaitingRoom meetingId={meetingId} token={token} onJoined={onJoined} />
    </MeetingProvider>
  );
}
