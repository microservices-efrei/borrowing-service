const Borrowing = require('../models/borrowing'); // Modèle Borrowing pour enregistrer les emprunts

// Fonction pour créer l'emprunt
async function createBorrowing(userId, bookId) {
  try {
    // Création de l'emprunt dans la base de données

    const borrowing = await Borrowing.create({
      userId,
      bookId,
    });

    console.log('Emprunt créé avec succès:', borrowing);

    // Retourner l'emprunt créé
    return borrowing;
  } catch (error) {
    console.error("Erreur lors de la création de l'emprunt:", error.message);
    return null;
  }
}

// Exporter les fonctions du contrôleur
async function updateBorrowing(bookId, returnedAt = null) {
  try {
    // Recherche de l'emprunt par son ID

    const borrowing = await Borrowing.findOne({
      where: {
        bookId: bookId,
      },
    });

    if (!borrowing) {
      console.log("L'emprunt n'existe pas.");
      return null;
    }

    // Mise à jour de la date de retour
    borrowing.returnedAt = returnedAt;
    borrowing.borrowedAt = null;
    borrowing.updatedAt = new Date();

    if (borrowing.returnedAt === null) {
      borrowing.returnedAt = null;
      borrowing.borrowedAt = new Date();
      borrowing.updatedAt = new Date();
      await borrowing.save();
      console.log('Le livre est à nouveau disponible :', borrowing);
      return borrowing;
    }

    // Sauvegarder les modifications
    await borrowing.save();

    console.log('Emprunt mis à jour avec succès:', borrowing);

    // Retourner l'emprunt mis à jour
    return borrowing;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'emprunt:", error.message);
    return null;
  }
}

module.exports = { createBorrowing, updateBorrowing };
