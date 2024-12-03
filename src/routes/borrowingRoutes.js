const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/jwt');
const { getBorrowing } = require('../controllers/borrowingController');

// Route pour emprunter un livre
router.get('/', verifyToken, getBorrowing);

module.exports = router;
