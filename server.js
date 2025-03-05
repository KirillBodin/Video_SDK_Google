require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

// Разрешаем CORS
app.use(cors());
app.use(express.json());

// Генерация JWT-токена
app.post("/get-token", (req, res) => {
    try {
        const API_KEY = "1e5365dc-0fcc-4299-9602-7e1022ffeacc";
        const SECRET_KEY = "e3eb23ffd330656ccb8ed6c17b68f00f04cb4e57f5ed7b2b1ce14948847fa85a";

        if (!API_KEY || !SECRET_KEY) {
            return res.status(400).json({ error: "API Key или Secret Key отсутствуют" });
        }

        const options = { expiresIn: "10m", algorithm: "HS256" };
        const payload = {
            apikey: API_KEY,
            permissions: ["allow_join", "allow_mod", "ask_join"], // Trigger permission.
        };
        const token = jwt.sign(payload, SECRET_KEY, options);

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Ошибка при генерации токена" });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
