import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { MeetingContainer } from "./meeting/MeetingContainer";
import { LeaveScreen } from "./components/screens/LeaveScreen";
import { JoiningScreen } from "./components/screens/JoiningScreen";
import { MeetingAppProvider } from "./MeetingAppContextDef";
import SuperAdminDashboard from "./components/screens/SuperAdminDashboard";
import AdminDashboardScreen from "./components/screens/AdminDashboardScreen";
import TeacherDashboard from "./components/screens/TeacherDashboard";
import AdminLoginScreen from "./components/screens/AdminLoginScreen";
import JoinMeetingWrapper from "./components/screens/JoinMeetingWrapper";
import ProtectedRoute from "./components/ProtectedRoute";
import StaticMeetingJoinerWrapper from "./components/StaticMeetingJoinerWrapper";
import UnauthorizedScreen from "./components/screens/UnauthorizedScreen"; 


function App() {
  const [token, setToken] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [webcamOn, setWebcamOn] = useState(false);
  const [customAudioStream, setCustomAudioStream] = useState(null);
  const [customVideoStream, setCustomVideoStream] = useState(null);
  const [isMeetingStarted, setMeetingStarted] = useState(false);
  const [isMeetingLeft, setIsMeetingLeft] = useState(false);
  const [role, setRole] = useState("");

  const handleStartMeeting = (currentToken, currentMeetingId) => {
    if (!currentToken || !currentMeetingId) {
      return;
    }
    setToken(currentToken);
    setMeetingId(currentMeetingId);
  };

  useEffect(() => {
    if (token && meetingId && !isMeetingStarted) {
      setMeetingStarted(true);
    }
  }, [token, meetingId, isMeetingStarted]);

  return (
      <MeetingAppProvider>
        <Routes>
          <Route
            path="/"
            element={
              isMeetingStarted ? (
                token && meetingId ? (
                  <MeetingProvider
                    config={{
                      meetingId,
                      micEnabled: micOn,
                      webcamEnabled: webcamOn,
                      name: participantName || "TestUser",
                      multiStream: true,
                    }}
                    token={token}
                    reinitialiseMeetingOnConfigChange={true}
                    joinWithoutUserInteraction={true}
                  >
                    <MeetingContainer
                      onMeetingLeave={() => {
                        setMeetingId("");
                        setParticipantName("");
                        setWebcamOn(false);
                        setMicOn(false);
                        setMeetingStarted(false);
                      }}
                      setIsMeetingLeft={setIsMeetingLeft}
                      role={role}
                    />
                  </MeetingProvider>
                ) : (
                  <h1 className="text-red-500 text-center">
                    ❌ Token or Meeting ID is missing!
                  </h1>
                )
              ) : isMeetingLeft ? (
                <LeaveScreen setIsMeetingLeft={setIsMeetingLeft} />
              ) : (
                <JoiningScreen
                  participantName={participantName}
                  setParticipantName={setParticipantName}
                  setMeetingId={setMeetingId}
                  setToken={setToken}
                  micOn={micOn}
                  setMicOn={setMicOn}
                  webcamOn={webcamOn}
                  setWebcamOn={setWebcamOn}
                  customAudioStream={customAudioStream}
                  setCustomAudioStream={setCustomAudioStream}
                  customVideoStream={customVideoStream}
                  setCustomVideoStream={setCustomVideoStream}
                  onClickStartMeeting={handleStartMeeting}
                  startMeeting={isMeetingStarted}
                  setIsMeetingLeft={setIsMeetingLeft}
                  role={role}
                />
              )
            }
          />
          <Route path="/admin/login" element={<AdminLoginScreen />} />
          
          <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
  <Route path="/superadmin/:superAdminId/:name" element={<SuperAdminDashboard />} />
</Route>

<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
  <Route path="/admin/:adminId/:name" element={<AdminDashboardScreen />} />
</Route>

<Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
  <Route path="/teacher/:teacherId/:name" element={<TeacherDashboard />} />
</Route>

<Route
  path="/:slug/:teacherName/:className"
  element={
    isMeetingStarted ? (
      token && meetingId ? (
        <MeetingProvider
          config={{
            meetingId,
            micEnabled: micOn,
            webcamEnabled: webcamOn,
            name: participantName || "TestUser",
            multiStream: true,
          }}
          token={token}
          reinitialiseMeetingOnConfigChange={true}
          joinWithoutUserInteraction={true}
        >
          <MeetingContainer
            onMeetingLeave={() => {
              setMeetingId("");
              setParticipantName("");
              setWebcamOn(false);
              setMicOn(false);
              setMeetingStarted(false);
            }}
            setIsMeetingLeft={setIsMeetingLeft}
            role={role}
          />
        </MeetingProvider>
      ) : (
        <h1 className="text-red-500 text-center">
          ❌ Token or Meeting ID is missing!
        </h1>
      )
    ) : isMeetingLeft ? (
      <LeaveScreen setIsMeetingLeft={setIsMeetingLeft} />
    ) : (
      <JoiningScreen
        participantName={participantName}
        setParticipantName={setParticipantName}
        setMeetingId={setMeetingId}
        setToken={setToken}
        micOn={micOn}
        setMicOn={setMicOn}
        webcamOn={webcamOn}
        setWebcamOn={setWebcamOn}
        customAudioStream={customAudioStream}
        setCustomAudioStream={setCustomAudioStream}
        customVideoStream={customVideoStream}
        setCustomVideoStream={setCustomVideoStream}
        onClickStartMeeting={handleStartMeeting}
        startMeeting={isMeetingStarted}
        setIsMeetingLeft={setIsMeetingLeft}
        role={role}
      />
    )
  }
/>



<Route path="/unauthorized" element={<UnauthorizedScreen />} />


        </Routes>
      </MeetingAppProvider>
    
  );
}

export default App;
