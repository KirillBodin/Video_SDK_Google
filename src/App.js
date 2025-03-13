import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { MeetingContainer } from "./meeting/MeetingContainer";
import { LeaveScreen } from "./components/screens/LeaveScreen";
import { JoiningScreen } from "./components/screens/JoiningScreen";
import { MeetingAppProvider } from "./MeetingAppContextDef";
import SuperAdminDashboard from "./components/screens/SuperAdminDashboard";
import SchoolAdminDashboard from "./components/screens/SchoolAdminDashboard";
import TeacherDashboard from "./components/screens/TeacherDashboard";
import AdminLoginScreen from "./components/screens/AdminLoginScreen";

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
                      customCameraVideoTrack: customVideoStream,
                      customMicrophoneAudioTrack: customAudioStream,
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
                    />
                  </MeetingProvider>
                ) : (
                  <h1 className="text-red-500 text-center">
                    ❌ Token или Meeting ID отсутствуют!
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
                />
              )
            }
          />
          <Route path="/admin/login" element={<AdminLoginScreen />} />
<Route path="/admin/super" element={<SuperAdminDashboard />} />
<Route path="/admin/school/:schoolId" element={<SchoolAdminDashboard />} />
<Route path="/admin/teacher/:teacherId" element={<TeacherDashboard />} />

        </Routes>
      </MeetingAppProvider>
    
  );
}

export default App;
