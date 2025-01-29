const { verifyIdToken } = require('../services/firebaseService');
const winston = require('winston');

async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await verifyIdToken(token);

    if (!decodedToken) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'user'
    };

    next();
  } catch (error) {
    winston.error('Authentication middleware error', error);
    res.status(403).json({ error: 'Unauthorized' });
  }
}

function authorizeRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

module.exports = {
  authenticateUser,
  authorizeRole
};
