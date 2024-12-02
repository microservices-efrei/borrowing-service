const express = require('express');
const router = express.Router();
const { createBorrowing } = require('../controllers/borrowingController');

// Route pour emprunter un livre
router.post('/borrow', createBorrowing);

module.exports = router;
