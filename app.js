const express = require('express');
const sequelize = require('./src/config/database');
const dotenv = require('dotenv');
const indexRoutes = require('./src/routes/index');
const { startListening } = require('./src/services/listeningService');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Initialisation de la base de données
sequelize
  .authenticate()
  .then(() => {
    console.log('Connexion à la base de données réussie');
  })
  .catch((error) => {
    console.error('Impossible de se connecter à la base de données :', error);
    process.exit(1);
  });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api', indexRoutes);
app.use(cors());

startListening();

app.listen(PORT, () => {
  console.log(`Borrowing Service running on port ${PORT}`);
});
