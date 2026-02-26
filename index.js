const TelegramBot = require('node-telegram-bot-api');

// --- CONFIGURATION ---
const token = process.env.BOT_TOKEN; 
const adminId = parseInt(process.env.ADMIN_ID); 
const channelId = process.env.CHANNEL_ID; 
const supportBotUser = 'Investcoelite_bot'; 
const mainBotUser = 'Crypt0Alliance_bot'; 

const bot = new TelegramBot(token, { polling: true });

const gold_star = "⭐";
const line = "━━━━━━━━━━━━━━━━━━";
let isTestMode = false;

// --- FONCTIONS DE TEXTE ---

const getWelcomeText = () => `
🏛 *INVEST&CO : PLATEFORME PRIVÉE*
${line}

Bienvenue dans notre pool d'investissement collectif. Ici, nous mutualisons nos capitaux pour maximiser les rendements sur l'écosystème Solana.

🔐 *ACCÈS NOUVEAUX MEMBRES :*
Avant toute opération, vous devez impérativement configurer votre accès et consulter le protocole de sécurité.

*Cliquez sur le bouton ci-dessous pour débuter.*
`;

const getAppText = () => `
${gold_star} *ACCÈS AU TERMINAL COLLECTIF* ${gold_star}
${line}

Votre session est prête. Connectez-vous maintenant pour suivre les performances du pool et vos dividendes en temps réel.

🌐 *Statut : Session sécurisée active.*
`;

// --- MENUS ---

const getUserMenu = () => ({
    inline_keyboard: [
        [{ text: "🏦 PROTOCOLE DE DÉPÔT", callback_data: 'depo' }],
        [{ text: "💳 ACHAT SOLANA", callback_data: 'buy' }],
        [{ text: "📊 RENDEMENTS & RETRAITS", callback_data: 'earn' }],
        [{ text: "🏛 CONTACTER L'ADMINISTRATION", callback_data: 'admin' }],
        [{ text: "🚀 LANCER L'APPLICATION", url: `https://t.me/${mainBotUser}` }]
    ]
});

const getAdminMenu = () => ({
    inline_keyboard: [
        [{ text: "📢 PUBLIER ACCUEIL (CANAL)", callback_data: 'admin_send_welcome' }],
        [{ text: "📲 PUBLIER ACCÈS APP (CANAL)", callback_data: 'admin_send_app' }],
        [{ text: "🕵️ PASSER EN MODE TEST (CLIENT)", callback_data: 'admin_toggle_test' }],
        [{ text: "📸 AIDE ANNONCE PHOTO", callback_data: 'admin_help_photo' }]
    ]
});

const backButton = [[{ text: "⬅️ RETOUR AU MENU", callback_data: 'main_menu' }]];

// --- LOGIQUE DE DÉMARRAGE ---

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text) return;

    // Retour admin secret
    if (text === '/admin' && chatId === adminId) {
        isTestMode = false;
        return bot.sendMessage(chatId, "🛠 *MODE GESTIONNAIRE RÉACTIVÉ*", { parse_mode: 'Markdown', reply_markup: getAdminMenu() });
    }

    if (text.startsWith('/start')) {
        const isAdmin = (chatId === adminId && !isTestMode);
        const title = isAdmin ? "👑 *TABLEAU DE BORD ADMIN*" : "💼 *VOTRE ESPACE INVESTISSEUR*";
        const menu = isAdmin ? getAdminMenu() : getUserMenu();
        
        bot.sendMessage(chatId, `${title}\n${line}\nBienvenue sur l'interface de gestion Invest&Co.`, {
            parse_mode: 'Markdown',
            reply_markup: menu
        });
        return;
    }

    // Système de Ticket Support (L'utilisateur écrit un message)
    if (chatId !== adminId && msg.chat.type === 'private' && !text.startsWith('/')) {
        bot.sendMessage(adminId, `🎫 *NOUVEAU TICKET*\n*De:* ${msg.from.first_name}\n*ID:* \`${chatId}\`\n\n*Message:* ${text}`, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "✍️ RÉPONDRE", callback_data: `reply_${chatId}` }]] }
        });
        bot.sendMessage(chatId, "✅ *Message transmis.* Un gestionnaire vous répondra ici-même.");
    }
});

