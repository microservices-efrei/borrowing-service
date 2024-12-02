const rabbitmqService = require('../services/rabbitmqService');

// Contrôleur pour emprunter un livre
async function borrowBook(req, res) {
  const { userId, bookId } = req.body;

  // Envoi d'un message à RabbitMQ pour vérifier l'utilisateur
  await rabbitmqService.sendMessage('user_check_queue', { userId });

  // Réponse temporaire en attendant la réponse via RabbitMQ
  res.send({
    message: `Votre demande d'emprunt a été reçue. Vérification en cours... ${bookId}`,
  });
}

// Fonction pour gérer la réponse de RabbitMQ pour la vérification de l'utilisateur
async function handleUserVerification(response) {
  const { userId, isAuthenticated } = response;

  if (isAuthenticated) {
    console.log(
      `Utilisateur ${userId} vérifié avec succès, prêt pour l'emprunt.`
    );
    // Logique pour enregistrer l'emprunt dans la base de données
  } else {
    console.log(
      `L'utilisateur ${userId} n'est pas authentifié. Impossible d'emprunter.`
    );
  }
}

// Démarrage de l'écoute des messages RabbitMQ
async function startListening() {
  await rabbitmqService.listenToQueue(
    'user_response_queue',
    handleUserVerification
  );
}

module.exports = {
  borrowBook,
  startListening,
};
