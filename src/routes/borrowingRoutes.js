const express = require("express");
const router = express.Router();
const borrowingController = require("../controllers/borrowingController");

// Route pour emprunter un livre
router.post("/borrow", borrowingController.borrowBook);

module.exports = router;
