require("dotenv").config();
const bcrypt = require("bcrypt");
const { initDB, User, ClassMeeting, Student, sequelize } = require("../backend/models");

const users = [
  { name: "Super Admin", email: "superadmin@example.com", password: "superadmin123", role: "superadmin" },
  { name: "Andriy Dykyy", email: "meet.tamamat@gmail.com", password: "superadmin123", role: "superadmin" },
  { name: "Admin One", email: "admin1@example.com", password: "adminpassword1", role: "admin" },
  { name: "Teacher One", email: "teacher1@example.com", password: "teacherpassword1", role: "teacher", adminEmail: "admin1@example.com" },
  { name: "Teacher Two", email: "teacher2@example.com", password: "teacherpassword2", role: "teacher", adminEmail: "admin1@example.com" }
];

const lessons = [
  { className: "Math Class", teacherEmail: "teacher1@example.com" },
  { className: "Science Class", teacherEmail: "teacher2@example.com" }
];

const students = [
  { name: "Peter Piper", email: "peter.piper@example.com", teacherEmail: "teacher1@example.com" },
  { name: "Fred Flintstone", email: "fred.flintstone@example.com", teacherEmail: "teacher2@example.com" }
];

const seedDB = async () => {
  const transaction = await sequelize.transaction();
  try {
    await sequelize.authenticate();
    console.log("✅ Подключение к БД успешно!");

    // 🔥 Полное удаление всех таблиц
    await sequelize.drop({ transaction });
    console.log("🗑 База данных очищена!");

    // 🔄 Пересоздание таблиц
    await sequelize.sync({ force: true, transaction });
    console.log("📦 Структура БД пересоздана!");

    const createdUsers = {};

    // ✅ Создание пользователей
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      let adminId = null;
      if (userData.role === "teacher" && userData.adminEmail) {
        const admin = createdUsers[userData.adminEmail];
        if (!admin) {
          console.warn(`⚠️ Администратор ${userData.adminEmail} не найден, учитель без adminId.`);
        } else {
          adminId = admin.id;
        }
      }

      const newUser = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        adminId
      }, { transaction });

      createdUsers[userData.email] = newUser;
      console.log(`✅ Пользователь ${userData.email} добавлен!`);
    }

    // ✅ Создание уроков
    const createdLessons = {};
    for (const lessonData of lessons) {
      const teacher = createdUsers[lessonData.teacherEmail];
      if (!teacher) continue;

      const meetingId = `meet-${Math.random().toString(36).substring(2, 10)}`;
      const classUrl = `${meetingId}/${teacher.name.replace(/\s/g, "_")}/${lessonData.className.replace(/\s/g, "_")}`;
      const slug = `${teacher.name.replace(/\s/g, "-").toLowerCase()}-${lessonData.className.replace(/\s/g, "-").toLowerCase()}`;

      const lesson = await ClassMeeting.create({
        className: lessonData.className,
        meetingId,
        teacherId: teacher.id,
        teacherName: teacher.name,
        classUrl,
        slug,
      }, { transaction });

      createdLessons[lessonData.className] = lesson;
      console.log(`✅ Урок "${lesson.className}" создан!`);
    }

    // ✅ Создание студентов и привязка к урокам
    for (const studentData of students) {
      const teacher = createdUsers[studentData.teacherEmail];
      if (!teacher) continue;

      const student = await Student.create({
        name: studentData.name,
        email: studentData.email,
        teacherId: teacher.id
      }, { transaction });

      // Привязываем студента ко всем урокам его учителя
      for (const lesson of Object.values(createdLessons)) {
        if (lesson.teacherId === teacher.id) {
          await student.addClass(lesson, { transaction });
        }
      }

      console.log(`✅ Студент ${student.name} добавлен и привязан к урокам!`);
    }

    await transaction.commit();
    console.log("🎉 База данных успешно заполнена!");
    process.exit();
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Ошибка при заполнении базы:", error);
    process.exit(1);
  }
};

seedDB();
