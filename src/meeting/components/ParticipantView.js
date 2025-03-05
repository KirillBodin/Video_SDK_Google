import React, { useMemo } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { MemoizedParticipantGrid } from "../../components/ParticipantGrid";

function ParticipantsViewer({ isPresenting, highlightedParticipantId }) {
  const {
    participants,
    pinnedParticipants,
    activeSpeakerId,
    localParticipant,
    localScreenShareOn,
    presenterId,
  } = useMeeting();

  const participantIds = useMemo(() => {
    const pinnedParticipantId = [...pinnedParticipants.keys()].filter(
        (participantId) => participantId !== localParticipant.id
    );
    const regularParticipantIds = [...participants.keys()].filter(
        (participantId) =>
            ![...pinnedParticipants.keys()].includes(participantId) &&
            localParticipant.id !== participantId
    );

    const ids = [
      localParticipant.id,
      ...pinnedParticipantId,
      ...regularParticipantIds,
    ].slice(0, isPresenting ? 6 : 16);

    if (activeSpeakerId && !ids.includes(activeSpeakerId)) {
      ids[ids.length - 1] = activeSpeakerId;
    }
    return ids;
  }, [
    participants,
    activeSpeakerId,
    pinnedParticipants,
    presenterId,
    localScreenShareOn,
  ]);

  return (
      <MemoizedParticipantGrid
          participantIds={participantIds}
          isPresenting={isPresenting}
          highlightedParticipantId={highlightedParticipantId}
      />

  );
}

const MemorizedParticipantView = React.memo(
    ParticipantsViewer,
    (prevProps, nextProps) =>
        prevProps.isPresenting === nextProps.isPresenting &&
        prevProps.highlightedParticipantId === nextProps.highlightedParticipantId
);

export default MemorizedParticipantView;
