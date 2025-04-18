import React, { useState, useEffect, useRef, createRef, memo } from "react";
import { Constants, useMeeting, useParticipant, usePubSub } from "@videosdk.live/react-sdk";
import { BottomBar } from "./components/BottomBar";
import { SidebarConatiner } from "../components/sidebar/SidebarContainer";
import MemorizedParticipantView from "./components/ParticipantView";
import { PresenterView } from "../components/PresenterView";
import { nameTructed, trimSnackBarText } from "../utils/helper";
import WaitingToJoinScreen from "../components/screens/WaitingToJoinScreen";
import ConfirmBox from "../components/ConfirmBox";
import useIsMobile from "../hooks/useIsMobile";
import useIsTab from "../hooks/useIsTab";
import { useMediaQuery } from "react-responsive";
import { toast } from "react-toastify";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import { useNavigate } from "react-router-dom";

const ParticipantMicStream = memo(({ participantId }) => {
  const { micStream } = useParticipant(participantId);

  useEffect(() => {
    let audioElement;

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioInputs = devices.filter((device) => device.kind === "audioinput");

      if (audioInputs.length === 0) {
        console.warn("⚠️ No audio input devices found.");
      }
    });

    if (micStream?.track) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(micStream.track);

      audioElement = new Audio();
      audioElement.srcObject = mediaStream;
      audioElement.autoplay = true;
      audioElement.oncanplaythrough = () => {
        audioElement.play().catch((err) => {
          console.warn("❌ Unable to play audio stream:", err);
        });
      };
    } else {
      console.warn("⚠️ No mic track available for participant:", participantId);
    }

    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.srcObject = null;
      }
    };
  }, [micStream, participantId]);

  return null;
});


