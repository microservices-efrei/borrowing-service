const express = require("express");
const app = express();
const borrowingRoutes = require("./src/routes/borrowingRoutes");

app.use("/borrowing", borrowingRoutes);

module.exports = app;
