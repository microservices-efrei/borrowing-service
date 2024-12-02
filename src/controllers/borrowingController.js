// borrowingController.js
// const { Borrowing } = require('../models/borrowing');
const { User } = require('../models/user');

/**
 * Fonction pour créer un emprunt
 * @param {number} userId - ID de l'utilisateur
 * @param {number} bookId - ID du livre à emprunter
 */
async function createBorrowing(req, res) {
  // Vérification que le livre existe
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    return userId; // Retourner l'objet d'emprunt créé
  } catch (error) {
    console.error(error);
    return { error: "Erreur lors de la création de l'emprunt." };
  }
}

module.exports = { createBorrowing };
