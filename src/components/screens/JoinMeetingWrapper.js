import React, { useState } from "react";
import { useParams } from "react-router-dom";
import WaitingRoomScreen from "./WaitingRoomScreen";
import StaticMeetingJoiner from "../StaticMeetingJoiner";

export default function JoinMeetingWrapper() {
  const { slug: meetingId } = useParams();
  const [step, setStep] = useState("email");
  const [userEmail, setUserEmail] = useState("");
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");

  const SERVER_URL = process.env.REACT_APP_SERVER_URL;

  const handleMeetingAvailable = () => {
    setStep("meeting");
  };

  const handleEmailSubmit = async () => {
    if (!userEmail) return;

    try {
      // 1. Проверка доступа
      const res = await fetch(`${SERVER_URL}/api/student/check-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, email: userEmail }),
      });

      const data = await res.json();

      if (res.ok && data.access) {
        // 2. Получение токена
        const tokenRes = await fetch(`${SERVER_URL}/api/get-token`);
        const tokenData = await tokenRes.json();

        if (!tokenData.token) {
          setError("Failed to retrieve token.");
          return;
        }

        setToken(tokenData.token);
        setStep("waiting");
      } else {
        setError("You do not have access to this class.");
      }
    } catch (err) {
      console.error("❌ Access check failed:", err);
      setError("Server error. Please try again later.");
    }
  };

  if (step === "email") {
    return (
      <div className="h-screen w-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl mb-4">Enter Your Email</h1>
        <input
          className="px-4 py-2 text-black rounded"
          type="email"
          placeholder="your@email.com"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <button
          className="mt-4 bg-blue-600 px-6 py-2 rounded"
          onClick={handleEmailSubmit}
        >
          Continue
        </button>
        {error && <p className="mt-2 text-red-400">{error}</p>}
      </div>
    );
  }

  if (step === "waiting") {
    return (
      <WaitingRoomScreen
        meetingId={meetingId}
        token={token}
        onMeetingAvailable={handleMeetingAvailable}
      />
    );
  }

  if (step === "meeting") {
    return (
      <StaticMeetingJoiner
        meetingId={meetingId}
        token={token}
        userName={userEmail.split("@")[0]}
      />
    );
  }

  return null;
}
