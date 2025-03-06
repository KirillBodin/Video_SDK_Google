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

// Компонент для воспроизведения аудио потока участника (микрофон)
const ParticipantMicStream = memo(({ participantId }) => {
  const { micStream } = useParticipant(participantId);
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioInputs = devices.filter((device) => device.kind === "audioinput");
      console.log("Available audio input devices:", audioInputs);
    });

    if (micStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(micStream.track);
      const audioElement = new Audio();
      audioElement.srcObject = mediaStream;
      audioElement.play();
      console.log(`Playing audio stream for participant ${participantId}`);
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
        setHighlightedParticipantId(null); // Сбрасываем рамку
        console.log("✅ Highlight reset (no participant highlighted)");
      } else if (lastMessage?.message?.participantId) {
        setHighlightedParticipantId(lastMessage.message.participantId);
        console.log(`🔦 Highlighted participant: ${lastMessage.message.participantId}`);
      }
    }
  }, [highlightMessages]);

  // Функции обратного вызова для meeting
  function onParticipantJoined(participant) {
    participant && participant.setQuality("high");
    console.log(`Participant joined: ${participant.displayName}`);
  }

  function onEntryResponded(participantId, name) {
    console.log(`onEntryResponded: ${participantId} - ${name}`);
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

  function onMeetingJoined() {
    console.log("onMeetingJoined");
  }

  function onMeetingLeft() {
    console.log("onMeetingLeft");
    setSelectedMic({ id: null, label: null });
    setSelectedWebcam({ id: null, label: null });
    setSelectedSpeaker({ id: null, label: null });
    onMeetingLeave();
  }

  const _handleOnError = (data) => {
    const { code, message } = data;
    console.log("meetingErr", code, message);
    const joiningErrCodes = [4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010];
    const isJoiningError = joiningErrCodes.findIndex((c) => c === code) !== -1;
    const isCriticalError = `${code}`.startsWith("500");
    console.log(`Error received: code ${code}, isCriticalError: ${isCriticalError}`);
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
    console.log("Recording state changed:", status);
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

  // Инициализируем mMeeting сразу
// Инициализируем mMeeting сразу
  const mMeeting = useMeeting({
    onParticipantJoined,
    onEntryResponded,
    onMeetingJoined: () => {
      console.log("🔇 Muting mic and disabling webcam by default...");

      setTimeout(() => {
        if (mMeeting.muteMic) {
          mMeeting.muteMic(); // Выключаем микрофон программно при входе
        }
        if (mMeeting.disableWebcam) {
          mMeeting.disableWebcam(); // Выключаем веб-камеру программно при входе
        }
      }, 1000); // Добавляем небольшую задержку, чтобы избежать конфликтов
    },
    onMeetingLeft,
    onError: _handleOnError,
    onRecordingStateChanged: _handleOnRecordingStateChanged,
  });


  const isPresenting = mMeeting.presenterId ? true : false;

  // Используем хуки usePubSub для каналов "CONTROL" и "CHAT"
  const { publish: controlPublish } = usePubSub("CONTROL");
  const { publish: chatPublish } = usePubSub("CHAT");



  // Обработка клавиш для учителя с расширенными логами
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      const key = event.key;
      console.log(`🎹 [GLOBAL SHORTCUT] Pressed key: ${key}`);

      if (!mMeeting) {
        console.warn("❌ Meeting instance is not available!");
        return;
      }

      const participantArray = Array.from(mMeeting.participants.values()).filter(
          (p) => p.id !== mMeeting.localParticipant.id
      );

      setParticipantsArray(participantArray);

      if (key === "5") {
        console.log(`🎤 Toggling mic for all. Current state: ${globalMuteState ? "Muted" : "Unmuted"}`);
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

          console.log(`🎲 Randomly selected: ${participant.displayName} (ID: ${participant.id})`);
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

          console.log(`✅ Highlighting ${participant.displayName} (ID: ${participant.id})`);
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

          console.log(`🌟 Sending praise to participant (ID: ${targetParticipantId}): ${message}`);

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
            console.log(`🔇 Sending mute command to participant (ID: ${targetParticipantId})`);
          }, 1000);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [mMeeting, controlPublish, chatPublish, praiseMessages]);



  // Подписка на канал CONTROL на стороне ученика
  useEffect(() => {
    if (mMeeting?.localParticipant) {
      console.log(
          `🎤 Mic state changed manually: ${mMeeting.localParticipant.micOn ? "ON ✅" : "OFF ❌"}`
      );
    }
  }, [mMeeting?.localParticipant?.micOn]);

  console.log("🔄 usePubSub CONTROL initialized!");
  usePubSub("CONTROL", {
    onMessageReceived: async (data) => {
      console.log("📡 CONTROL message received:", data);

      if (!data?.message) return;

      const { command, to } = data.message;
      const localParticipantId = mMeeting.localParticipant?.id;

      if (!localParticipantId) {
        console.warn("❌ Local participant ID not available.");
        return;
      }

      // Проверяем, адресовано ли сообщение этому участнику
      if (to && localParticipantId !== to) return;

      console.log(`🎤 Command for me: ${command}`);

      if (command === "requestUnmute") {
        console.log("🎤 Received request to enable mic");

        // 🔔 Показываем сообщение ученику о включении микрофона
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
          console.log("🎤 Mic enabled successfully.");
        } catch (err) {
          console.error("❌ Failed to enable mic:", err);
        }
      }

      if (command === "mute") {
        console.log("🔇 Received mute command. Disabling mic...");
        try {
          await mMeeting.muteMic();
          console.log("🔇 Mic disabled successfully.");
        } catch (err) {
          console.error("❌ Failed to disable mic:", err);
        }
      }
    },
  });




  usePubSub("CHAT", {
    onMessageReceived: (data) => {
      console.log("📡 CHAT message received:", data);

      try {
        // ✅ Правильное извлечение данных из вложенного объекта
        const { senderName, message } = data.message || {};

        if (!message) return;

        const localParticipantId = mMeeting?.localParticipant?.id;
        if (!localParticipantId) {
          console.warn("❌ Local participant ID not available.");
          return;
        }

        console.log(`🎉 You received a praise message: "${message}" from ${senderName}`);
        toast.success(`${senderName} says: "${message}"`); // ✅ Показываем только текст
      } catch (error) {
        console.error("❌ Failed to parse incoming chat message:", error, data);
      }
    },
  });








// Отслеживаем ручное включение/выключение микрофона
  const originalEnableMic = mMeeting?.localParticipant?.enableMic;
  const originalDisableMic = mMeeting?.localParticipant?.disableMic;
  const originalToggleMic = mMeeting?.localParticipant?.toggleMic;

  if (originalEnableMic) {
    mMeeting.localParticipant.enableMic = (...args) => {
      console.log("🔊 enableMic() manually triggered!");
      return originalEnableMic(...args);
    };
  }

  if (originalDisableMic) {
    mMeeting.localParticipant.disableMic = (...args) => {
      console.log("🔇 disableMic() manually triggered!");
      return originalDisableMic(...args);
    };
  }

  if (originalToggleMic) {
    mMeeting.localParticipant.toggleMic = (...args) => {
      console.log("🔄 toggleMic() manually triggered!");
      return originalToggleMic(...args);
    };
  }





  // Подписка на канал RAISE_HAND
  usePubSub("RAISE_HAND", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;
      const { senderId, senderName } = data;
      const isLocal = senderId === localParticipantId;
      console.log("RAISE_HAND message received:", data);
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
      console.log("Debounced participantIds:", participantIds);
      setParticipantsData(participantIds);
      console.log("Setting participants");
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
