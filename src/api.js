const API_BASE_URL = "https://api.videosdk.live";
const SERVER_URL = "http://localhost:5000"; // Сервер теперь работает на 6000

// Функция для получения токена с сервера
export const getToken = async () => {
  try {
    console.log("[API] 🔍 Запрашиваем токен...");
    const response = await fetch(`${SERVER_URL}/api/get-token`);
    const data = await response.json();

    if (data.token) {
      console.log("[API] ✅ Получен токен:", data.token);
      return data.token;
    } else {
      console.error("[API] ❌ Ошибка при получении токена:", data.error);
      return null;
    }
  } catch (error) {
    console.error("[API] ❌ Ошибка запроса токена:", error);
    return null;
  }
};

// Создание встречи
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
    console.log("[API] 🔍 Создаём комнату:", roomId);
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.roomId) {
      console.log("[API] ✅ Комната создана:", data.roomId);
      return { meetingId: data.roomId, err: null };
    } else {
      console.error("[API] ❌ Ошибка создания:", data.error);
      return { meetingId: null, err: data.error };
    }
  } catch (error) {
    console.error("[API] ❌ Ошибка создания встречи:", error);
    return { meetingId: null, err: "Server error" };
  }
};

// Проверка существования встречи и создание при необходимости
export const validateMeeting = async ({ roomId }) => {
  const token = await getToken();
  if (!token) return { meetingId: null, err: "Failed to get token" };

  const url = `${API_BASE_URL}/v2/rooms/validate/${roomId}`;
  const options = {
    method: "GET",
    headers: { Authorization: token, "Content-Type": "application/json" },
  };

  try {
    console.log("[API] 🔍 Проверяем существование комнаты:", roomId);
    const response = await fetch(url, options);
    
    if (response.status === 400) {
      console.log("[API] ❌ Комната не найдена, создаём новую...");
      return await createMeeting({ roomId });
    }
    
    const data = await response.json();
    if (data.roomId) {
      console.log("[API] ✅ Комната найдена:", data.roomId);
      return { meetingId: data.roomId, err: null };
    } else {
      console.error("[API] ❌ Ошибка проверки комнаты:", data.error);
      return { meetingId: null, err: data.error };
    }
  } catch (error) {
    console.error("[API] ❌ Ошибка проверки встречи:", error);
    return { meetingId: null, err: "Server error" };
  }
};
