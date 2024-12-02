const jwt = require('jsonwebtoken');

/**
 * Middleware pour vérifier et décoder le token JWT.
 */
const verifyToken = (req, res, next) => {
  try {
    let token = req.headers['authorization'];
    if (!token) {
      return res.status(403).send({
        message: 'Aucun token fourni !',
      });
    }

    // Supprimer le préfixe "Bearer" du token
    token = token.replace('Bearer ', '');

    // Vérifier et décoder le token
    const userInfo = jwt.verify(token, process.env.JWT_SECRET);

    // Ajouter les informations d'utilisateur extraites du token à la requête
    req.user = {
      id: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      role: userInfo.role,
    };

    next(); // Passer au middleware ou au contrôleur suivant
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return res.status(401).send({
      message: 'Token invalide ou expiré !',
    });
  }
};

// Fonction pour vérifier le JWT
const checkJwtTokenFromRabbitMQ = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject('Token invalide ou expiré');
      } else {
        resolve(decoded); // Retourne les données du payload du token
      }
    });
  });
};

module.exports = { verifyToken, checkJwtTokenFromRabbitMQ };