export function MeetingContainer({ onMeetingLeave, setIsMeetingLeft }) {
  const { setSelectedMic, setSelectedWebcam, setSelectedSpeaker, useRaisedHandParticipants } = useMeetingAppContext();
  const { participantRaisedHand } = useRaisedHandParticipants();
  const navigate = useNavigate();
  const [participantsData, setParticipantsData] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null); 
  const bottomBarHeight = 60;
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [localParticipantAllowedJoin, setLocalParticipantAllowedJoin] = useState(null);
  const [meetingErrorVisible, setMeetingErrorVisible] = useState(false);
  const [meetingError, setMeetingError] = useState(false);
  const mMeetingRef = useRef();
  const containerRef = createRef();
  const containerHeightRef = useRef();
  const containerWidthRef = useRef();
  
  const [participantsArray, setParticipantsArray] = useState([]);
  //const [lastUnmutedParticipantId, setLastUnmutedParticipantId] = useState(null);
  const [globalMuteState, setGlobalMuteState] = useState(false);
  const lastUnmutedParticipantIdRef = useRef(null);
  const [highlightedParticipantId, setHighlightedParticipantId] = useState(null);
  const role = sessionStorage.getItem("participantRole");
  const [pendingJoinRequests, setPendingJoinRequests] = useState([]);

  const { publish: highlightPublish, messages: highlightMessages } = usePubSub("HIGHLIGHT");
  const praiseMessages = [
    "Good job!",
    "Excellent!",
    "Bravo!",
    "You rock!",
    "Well done!",
    "Fantastic!",
    "Amazing!",
    "Superb!",
    "Impressive!",
    "Great work!",
    "Keep it up!",
    "Nice effort!",
    "Outstanding!",
    "Terrific!",
    "You're a star!",
    "Super cool!",
    "Nice one!",
    "You're brilliant!",
    "Wonderful!",
    "So smart!"
  ];

  useEffect(() => {
    document.title = "Tamamat Meeting"; 
  }, []);  

  useEffect(() => {
    containerHeightRef.current = containerHeight;
    containerWidthRef.current = containerWidth;
  }, [containerHeight, containerWidth]);
  useEffect(() => {
    if (highlightMessages.length > 0) {
      const lastMessage = highlightMessages[highlightMessages.length - 1];
      if (lastMessage?.message?.participantId === "none") {
        setHighlightedParticipantId(null);
      } else if (lastMessage?.message?.participantId === "all") {
        setHighlightedParticipantId("all");
      } else if (lastMessage?.message?.participantId) {
        setHighlightedParticipantId(lastMessage.message.participantId);
      }
    }
  }, [highlightMessages]);
  



  

  function onParticipantJoined(participant) {
    participant && participant.setQuality("high");
    
  }

  function onEntryResponded(participantId, name) {
    
    if (mMeetingRef.current?.localParticipant?.id === participantId) {
      if (name === "allowed") {
        setLocalParticipantAllowedJoin(true);
      } else {
        setLocalParticipantAllowedJoin(false);
        setTimeout(() => {
          _handleMeetingLeft();
        }, 3000);
      }
    }
  }

 

  function onMeetingLeft() {
   
    setSelectedMic({ id: null, label: null });
    setSelectedWebcam({ id: null, label: null });
    setSelectedSpeaker({ id: null, label: null });
    onMeetingLeave();
  }

  const _handleOnError = (data) => {
    const { code, message } = data;
    
    const joiningErrCodes = [4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010];
    const isJoiningError = joiningErrCodes.findIndex((c) => c === code) !== -1;
    const isCriticalError = `${code}`.startsWith("500");
   
    new Audio(
        isCriticalError
            ? `https://static.videosdk.live/prebuilt/notification_critical_err.mp3`
            : `https://static.videosdk.live/prebuilt/notification_err.mp3`
    ).play();
    setMeetingErrorVisible(true);
    setMeetingError({
      code,
      message: isJoiningError ? "Unable to join meeting!" : message,
    });
  };


  

  const _handleOnRecordingStateChanged = ({ status }) => {
    
    if (
        status === Constants.recordingEvents.RECORDING_STARTED ||
        status === Constants.recordingEvents.RECORDING_STOPPED
    ) {
      toast(
          `${
              status === Constants.recordingEvents.RECORDING_STARTED
                  ? "Meeting recording is started"
                  : "Meeting recording is stopped."
          }`,
          {
            position: "bottom-left",
            autoClose: 4000,
            hideProgressBar: true,
            closeButton: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
      );
    }
  };


  const mMeeting = useMeeting({
    micEnabled: false,
    onParticipantJoined,
    onEntryResponded: (participantId, decision) => {
      console.log("📥 Entry response:", participantId, decision);
      if (participantId === mMeetingRef.current?.localParticipant?.id) {
        if (decision === "allowed") {
          setLocalParticipantAllowedJoin(true);
        } else {
          setLocalParticipantAllowedJoin(false);
          setTimeout(() => {
            _handleMeetingLeft();
          }, 3000);
        }
      }
    },
    
    onEntryRequested: ({ participantId, name, allow, deny }) => {
      console.log(`${name} requested to join.`);
    
     
      setPendingJoinRequests((prev) => [
        ...prev,
        { id: participantId, name, allow, deny },
      ]);
    },
    
    onMeetingJoined: async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasMic = devices.some((d) => d.kind === "audioinput");
  
        if (!hasMic) {
          console.warn("⚠️ No microphone found. Skipping mic init.");
          if (mMeeting.muteMic) await mMeeting.muteMic();
          return;
        }
  
        const permissions = await navigator.permissions.query({ name: "microphone" });
        if (permissions.state === "denied") {
          console.warn("🚫 Microphone permission denied.");
          if (mMeeting.muteMic) await mMeeting.muteMic();
          return;
        }
        await mMeeting.disableWebcam?.();
      } catch (err) {
        console.error("❌ Error during device check:", err);
        if (mMeeting.muteMic) await mMeeting.muteMic();
      }
    },
    
    onMeetingLeft,
    onError: _handleOnError,
    onRecordingStateChanged: _handleOnRecordingStateChanged,
  });




  const isPresenting = mMeeting.presenterId ? true : false;

 
  const { publish: controlPublish } = usePubSub("CONTROL");
  const { publish: chatPublish } = usePubSub("CHAT");
  const { publish: joinResponsePublish } = usePubSub("CONTROL");
  const { publish: entryPublish } = usePubSub("ENTRY");


  
  
 
  
  

  
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      const key = event.key;
      if (role !== "teacher") return;
      if (!mMeeting) {
        console.warn("❌ Meeting instance is not available!");
        return;
      }
  
      // Получаем массив участников, исключая локального участника (учитель)
      const participantArray = Array.from(mMeeting.participants.values()).filter(
        (p) => p.id !== mMeeting.localParticipant.id
      );
      setParticipantsArray(participantArray);
  

      if (key === "5") {
        const studentParticipants = participantArray.filter((p) => p.role !== "teacher");
      
        studentParticipants.forEach((participant) => {
          controlPublish({
            type: "control",
            command: globalMuteState ? "mute" : "requestUnmute",
            to: participant.id,
          });
          setSelectedParticipant(participant.id);
        });
      

       if (globalMuteState) {
         highlightPublish({ participantId: "none" });
       } else {
         highlightPublish({ participantId: "all" });
       }
      
        setGlobalMuteState(!globalMuteState);
      }
      
  
      
      if (key === "0") {
        
        const availableParticipants = participantArray; 
        // Если нет участников – выходим
        if (availableParticipants.length === 0) {
          console.warn("⚠️ Нет участников для выбора!");
          return;
        }
      
        
        if (availableParticipants.length === 1) {
          const singleParticipant = availableParticipants[0];
          console.log("👉 [KEY=0] Единственный участник:", singleParticipant.id);
      
         
          if (selectedParticipant === singleParticipant.id) {
            console.log("🔇 [KEY=0] Тот же участник => mute/unhighlight:", singleParticipant.id);
            controlPublish({ type: "control", command: "mute", to: singleParticipant.id });
            highlightPublish({ participantId: "none" });
            setSelectedParticipant(null);
            lastUnmutedParticipantIdRef.current = null;
          } else {
            if (selectedParticipant) {
              console.log("🔇 [KEY=0] Muting old participant:", selectedParticipant);
              controlPublish({ type: "control", command: "mute", to: selectedParticipant });
            }
            console.log("🔊 [KEY=0] Requesting unmute:", singleParticipant.id);
            highlightPublish({ participantId: singleParticipant.id });
            controlPublish({ type: "control", command: "requestUnmute", to: singleParticipant.id });
            setSelectedParticipant(singleParticipant.id);
            lastUnmutedParticipantIdRef.current = singleParticipant.id;
          }
      
          return; 
        }
      
        
        let randomIndex = Math.floor(Math.random() * availableParticipants.length);
        let newParticipant = availableParticipants[randomIndex];
      
      
        let tries = 0;
        while (newParticipant.id === selectedParticipant && tries < 20) {
          randomIndex = Math.floor(Math.random() * availableParticipants.length);
          newParticipant = availableParticipants[randomIndex];
          tries++;
        }
      
        console.log("👉 [KEY=0] Выбран новый участник:", newParticipant.id, " | Старый:", selectedParticipant);
      
       
        if (selectedParticipant) {
          console.log("🔇 [KEY=0] Muting old participant:", selectedParticipant);
          controlPublish({ type: "control", command: "mute", to: selectedParticipant });
        }
      
      
        console.log("🔊 [KEY=0] Requesting unmute:", newParticipant.id);
        highlightPublish({ participantId: newParticipant.id });
        controlPublish({ type: "control", command: "requestUnmute", to: newParticipant.id });
      
        
        setSelectedParticipant(newParticipant.id);
        lastUnmutedParticipantIdRef.current = newParticipant.id;
      }
      
     
      if (key >= "1" && key <= "9") {
        const index = parseInt(key, 10) - 1;
        if (index < participantArray.length) {
          const participant = participantArray[index];
          if (selectedParticipant === participant.id) {
            // Если тот же участник уже выбран – выключаем его микрофон и снимаем выделение
            controlPublish({ type: "control", command: "mute", to: participant.id });
            highlightPublish({ participantId: "none" });
            setSelectedParticipant(null);
            lastUnmutedParticipantIdRef.current = null;
          } else {
           
            if (selectedParticipant) {
              controlPublish({ type: "control", command: "mute", to: selectedParticipant });
            }
            highlightPublish({ participantId: participant.id });
            setSelectedParticipant(participant.id);
            lastUnmutedParticipantIdRef.current = participant.id;
            controlPublish({ type: "control", command: "requestUnmute", to: participant.id });
          }
        }
      }
    };
  
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [mMeeting, controlPublish, role, globalMuteState, selectedParticipant]);
  



  useEffect(() => {
    if (mMeeting?.localParticipant) {
     
    }
  }, [mMeeting?.localParticipant?.micOn]);

 
  usePubSub("CONTROL", {
    onMessageReceived: async (data) => {

      if (!data?.message) return;

      const { command, to } = data.message;
      const localParticipantId = mMeeting.localParticipant?.id;

      if (!localParticipantId) {
        console.warn("❌ Local participant ID not available.");
        return;
      }
    
      if (to && localParticipantId !== to) return;
      if (command === "endMeeting") {
        sessionStorage.setItem("meetingWasEnded", "true");
        setTimeout(() => {
          sessionStorage.removeItem("meetingWasEnded");
        }, 15000);
        await mMeeting.leave();
        navigate(window.location.pathname);
        return;
      }
      
      
      if (command === "requestUnmute") {

        try {
          await mMeeting.unmuteMic();
          
        } catch (err) {
          console.error("❌ Failed to enable mic:", err);
        }
      }

      if (command === "mute") {
        
        try {
          await mMeeting.muteMic();
          
        } catch (err) {
          console.error("❌ Failed to disable mic:", err);
        }
      }
    },
  });




  usePubSub("CHAT", {
    onMessageReceived: (data) => {
      const { senderName, message, to } = data.message || {};
      const localParticipantId = mMeeting?.localParticipant?.id;
  
      if (to && localParticipantId !== to) {
        return; 
      }
  
      if (message) {
        toast.success(`${senderName} says: "${message}"`);
      }
    },
  });
  




  const originalEnableMic = mMeeting?.localParticipant?.enableMic;
  const originalDisableMic = mMeeting?.localParticipant?.disableMic;
  const originalToggleMic = mMeeting?.localParticipant?.toggleMic;

  if (originalEnableMic) {
    mMeeting.localParticipant.enableMic = (...args) => {
      
      return originalEnableMic(...args);
    };
  }

  if (originalDisableMic) {
    mMeeting.localParticipant.disableMic = (...args) => {
     
      return originalDisableMic(...args);
    };
  }

  if (originalToggleMic) {
    mMeeting.localParticipant.toggleMic = (...args) => {
    
      return originalToggleMic(...args);
    };
  }


  usePubSub("RAISE_HAND", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;
      const { senderId, senderName } = data;
      const isLocal = senderId === localParticipantId;
      
      new Audio(`https://static.videosdk.live/prebuilt/notification.mp3`).play();
      toast(`${isLocal ? "You" : nameTructed(senderName, 15)} raised hand 🖐🏼`, {
        position: "bottom-left",
        autoClose: 4000,
        hideProgressBar: true,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      participantRaisedHand(senderId);
    },
  });


  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });
  const sideBarContainerWidth = isXLDesktop
      ? 400
      : isLGDesktop
          ? 360
          : isTab
              ? 320
              : isMobile
                  ? 280
                  : 240;

  useEffect(() => {
    if (containerRef.current?.offsetHeight)
      setContainerHeight(containerRef.current.offsetHeight);
    if (containerRef.current?.offsetWidth)
      setContainerWidth(containerRef.current.offsetWidth);
    window.addEventListener("resize", () => {
      if (containerRef.current?.offsetHeight)
        setContainerHeight(containerRef.current.offsetHeight);
      if (containerRef.current?.offsetWidth)
        setContainerWidth(containerRef.current.offsetWidth);
    });
  }, [containerRef]);

  const _handleMeetingLeft = () => {
    setIsMeetingLeft(true);
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      const participantIds = Array.from(mMeeting.participants.keys());
  
      setParticipantsData(participantIds);

    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [mMeeting.participants]);

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  return (
      <div className="fixed inset-0">
        <div ref={containerRef} className="h-full flex flex-col bg-gray-800">
          {typeof localParticipantAllowedJoin === "boolean" ? (
              localParticipantAllowedJoin ? (
                  <>
                    <div className="flex flex-1 flex-row bg-gray-800">
                      <div className="flex flex-1">
                        {isPresenting ? (
                            <PresenterView height={containerHeight - bottomBarHeight} />
                        ) : null}
                        {isPresenting && isMobile ? (
                            participantsData.map((participantId) => (
                                <ParticipantMicStream key={participantId} participantId={participantId} />
                            ))
                        ) : (
                            <MemorizedParticipantView
                                isPresenting={isPresenting}
                                highlightedParticipantId={highlightedParticipantId}
                            />
                        )}
                      </div>
                      <SidebarConatiner
                          height={containerHeight - bottomBarHeight}
                          sideBarContainerWidth={sideBarContainerWidth}
                          participants={mMeeting.participants}
                      />
                    </div>
                    <BottomBar bottomBarHeight={bottomBarHeight} setIsMeetingLeft={setIsMeetingLeft} />
                  </>
              ) : (
                  <></>
              )
          ) : (
            !mMeeting.isMeetingJoined && <WaitingToJoinScreen role={role} />
          )}
          <ConfirmBox
              open={meetingErrorVisible}
              successText="OKAY"
              onSuccess={() => {
                setMeetingErrorVisible(false);
              }}
              title={`Error Code: ${meetingError.code}`}
              subTitle={meetingError.message}
          />
         {role === "teacher" && pendingJoinRequests.length > 0 && (
  <div className="absolute top-5 left-5 bg-white shadow-xl rounded-lg p-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-bold text-gray-800 text-lg">Join Requests ({pendingJoinRequests.length})</h3>
      <div className="flex gap-2">
        <button
          onClick={() => {
            pendingJoinRequests.forEach((req) => req.allow());
            setPendingJoinRequests([]);
          }}
          className="bg-green-500 text-white text-sm px-2 py-1 rounded hover:bg-green-600"
        >
          Allow All
        </button>
        <button
          onClick={() => {
            pendingJoinRequests.forEach((req) => req.deny());
            setPendingJoinRequests([]);
          }}
          className="bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600"
        >
          Deny All
        </button>
      </div>
    </div>
    <div className="space-y-2">
      {pendingJoinRequests.map((req) => (
        <div key={req.id} className="flex justify-between items-center p-2 bg-gray-100 rounded shadow-sm">
          <span className="text-gray-800 font-medium">{req.name}</span>
          <div className="flex gap-1">
            <button
              onClick={() => {
                req.allow();
                setPendingJoinRequests((prev) => prev.filter((r) => r.id !== req.id));
              }}
              className="bg-green-500 text-white px-2 py-0.5 rounded text-sm hover:bg-green-600"
            >
              Allow
            </button>
            <button
              onClick={() => {
                req.deny();
                setPendingJoinRequests((prev) => prev.filter((r) => r.id !== req.id));
              }}
              className="bg-red-500 text-white px-2 py-0.5 rounded text-sm hover:bg-red-600"
            >
              Deny
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}


        </div>
      </div>
  );
}