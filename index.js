const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN; 
const adminId = parseInt(process.env.ADMIN_ID); 
const channelId = process.env.CHANNEL_ID; 
const supportBotUser = 'Investcoelite_bot'; 
const mainBotUser = 'Crypt0Alliance_bot'; 

const bot = new TelegramBot(token, {polling: true});

// --- DESIGN CODES ---
const gold_star = "⭐";
const line = "━━━━━━━━━━━━━━━━━━";

// --- 1. L'ANNONCE DE CONNEXION FLASH (Ta commande /app) ---
// Pour ceux qui sont déjà membres du collectif
bot.onText(/\/app/, (msg) => {
    if (msg.from.id === adminId) {
        const appText = `
${gold_star} *ACCÈS AU TERMINAL COLLECTIF* ${gold_star}
${line}

Pour les membres ayant déjà configuré leur accès, le terminal est synchronisé. 

📈 *Suivez la performance des fonds et vos dividendes en temps réel via le lien ci-dessous.*

🔗 *Statut : Session sécurisée active.*
`;
        bot.sendMessage(channelId, appText, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: "💼 ENTRER DANS MON TERMINAL", url: `https://t.me/${mainBotUser}` }]
                ]
            }
        });
        bot.sendMessage(adminId, "✅ Rappel d'accès envoyé au collectif.");
    }
});

// --- 2. MESSAGE D'ACCUEIL AUTO (Dès que tu lances le bot) ---
const welcomeText = `
🏛 *INVEST&CO : PLATEFORME PRIVÉE*
${line}

Bienvenue dans notre pool d'investissement collectif. Ici, nous mutualisons nos capitaux pour maximiser les rendements sur Solana.

🔐 *NOUVEAUX MEMBRES :*
Avant toute opération, vous devez impérativement consulter le protocole de dépôt pour garantir la sécurité de vos fonds.

*Cliquez sur le bouton pour l'onboarding.*
`;

const welcomeButtons = {
    parse_mode: 'Markdown',
    reply_markup: {
        inline_keyboard: [
            [{ text: "🔑 CONFIGURER MON ACCÈS PRIVÉ", url: `https://t.me/${supportBotUser}?start=guide` }]
        ]
    }
};

// --- 3. MENU DU BOT (Version Finance Privée) ---
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (msg.text && msg.text.startsWith('/start')) {
        const menuText = `
💼 *VOTRE ESPACE INVESTISSEUR*
${line}
Gérez vos fonds et contactez l'administration du collectif.
`;
        bot.sendMessage(chatId, menuText, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🏦 PROTOCOLE DE DÉPÔT", callback_data: 'depo' }],
                    [{ text: "💳 ACHAT SOLANA", callback_data: 'buy' }],
                    [{ text: "📊 RENDEMENTS & RETRAITS", callback_data: 'earn' }],
                    [{ text: "🏛 CONTACTER L'ADMINISTRATION", callback_data: 'admin' }],
                    [{ text: "🚀 LANCER L'APPLICATION", url: `https://t.me/${mainBotUser}` }]
                ]
            }
        });
    }
});

// --- RÉPONSES AUX BOUTONS ---
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    let txt = "";

    if (query.data === 'depo') txt = "📥 *PROTOCOLE DE DÉPÔT*\n\nLe terminal génère une adresse unique. Vous **DEVEZ** inclure le MÉMO fourni lors du transfert. Sans cela, l'investissement ne pourra pas être mutualisé sur votre compte.";
    if (query.data === 'buy') txt = "💳 *ACQUISITION DE SOLANA*\n\nNous privilégions Binance pour la liquidité. Transférez ensuite vos SOL vers l'adresse du collectif affichée sur l'App.";
    if (query.data === 'earn') txt = "📊 *DIVIDENDES*\n\nLes profits sont redistribués selon votre part du pool. Les retraits sont validés 7j/7 sur votre wallet personnel.";
    if (query.data === 'admin') txt = "🏛 *ADMINISTRATION*\n\nEnvoyez votre message ici. Un gestionnaire de compte vous répondra.";

    bot.sendMessage(chatId, txt, { parse_mode: 'Markdown' });
    bot.answerCallbackQuery(query.id);
});

// Envoi auto au démarrage
bot.sendMessage(channelId, welcomeText, welcomeButtons);

console.log("🚀 Plateforme Investissement Collectif en ligne !");
