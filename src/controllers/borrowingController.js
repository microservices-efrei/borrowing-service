const axios = require('axios'); // Pour les requêtes HTTP
const { Borrowing } = require('../models/borrowing'); // Modèle Borrowing pour enregistrer les emprunts

// URL des services externes
const BOOK_SERVICE_URL = 'http://book-service:3003/api/books/';
const USER_SERVICE_URL = 'http://user-service:3001/api/users/'; // URL des user-service

// Fonction pour vérifier si l'utilisateur existe via un service externe
async function checkUserExistence(userId, jwtToken) {
  try {
    // Envoi de la requête au service utilisateur pour vérifier si l'utilisateur existe
    const response = await axios.get(`${USER_SERVICE_URL}${userId}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return response.data.exists;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur:", error);
    return false;
  }
}

// Fonction pour créer l'emprunt
async function createBorrowing(userId, bookId, jwtToken) {
  try {
    // Vérification si l'utilisateur existe via le service externe
    const userExists = await checkUserExistence(userId, jwtToken);
    if (!userExists) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérification de la disponibilité du livre via le book-service
    const bookResponse = await axios.get(`${BOOK_SERVICE_URL}${bookId}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    if (!bookResponse.data) {
      throw new Error("Le livre n'est pas disponible");
    }

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

module.exports = { createBorrowing };
