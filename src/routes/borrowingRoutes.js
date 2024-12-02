const express = require('express');
const router = express.Router();
const borrowingController = require('../controllers/borrowingController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Route pour emprunter un livre
router.post('/borrow', verifyToken, borrowingController.createBorrowing);

module.exports = router;
