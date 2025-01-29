const admin = require('firebase-admin');
const winston = require('winston');

function initializeFirebase() {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    winston.info('Firebase Admin initialized successfully');
  } catch (error) {
    winston.error('Firebase initialization error', error);
    throw error;
  }
}

async function verifyIdToken(token) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    winston.error('Token verification failed', error);
    return null;
  }
}

module.exports = {
  initializeFirebase,
  verifyIdToken
};
