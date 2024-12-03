// Démarrer l'écoute des messages RabbitMQ
const consumeMessagesFromReturnQueue = require('./returnBook-service');
const consumeMessagesFromBorrowingQueue = require('./borrowingBook-service');

async function startListening() {
  await consumeMessagesFromBorrowingQueue();
  await consumeMessagesFromReturnQueue();
}

module.exports = { startListening };
