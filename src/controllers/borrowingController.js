const Borrowing = require('../models/borrowing'); // Modèle Borrowing pour enregistrer les emprunts
const amqp = require('amqplib'); // Client RabbitMQ pour envoyer des messages

// Fonction pour créer l'emprunt
const RABBITMQ_URI = 'amqp://micro-service:password@rabbitmq'; // URI de RabbitMQ
const CANCEL_QUEUE = 'cancel_borrowing_queue'; // Queue pour envoyer les annulations d'emprunt
const RETURNING_QUEUE = 'returning_book_queue'; // Queue pour envoyer les demandes de retour

async function sendMessageToQueue(queue, message) {
  const connection = await amqp.connect(RABBITMQ_URI);
  const channel = await connection.createChannel();

  await channel.assertQueue(queue, { durable: true });

  // Envoi du message dans la queue
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  console.log(`Message envoyé à la queue ${queue}:`, message);

  await channel.close();
  await connection.close();
}

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

async function deleteBorrow(req, res) {
  try {
    const borrowing = await Borrowing.findOne({
      where: { id: req.params.id },
    });

    if (!borrowing) {
      res.status(404).json({ error: 'Emprunt non trouvé.' });
      return;
    }

    await sendMessageToQueue(CANCEL_QUEUE, {
      borrowingId: borrowing.id,
      bookId: borrowing.bookId,
    });

    await borrowing.destroy();

    res
      .status(200)
      .json({ status: 200, message: 'Emprunt supprimé avec succès.' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'emprunt:", error.message);

    res.status(500).json({ error: "Impossible de supprimer l'emprunt." });
  }
}

async function returnBook(req, res) {
  try {
    const { bookId } = req.params;

    const borrowing = await Borrowing.findOne({
      where: { id: bookId },
    });

    if (!borrowing) {
      return res.status(404).json({ message: 'Emprunt non trouvé.' });
    }

    borrowing.isAvailable = true;

    sendMessageToQueue(RETURNING_QUEUE, {
      borrowingId: borrowing.id,
      bookId: borrowing.bookId,
      isAvailable: true,
    });

    borrowing.returnedAt = new Date();
    const updateBook = await borrowing.save();

    if (!updateBook) {
      return res
        .status(500)
        .json({ message: 'Erreur lors du retour du livre.' });
    }

    res.status(200).json({
      message: `Le livre a été retourné avec succès.`,
    });
  } catch (error) {
    console.error('Erreur lors du retour du livre:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}

module.exports = {
  createBorrowing,
  updateBorrowing,
  getBorrowing,
  getBorrowingById,
  deleteBorrow,
  returnBook,
};
