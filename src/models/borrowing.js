const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Borrowing = sequelize.define(
  'Borrowing',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "Référence à l'utilisateur qui a emprunté le livre",
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Référence au livre emprunté',
    },
    borrowedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      comment: "Date de début de l'emprunt",
    },
    returnedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date de retour du livre (null si non retourné)',
    },
  },
  {
    tableName: 'borrowings',
    timestamps: true, // Pour inclure les colonnes createdAt et updatedAt
    comment: 'Table qui suit les emprunts de livres par les utilisateurs',
  }
);

module.exports = Borrowing;
