require("dotenv").config();
const bcrypt = require("bcrypt");
const { initDB, User, School, ClassMeeting } = require("../models");

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

const lessons = [
  { className: "Superadmin Meeting", teacherEmail: "meet.tamamat@gmail.com" }, // Урок для Andriy Dykyy
  { className: "Math Class", teacherEmail: "teacher2@example.com" } // Урок для Teacher Two
];

const seedDB = async () => {
  try {
    await initDB();
    console.log("🗑 Удаление всех данных...");

    // Очистка данных
    await ClassMeeting.destroy({ where: {} });
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
    const createdUsers = {};
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        schoolId: userData.schoolIndex !== null ? createdSchools[userData.schoolIndex].id : null
      });

      createdUsers[userData.email] = newUser; // Сохраняем пользователя для дальнейшего использования
      console.log(`✅ Пользователь ${userData.email} добавлен!`);
    }

    console.log("✅ Все пользователи добавлены!");

    // 🔹 Добавляем уроки
    for (const lessonData of lessons) {
      const teacher = createdUsers[lessonData.teacherEmail];

      if (!teacher) {
        console.warn(`⚠️ Учитель ${lessonData.teacherEmail} не найден, урок не будет добавлен.`);
        continue;
      }

      const newLesson = await ClassMeeting.create({
        className: lessonData.className,
        meetingId: `meet-${Math.random().toString(36).substring(2, 10)}`, // Генерация случайного ID
        teacherId: teacher.id
      });

      console.log(`✅ Урок "${lessonData.className}" создан для ${lessonData.teacherEmail}!`);
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
