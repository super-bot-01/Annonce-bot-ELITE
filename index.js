const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');

// --- CONFIGURATION VIA VARIABLES RAILWAY ---
const token = process.env.BOT_TOKEN; 
const adminId = parseInt(process.env.ADMIN_ID); 
const channelId = process.env.CHANNEL_ID; 
const mainBotUser = 'Crypt0Alliance_bot'; 

const bot = new TelegramBot(token, {polling: true});

// --- MESSAGE PRINCIPAL DU CANAL ---
const guideMessage = "🛠 *SUPPORT TECHNIQUE ELITE*\n\nCliquez sur l'une des options ci-dessous pour obtenir une aide personnalisée immédiate.";

const guideMenu = {
    parse_mode: 'Markdown',
    reply_markup: {
        inline_keyboard: [
            [{ text: "💳 Acheter du Solana (SOL)", callback_data: 'buy' }],
            [{ text: "📥 Faire un Dépôt / MÉMO", callback_data: 'depo' }],
            [{ text: "💰 Profits & Retraits", callback_data: 'earn' }],
            [{ text: "🚀 OUVRIR LE TERMINAL", url: `https://t.me/${mainBotUser}` }]
        ]
    }
};

// --- RÉPONSES PRIVÉES (POP-UP) ---
bot.on('callback_query', (query) => {
    let response = "";

    switch (query.data) {
        case 'buy':
            response = "💳 ACHAT SOLANA :\n\nUtilisez Binance ou Coinbase. Achetez vos SOL et transférez-les vers l'adresse indiquée dans le Terminal.";
            break;
        case 'depo':
            response = "📥 DÉPÔT & MÉMO :\n\nCopiez l'adresse ET le MÉMO généré. Le mémo est INDISPENSABLE pour que vos fonds arrivent sur votre solde.";
            break;
        case 'earn':
            response = "💰 PROFITS :\n\nLes gains sont crédités automatiquement. Retraits disponibles 24h/24 via l'onglet 'Retrait' du bot.";
            break;
    }

    // Réponse "Alerte" visible UNIQUEMENT par l'utilisateur qui clique
    bot.answerCallbackQuery(query.id, {
        text: response,
        show_alert: true
    });
});

// --- GESTION DES ENVOIS ---
// Auto à 10h
schedule.scheduleJob('0 10 * * *', () => {
    bot.sendMessage(channelId, guideMessage, guideMenu);
});

// Envoi manuel par l'admin
bot.onText(/\/post_guide/, (msg) => {
    if (msg.from.id === adminId) {
        bot.sendMessage(channelId, guideMessage, guideMenu);
    }
});

console.log("✅ Bot Elite (Mode Alertes Privées) lancé !");
