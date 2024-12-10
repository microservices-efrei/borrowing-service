const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/jwt');
const { getBorrowing,getBorrowingById } = require('../controllers/borrowingController');

// Route pour emprunter un livre
router.get('/', verifyToken, getBorrowing);
router.get('/:id', verifyToken, getBorrowingById);

module.exports = router;
