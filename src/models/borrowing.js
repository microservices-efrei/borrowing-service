const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Borrowing = sequelize.define(
  "Borrowing",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
  },
  {
    tableName: "borrowings",
    timestamps: true,
  }
);

module.exports = Borrowing;
