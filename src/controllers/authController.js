const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 📌 Здесь должна быть твоя база данных (MongoDB, PostgreSQL, MySQL или другая)
const usersDB = []; // Временная база пользователей (заменить на реальную)

// 📌 Регистрация пользователя
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Проверяем, есть ли уже пользователь с таким email
    const existingUser = usersDB.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём нового пользователя
    const newUser = { email, password: hashedPassword };
    usersDB.push(newUser); // В реальном проекте нужно записывать в базу данных

    console.log(`[authController] ✅ Пользователь зарегистрирован: ${email}`);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("[authController] ❌ Ошибка регистрации:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 📌 Логин пользователя
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Проверяем, существует ли пользователь
    const user = usersDB.find((user) => user.email === email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Генерируем токен
    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    console.log(`[authController] ✅ Пользователь вошёл: ${email}`);
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("[authController] ❌ Ошибка логина:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
