const express = require('express');
const app = express();
const borrowingRoutes = require('./borrowingRoutes');

app.use('/borrowing', borrowingRoutes);

module.exports = app;
