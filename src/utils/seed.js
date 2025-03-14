require("dotenv").config();
const bcrypt = require("bcrypt");
const { initDB, User, School } = require("../models");

const schools = [
  { name: "Test School 1" },
  { name: "Test School 2" }
];

const users = [
  { name: "Super Admin", email: "superadmin@example.com", password: "superadmin123", role: "superadmin", schoolIndex: null },
  { name: "Admin One", email: "admin1@example.com", password: "adminpassword1", role: "admin", schoolIndex: 0 },
  { name: "Admin Two", email: "admin2@example.com", password: "adminpassword2", role: "admin", schoolIndex: 1 },
  { name: "Teacher One", email: "teacher1@example.com", password: "teacherpassword1", role: "teacher", schoolIndex: 0 },
  { name: "Andriy Dykyy", email: "meet.tamamat@gmail.com", password: "12345", role: "superadmin", schoolIndex: 0 },
  { name: "Teacher Two", email: "teacher2@example.com", password: "teacherpassword2", role: "teacher", schoolIndex: 1 }
];

const seedDB = async () => {
  try {
    await initDB();
    console.log("🗑 Удаление всех данных...");

    // Очистка данных
    await User.destroy({ where: {} });
    await School.destroy({ where: {} });

    console.log("✅ Все данные удалены!");

    // 🔹 Добавляем школы
    const createdSchools = [];
    for (const schoolData of schools) {
      const school = await School.create(schoolData);
      createdSchools.push(school);
    }
    console.log("✅ Школы добавлены!");

    // 🔹 Добавляем пользователей
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        schoolId: userData.schoolIndex !== null ? createdSchools[userData.schoolIndex].id : null
      });
      console.log(`✅ Пользователь ${userData.email} добавлен!`);
    }

    console.log("🎉 Заполнение базы завершено!");
    process.exit();
  } catch (error) {
    console.error("❌ Ошибка при заполнении базы:", error);
    process.exit(1);
  }
};

// Запускаем
seedDB();
