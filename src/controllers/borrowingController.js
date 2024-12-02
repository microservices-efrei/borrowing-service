// borrowingController.js
// const { Borrowing } = require('../models/borrowing');

async function createBorrowing(req, res) {
  // Vérification que le livre existe
  const user = req.user;
  try {
    if (!user.id) {
      return res.status(400).json({ message: 'ID utilisateur manquant' });
    }
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    return user.id; // Retourner l'objet d'emprunt créé
  } catch (error) {
    console.error(error);
    return { error: "Erreur lors de la création de l'emprunt." };
  }
}

module.exports = { createBorrowing };
