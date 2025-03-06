// WaitingRoomScreen.js
import React, { useEffect, useState } from "react";
import { validateMeeting, getToken } from "../../api"; // Replace with the correct path to these functions

export default function WaitingRoomScreen({
                                              meetingId,
                                              onMeetingAvailable,
                                          }) {
    // onMeetingAvailable — callback that will be triggered when the meeting becomes available
    // (we will pass meetingId, token, etc. to it)

    const [waiting, setWaiting] = useState(true);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                // Check if the meeting exists
                const token = await getToken();
                const { meetingId: validId, err } = await validateMeeting({
                    roomId: meetingId,
                    token,
                });

                // If validId matches our meetingId, the meeting is created
                if (validId === meetingId) {
                    clearInterval(intervalId);
                    setWaiting(false);
                    onMeetingAvailable({ meetingId, token });
                }
            } catch (err) {
                // If an error occurs, keep waiting, meaning the teacher has not created the meeting yet
                console.log("Meeting not available yet:", err);
            }
        }, 5000); // Check every 5 seconds if the meeting has been created

        return () => clearInterval(intervalId);
    }, [meetingId]);

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-800 text-white">
            <h1 className="text-3xl mb-4">Waiting Room</h1>
            {waiting ? (
                <p className="mb-2">
                    The teacher has not started the lesson or created the meeting yet. Please wait...
                </p>
            ) : (
                <p>Meeting found. Joining now…</p>
            )}
        </div>
    );
}
