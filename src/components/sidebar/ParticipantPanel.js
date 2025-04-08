import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import React, { useMemo, useEffect } from "react";
import MicOffIcon from "../../icons/ParticipantTabPanel/MicOffIcon";
import MicOnIcon from "../../icons/ParticipantTabPanel/MicOnIcon";
import RaiseHand from "../../icons/ParticipantTabPanel/RaiseHand";
import VideoCamOffIcon from "../../icons/ParticipantTabPanel/VideoCamOffIcon";
import VideoCamOnIcon from "../../icons/ParticipantTabPanel/VideoCamOnIcon";
import { useMeetingAppContext } from "../../MeetingAppContextDef";
import { nameTructed } from "../../utils/helper";


function ParticipantListItem({ participantId, raisedHand, index }) {
  const { micOn, webcamOn, displayName, isLocal } = useParticipant(participantId);


  const showNumber = index !== undefined;

  return (
    <div className="mt-2 m-2 p-2 bg-gray-700 rounded-lg mb-0">
      <div className="flex flex-1 items-center justify-center relative">
        {showNumber && (
          <span className="text-white mr-2 w-5 text-right">{index + 1}.</span>
        )}
        <div
          style={{ color: "#212032", backgroundColor: "#757575" }}
          className="h-10 w-10 text-lg mt-0 rounded overflow-hidden flex items-center justify-center"
        >
          {displayName?.charAt(0).toUpperCase()}
        </div>
        <div className="ml-2 mr-1 flex flex-1">
          <p className="text-base text-white overflow-hidden whitespace-pre-wrap overflow-ellipsis">
            {isLocal ? "You" : nameTructed(displayName, 15)}
          </p>
        </div>
        {raisedHand && (
          <div className="flex items-center justify-center m-1 p-1">
            <RaiseHand fillcolor={"#fff"} />
          </div>
        )}
        <div className="m-1 p-1">
          {micOn ? <MicOnIcon /> : <MicOffIcon />}
        </div>
        <div className="m-1 p-1">
          {webcamOn ? <VideoCamOnIcon /> : <VideoCamOffIcon />}
        </div>
      </div>
    </div>
  );
}

export function ParticipantPanel({ panelHeight }) {
  const { raisedHandsParticipants } = useMeetingAppContext();
  const mMeeting = useMeeting();
  const currentRole = sessionStorage.getItem("participantRole");

  const allParticipants = mMeeting.participants;
  const localParticipantId = mMeeting.localParticipant?.id;

  
  const allParticipantIds = useMemo(() => {
    return Array.from(allParticipants.keys());
  }, [allParticipants]);


  const sortedIdsForDisplay = useMemo(() => {
   
    const others = allParticipantIds.filter((id) => id !== localParticipantId);

    if (currentRole === "teacher") {

      const raisedIds = raisedHandsParticipants
        .sort((a, b) => {
          if (a.raisedHandOn > b.raisedHandOn) return -1;
          if (a.raisedHandOn < b.raisedHandOn) return 1;
          return 0;
        })
        .map((item) => item.participantId);

    
      const notRaised = others.filter(
        (id) => !raisedIds.includes(id)
      );

  
      return [
        localParticipantId,
        ...raisedIds,
        ...notRaised,
      ];
    } else {
     
      return allParticipantIds;
    }
  }, [allParticipantIds, localParticipantId, raisedHandsParticipants, currentRole]);


  const combinedList = useMemo(() => {
    return sortedIdsForDisplay.map((pid) => {
      const raised = raisedHandsParticipants.findIndex(
        (r) => r.participantId === pid
      ) !== -1;
      return { participantId: pid, raisedHand: raised };
    });
  }, [sortedIdsForDisplay, raisedHandsParticipants]);

  useEffect(() => {
    console.log("=== Список участников для отображения ===", combinedList);
  }, [combinedList]);

  return (
    <div
      className="flex w-full flex-col bg-gray-750 overflow-y-auto"
      style={{ height: panelHeight }}
    >
      <div
        className="flex flex-col flex-1"
        style={{ height: panelHeight - 100 }}
      >
{combinedList.map((item, index) => {
  let showIndex = undefined;

  if (currentRole === "teacher") {
    if (item.participantId === localParticipantId) {
     
      showIndex = undefined;
    } else {

      showIndex = index - 1;
    }
  }

  return (
    <ParticipantListItem
      key={item.participantId}
      participantId={item.participantId}
      raisedHand={item.raisedHand}
     
      index={showIndex >= 0 ? showIndex : undefined}
    />
  );
})}

      </div>
    </div>
  );
}
