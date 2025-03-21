import React from "react";
import { useMeetingAppContext } from "../MeetingAppContextDef";
import { ParticipantView } from "./ParticipantView";
import { useMeeting } from "@videosdk.live/react-sdk";

const MemoizedParticipant = React.memo(
    ParticipantView,
    (prevProps, nextProps) => prevProps.participantId === nextProps.participantId
);

function ParticipantGrid({ participantIds, isPresenting, highlightedParticipantId }) {
    const { sideBarMode } = useMeetingAppContext();
    const { localParticipant } = useMeeting(); 
    const isMobile = window.matchMedia("only screen and (max-width: 768px)").matches;


    let sortedParticipantIds = [...participantIds];

    if (sortedParticipantIds.includes(localParticipant.id)) {
        sortedParticipantIds = sortedParticipantIds.filter(id => id !== localParticipant.id); 
        sortedParticipantIds.splice(Math.floor(sortedParticipantIds.length / 2), 0, localParticipant.id); 
    }

    const perRow =
        isMobile || isPresenting
            ? sortedParticipantIds.length < 4
            ? 1
            : sortedParticipantIds.length < 9
                ? 2
                : 3
            : sortedParticipantIds.length < 5
            ? 2
            : sortedParticipantIds.length < 7
                ? 3
                : sortedParticipantIds.length < 9
                    ? 4
                    : sortedParticipantIds.length < 10
                        ? 3
                        : sortedParticipantIds.length < 11
                            ? 4
                            : 4;

    return (
        <div
            className={`flex flex-col md:flex-row flex-grow m-3 items-center justify-center ${
                sortedParticipantIds.length < 2 && !sideBarMode && !isPresenting
                    ? "md:px-16 md:py-2"
                    : sortedParticipantIds.length < 3 && !sideBarMode && !isPresenting
                    ? "md:px-16 md:py-8"
                    : sortedParticipantIds.length < 4 && !sideBarMode && !isPresenting
                        ? "md:px-16 md:py-4"
                        : sortedParticipantIds.length > 4 && !sideBarMode && !isPresenting
                            ? "md:px-14"
                            : "md:px-0"
            }`}
        >
            <div className="flex flex-col w-full h-full">
                {Array.from(
                    { length: Math.ceil(sortedParticipantIds.length / perRow) },
                    (_, i) => {
                        return (
                            <div
                                key={`participant-${i}`}
                                className={`flex flex-1 ${
                                    isPresenting
                                        ? sortedParticipantIds.length === 1
                                        ? "justify-start items-start"
                                        : "items-center justify-center"
                                        : "items-center justify-center"
                                }`}
                            >
                                {sortedParticipantIds
                                    .slice(i * perRow, (i + 1) * perRow)
                                    .map((participantId) => {
                                        return (
                                            <div
                                                key={`participant_${participantId}`}
                                                className={`flex flex-1 relative ${
                                                    isPresenting
                                                        ? sortedParticipantIds.length === 1
                                                        ? "md:h-48 md:w-44 xl:w-52 xl:h-48 "
                                                        : sortedParticipantIds.length === 2
                                                            ? "md:w-44 xl:w-56"
                                                            : "md:w-44 xl:w-48"
                                                        : "w-full"
                                                } items-center justify-center h-full ${
                                                    sortedParticipantIds.length === 1
                                                        ? "md:max-w-7xl 2xl:max-w-[1480px] "
                                                        : "md:max-w-lg 2xl:max-w-2xl"
                                                } overflow-clip overflow-hidden p-1 ${
                                                    highlightedParticipantId && highlightedParticipantId !== "none"
                                                        ? participantId === highlightedParticipantId
                                                        ? "border-4 border-green-500 rounded-lg"
                                                        : ""
                                                        : "" // ❗ Убираем рамку, если participantId = "none"
                                                }`}
                                            >
                                                <MemoizedParticipant participantId={participantId} />
                                            </div>

                                        );
                                    })}
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
}

export const MemoizedParticipantGrid = React.memo(ParticipantGrid, (prevProps, nextProps) => {
    return (
        JSON.stringify(prevProps.participantIds) === JSON.stringify(nextProps.participantIds) &&
        prevProps.isPresenting === nextProps.isPresenting &&
        prevProps.highlightedParticipantId === nextProps.highlightedParticipantId
    );
});
