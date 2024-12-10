const Borrowing = require('../models/borrowing'); // Modèle Borrowing pour enregistrer les emprunts

// Fonction pour créer l'emprunt
async function createBorrowing(userId, bookId) {
  try {
    // Création de l'emprunt dans la base de données

    const borrowing = await Borrowing.create({
      userId,
      bookId,
      isAvailable: false,
    });

    console.log('Emprunt créé avec succès:', borrowing);

    // Retourner l'emprunt créé
    return borrowing;
  } catch (error) {
    console.error("Erreur lors de la création de l'emprunt:", error.message);
    return null;
  }
}

// Exporter la fonction de création de l'emprunt
async function getBorrowing(req, res) {
  try {
    const borrowings = await Borrowing.findAll();
    res.status(200).json({ status: 200, borrowing: borrowings });
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des emprunts:',
      error.message
    );
    res.status(500).json({ error: 'Impossible de récupérer les emprunts.' });
  }
}

async function getBorrowingById(req, res) {
  try {
    const borrowing = await Borrowing.findOne({
      where: { id: req.params.id },
    });

    if (!borrowing) {
      res.status(404).json({ error: 'Emprunt non trouvé.' });
      return;
    }

    res.status(200).json({ status: 200, borrowing: borrowing });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'emprunt:",
      error.message
    );

    res.status(500).json({ error: "Impossible de récupérer l'emprunt." });
  }
}

async function updateBorrowing(bookId, isAvailable, returnedAt = null) {
  try {
    // Recherche de l'emprunt par son ID
    const borrowing = await Borrowing.findOne({
      where: { bookId },
    });

    if (!borrowing) {
      console.log("L'emprunt n'existe pas.");
      return null;
    }

    // Mise à jour des champs en fonction de la disponibilité
    if (isAvailable) {
      borrowing.returnedAt = returnedAt || new Date(); // Si returnedAt n'est pas fourni, on utilise la date actuelle
      borrowing.borrowedAt = null;
    } else {
      borrowing.borrowedAt = new Date();
      borrowing.returnedAt = null;
    }

    borrowing.isAvailable = isAvailable;
    borrowing.updatedAt = new Date();

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

module.exports = {
  createBorrowing,
  updateBorrowing,
  getBorrowing,
  getBorrowingById,
};
