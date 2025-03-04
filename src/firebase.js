// firebase.js
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    signInWithRedirect,
    getRedirectResult
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDjU9_fczakApmKUOGuzJIlq1IFtS9LTSc",
    authDomain: "zoom-web-sdk-custom-overlay.firebaseapp.com",
    projectId: "zoom-web-sdk-custom-overlay",
    storageBucket: "zoom-web-sdk-custom-overlay.appspot.com",
    messagingSenderId: "31171779513",
    appId: "1:31171779513:web:8beee80678204710be7468"
};

// Инициализируем Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Функция для определения маршрута после входа
const getRedirectPath = () => {
    const userRole = localStorage.getItem("userRole") || "teacher";
    return userRole === "teacher" ? "/teacher" : "/student";
};

// Вход через Google (Popup для ПК, Redirect для мобильных)
// Если navigate не передан, просто возвращаем пользователя.
export const signInWithGoogle = async (navigate) => {
    console.log("🔹 Начинаем вход через Google...");
    try {
        if (window.innerWidth < 600) {
            console.log("📲 Используем signInWithRedirect на мобильных устройствах");
            await signInWithRedirect(auth, provider);
        } else {
            console.log("🖥 Используем signInWithPopup на десктопе");
            const result = await signInWithPopup(auth, provider);
            console.log("✅ Firebase вернул результат входа:", result);
            if (result.user) {
                console.log("✅ Имя пользователя:", result.user.displayName);
                localStorage.setItem("userName", result.user.displayName);
                if (navigate && typeof navigate === "function") {
                    navigate(getRedirectPath(), { state: { userName: result.user.displayName } });
                }
                return result.user;
            }
        }
    } catch (error) {
        console.error("❌ Ошибка входа через Google:", error);
        if (error.code === "auth/popup-closed-by-user") {
            console.warn("⚠ Окно закрыто. Пробуем signInWithRedirect.");
            await signInWithRedirect(auth, provider);
        }
    }
};

// Проверка редиректного входа (если вход был через редирект)
export const checkRedirectResult = async (navigate) => {
    console.log("🔹 Проверяем редиректный вход...");
    try {
        const result = await getRedirectResult(auth);
        console.log("✅ Firebase вернул результат редиректа:", result);
        if (result && result.user) {
            console.log("✅ Имя пользователя после редиректа:", result.user.displayName);
            localStorage.setItem("userName", result.user.displayName);
            if (navigate && typeof navigate === "function") {
                navigate(getRedirectPath(), { state: { userName: result.user.displayName } });
            }
        } else {
            console.warn("⚠ Результат редиректа пустой.");
        }
    } catch (error) {
        console.error("❌ Ошибка обработки редиректа:", error);
    }
};

// Выход из аккаунта
export const logOut = async (navigate) => {
    await signOut(auth);
    console.log("✅ Вышли из аккаунта Google");
    localStorage.removeItem("userName");
    if (navigate && typeof navigate === "function") {
        navigate("/login");
    }
};

export { auth, provider };
