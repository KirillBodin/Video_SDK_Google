require("dotenv").config();
const bcrypt = require("bcrypt");
const { initDB, User, ClassMeeting, Student, sequelize } = require("../backend/models");

const users = [
  { name: "Super Admin", email: "superadmin@example.com", password: "superadmin123", role: "superadmin" },
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

// 🔄 Функция заполнения базы
const seedDB = async () => {
  const transaction = await sequelize.transaction();
  try {
    await initDB();
    console.log("🗑 Удаление всех данных...");


    await sequelize.query("TRUNCATE TABLE \"ClassStudents\" CASCADE", { transaction });
    await sequelize.query("TRUNCATE TABLE \"ClassMeetings\" CASCADE", { transaction });
    await sequelize.query("TRUNCATE TABLE \"Students\" CASCADE", { transaction });
    await sequelize.query("TRUNCATE TABLE \"Users\" CASCADE", { transaction });

    console.log("✅ Все данные удалены!");

    const createdUsers = {};

  
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

    console.log("✅ Все пользователи добавлены!");

    const createdLessons = {};
    for (const lessonData of lessons) {
      const teacher = createdUsers[lessonData.teacherEmail];

      if (!teacher) {
        console.warn(`⚠️ Учитель ${lessonData.teacherEmail} не найден, урок не добавлен.`);
        continue;
      }

      const meetingId = `meet-${Math.random().toString(36).substring(2, 10)}`;
      const classUrl = `https://meet.tamamat.com/${meetingId}/${teacher.name.replace(/\s/g, "_")}/${lessonData.className.replace(/\s/g, "_")}`;

      const newLesson = await ClassMeeting.create({
        className: lessonData.className,
        meetingId,
        teacherId: teacher.id,
        classUrl
      }, { transaction });

      createdLessons[lessonData.className] = newLesson;
      console.log(`✅ Урок "${lessonData.className}" создан!`);
    }

    console.log("✅ Все уроки добавлены!");

    
    for (const studentData of students) {
      const teacher = createdUsers[studentData.teacherEmail];

      if (!teacher) {
        console.warn(`⚠️ Учитель ${studentData.teacherEmail} не найден, студент не добавлен.`);
        continue;
      }

      const newStudent = await Student.create({
        name: studentData.name,
        email: studentData.email,
        teacherId: teacher.id
      }, { transaction });

    
      for (const lesson of Object.values(createdLessons)) {
        if (lesson.teacherId === teacher.id) {
          await newStudent.addClass(lesson, { transaction });
        }
      }

      console.log(`✅ Студент ${studentData.name} добавлен и привязан к урокам!`);
    }

    console.log("✅ Все студенты добавлены!");

    await transaction.commit();
    console.log("🎉 Заполнение базы завершено!");
    process.exit();
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Ошибка при заполнении базы:", error);
    process.exit(1);
  }
};

seedDB();
