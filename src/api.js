const API_BASE_URL = "https://api.videosdk.live";
const SERVER_URL = process.env.REACT_APP_SERVER_URL; 


export const getToken = async () => {
  try {
    console.log("[API] 🔍 Запрашиваем токен...");
    const response = await fetch(`${SERVER_URL}/api/get-token`);
    const data = await response.json();

    if (data.token) {
      console.log("[API] ✅ Token received:", data.token);
      return data.token;
    } else {
      console.error("[API] ❌ Error getting token:", data.error);
      return null;
    }
  } catch (error) {
    console.error("[API] ❌ Token request error:", error);
    return null;
  }
};


export const createMeeting = async ({ roomId }) => {
  const token = await getToken();
  if (!token) return { meetingId: null, err: "Failed to get token" };

  const url = `${API_BASE_URL}/v2/rooms`;
  const options = {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({ roomId }),
  };

  try {
    console.log("[API] 🔍 Create a room:", roomId);
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.roomId) {
      console.log("[API] ✅ Room created:", data.roomId);
      return { meetingId: data.roomId, err: null };
    } else {
      console.error("[API] ❌ Creation error:", data.error);
      return { meetingId: null, err: data.error };
    }
  } catch (error) {
    console.error("[API] ❌ Error creating meeting:", error);
    return { meetingId: null, err: "Server error" };
  }
};


export const validateMeeting = async ({ roomId }) => {
  const token = await getToken();
  if (!token) return { meetingId: null, err: "Failed to get token" };

  const url = `${API_BASE_URL}/v2/rooms/validate/${roomId}`;
  const options = {
    method: "GET",
    headers: { Authorization: token, "Content-Type": "application/json" },
  };

  try {
    console.log("[API] 🔍 Checking the existence of the room:", roomId);
    const response = await fetch(url, options);
    
    if (response.status === 400) {
      console.log("[API] ❌ Room not found, creating a new one...");
      return await createMeeting({ roomId });
    }
    
    const data = await response.json();
    if (data.roomId) {
      console.log("[API] ✅ Room found:", data.roomId);
      return { meetingId: data.roomId, err: null };
    } else {
      console.error("[API] ❌ Room verification error:", data.error);
      return { meetingId: null, err: data.error };
    }
  } catch (error) {
    console.error("[API] ❌ Meeting check error:", error);
    return { meetingId: null, err: "Server error" };
  }
};
