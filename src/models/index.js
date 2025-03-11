const sequelize = require("./db");
const User = require("./User");
const ClassMeeting = require("./ClassMeeting");

const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Подключение к БД успешно!");
    
    await sequelize.sync({ alter: true });
    console.log("✅ База данных синхронизирована!");
  } catch (error) {
    console.error("❌ Ошибка подключения:", error);
  }
};

module.exports = { initDB, User, ClassMeeting };
