const TelegramBot = require('node-telegram-bot-api');

// --- CONFIGURATION ---
const token = process.env.BOT_TOKEN; 
const adminId = parseInt(process.env.ADMIN_ID); 
const mainBotUser = 'Crypt0Alliance_bot'; 

const bot = new TelegramBot(token, {polling: true});

// --- CLAVIER PRINCIPAL (Menu du Bot) ---
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

// --- LOGIQUE DE RÉPONSE ---
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Si c'est l'utilisateur qui écrit (pas une commande) -> On crée un TICKET pour l'Admin
    if (text && !text.startsWith('/') && chatId !== adminId) {
        bot.sendMessage(adminId, `🎫 *NOUVEAU TICKET SUPPORT*\n\n*De:* ${msg.from.first_name} (@${msg.from.username || 'N/A'})\n*ID:* \`${chatId}\`\n\n*Message:* ${text}`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[{ text: "✍️ RÉPONDRE", callback_data: `reply_${chatId}` }]]
            }
        });
        bot.sendMessage(chatId, "✅ *Message envoyé au support.*\nUn administrateur va vous répondre très rapidement ici-même.", { parse_mode: 'Markdown' });
        return;
    }

    // Commande /start
    if (text === '/start') {
        bot.sendMessage(chatId, `👋 *Bienvenue sur le Support Elite.*\n\nQue souhaitez-vous faire aujourd'hui ?`, mainMenu);
    }
});

// --- GESTION DES BOUTONS ---
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'menu_buy') {
        const buyText = "💳 *OÙ ACHETER DU SOLANA (SOL) ?*\n\nVoici les plateformes les plus fiables pour acheter par Carte ou Virement :\n\n• [Binance](https://www.binance.com) (Recommandé)\n• [Coinbase](https://www.coinbase.com)\n• [Kraken](https://www.kraken.com)\n\n*Une fois vos SOL achetés, revenez ici pour le guide de dépôt.*";
        bot.editMessageText(buyText, { chat_id: chatId, message_id: query.message.message_id, parse_mode: 'Markdown', disable_web_page_preview: true, reply_markup: mainMenu.reply_markup });
    }

    if (data === 'menu_deposit') {
        const depText = "📥 *PROCÉDURE DE DÉPÔT*\n\n1️⃣ Allez sur l'Application Elite.\n2️⃣ Cliquez sur *DÉPÔT*.\n3️⃣ Copiez l'adresse Solana affichée.\n4️⃣ *TRÈS IMPORTANT* : Copiez et collez le **MÉMO UNIQUE**.\n\n⚠️ *Sans le MÉMO, le système ne pourra pas identifier votre virement et vos fonds seront bloqués.*";
        bot.editMessageText(depText, { chat_id: chatId, message_id: query.message.message_id, parse_mode: 'Markdown', reply_markup: mainMenu.reply_markup });
    }

    if (data === 'menu_earn') {
        const earnText = "💰 *GÉRER VOS PROFITS*\n\n• *Investir :* Vos fonds déposés apparaissent dans votre 'Balance'. Choisissez un projet actif pour générer des gains.\n• *Retrait :* Allez dans l'onglet 'Retrait', entrez votre adresse Solana personnelle et validez.\n\n*Délai de traitement : Instantané à 1h.*";
        bot.editMessageText(earnText, { chat_id: chatId, message_id: query.message.message_id, parse_mode: 'Markdown', reply_markup: mainMenu.reply_markup });
    }

    if (data === 'menu_support') {
        bot.sendMessage(chatId, "📩 *Écrivez votre message ci-dessous...*\n\nDécrivez votre problème avec précision (capture d'écran possible). L'équipe Elite vous répondra ici.");
    }

    // Système de réponse Admin
    if (data.startsWith('reply_')) {
        const userId = data.split('_')[1];
        bot.sendMessage(adminId, `Tapez votre réponse pour l'utilisateur \`${userId}\` sous la forme :\n\n\`/rep ${userId} Votre message ici\``);
    }
});

// Commande pour l'admin pour répondre aux tickets
bot.onText(/\/rep (\d+) (.+)/, (msg, match) => {
    if (msg.from.id === adminId) {
        const userId = match[1];
        const response = match[2];
        bot.sendMessage(userId, `👨‍💻 *RÉPONSE DU SUPPORT ELITE :*\n\n${response}`, { parse_mode: 'Markdown' });
        bot.sendMessage(adminId, "✅ Réponse envoyée !");
    }
});

console.log("🚀 Bot Support Elite v2 (Optimisé) en ligne !");