// --- GESTION DYNAMIQUE DES BOUTONS ---

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const msgId = query.message.message_id;
    const data = query.data;

    let content = "";
    let menu = { inline_keyboard: backButton };

    // ACTIONS ADMIN
    if (data === 'admin_send_welcome') {
        bot.sendMessage(channelId, getWelcomeText(), {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "🔑 CONFIGURER MON ACCÈS PRIVÉ", url: `https://t.me/${supportBotUser}?start=setup` }]] }
        });
        return bot.answerCallbackQuery(query.id, { text: "Message d'accueil posté !" });
    }

    if (data === 'admin_send_app') {
        bot.sendMessage(channelId, getAppText(), {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "💼 ENTRER DANS MON TERMINAL", url: `https://t.me/${mainBotUser}` }]] }
        });
        return bot.answerCallbackQuery(query.id, { text: "Accès App posté !" });
    }

    if (data === 'admin_toggle_test') {
        isTestMode = true;
        return bot.editMessageText(`🕵️ *MODE TEST ACTIVÉ*\n${line}\nVous voyez le menu comme un client.\n\n_Tapez /admin pour revenir._`, {
            chat_id: chatId, message_id: msgId, parse_mode: 'Markdown', reply_markup: getUserMenu()
        });
    }

    if (data === 'admin_help_photo') {
        content = "📸 *ANNONCE AVEC PHOTO*\n\nPour publier une image avec bouton :\n1. Envoie une photo au bot en privé.\n2. Mets ton texte en 'Légende'.\n3. Le bot l'envoie direct au canal avec le bouton App.";
    }

    // ACTIONS UTILISATEUR & NAVIGATION
    if (data === 'main_menu') {
        const isAdmin = (chatId === adminId && !isTestMode);
        return bot.editMessageText(isAdmin ? "👑 *TABLEAU DE BORD ADMIN*" : "💼 *VOTRE ESPACE INVESTISSEUR*", {
            chat_id: chatId, message_id: msgId, parse_mode: 'Markdown', reply_markup: isAdmin ? getAdminMenu() : getUserMenu()
        });
    }

    if (data === 'depo') content = "📥 *PROTOCOLE DE DÉPÔT*\n\nLe terminal génère une adresse unique. Vous **DEVEZ** inclure le MÉMO fourni lors du transfert pour que vos fonds soient mutualisés.";
    else if (data === 'buy') content = "💳 *ACHAT SOLANA*\n\nNous recommandons Binance ou Coinbase pour la liquidité. Transférez ensuite vos SOL vers l'adresse du collectif.";
    else if (data === 'earn') content = "📊 *RENDEMENTS & RETRAITS*\n\nLes profits sont crédités selon votre part du pool. Les retraits sont validés 7j/7 sous 1h.";
    else if (data === 'admin') content = "🏛 *ADMINISTRATION*\n\nPosez votre question directement dans le chat ci-dessous. Un gestionnaire prendra en charge votre ticket.";

    if (data.startsWith('reply_')) {
        bot.sendMessage(adminId, `Tapez : \`/rep ${data.split('_')[1]} votre message\``);
        return bot.answerCallbackQuery(query.id);
    }

    if (content) {
        bot.editMessageText(content, {
            chat_id: chatId, message_id: msgId, parse_mode: 'Markdown', reply_markup: menu
        }).catch(() => {});
    }

    bot.answerCallbackQuery(query.id);
});

// --- RÉPONSES ET PHOTOS ---

bot.onText(/\/rep (\d+) (.+)/, (msg, match) => {
    if (msg.from.id === adminId) {
        bot.sendMessage(match[1], `👨‍💻 *MESSAGE DE L'ADMINISTRATION :*\n\n${match[2]}`, { parse_mode: 'Markdown' });
        bot.sendMessage(adminId, "✅ Message envoyé au membre.");
    }
});

bot.on('photo', (msg) => {
    if (msg.from.id === adminId && msg.chat.type === 'private') {
        bot.sendPhoto(channelId, msg.photo[msg.photo.length - 1].file_id, {
            caption: `🔔 *ANNONCE ÉLITE*\n\n${msg.caption || ""}`,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "🚀 OUVRIR LE TERMINAL", url: `https://t.me/${mainBotUser}` }]] }
        });
        bot.sendMessage(adminId, "✅ Annonce photo publiée dans le canal.");
    }
});

// --- AUTO-START ---
bot.sendMessage(channelId, getWelcomeText(), {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: [[{ text: "🔑 CONFIGURER MON ACCÈS", url: `https://t.me/${supportBotUser}?start=setup` }]] }
}).catch(() => {});

console.log("🚀 Système Invest&Co Platinum Opérationnel");
