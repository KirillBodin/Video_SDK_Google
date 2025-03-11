const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const router = express.Router();

// 🔹 Регистрация пользователя
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.create({ email, password, role });
    res.status(201).json({ message: "✅ Пользователь создан!", user });
  } catch (error) {
    res.status(400).json({ error: "❌ Ошибка регистрации" });
  }
});

// 🔹 Логин пользователя
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "❌ Неверные данные" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "❌ Неверные данные" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "✅ Вход успешен!", token });
  } catch (error) {
    res.status(500).json({ error: "❌ Ошибка сервера" });
  }
});

module.exports = router;
