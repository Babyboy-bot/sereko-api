require('dotenv').config({ path: '.env.test' });

// Configuration globale pour les tests
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Configuration des mocks pour les services externes
jest.mock('../src/services/firebaseService', () => ({
  initializeFirebase: jest.fn(),
  verifyIdToken: jest.fn()
}));

jest.mock('../src/services/databaseService', () => ({
  executeQuery: jest.fn()
}));

jest.mock('../src/services/paymentService', () => ({
  initialiserPaiement: jest.fn(),
  verifierPaiement: jest.fn()
}));
