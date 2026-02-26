const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN; 
const adminId = parseInt(process.env.ADMIN_ID); 
const channelId = process.env.CHANNEL_ID; 
const supportBotUser = 'Investcoelite_bot'; 
const mainBotUser = 'Crypt0Alliance_bot'; 

// --- SÉCURITÉ ANTI-CONFLIT ---
const bot = new TelegramBot(token, {
    polling: {
        params: { timeout: 10 } // Réduit les risques de conflit 409
    }
});

const line = "━━━━━━━━━━━━━━━━━━";
let isTestMode = false;

// --- MENUS ---
const getUserMenu = () => ({
    inline_keyboard: [
        [{ text: "🏦 PROTOCOLE DE DÉPÔT", callback_data: 'depo' }],
        [{ text: "💳 ACHAT SOLANA", callback_data: 'buy' }],
        [{ text: "📊 RENDEMENTS & RETRAITS", callback_data: 'earn' }],
        [{ text: "🏛 CONTACTER L'ADMIN", callback_data: 'admin' }],
        [{ text: "🚀 LANCER L'APPLICATION", url: `https://t.me/${mainBotUser}` }]
    ]
});

const getAdminMenu = () => ({
    inline_keyboard: [
        [{ text: "📢 ENVOYER ACCÈS APP (CANAL)", callback_data: 'admin_send_app' }],
        [{ text: "👋 ENVOYER ACCUEIL (CANAL)", callback_data: 'admin_send_welcome' }],
        [{ text: "🕵️ PASSER EN MODE TEST (CLIENT)", callback_data: 'admin_toggle_test' }],
        [{ text: "🖼 AIDE ANNONCE PHOTO", callback_data: 'admin_help_photo' }]
    ]
});

// --- LOGIQUE ---
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (!msg.text) return;

    if (msg.text === '/admin' && chatId === adminId) {
        isTestMode = false;
        return bot.sendMessage(chatId, "🛠 *MODE ADMIN RÉACTIVÉ*", { parse_mode: 'Markdown', reply_markup: getAdminMenu() });
    }

    if (msg.text.startsWith('/start')) {
        const menu = (chatId === adminId && !isTestMode) ? getAdminMenu() : getUserMenu();
        const title = (chatId === adminId && !isTestMode) ? "👑 *TABLEAU DE BORD ADMIN*" : "💼 *VOTRE ESPACE INVESTISSEUR*";
        bot.sendMessage(chatId, `${title}\n${line}`, { parse_mode: 'Markdown', reply_markup: menu });
    }
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'admin_send_app') {
        bot.sendMessage(channelId, `⭐ *ACCÈS AU TERMINAL COLLECTIF* ⭐\n${line}\n\n🔗 *Statut : Session sécurisée.*`, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "💼 ENTRER DANS MON TERMINAL", url: `https://t.me/${mainBotUser}` }]] }
        });
    }

    if (data === 'admin_toggle_test') {
        isTestMode = true;
        bot.editMessageText(`🕵️ *MODE TEST ACTIVÉ*\n_Tapez /admin pour revenir._`, {
            chat_id: chatId, message_id: query.message.message_id, parse_mode: 'Markdown', reply_markup: getUserMenu()
        });
    }

    bot.answerCallbackQuery(query.id);
});

// Envoi manuel pour tester si la connexion est revenue
bot.sendMessage(channelId, "🔄 *Mise à jour du système effectuée.*")
    .then(() => console.log("✅ Connecté au canal !"))
    .catch(e => console.log("❌ Toujours un bug de connexion :", e.message));

console.log("🚀 Bot Élite v4.1 (Anti-Bug) prêt !");
