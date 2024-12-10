const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/jwt');
const {
  getBorrowing,
  getBorrowingById,
  deleteBorrow,
  returnBook,
} = require('../controllers/borrowingController');

// Route pour emprunter un livre
router.get('/', verifyToken, getBorrowing);
router.get('/:id', verifyToken, getBorrowingById);
router.delete('/:id', verifyToken, deleteBorrow);
router.put('/return/:bookId', verifyToken, returnBook);

module.exports = router;
