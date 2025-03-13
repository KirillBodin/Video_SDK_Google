const express = require("express");
const { Pool } = require("pg");

const router = express.Router();

// 📌 Подключение к базе данных PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "videosdk_db",
  password: process.env.DB_PASSWORD || "mynewpassword",
  port: process.env.DB_PORT || 5432,
});

// ✅ Получение всех администраторов школ
router.get("/", async (req, res) => {
  try {
    console.log("[server] 🟢 Запрос на получение админов...");

    const query = `
      SELECT u.id, u.email, u.name, u."schoolId", 
             s.name AS "schoolName"
      FROM "Users" u
      LEFT JOIN "Schools" s ON u."schoolId" = s.id
      WHERE u.role = 'admin';
    `;

    const result = await pool.query(query);
    console.log("[server] ✅ Администраторы загружены:", result.rows);

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Ошибка получения админов:", error);
    res.status(500).json({ error: "Ошибка сервера", details: error.message });
  }
});

// ✅ Добавление нового администратора школы
router.post("/", async (req, res) => {
  try {
    const { email, name, schoolName } = req.body;

    if (!email || !name || !schoolName) {
      return res.status(400).json({ error: "Все поля (email, name, schoolName) обязательны" });
    }

    let schoolIdQuery = `SELECT id FROM "Schools" WHERE name = $1;`;
    let schoolResult = await pool.query(schoolIdQuery, [schoolName]);

    let schoolId;
    if (schoolResult.rows.length > 0) {
      schoolId = schoolResult.rows[0].id;
    } else {
      const insertSchoolQuery = `INSERT INTO "Schools" (name, "createdAt", "updatedAt") VALUES ($1, NOW(), NOW()) RETURNING id;`;
      const newSchool = await pool.query(insertSchoolQuery, [schoolName]);
      schoolId = newSchool.rows[0].id;
    }

    const query = `
      INSERT INTO "Users" (email, password, name, role, "schoolId", "createdAt", "updatedAt")
      VALUES ($1, '', $2, 'admin', $3, NOW(), NOW()) RETURNING id, email, name, "schoolId";
    `;
    const result = await pool.query(query, [email, name, schoolId]);

    res.status(201).json({
      message: "✅ Админ создан!",
      admin: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Ошибка создания админа:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ✅ Обновление данных администратора школы
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, schoolName } = req.body;

    let schoolIdQuery = `SELECT id FROM "Schools" WHERE name = $1;`;
    let schoolResult = await pool.query(schoolIdQuery, [schoolName]);

    let schoolId;
    if (schoolResult.rows.length > 0) {
      schoolId = schoolResult.rows[0].id;
    } else {
      const insertSchoolQuery = `INSERT INTO "Schools" (name, "createdAt", "updatedAt") VALUES ($1, NOW(), NOW()) RETURNING id;`;
      const newSchool = await pool.query(insertSchoolQuery, [schoolName]);
      schoolId = newSchool.rows[0].id;
    }

    const updateAdminQuery = `
      UPDATE "Users" 
      SET email = $1, name = $2, "schoolId" = $3, "updatedAt" = NOW() 
      WHERE id = $4 RETURNING *;
    `;
    const result = await pool.query(updateAdminQuery, [email, name, schoolId, id]);

    if (result.rowCount > 0) {
      res.json({ message: "✅ Админ обновлен!", admin: result.rows[0] });
    } else {
      res.status(404).json({ error: "Админ не найден" });
    }
  } catch (error) {
    console.error("❌ Ошибка обновления админа:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ✅ Удаление администратора школы
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM "Users" WHERE id = $1 RETURNING *;`;
    const result = await pool.query(query, [id]);

    if (result.rowCount > 0) {
      res.json({ message: "✅ Админ удален!" });
    } else {
      res.status(404).json({ error: "Админ не найден" });
    }
  } catch (error) {
    console.error("❌ Ошибка удаления админа:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ✅ Получение списка школ
router.get("/schools", async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name FROM "Schools" ORDER BY name ASC;`);
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Ошибка получения списка школ:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ✅ Получение списка учителей школы
router.get("/:schoolId/teachers", async (req, res) => {
  try {
    const { schoolId } = req.params;

    // ✅ Выбираем всех учителей, привязанных к этой школе
    const query = `
      SELECT id, name, email FROM "Users"
      WHERE "schoolId" = $1 AND role = 'teacher';
    `;

    const result = await pool.query(query, [schoolId]);

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Ошибка получения учителей:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});


// ✅ Получение информации о школе и ее учителях
router.get("/:schoolId", async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({ error: "School ID is required" });
    }

    // 🔍 Запрашиваем информацию о школе
    const schoolQuery = `SELECT id, name FROM "Schools" WHERE id = $1;`;
    const schoolResult = await pool.query(schoolQuery, [schoolId]);

    if (schoolResult.rows.length === 0) {
      return res.status(404).json({ error: "School not found" });
    }

    const school = schoolResult.rows[0];

    // 📚 Запрашиваем учителей, привязанных к этой школе
    const teachersQuery = `SELECT id, name, email FROM "Teachers" WHERE "schoolId" = $1;`;
    const teachersResult = await pool.query(teachersQuery, [schoolId]);

    res.json({
      school,
      teachers: teachersResult.rows,
    });
  } catch (error) {
    console.error("❌ Ошибка получения данных школы:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Получение уроков учителя

router.get("/:teacherId/lessons", async (req, res) => {
  try {
    const { teacherId } = req.params;

    const query = `
      SELECT id, "className", "meetingId", "teacherId"
      FROM "ClassMeetings"
      WHERE "teacherId" = $1;
    `;

    const result = await pool.query(query, [teacherId]);

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Ошибка получения уроков учителя:", error);
    res.status(500).json({ error: "Ошибка сервера", details: error.message });
  }
});

module.exports = router;
