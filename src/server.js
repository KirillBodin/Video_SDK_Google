require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg"); // Подключаем PostgreSQL
const { initDB } = require("./models");
const authRoutes = require("./routes/authRoutes");
const schoolAdminRoutes = require("./routes/schoolAdminRoutes");


const app = express();
app.use(express.json());
app.use(cors());

// 📌 Подключение к базе данных PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "videosdk_db",
  password: process.env.DB_PASSWORD || "mynewpassword",
  port: process.env.DB_PORT || 5432,
});

// ✅ Подключаем роуты
app.use("/api/auth", authRoutes);
app.use("/api/school-admins", schoolAdminRoutes);







// ✅ Эндпоинт для генерации токена VideoSDK
app.get("/api/get-token", (req, res) => {
  try {
    const API_KEY = process.env.VIDEOSDK_API_KEY || "1e5365dc-0fcc-4299-9602-7e1022ffeacc";
    const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY || "e3eb23ffd330656ccb8ed6c17b68f00f04cb4e57f5ed7b2b1ce14948847fa85a";

    if (!API_KEY || !SECRET_KEY) {
      return res.status(500).json({ error: "Missing VideoSDK API keys" });
    }

    const token = jwt.sign(
      { apikey: API_KEY, permissions: ["allow_join"] },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("[server] ❌ Ошибка генерации токена:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// ✅ Эндпоинт для поиска встречи по имени класса
app.get("/api/get-meeting/:className", async (req, res) => {
  try {
    const { className } = req.params;

    const query = `
      SELECT "meetingId" FROM "ClassMeetings" WHERE "className" = $1 LIMIT 1;
    `;
    const result = await pool.query(query, [className]);

    if (result.rows.length > 0) {
      res.json({ meetingId: result.rows[0].meetingId });
    } else {
      res.status(404).json({ error: "Meeting not found" });
    }
  } catch (error) {
    console.error("[server] ❌ Ошибка при поиске встречи:", error);
    res.status(500).json({ error: "Database error" });
  }
});
// ✅ Удаление встречи по `meetingId`
app.delete("/api/delete-meeting/:meetingId", async (req, res) => {
  try {
    const { meetingId } = req.params;

    const query = `DELETE FROM "ClassMeetings" WHERE "meetingId" = $1 RETURNING *;`;
    const result = await pool.query(query, [meetingId]);

    if (result.rowCount > 0) {
      res.json({ message: "Meeting deleted successfully" });
    } else {
      res.status(404).json({ error: "Meeting not found" });
    }
  } catch (error) {
    console.error("[server] ❌ Ошибка при удалении встречи:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Эндпоинт для сохранения встречи в базу
app.post("/api/save-meeting", async (req, res) => {
  try {
    const { className, meetingId, teacherId } = req.body;

    if (!className || !meetingId || !teacherId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO "ClassMeetings" ("className", "meetingId", "teacherId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *;
    `;

    const result = await pool.query(query, [className, meetingId, teacherId]);

    console.log(`[server] ✅ Встреча сохранена: ${className} (${meetingId})`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("[server] ❌ Ошибка при сохранении встречи:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Эндпоинт для получения всех встреч
app.get("/api/meetings", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM "ClassMeetings" ORDER BY "createdAt" DESC;`);
    res.json(result.rows);
  } catch (error) {
    console.error("[server] ❌ Ошибка получения встреч:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await initDB();
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});

// ✅ Проверка сервера
app.get("/", (req, res) => {
  res.send("Сервер работает!");
});
