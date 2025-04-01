import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WaitingRoomScreen from "./WaitingRoomScreen";

export default function JoinMeetingScreen({ slug, teacherName, className }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <WaitingRoomScreen
        meetingId={slug}
        userEmail={email}
        onMeetingAvailable={({ meetingId, token }) => {
          navigate(`/join/${meetingId}?token=${token}&email=${encodeURIComponent(email)}`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl mb-4">Enter Your Email</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
        <input
          type="email"
          className="px-4 py-2 rounded text-black"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="bg-blue-600 py-2 rounded hover:bg-blue-700">Continue</button>
      </form>
    </div>
  );
}
