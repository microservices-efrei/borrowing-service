const amqp = require('amqplib');
const {
  createBorrowing,
  updateBorrowing,
} = require('../controllers/borrowingController');
const { checkJwtTokenFromRabbitMQ } = require('../middleware/jwt');
const RABBITMQ_URI = 'amqp://micro-service:password@rabbitmq';

let connection;
let channel;

// Connexion RabbitMQ globale
async function connectRabbitMQ() {
  if (!connection) {
    connection = await amqp.connect(RABBITMQ_URI);
    channel = await connection.createChannel();
    console.log('Connexion à RabbitMQ établie');
  }
}

// Fonction pour envoyer un message à RabbitMQ
async function sendMessage(queue, message) {
  try {
    await connectRabbitMQ();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    console.log(`Message envoyé à la queue ${queue}:`, message);
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
  }
}

// Fonction pour vérifier si l'utilisateur est authentifié
async function checkUserAuthentication(userId) {
  if (userId) {
    return true; // Retourne true si l'utilisateur est authentifié
  }
  return false;
}

// Fonction de vérification de l'utilisateur
async function handleUserVerification(userId) {
  try {
    const isAuthenticated = await checkUserAuthentication(userId);
    if (!isAuthenticated) {
      console.log(
        `L'utilisateur ${userId} n'est pas authentifié. Impossible d'emprunter.`
      );
      return false; // L'utilisateur n'est pas authentifié
    }
    console.log(
      `Utilisateur ${userId} vérifié avec succès, prêt pour l'emprunt.`
    );
    return true; // L'utilisateur est authentifié
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur:", error);
    return false;
  }
}

// Fonction pour consommer les messages RabbitMQ et traiter les emprunts
// Fonction pour consommer les messages RabbitMQ et traiter les emprunts
async function consumeMessagesFromBorrowingQueue() {
  try {
    await connectRabbitMQ();
    const queue = 'borrowing_queue';
    await channel.assertQueue(queue, { durable: true });

    console.log('En attente de messages dans la queue', queue);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const { userId, bookId, token } = JSON.parse(msg.content.toString());
        console.log("Traitement de l'emprunt pour l'utilisateur", userId);

        // Vérifier le JWT
        try {
          const decoded = await checkJwtTokenFromRabbitMQ(token); // Vérifier et décoder le token
          console.log('Utilisateur vérifié:', decoded);

          // Vérification de l'utilisateur
          if (decoded.id !== userId) {
            console.log("Erreur: L'ID utilisateur du token ne correspond pas.");
            channel.ack(msg); // Acquitter le message, même si l'emprunt n'a pas été effectué
            return;
          }

          // L'utilisateur est authentifié, poursuivre le traitement
          const isUserVerified = await handleUserVerification(userId);
          if (!isUserVerified) {
            console.log(
              `L'utilisateur ${userId} ne peut pas effectuer l'emprunt.`
            );
            channel.ack(msg); // Acquitter le message, même si l'emprunt n'a pas été effectué
            return;
          }

          // Si l'utilisateur est authentifié et le livre est disponible, on crée l'emprunt
          const borrowing = await createBorrowing(userId, bookId, token);
          if (borrowing) {
            console.log('Emprunt créé avec succès:', borrowing);
          } else {
            console.error("Erreur lors de la création de l'emprunt.");
          }

          // Acquitter le message après traitement
          channel.ack(msg);
        } catch (error) {
          console.error('Erreur lors de la vérification du JWT:', error);
          channel.ack(msg); // Acquitter le message si le JWT est invalide
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la consommation des messages:', error);
  }
}

async function consumeMessagesFromReturnQueue() {
  try {
    await connectRabbitMQ();
    const queue = 'returning_queue';
    await channel.assertQueue(queue, { durable: true });

    console.log('En attente de messages dans la queue', queue);
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const { userId, bookId, returnedAt } = JSON.parse(
          msg.content.toString()
        );
        console.log("Traitement du retour du livre pour l'utilisateur", userId);
        const isUserVerified = await handleUserVerification(userId);
        if (!isUserVerified) {
          console.log(
            `L'utilisateur ${userId} ne peut pas effectuer le retour.`
          );
          channel.ack(msg); // Acquitter le message, même si l'emprunt n'a pas été effectué
          return;
        }

        const borrowing = await updateBorrowing(bookId, returnedAt);
        if (borrowing) {
          console.log('Retour effectué avec succès:', borrowing);
        } else {
          console.error('Erreur lors du retour du livre.');
        }
      }

      // Acquitter le message après traitement
      channel.ack(msg);
    });
  } catch (error) {
    console.error('Erreur lors de la consommation des messages:', error);
  }
}

// Démarrer l'écoute des messages RabbitMQ
async function startListening() {
  await consumeMessagesFromBorrowingQueue();
  await consumeMessagesFromReturnQueue();
}

module.exports = {
  sendMessage,
  consumeMessagesFromBorrowingQueue,
  consumeMessagesFromReturnQueue,
  startListening,
};
