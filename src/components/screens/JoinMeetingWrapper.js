import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import WaitingRoomScreen from "./WaitingRoomScreen";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function JoinMeetingWrapper() {
  const { slug: meetingIdSlug, teacherName, className } = useParams();
  const [step, setStep] = useState("email");
  const [userEmail, setUserEmail] = useState("");
  const [token, setToken] = useState("");
  const [userRole, setUserRole] = useState("participant");
  const [actualMeetingId, setActualMeetingId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const hasCreatedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleFromURL = params.get("role");

   

    if (roleFromURL === "teacher") {
      const email = localStorage.getItem("teacherEmail");
    

      if (email && !hasCreatedRef.current) {
        hasCreatedRef.current = true;
       
        setUserEmail(email);
        setUserRole("host");
        createMeeting(email);
      } else {
        console.warn("❌ No teacher email found in localStorage.");
      }
    }
  }, []);

  const createMeeting = async (email) => {
    try {
      
      const tokenResponse = await fetch(`${SERVER_URL}/api/get-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissions: [
            "allow_join",
            "allow_mod",
            "allow_create",
            "allow_publish",
            "allow_subscribe",
          ],
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.token) throw new Error("No token");

      setToken(tokenData.token);

      
      const meetingRes = await fetch("https://api.videosdk.live/v1/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: tokenData.token,
        },
        body: JSON.stringify({ userMeetingId: meetingIdSlug, lobby: false }),
      });

      const meetingData = await meetingRes.json();
    
      if (!meetingData.meetingId) throw new Error("Failed to create meeting");

      
      await fetch(`${SERVER_URL}/api/savemeeting/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className,
          meetingId: meetingData.meetingId,
          teacherEmail: email,
        }),
      });

      setActualMeetingId(meetingData.meetingId);
      setStep("meeting");
    } catch (err) {
      console.error("❌ Error creating meeting:", err);
      toast.error("Failed to create meeting.");
    }
  };

  const handleEmailSubmit = async () => {
    if (!userEmail) return;
  
    setLoading(true); 
  
    try {
      const userRes = await fetch(`${SERVER_URL}/api/users/by-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
  
      const userData = await userRes.json();
  
      if (!userRes.ok || !userData.role) {
        setError("User not found or invalid.");
        setLoading(false); 
        return;
      }
  
      const isTeacher = userData.role === "teacher";
      setUserRole(isTeacher ? "host" : "participant");
  
      const accessRes = await fetch(`${SERVER_URL}/api/meet/check-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className, email: userEmail }),
      });
  
      const accessData = await accessRes.json();
  
      if (!accessRes.ok || !accessData.access) {
        setError("You do not have access to this class.");
        setLoading(false); 
        return;
      }
  
      const tokenRes = await fetch(`${SERVER_URL}/api/get-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissions: isTeacher
            ? [
                "allow_join",
                "allow_mod",
                "allow_create",
                "allow_publish",
                "allow_subscribe",
              ]
            : ["allow_join"],
        }),
      });
  
      const tokenData = await tokenRes.json();
  
      if (!tokenData.token) throw new Error("No token");
  
      setToken(tokenData.token);
  
      if (isTeacher) {
        const meetingRes = await fetch("https://api.videosdk.live/v1/meetings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: tokenData.token,
          },
          body: JSON.stringify({ userMeetingId: meetingIdSlug, lobby: false }),
        });
  
        const meetingData = await meetingRes.json();
  
        if (!meetingData.meetingId) {
          setError("Failed to create meeting");
          setLoading(false);
          return;
        }
  
        await fetch(`${SERVER_URL}/api/savemeeting/new`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            className,
            meetingId: meetingData.meetingId,
            teacherEmail: userEmail,
          }),
        });
  
        setActualMeetingId(meetingData.meetingId);
        setStep("meeting");
      } else {
        const meetingRes = await fetch(`${SERVER_URL}/api/savemeeting/by-classname/${className}`);
        const meetingData = await meetingRes.json();
        const meetingId = meetingData?.meeting?.meetingId;
  
        if (!meetingId) {
          setError("No meeting found for this class.");
          setLoading(false);
          return;
        }
  
        setActualMeetingId(meetingId);
        setStep("waiting-room");
      }
    } catch (err) {
      console.error("❌ Error submitting email:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false); 
    }
  };
  

  if (step === "email") {
 
    return (
      <div className="h-screen w-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl mb-4">Enter Your Email</h1>
        <input
          className="px-4 py-2 text-black rounded"
          type="email"
          value={userEmail}
          placeholder="your@email.com"
          onChange={(e) => setUserEmail(e.target.value)}
        />
<button
  className="mt-4 bg-blue-600 px-6 py-2 rounded disabled:opacity-50"
  onClick={handleEmailSubmit}
  disabled={loading}
>
  {loading ? "Loading..." : "Continue"}
</button>
        {error && <p className="mt-2 text-red-400">{error}</p>}
      </div>
    );
  }

  if (step === "waiting-room" && actualMeetingId && token) {
   
    return (
      <WaitingRoomScreen
        meetingId={actualMeetingId}
        token={token}
        userName={userEmail.split("@")[0]}
        role={userRole}
        onJoined={() => setStep("meeting")}
      />
    );
  }

  if (step === "meeting" && actualMeetingId && token) {
   
    const StaticMeetingJoiner = require("../StaticMeetingJoiner").default;
    return (
      <StaticMeetingJoiner
        meetingId={actualMeetingId}
        token={token}
        userName={userEmail.split("@")[0]}
        role={userRole}
      />
    );
  }

  
  return null;
}
