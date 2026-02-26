const TelegramBot = require('node-telegram-bot-api');

// --- CONFIGURATION ---
const token = process.env.BOT_TOKEN; 
const adminId = parseInt(process.env.ADMIN_ID); 
const channelId = process.env.CHANNEL_ID; 

// LIEN DIRECT VERS L'APPLICATION (URL EXTERNE POUR ÉVITER LES CONFLITS)
const LINK_APP = "https://t.me/Crypt0Alliance_bot"; 

const bot = new TelegramBot(token, { polling: true });
const line = "━━━━━━━━━━━━━━━━━━";
let isTestMode = false;

// --- INTERFACE DES MENUS ---

const getUserMenu = () => ({
    inline_keyboard: [
        [{ text: "🏦 PROTOCOLE DE DÉPÔT", callback_data: 'depo' }],
        [{ text: "📊 RENDEMENTS & RETRAITS", callback_data: 'earn' }],
        [{ text: "🚀 ACCÉDER AU TERMINAL (DIRECT)", url: LINK_APP }],
        [{ text: "🏛 CONTACTER L'ADMINISTRATION", callback_data: 'support' }]
    ]
});

const getAdminMenu = () => ({
    inline_keyboard: [
        [{ text: "📢 PUBLIER ACCUEIL (CANAL)", callback_data: 'admin_welcome' }],
        [{ text: "📲 PUBLIER ACCÈS APP (CANAL)", callback_data: 'admin_app' }],
        [{ text: "🕵️ MODE TEST (VUE CLIENT)", callback_data: 'admin_test' }],
        [{ text: "📸 AIDE ANNONCE PHOTO", callback_data: 'admin_photo_help' }]
    ]
});

// --- LOGIQUE DES MESSAGES ---

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (!msg.text) return;

    // Commande secrète Admin
    if (msg.text === '/admin' && chatId === adminId) {
        isTestMode = false;
        return bot.sendMessage(chatId, "🛠 *INTERFACE GESTIONNAIRE ACTIVÉE*", { 
            parse_mode: 'Markdown', 
            reply_markup: getAdminMenu() 
        });
    }

    if (msg.text.startsWith('/start')) {
        const isAdmin = (chatId === adminId && !isTestMode);
        const txt = isAdmin ? "👑 *TABLEAU DE BORD ADMIN*" : "💼 *VOTRE ESPACE INVESTISSEUR*";
        bot.sendMessage(chatId, `${txt}\n${line}`, { 
            parse_mode: 'Markdown', 
            reply_markup: isAdmin ? getAdminMenu() : getUserMenu() 
        });
    }

    // Système de Ticket Support
    if (chatId !== adminId && !msg.text.startsWith('/')) {
        bot.sendMessage(adminId, `🎫 *NOUVEAU TICKET*\n*De:* ${msg.from.first_name}\n*ID:* \`${chatId}\`\n\n*Message:* ${msg.text}`, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "✍️ RÉPONDRE", callback_data: `reply_${chatId}` }]] }
        });
        bot.sendMessage(chatId, "✅ *Message transmis.* L'admin vous répondra ici.");
    }
});

// --- GESTION DES BOUTONS ---

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const msgId = query.message.message_id;
    const data = query.data;

    if (data === 'admin_welcome') {
        bot.sendMessage(channelId, `🏛 *INVEST&CO : ACCÈS PRIVÉ*\n${line}\n\nBienvenue dans notre pool d'investissement collectif sur Solana.`, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "🔑 CONFIGURER MON ACCÈS", url: `https://t.me/Investcoelite_bot?start=setup` }]] }
        });
        bot.answerCallbackQuery(query.id, { text: "Accueil posté !" });
    }

    if (data === 'admin_app') {
        bot.sendMessage(channelId, `⭐ *ACCÈS AU TERMINAL* ⭐\n${line}\n\n🔗 *Statut : Session sécurisée active.*`, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "💼 ENTRER DANS LE TERMINAL", url: LINK_APP }]] }
        });
        bot.answerCallbackQuery(query.id, { text: "Accès App posté !" });
    }

    if (data === 'admin_test') {
        isTestMode = true;
        bot.editMessageText(`🕵️ *MODE TEST ACTIVÉ*\n_Tapez /admin pour revenir._`, {
            chat_id: chatId, message_id: msgId, parse_mode: 'Markdown', reply_markup: getUserMenu()
        });
    }

    // Navigation Infos
    let info = "";
    if (data === 'depo') info = "📥 *DÉPÔT*\n\nLancez le terminal, copiez l'adresse SOL et insérez le MÉMO obligatoire.";
    else if (data === 'earn') info = "📊 *RENDEMENTS*\n\nProfits crédités quotidiennement. Retraits validés sous 1h via l'App.";
    else if (data === 'support') info = "🏛 *SUPPORT*\n\nPosez votre question directement ici par message.";
    
    if (data === 'main') {
        const isAdmin = (chatId === adminId && !isTestMode);
        bot.editMessageText(isAdmin ? "👑 *ADMIN*" : "💼 *INVESTISSEUR*", {
            chat_id: chatId, message_id: msgId, parse_mode: 'Markdown', reply_markup: isAdmin ? getAdminMenu() : getUserMenu()
        });
    }

    if (info) {
        bot.editMessageText(info, {
            chat_id: chatId, message_id: msgId, parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "⬅️ RETOUR", callback_data: 'main' }]] }
        });
    }
    bot.answerCallbackQuery(query.id);
});

// --- FONCTIONS ADMIN ---

bot.onText(/\/rep (\d+) (.+)/, (msg, match) => {
    if (msg.from.id === adminId) {
        bot.sendMessage(match[1], `👨‍💻 *ADMINISTRATION :*\n\n${match[2]}`, { parse_mode: 'Markdown' });
        bot.sendMessage(adminId, "✅ Réponse envoyée.");
    }
});

bot.on('photo', (msg) => {
    if (msg.from.id === adminId && msg.chat.type === 'private') {
        bot.sendPhoto(channelId, msg.photo[msg.photo.length - 1].file_id, {
            caption: `🔔 *ANNONCE ÉLITE*\n\n${msg.caption || ""}`,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "🚀 OUVRIR LE TERMINAL", url: LINK_APP }]] }
        });
        bot.sendMessage(adminId, "✅ Annonce publiée.");
    }
});

console.log("🚀 Bot Support Elite v5.1 prêt !");
