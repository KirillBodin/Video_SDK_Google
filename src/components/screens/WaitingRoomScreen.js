import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MeetingContainer } from "../../meeting/MeetingContainer";
import { MeetingProvider } from "@videosdk.live/react-sdk";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export function StaticMeetingJoiner({ meetingId, token, userName }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validate = async () => {
      try {
        if (!meetingId || !token) {
          toast.error("Missing meeting info.");
          navigate("/");
          return;
        }
      } catch (error) {
        toast.error("Error joining meeting.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, [meetingId, token, navigate]);

  if (loading) return <div>Loading meeting...</div>;

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: userName || "Guest",
        multiStream: true,
      }}
      token={token}
      joinWithoutUserInteraction={true}
    >
      <MeetingContainer onMeetingLeave={() => navigate("/")} />
    </MeetingProvider>
  );
}

export default StaticMeetingJoiner;
