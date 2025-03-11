const ClassMeeting = require("../models/ClassMeeting");

/**
 * ✅ Создание / Обновление встречи
 */
const createMeeting = async (req, res) => {
  try {
    const { className, meetingId, teacherId } = req.body;
    if (!className || !meetingId || !teacherId) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    const existingClass = await ClassMeeting.findOne({ where: { className } });

    if (existingClass) {
      existingClass.meetingId = meetingId;
      await existingClass.save();
      console.log(`🔄 Обновлен meetingId для ${className}: ${meetingId}`);
    } else {
      await ClassMeeting.create({ className, meetingId, teacherId });
      console.log(`✅ Создана новая встреча: ${className} → ${meetingId}`);
    }

    res.json({ message: "Встреча обновлена!", className, meetingId });
  } catch (error) {
    console.error("❌ Ошибка при создании встречи:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

/**
 * ✅ Получение Meeting ID по названию класса
 */
const getMeetingByClass = async (req, res) => {
  try {
    const { className } = req.params;
    const classData = await ClassMeeting.findOne({ where: { className } });

    if (!classData) {
      return res.status(404).json({ error: "Класс не найден" });
    }

    res.json({ className, meetingId: classData.meetingId });
  } catch (error) {
    console.error("❌ Ошибка при получении Meeting ID:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

module.exports = { createMeeting, getMeetingByClass };
