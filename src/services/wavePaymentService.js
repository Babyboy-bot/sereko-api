const axios = require('axios');

class WavePaymentService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.wave.ci/v1'; // URL hypothétique
    }

    async initiatePayment(amount, userPhone, description) {
        try {
            const response = await axios.post(`${this.baseUrl}/payments`, {
                amount: amount,
                phone_number: userPhone,
                description: description
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                transactionId: response.data.transaction_id,
                status: response.data.status
            };
        } catch (error) {
            console.error('Wave Payment Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Payment initiation failed'
            };
        }
    }

    async verifyPayment(transactionId) {
        try {
            const response = await axios.get(`${this.baseUrl}/payments/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return {
                success: true,
                status: response.data.status,
                amount: response.data.amount
            };
        } catch (error) {
            console.error('Wave Payment Verification Error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Payment verification failed'
            };
        }
    }

    async refundPayment(transactionId) {
        try {
            const response = await axios.post(`${this.baseUrl}/payments/${transactionId}/refund`, {}, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return {
                success: true,
                refundStatus: response.data.status
            };
        } catch (error) {
            console.error('Wave Refund Error:', error.response?.data || error.message);
            return {
                success: false,
                error: 'Refund failed'
            };
        }
    }
}

module.exports = WavePaymentService;
