const TelegramBot = require('node-telegram-bot-api');

// --- CONFIGURATION ---
const token = process.env.BOT_TOKEN; 
const adminId = parseInt(process.env.ADMIN_ID); 
const channelId = process.env.CHANNEL_ID; 
const supportBotUser = 'TON_BOT_SUPPORT_USERNAME'; // Remplace par le pseudo de CE bot (ex: EliteSupport_bot)
const mainBotUser = 'Crypt0Alliance_bot'; // Ton application principale

const bot = new TelegramBot(token, {polling: true});

// --- TEXTE DE L'ANNONCE AUTOMATIQUE (CANAL) ---
const autoAnnonceText = `
🏆 *BIENVENUE SUR INVEST&CO PRIVÉ* 🏆

L'accès au **Terminal Elite** est officiellement ouvert. 

Pour commencer à générer des profits et configurer votre compte, vous devez suivre notre guide interactif.

🔹 *Ce que vous allez trouver :*
• Guide d'achat Solana (SOL) rapide.
• Procédure de dépôt sécurisée (Mémo).
• Accès direct au support 24/7.

👇 **Cliquez sur le bouton ci-dessous pour lancer votre configuration.**
`;

const autoAnnonceButtons = {
    parse_mode: 'Markdown',
    reply_markup: {
        inline_keyboard: [
            [{ text: "🚀 DÉMARRER MON GUIDE PERSO", url: `https://t.me/${supportBotUser}?start=guide` }]
        ]
    }
};

// --- MENU PRIVÉ DU BOT (Support/Guide) ---
const mainMenu = {
    parse_mode: 'Markdown',
    reply_markup: {
        inline_keyboard: [
            [{ text: "💳 ACHETER DU SOLANA (SOL)", callback_data: 'menu_buy' }],
            [{ text: "📥 COMMENT DÉPOSER (MÉMO)", callback_data: 'menu_deposit' }],
            [{ text: "💰 PROFITS & RETRAITS", callback_data: 'menu_earn' }],
            [{ text: "👨‍💻 CONTACTER LE SUPPORT", callback_data: 'menu_support' }],
            [{ text: "🚀 LANCER L'APPLICATION", url: `https://t.me/${mainBotUser}` }]
        ]
    }
};

// --- ENVOI AUTOMATIQUE AU DÉMARRAGE ---
bot.sendMessage(channelId, autoAnnonceText, autoAnnonceButtons)
    .then(() => console.log("✅ Annonce automatique publiée dans le canal !"))
    .catch((err) => console.log("❌ Erreur d'envoi automatique :", err.message));

// --- LOGIQUE DES MESSAGES PRIVÉS ---
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    // Gestion du /start
    if (text.startsWith('/start')) {
        bot.sendMessage(chatId, `👋 *Bienvenue sur votre Assistant Elite.*\n\nJe vais vous guider pas à pas pour vos investissements sur le Terminal.`, mainMenu);
        return;
    }

    // Gestion du Support (Tickets)
    if (chatId !== adminId && msg.chat.type === 'private') {
        bot.sendMessage(adminId, `🎫 *NOUVEAU TICKET*\n*De:* ${msg.from.first_name}\n*ID:* \`${chatId}\`\n\n*Message:* ${text}`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: "✍️ RÉPONDRE", callback_data: `reply_${chatId}` }]]
            }
        });
        bot.sendMessage(chatId, "✅ *Message reçu.* Le support va vous répondre ici.");
    }
});

// --- COMMANDES ADMIN ---
bot.onText(/\/annonce (.+)/, (msg, match) => {
    if (msg.from.id === adminId) {
        bot.sendMessage(channelId, `🔔 *ANNONCE ELITE*\n\n${match[1]}`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: "🚀 OUVRIR LE TERMINAL", url: `https://t.me/${mainBotUser}` }]]
            }
        });
    }
});

bot.onText(/\/rep (\d+) (.+)/, (msg, match) => {
    if (msg.from.id === adminId) {
        bot.sendMessage(match[1], `👨‍💻 *RÉPONSE DU SUPPORT :*\n\n${match[2]}`, { parse_mode: 'Markdown' });
        bot.sendMessage(adminId, "✅ Réponse envoyée.");
    }
});

// --- CALLBACKS (Boutons) ---
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    if (query.data === 'menu_buy') {
        bot.sendMessage(chatId, "💳 *ACHAT SOLANA :*\nUtilisez [Binance](https://www.binance.com).", { parse_mode: 'Markdown', disable_web_page_preview: true });
    }
    if (query.data === 'menu_deposit') {
        bot.sendMessage(chatId, "📥 *DÉPÔT :*\nCopiez l'adresse ET le MÉMO dans l'App. Très important !", { parse_mode: 'Markdown' });
    }
    if (query.data === 'menu_support') {
        bot.sendMessage(chatId, "📩 Écrivez votre message ci-dessous...");
    }
    if (query.data.startsWith('reply_')) {
        bot.sendMessage(adminId, `Tapez : \`/rep ${query.data.split('_')[1]} votre message\``);
    }
    bot.answerCallbackQuery(query.id);
});

console.log("🚀 Bot Élite prêt !");
