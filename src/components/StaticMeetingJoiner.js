import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { MeetingContainer } from "../meeting/MeetingContainer";

export function StaticMeetingJoiner({
  meetingId,
  token,
  userName = "User",
  role = "participant",
}) {
  const navigate = useNavigate();
  const [isMeetingLeft, setIsMeetingLeft] = useState(false);

  const handleLeave = () => {
    setIsMeetingLeft(true);
    navigate("/"); 
  };

  if (!meetingId || !token) {
    return <div>Missing meeting information.</div>;
  }

  return (
    <MeetingProvider
    config={{
      meetingId,
      micEnabled: false,
      webcamEnabled: role === "host",
      name: userName,
      multiStream: true,
      role,
    }}
    
      token={token}
      joinWithoutUserInteraction={true} 
    >
      <MeetingContainer
        onMeetingLeave={handleLeave}
        setIsMeetingLeft={setIsMeetingLeft}
        role={role}
      />
    </MeetingProvider>
  );
}

export default StaticMeetingJoiner;
