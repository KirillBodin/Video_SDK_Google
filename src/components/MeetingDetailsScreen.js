import React, { useState } from "react";
import { toast } from "react-toastify";
import { signInWithGoogle } from "../firebase";
import WaitingRoomScreen from "./screens/WaitingRoomScreen"; // Экран ожидания

const ALLOWED_EMAILS = ["tamamatinfo@gmail.com", "meet.tamamat@gmail.com"];

export function MeetingDetailsScreen({
                                         onClickJoin,
                                         _handleOnCreateMeeting,
                                         participantName,
                                         setParticipantName,
                                         onClickStartMeeting,
                                     }) {
    const [meetingId, setMeetingId] = useState("");
    const [isJoinMeetingClicked, setIsJoinMeetingClicked] = useState(false);
    const [isWaitingRoom, setIsWaitingRoom] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    return isWaitingRoom ? (
        <WaitingRoomScreen meetingId={meetingId} />
    ) : (
        <div className="flex flex-1 flex-col justify-center w-full md:p-[6px] sm:p-1 p-1.5">
            {/* Поле ввода email (всегда отображается) */}
            <input
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value.trim())}
                placeholder="Enter your email"
                className="px-4 py-3 bg-gray-650 rounded-xl text-white w-full text-center mb-4"
            />

            {/* Кнопка входа через Google, если email пустой */}
            {!userEmail && (
                <button
                    className="w-full bg-red-500 text-white px-2 py-3 rounded-xl"
                    onClick={async () => {
                        try {
                            const user = await signInWithGoogle();
                            if (user && user.email) {
                                setUserEmail(user.email.trim());
                                setParticipantName(user.email);
                                toast.success(`Signed in as ${user.email}`, {
                                    position: "bottom-left",
                                    autoClose: 3000,
                                    hideProgressBar: true,
                                });
                            }
                        } catch (error) {
                            console.error("Ошибка входа через Google:", error);
                            toast.error("Google Sign-In Error", {
                                position: "bottom-left",
                                autoClose: 4000,
                                hideProgressBar: true,
                            });
                        }
                    }}
                >
                    Login with Google
                </button>
            )}

            {/* Ввод Meeting ID (отображается после нажатия "Join a meeting") */}
            {isJoinMeetingClicked && (
                <>
                    <input
                        value={meetingId}
                        onChange={(e) => setMeetingId(e.target.value)}
                        placeholder="Enter meeting ID"
                        className="px-4 py-3 mt-3 bg-gray-650 rounded-xl text-white w-full text-center"
                    />
                </>
            )}

            {/* Кнопки "Создать" и "Присоединиться" */}
            <div className="w-full md:mt-4 mt-4 flex flex-col">
                <div className="flex items-center justify-center flex-col w-full">
                    {/* Кнопка "Create a meeting" исчезает, если нажата "Join a meeting" */}
                    {!isJoinMeetingClicked && (
                        <button
                            className="w-full bg-purple-350 text-white px-2 py-3 rounded-xl"
                            onClick={async () => {
                                if (!ALLOWED_EMAILS.includes(userEmail)) {
                                    toast.error(`Access denied: ${userEmail} is not authorized to create meetings.`, {
                                        position: "bottom-left",
                                        autoClose: 4000,
                                        hideProgressBar: true,
                                    });
                                    return;
                                }

                                toast.info("Creating meeting, please wait...", {
                                    position: "bottom-left",
                                    autoClose: 3000,
                                    hideProgressBar: true,
                                });

                                try {
                                    const { meetingId, err } = await _handleOnCreateMeeting();
                                    if (meetingId) {
                                        setMeetingId(meetingId);
                                        toast.success(`Meeting created: ${meetingId}`, {
                                            position: "bottom-left",
                                            autoClose: 4000,
                                            hideProgressBar: true,
                                        });

                                        // Автоматический переход в встречу
                                        setTimeout(() => {
                                            onClickStartMeeting();
                                        }, 2000);
                                    } else {
                                        toast.error(`Failed to create meeting: ${err}`, {
                                            position: "bottom-left",
                                            autoClose: 4000,
                                            hideProgressBar: true,
                                        });
                                    }
                                } catch (error) {
                                    toast.error("Unexpected error while creating meeting.", {
                                        position: "bottom-left",
                                        autoClose: 4000,
                                        hideProgressBar: true,
                                    });
                                }
                            }}
                        >
                            Create a meeting
                        </button>
                    )}

                    {/* Кнопка "Join a meeting" теперь открывает поле для ввода ID */}
                    {!isJoinMeetingClicked ? (
                        <button
                            className="w-full bg-gray-650 text-white px-2 py-3 rounded-xl mt-5"
                            onClick={() => setIsJoinMeetingClicked(true)}
                        >
                            Join a meeting
                        </button>
                    ) : (
                        <button
                            className="w-full bg-green-500 text-white px-2 py-3 rounded-xl mt-3"
                            onClick={() => {
                                if (!meetingId.match("\\w{4}\\-\\w{4}\\-\\w{4}")) {
                                    toast.info("No meeting found, redirecting to waiting room...", {
                                        position: "bottom-left",
                                        autoClose: 3000,
                                        hideProgressBar: true,
                                    });

                                    setTimeout(() => {
                                        setIsWaitingRoom(true);
                                    }, 2000);
                                } else {
                                    toast.success("Joining meeting...", {
                                        position: "bottom-left",
                                        autoClose: 2000,
                                        hideProgressBar: true,
                                    });

                                    setTimeout(() => {
                                        onClickJoin(meetingId);
                                    }, 2000);
                                }
                            }}
                        >
                            Confirm & Join
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
