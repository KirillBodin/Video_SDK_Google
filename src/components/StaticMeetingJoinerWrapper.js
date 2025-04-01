import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import StaticMeetingJoiner from "./StaticMeetingJoiner";

export default function StaticMeetingJoinerWrapper() {
  const { meetingId } = useParams();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!meetingId || !token || !email) {
    return <div className="text-white">Missing meeting info in URL</div>;
  }

  return (
    <StaticMeetingJoiner
      meetingId={meetingId}
      token={token}
      userName={email.split("@")[0]}
      role="participant"
      hasAlreadyJoined={true}
    />
  );
}
