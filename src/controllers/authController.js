const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, role });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("❌ Ошибка регистрации:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 🔍 Если пользователь - учитель или админ школы, ищем его schoolId
    let schoolId = null;
    let teacherId = null;

    if (user.role === "teacher") {
      teacherId = user.id; // ✅ Добавляем teacherId для учителей
      schoolId = user.schoolId || null;
    } else if (user.role === "admin") {
      schoolId = user.schoolId || null;
    }

    // 🔐 Создаем токен с `teacherId`
    const token = jwt.sign(
      { id: user.id, role: user.role, teacherId }, // ✅ Добавляем teacherId в токен
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    res.json({ 
      message: "Login successful", 
      token, 
      role: user.role, 
      teacherId, // ✅ Передаём teacherId для учителей
      schoolId   // ✅ Передаём schoolId только для учителей и админов
    });
  } catch (error) {
    console.error("❌ Ошибка логина:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
