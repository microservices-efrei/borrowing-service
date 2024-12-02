// models/book.js
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    // ID généré automatiquement par Sequelize
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Vérifie que le titre n'est pas vide
      },
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Vérifie que l'auteur n'est pas vide
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    availabilityStatus: {
      type: DataTypes.ENUM,
      values: ['available', 'borrowed', 'reserved'],
      defaultValue: 'available',
    },
    // Optionnel : Si tu veux ajouter un prix par exemple
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    // Date de publication (optionnelle)
    publicationDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  // Associations si nécessaire
  // Par exemple : un livre peut avoir plusieurs emprunts (Borrowings)
  Book.associate = (models) => {
    Book.hasMany(models.Borrowing, {
      foreignKey: 'bookId',
      as: 'borrowings', // Nom de l'association (facultatif)
    });
  };

  return Book;
};
