const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');

// --- CONFIGURATION SÉCURISÉE ---
const token = process.env.BOT_TOKEN; 
const adminId = parseInt(process.env.ADMIN_ID); 
const channelId = process.env.CHANNEL_ID; 
const mainBotUser = 'Crypt0Alliance_bot'; 

const bot = new TelegramBot(token, {polling: true});

// --- CONTENU DU GUIDE ---
const guideMessage = "📖 *GUIDE DE L'INVESTISSEUR ELITE*\n\nBienvenue sur le canal officiel. Suivez les étapes ci-dessous pour commencer à générer des profits.";

const guideMenu = {
    parse_mode: 'Markdown',
    reply_markup: {
        inline_keyboard: [
            [{ text: "💳 1. Acheter du Solana (SOL)", callback_data: 'how_buy' }],
            [{ text: "📥 2. Procédure de Dépôt & Mémo", callback_data: 'how_deposit' }],
            [{ text: "🤝 3. Participation & Gains", callback_data: 'how_invest' }],
            [{ text: "🚀 LANCER L'APPLICATION", url: `https://t.me/${mainBotUser}` }]
        ]
    }
};

// --- LOGIQUE DES BOUTONS ---
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    let text = "";

    if (query.data === 'how_buy') {
        text = "💳 *ACHETER DU SOLANA (SOL)*\n\n1️⃣ Utilisez une plateforme comme *Binance*, *Coinbase* ou *Kraken*.\n2️⃣ Achetez des SOL par carte bancaire ou virement.\n3️⃣ Une fois vos SOL reçus, passez à l'étape 'Dépôt'.";
    } 
    else if (query.data === 'how_deposit') {
        text = "📥 *DÉPÔT & MÉMO (IMPORTANT)*\n\n1️⃣ Sur l'application, cliquez sur *DÉPÔT*.\n2️⃣ Copiez l'adresse et le *MÉMO UNIQUE* généré par le bot.\n3️⃣ Lors de l'envoi depuis votre plateforme, collez impérativement le MÉMO.\n\n⚠️ *Attention : Sans le MÉMO, votre dépôt ne pourra pas être validé automatiquement par le système.*";
    }
    else if (query.data === 'how_invest') {
        text = "🤝 *PARTICIPATION & PROFITS*\n\nUne fois votre solde crédité, rejoignez un projet actif. L'Elite gère les fonds et les profits sont versés directement sur votre solde. Vous pouvez effectuer un retrait vers votre wallet personnel à tout moment.";
    }

    bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

// --- AUTOMATISATION ---
// Envoi automatique tous les jours à 10h00
schedule.scheduleJob('0 10 * * *', () => {
    bot.sendMessage(channelId, guideMessage, guideMenu);
});

// Envoi immédiat au démarrage pour vérifier que ça marche
bot.sendMessage(channelId, guideMessage, guideMenu)
    .then(() => console.log("✅ Message de démarrage envoyé au canal !"))
    .catch((err) => console.log("❌ Erreur au démarrage :", err.message));

// --- COMMANDES ADMIN ---
bot.onText(/\/post_guide/, (msg) => {
    if (msg.from.id === adminId) {
        bot.sendMessage(channelId, guideMessage, guideMenu);
    }
});

bot.onText(/\/annonce (.+)/, (msg, match) => {
    if (msg.from.id === adminId) {
        const messageAnnonce = match[1];
        bot.sendMessage(channelId, `🔔 *ANNONCE ELITE*\n\n${messageAnnonce}`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: "🚀 OUVRIR LE TERMINAL", url: `https://t.me/${mainBotUser}` }]]
            }
        });
    }
});

console.log("✅ Bot d'annonces Elite opérationnel !");
