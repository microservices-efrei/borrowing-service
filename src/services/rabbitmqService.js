const amqp = require('amqplib');
const { createBorrowing } = require('../controllers/borrowingController');

const RABBITMQ_URI = 'amqp://micro-service:password@rabbitmq';

// Connexion RabbitMQ globale pour réutiliser la connexion
let connection;
let channel;

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

// Fonction pour écouter une queue et traiter les messages
async function listenToQueue(queue, callback) {
  try {
    await connectRabbitMQ();

    await channel.assertQueue(queue, { durable: true });
    console.log(`En attente de messages dans la queue ${queue}...`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const message = JSON.parse(msg.content.toString());
        callback(message);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'écoute de la queue:", error);
  }
}

// Fonction pour consommer les messages RabbitMQ et traiter les emprunts
async function consumeMessagesFromQueue() {
  try {
    await connectRabbitMQ();

    const queue = 'borrowing_queue';
    await channel.assertQueue(queue, { durable: true });

    console.log('En attente de messages dans la queue', queue);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const { userId } = JSON.parse(msg.content.toString());

        console.log('userId', userId);

        // Demander à la base de données si l'utilisateur est authentifié
        const userVerificationResult = await handleUserVerification({ userId });

        // Si l'utilisateur est authentifié, procéder à l'emprunt
        if (userVerificationResult.isAuthenticated) {
          await createBorrowing(userId /* autres paramètres nécessaires */);
        }

        // Acquitter le message après traitement
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Erreur lors de la consommation des messages:', error);
  }
}

// Fonction pour gérer la réponse de RabbitMQ pour la vérification de l'utilisateur
async function handleUserVerification(response) {
  const { userId } = response;

  try {
    // Ici, tu vérifies si l'utilisateur est authentifié (par exemple en consultant la base de données)
    const isAuthenticated = await checkUserAuthentication(userId);

    if (isAuthenticated) {
      console.log(
        `Utilisateur ${userId} vérifié avec succès, prêt pour l'emprunt.`
      );
    } else {
      console.log(
        `L'utilisateur ${userId} n'est pas authentifié. Impossible d'emprunter.`
      );
    }

    return { userId, isAuthenticated };
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur:", error);
    return { userId, isAuthenticated: false };
  }
}

// Simulation de la fonction de vérification de l'authentification (remplace par la logique réelle)
async function checkUserAuthentication(userId) {
  // Logique de vérification de l'utilisateur dans la base de données
  if (userId) {
    return true;
  } // Retourne true si l'utilisateur est authentifié
}

// Démarrer l'écoute des messages RabbitMQ
async function startListening() {
  await listenToQueue('user_response_queue', handleUserVerification);
}

module.exports = {
  sendMessage,
  listenToQueue,
  consumeMessagesFromQueue,
  startListening,
};
