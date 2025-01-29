#!/usr/bin/env node
require('dotenv').config();

const requiredEnvVars = [
    'NODE_ENV',
    'DATABASE_URL',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'WAVE_API_KEY',
    'JWT_SECRET'
];

function checkEnvironment() {
    console.log('🔍 Vérification des variables d\'environnement...');
    
    let missingVars = [];
    
    requiredEnvVars.forEach(varName => {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    });
    
    if (missingVars.length > 0) {
        console.error('❌ Variables manquantes :');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\n💡 Conseil : Vérifiez votre fichier .env');
        process.exit(1);
    } else {
        console.log('✅ Toutes les variables d\'environnement sont configurées !');
    }
}

checkEnvironment();
