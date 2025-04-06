import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import React, { useEffect, useMemo, useRef } from "react";
import ReactPlayer from "react-player";
import MicOffSmallIcon from "../icons/MicOffSmallIcon";
import ScreenShareIcon from "../icons/ScreenShareIcon";
import SpeakerIcon from "../icons/SpeakerIcon";
import { nameTructed } from "../utils/helper";
import { CornerDisplayName } from "./ParticipantView";

export function PresenterView({ height }) {
  const mMeeting = useMeeting();
  const presenterId = mMeeting?.presenterId;

  const videoPlayer = useRef();
  const audioPlayer = useRef();

  const {
    micOn,
    webcamOn,
    isLocal,
    screenShareStream,
    screenShareAudioStream,
    screenShareOn,
    displayName,
    isActiveSpeaker,
  } = useParticipant(presenterId);

 
  const mediaStream = useMemo(() => {
    if (screenShareOn) {
      const stream = new MediaStream();
      stream.addTrack(screenShareStream.track);
      return stream;
    }
  }, [screenShareStream, screenShareOn]);

  
  useEffect(() => {
    if (!isLocal && audioPlayer.current && screenShareOn && screenShareAudioStream) {
      const stream = new MediaStream();
      stream.addTrack(screenShareAudioStream.track);

      audioPlayer.current.srcObject = stream;
      audioPlayer.current
          .play()
          .catch((err) => {
            console.error("Audio autoplay error: ", err?.message);
          });
    } else {
      audioPlayer.current.srcObject = null;
    }
  }, [screenShareAudioStream, screenShareOn, isLocal]);

  return (
      <div
          className={`bg-gray-750 rounded m-2 relative overflow-hidden w-full h-[${
              height - "xl:p-6 lg:p-[52px] md:p-[26px] p-1"
          }]`}
      >
        
        <audio autoPlay playsInline controls={false} ref={audioPlayer} />

        <div className="video-contain absolute h-full w-full">
          <ReactPlayer
              ref={videoPlayer}
              playsinline
              playIcon={<></>}
              pip={false}
              light={false}
              controls={false}
              muted={true}
              playing={true}
              url={mediaStream}
              height="100%"
              width="100%"
              
              onError={(err) => {
                console.log("presenter video error => ", err);
              }}
          />

          {}
          <div
              className="bottom-2 left-2 bg-gray-750 p-2 absolute rounded-md flex items-center justify-center"
              style={{
                transition: "all 200ms linear",
              }}
          >
            {!micOn ? (
                <MicOffSmallIcon fillcolor="white" />
            ) : micOn && isActiveSpeaker ? (
                <SpeakerIcon />
            ) : null}

            <p className="text-sm text-white ml-2">
              {isLocal
                  ? `You are presenting`
                  : `${nameTructed(displayName, 15)} is presenting`}
            </p>
          </div>

          {
        }

          {isLocal && (
              <CornerDisplayName
                  {...{
                    isLocal,
                    displayName,
                    micOn,
                    webcamOn,
                    isPresenting: true,
                    participantId: presenterId,
                    isActiveSpeaker,
                  }}
              />
          )}
        </div>
      </div>
  );
}
