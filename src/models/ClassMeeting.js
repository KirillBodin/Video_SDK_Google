const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const ClassMeeting = sequelize.define("ClassMeeting", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  className: { type: DataTypes.STRING, unique: true, allowNull: false },
  meetingId: { type: DataTypes.STRING, allowNull: false },
  teacherId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = ClassMeeting;
