import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MeetingContainer } from "../meeting/MeetingContainer";
import { MeetingProvider } from "@videosdk.live/react-sdk";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export function StaticMeetingJoiner({ onClickStartMeeting }) {
  const { slug, teacherName, className } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [meetingId, setMeetingId] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    async function joinStaticMeeting() {
      try {
        const response = await fetch(
          `${SERVER_URL}/api/meet/${slug}/${teacherName}/${className}`
        );
        const data = await response.json();

        if (!data.meeting || !data.meeting.meetingId) {
          toast.error("Meeting not found!");
          navigate("/");
          return;
        }

        const fetchedMeetingId = data.meeting.meetingId;
        setMeetingId(fetchedMeetingId);

        const tokenRes = await fetch(`${SERVER_URL}/api/get-token`);
        const tokenData = await tokenRes.json();
        if (!tokenData.token) {
          toast.error("Failed to get token!");
          navigate("/");
          return;
        }
        setToken(tokenData.token);
      } catch (error) {
        console.error("Error joining static meeting:", error);
        toast.error("Error joining meeting!");
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    if (slug && teacherName && className) {
      joinStaticMeeting();
    } else {
      setLoading(false);
    }
  }, [slug, teacherName, className, navigate]);

  if (loading) {
    return <div>Loading meeting...</div>;
  }

  if (meetingId && token) {
    return (
      <MeetingProvider
        config={{
          meetingId,
          micEnabled: true,
          webcamEnabled: true,
          name: "User", 
          multiStream: true,
        }}
        token={token}
        joinWithoutUserInteraction={true}
      >
        <MeetingContainer onMeetingLeave={() => navigate("/")} />
      </MeetingProvider>
    );
  }

  return <div>No meeting parameters provided.</div>;
}

export default StaticMeetingJoiner;
