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


const ParticipantMicStream = memo(({ participantId }) => {
  const { micStream } = useParticipant(participantId);
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioInputs = devices.filter((device) => device.kind === "audioinput");
      
    });

    if (micStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(micStream.track);
      const audioElement = new Audio();
      audioElement.srcObject = mediaStream;
      audioElement.play();
      
    }
  }, [micStream, participantId]);
  return null;
});

export function MeetingContainer({ onMeetingLeave, setIsMeetingLeft }) {
  const { setSelectedMic, setSelectedWebcam, setSelectedSpeaker, useRaisedHandParticipants } = useMeetingAppContext();
  const { participantRaisedHand } = useRaisedHandParticipants();
  const [participantsData, setParticipantsData] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null); // ID выбранного участника
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
  const lastUnmutedParticipantIdRef = useRef(null); // Запоминаем последнего размьюченного ученика
  const [highlightedParticipantId, setHighlightedParticipantId] = useState(null);
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
    containerHeightRef.current = containerHeight;
    containerWidthRef.current = containerWidth;
  }, [containerHeight, containerWidth]);
  useEffect(() => {
    if (highlightMessages.length > 0) {
      const lastMessage = highlightMessages[highlightMessages.length - 1];
      if (lastMessage?.message?.participantId === "none") {
        setHighlightedParticipantId(null); 
        
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
    onParticipantJoined,
    onEntryResponded,
    onMeetingJoined: () => {
     

      setTimeout(() => {
        if (mMeeting.muteMic) {
          mMeeting.muteMic(); 
        }
        if (mMeeting.disableWebcam) {
          mMeeting.disableWebcam(); 
        }
      }, 1000); 
    },
    onMeetingLeft,
    onError: _handleOnError,
    onRecordingStateChanged: _handleOnRecordingStateChanged,
  });


  const isPresenting = mMeeting.presenterId ? true : false;

 
  const { publish: controlPublish } = usePubSub("CONTROL");
  const { publish: chatPublish } = usePubSub("CHAT");



  
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      const key = event.key;
      

      if (!mMeeting) {
        console.warn("❌ Meeting instance is not available!");
        return;
      }

      const participantArray = Array.from(mMeeting.participants.values()).filter(
          (p) => p.id !== mMeeting.localParticipant.id
      );

      setParticipantsArray(participantArray);

      if (key === "5") {
        
        participantArray.forEach((participant) => {
          controlPublish({
            type: "control",
            command: globalMuteState ? "mute" : "requestUnmute",
            to: participant.id,
          });
        });

        if (globalMuteState) {
          mMeeting.muteMic();
        } else {
          mMeeting.unmuteMic();
        }

        setGlobalMuteState(!globalMuteState);
      }

      if (key === "0") {
        const availableParticipants = participantArray.filter((p, index) => index !== 4);
        if (availableParticipants.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableParticipants.length);
          const participant = availableParticipants[randomIndex];

          
          setSelectedParticipant(participant.id);
          lastUnmutedParticipantIdRef.current = participant.id;

          controlPublish({
            type: "control",
            command: "requestUnmute",
            to: participant.id,
          });
        }
      }

      if (key >= "1" && key <= "9") {
        const index = parseInt(key, 10) - 1;
        if (index < participantArray.length) {
          const participant = participantArray[index];

          
          highlightPublish({ participantId: participant.id });

          lastUnmutedParticipantIdRef.current = participant.id;
          controlPublish({
            type: "control",
            command: "requestUnmute",
            to: participant.id,
          });
        }
      }

      if (key === "+") {
        if (lastUnmutedParticipantIdRef.current) {
          const targetParticipantId = lastUnmutedParticipantIdRef.current;
          const message = praiseMessages[Math.floor(Math.random() * praiseMessages.length)];

       

          chatPublish({
            senderId: mMeeting.localParticipant.id,
            senderName: mMeeting.localParticipant.displayName,
            message: message,
            to: targetParticipantId,
          });

          highlightPublish({ participantId: "none" });
          setHighlightedParticipantId(null);
          lastUnmutedParticipantIdRef.current = null;

          setTimeout(() => {
            controlPublish({
              type: "control",
              command: "mute",
              to: targetParticipantId,
            });
            
          }, 1000);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [mMeeting, controlPublish, chatPublish, praiseMessages]);



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

     

      if (command === "requestUnmute") {
        

      
        toast.info("Your microphone has been enabled by the teacher.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });

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
      

      try {
      
        const { senderName, message } = data.message || {};

        if (!message) return;

        const localParticipantId = mMeeting?.localParticipant?.id;
        if (!localParticipantId) {
          console.warn("❌ Local participant ID not available.");
          return;
        }

       
        toast.success(`${senderName} says: "${message}"`); 
      } catch (error) {
        console.error("❌ Failed to parse incoming chat message:", error, data);
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
                      />
                    </div>
                    <BottomBar bottomBarHeight={bottomBarHeight} setIsMeetingLeft={setIsMeetingLeft} />
                  </>
              ) : (
                  <></>
              )
          ) : (
              !mMeeting.isMeetingJoined && <WaitingToJoinScreen />
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
        </div>
      </div>
  );
}
