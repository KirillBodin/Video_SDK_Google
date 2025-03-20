require("dotenv").config();
const bcrypt = require("bcrypt");
const { initDB, User, School, ClassMeeting, Student } = require("../backend/models");

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

const students = [
  { name: "Peter Piper", email: "peter.piper@example.com", schoolIndex: 0, className: "Superadmin Meeting" },
  { name: "Fled Flintstone", email: "fled.flintstone@example.com", schoolIndex: 0, className: "Superadmin Meeting" },
  { name: "Berry Adams", email: "berry.adams@example.com", schoolIndex: 1, className: "Math Class" }
];

const seedDB = async () => {
  try {
    await initDB();
    console.log("🗑 Удаление всех данных...");

    // Очистка данных
    await ClassMeeting.destroy({ where: {} });
    await User.destroy({ where: {} });
    await School.destroy({ where: {} });
    await Student.destroy({ where: {} });

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
    const createdClasses = {};
    for (const lessonData of lessons) {
      const teacher = createdUsers[lessonData.teacherEmail];

      if (!teacher) {
        console.warn(`⚠️ Учитель ${lessonData.teacherEmail} не найден, урок не будет добавлен.`);
        continue;
      }

      // Генерируем `meetingId`
      const meetingId = `meet-${Math.random().toString(36).substring(2, 10)}`;

      // Генерируем `classUrl`
      const classUrl = `meet.tamamat.com/${meetingId}/${teacher.name.replace(/\s/g, "_")}/${lessonData.className.replace(/\s/g, "_")}`;

      const newLesson = await ClassMeeting.create({
        className: lessonData.className,
        meetingId,
        teacherId: teacher.id,
        classUrl
      });

      createdClasses[lessonData.className] = newLesson; // Сохраняем урок для связи со студентами
      console.log(`✅ Урок "${lessonData.className}" создан для ${lessonData.teacherEmail}! URL: ${classUrl}`);
    }

    console.log("✅ Все уроки добавлены!");

    // 🔹 Добавляем студентов
    for (const studentData of students) {
      const school = createdSchools[studentData.schoolIndex];

      if (!school) {
        console.warn(`⚠️ Школа с индексом ${studentData.schoolIndex} не найдена, студент не будет добавлен.`);
        continue;
      }

      const newStudent = await Student.create({
        name: studentData.name,
        email: studentData.email,
        schoolId: school.id
      });

      console.log(`✅ Студент ${studentData.name} добавлен в школу "${school.name}"!`);

      // Связываем студента с классом, если такой класс есть
      const classMeeting = createdClasses[studentData.className];

      if (classMeeting) {
        await classMeeting.addStudent(newStudent);
        console.log(`✅ Студент ${newStudent.name} добавлен в класс "${classMeeting.className}"!`);
      } else {
        console.warn(`⚠️ Класс "${studentData.className}" не найден, студент ${newStudent.name} не привязан.`);
      }
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
