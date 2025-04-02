require("dotenv").config();
const bcrypt = require("bcrypt");
const {
  initDB,
  User,
  ClassMeeting,
  Student,
  sequelize,
} = require("../backend/models");

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
  {
    name: "Peter Piper",
    email: "peter.piper@example.com",
    teacherEmails: ["teacher1@example.com"]
  },
  {
    name: "Fred Flintstone",
    email: "fred.flintstone@example.com",
    teacherEmails: ["teacher1@example.com", "teacher2@example.com"]
  }
];

const seedDB = async () => {
  const transaction = await sequelize.transaction();
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to the DB!");

    await sequelize.drop({ transaction });
    console.log("🗑 Dropped all tables!");

    await sequelize.sync({ force: true, transaction });
    console.log("📦 Recreated all tables!");

    const createdUsers = {};

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      let adminId = null;
      if (userData.role === "teacher" && userData.adminEmail) {
        const admin = createdUsers[userData.adminEmail];
        if (!admin) {
          console.warn(`⚠️ Admin ${userData.adminEmail} not found.`);
        } else {
          adminId = admin.id;
        }
      }

      const newUser = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        adminId,
      }, { transaction });

      createdUsers[userData.email] = newUser;
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

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
      console.log(`✅ Created lesson: "${lesson.className}"`);
    }

    for (const studentData of students) {
      const student = await Student.create({
        name: studentData.name,
        email: studentData.email,
      }, { transaction });

      for (const teacherEmail of studentData.teacherEmails) {
        const teacher = createdUsers[teacherEmail];
        if (teacher) {
          await teacher.addStudent(student, { transaction });
          console.log(`➡️ Linked student "${student.name}" to teacher "${teacher.name}"`);
        }
      }

      for (const lesson of Object.values(createdLessons)) {
        const lessonTeacher = Object.values(createdUsers).find(u => u.id === lesson.teacherId);
        if (studentData.teacherEmails.includes(lessonTeacher?.email)) {
          await student.addClass(lesson, { transaction });
          console.log(`➡️ Added "${student.name}" to lesson "${lesson.className}"`);
        }
      }
    }

    await transaction.commit();
    console.log("🎉 Database seeded successfully!");
    process.exit();
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
