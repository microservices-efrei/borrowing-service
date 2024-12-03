const {
  createBorrowing,
  updateBorrowing,
} = require('../controllers/borrowingController');
const {
  connectRabbitMQ,
  handleUserVerification,
} = require('./rabbitmqService');
const Borrowing = require('../models/borrowing');

// Fonction pour consommer les messages RabbitMQ et traiter les emprunts
async function consumeMessagesFromBorrowingQueue() {
  try {
    const channel = await connectRabbitMQ();

    const queue = 'borrowing_queue';
    await channel.assertQueue(queue, { durable: true });

    console.log('En attente de messages dans la queue', queue);

    channel.consume(queue, async (msg) => {
      console.log('Message reçu:', msg.content.toString());
      if (msg !== null) {
        const { userId, bookId, token } = JSON.parse(msg.content.toString());
        console.log("Traitement de l'emprunt pour l'utilisateur", userId);

        // Vérifier le JWT
        try {
          // L'utilisateur est authentifié, poursuivre le traitement
          const isUserVerified = await handleUserVerification(userId);
          if (!isUserVerified) {
            console.log(
              `L'utilisateur ${userId} ne peut pas effectuer l'emprunt.`
            );
            // Acquitter le message, même si l'emprunt n'a pas été effectué
            return;
          }

          const isBorrowingExists = await Borrowing.findOne({
            where: {
              userId,
              bookId,
            },
          });

          // Vérifier si l'utilisateur a déjà emprunté ce livre

          if (isBorrowingExists) {
            console.log("Ce livre existe déjà, on va l'update");
            const borrowing = await updateBorrowing(bookId);
            if (borrowing) {
              console.log('Emprunt mis à jour avec succès:', borrowing);
            } else {
              console.error("Erreur lors de la mise à jour de l'emprunt.");
            }
            // Acquitter le message, même si l'emprunt n'a pas été effectué
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

module.exports = consumeMessagesFromBorrowingQueue;
