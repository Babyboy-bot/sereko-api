const axios = require('axios');
const winston = require('winston');

class PaymentService {
  constructor() {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    this.paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY;
    this.baseUrl = 'https://api.paystack.co';
  }

  async initialiserPaiement(montant, email, reference) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          amount: montant * 100, // Conversion en centimes
          email: email,
          reference: reference
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      winston.error('Erreur lors de l\'initialisation du paiement', error);
      throw new Error('Impossible d\'initialiser le paiement');
    }
  }

  async verifierPaiement(reference) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      winston.error('Erreur lors de la vérification du paiement', error);
      throw new Error('Impossible de vérifier le paiement');
    }
  }

  genererReferenceUnique() {
    return `SEREKO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new PaymentService();
