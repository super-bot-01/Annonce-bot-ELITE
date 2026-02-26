const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');

// --- RÉCUPÉRATION DES VARIABLES RAILWAY ---
const token = process.env.BOT_TOKEN; 
const adminId = parseInt(process.env.ADMIN_ID); 
const channelId = process.env.CHANNEL_ID; 

const bot = new TelegramBot(token, {polling: true});

// --- TEXTES DU GUIDE (Basés sur tes captures) ---
const mainGuideText = "🛠 *SUPPORT TECHNIQUE ELITE*\n\nBienvenue. Cliquez sur une option pour obtenir une aide immédiate. La réponse s'affichera uniquement pour vous.";

const guideButtons = {
    parse_mode: 'Markdown',
    reply_markup: {
        inline_keyboard: [
            [{ text: "💳 Comment acheter du SOL ?", callback_data: 'buy_sol' }],
            [{ text: "📥 Guide Dépôt & MÉMO", callback_data: 'guide_memo' }],
            [{ text: "💰 Profits & Retraits", callback_data: 'earn_withdraw' }],
            [{ text: "🚀 OUVRIR L'APPLICATION", url: "https://t.me/Crypt0Alliance_bot" }]
        ]
    }
};

// --- LOGIQUE DES RÉPONSES PRIVÉES (Mode Alerte) ---
bot.on('callback_query', (query) => {
    let alertText = "";

    switch (query.data) {
        case 'buy_sol':
            alertText = "ACHAT SOLANA :\n1. Utilisez Binance ou Coinbase.\n2. Achetez des SOL et envoyez-les vers l'adresse du Terminal.";
            break;
        case 'guide_memo':
            alertText = "IMPORTANT (Image 1936) :\nLors de votre dépôt, vous devez copier l'adresse ET le MÉMO UNIQUE (ex: 1265528388). Sans mémo, vos fonds ne seront pas crédités !";
            break;
        case 'earn_withdraw':
            alertText = " PROFITS (Image 1939) :\nVos gains (ex: +120%) sont crédités sur votre solde total. Vous pouvez retirer via l'onglet 'Retrait' à tout moment.";
            break;
    }

    // Cette fonction affiche la réponse SEULEMENT à celui qui a cliqué
    bot.answerCallbackQuery(query.id, {
        text: alertText,
        show_alert: true 
    });
});

// --- AUTOMATISATION ---
// Publication automatique chaque matin à 10h
schedule.scheduleJob('0 10 * * *', () => {
    bot.sendMessage(channelId, mainGuideText, guideButtons);
});

// Message de test au démarrage
bot.sendMessage(channelId, "✅ Système Elite en ligne. Prêt à assister les investisseurs.", guideButtons)
    .then(() => console.log("✅ Bot d'annonces Elite opérationnel !"))
    .catch((err) => console.log("❌ Erreur de démarrage :", err.message));

// Commande manuelle pour l'admin
bot.onText(/\/post_guide/, (msg) => {
    if (msg.from.id === adminId) {
        bot.sendMessage(channelId, mainGuideText, guideButtons);
    }
});

console.log("Démarrage du bot...");
