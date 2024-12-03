const { updateBorrowing } = require('../controllers/borrowingController');
const {
  connectRabbitMQ,
  handleUserVerification,
} = require('./rabbitmqService');

async function consumeMessagesFromReturnQueue() {
  try {
    const channel = await connectRabbitMQ();

    const queue = 'returning_queue';
    await channel.assertQueue(queue, { durable: true });

    console.log('En attente de messages dans la queue', queue);
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const { userId, bookId, isAvailable, returnedAt } = JSON.parse(
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

        const borrowing = await updateBorrowing(
          bookId,
          isAvailable,
          returnedAt
        );
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

module.exports = consumeMessagesFromReturnQueue;
