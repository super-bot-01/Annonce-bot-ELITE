const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN; 
const adminId = parseInt(process.env.ADMIN_ID); 
const channelId = process.env.CHANNEL_ID; 
const supportBotUser = 'Investcoelite_bot'; 
const mainBotUser = 'Crypt0Alliance_bot'; 

const bot = new TelegramBot(token, {polling: true});

const line = "━━━━━━━━━━━━━━━━━━";

// État du mode test (mémoire vive)
let isTestMode = false;

// --- DÉFINITION DES MENUS ---

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

const backButton = [[{ text: "⬅️ RETOUR", callback_data: 'main_menu' }]];

// --- LOGIQUE /START ---

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    // Commande secrète pour quitter le mode test
    if (text === '/admin' && chatId === adminId) {
        isTestMode = false;
        bot.sendMessage(chatId, "🛠 *MODE ADMIN RÉACTIVÉ*", { parse_mode: 'Markdown', reply_markup: getAdminMenu() });
        return;
    }

    if (text.startsWith('/start')) {
        // Si c'est l'admin ET qu'il n'est pas en mode test
        if (chatId === adminId && !isTestMode) {
            bot.sendMessage(chatId, `👑 *TABLEAU DE BORD ADMIN*\n${line}\nMode Gestionnaire actif.`, {
                parse_mode: 'Markdown', reply_markup: getAdminMenu()
            });
        } else {
            // Mode Utilisateur (ou Admin en mode test)
            bot.sendMessage(chatId, `💼 *VOTRE ESPACE INVESTISSEUR*\n${line}\nGérez vos fonds et accédez au pool collectif.`, {
                parse_mode: 'Markdown', reply_markup: getUserMenu()
            });
        }
        return;
    }

    // Support (uniquement si ce n'est pas l'admin en mode normal)
    if (chatId !== adminId && msg.chat.type === 'private' && !text.startsWith('/')) {
        bot.sendMessage(adminId, `🎫 *NOUVEAU TICKET*\n*De:* ${msg.from.first_name}\n*ID:* \`${chatId}\`\n\n*Message:* ${text}`, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "✍️ RÉPONDRE", callback_data: `reply_${chatId}` }]] }
        });
        bot.sendMessage(chatId, "✅ *Message transmis.* L'administration vous répondra ici.");
    }
});

// --- GESTION DYNAMIQUE ---

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    let text = "";
    let menu = { inline_keyboard: backButton };

    // ACTIONS SPÉCIALES ADMIN
    if (data === 'admin_toggle_test') {
        isTestMode = true;
        bot.editMessageText(`🕵️ *MODE TEST ACTIVÉ*\n${line}\nVous voyez maintenant ce que vos membres voient.\n\n_Tapez /admin pour revenir en gestionnaire._`, {
            chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: getUserMenu()
        });
        return;
    }

    if (data === 'admin_send_app') {
        bot.sendMessage(channelId, `⭐ *ACCÈS AU TERMINAL COLLECTIF* ⭐\n${line}\n\nPour les membres actifs, le terminal est synchronisé.\n\n🔗 *Statut : Session sécurisée.*`, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "💼 ENTRER DANS MON TERMINAL", url: `https://t.me/${mainBotUser}` }]] }
        });
        bot.answerCallbackQuery(query.id, { text: "Annonce envoyée !" });
        return;
    }

    // RETOUR AU MENU
    if (data === 'main_menu') {
        if (chatId === adminId && !isTestMode) {
            text = `👑 *TABLEAU DE BORD ADMIN*\n${line}\nQue voulez-vous gérer ?`;
            menu = getAdminMenu();
        } else {
            text = `💼 *VOTRE ESPACE INVESTISSEUR*\n${line}\nGérez vos fonds et accédez au pool collectif.`;
            menu = getUserMenu();
        }
    } 
    // PAGES INFOS
    else if (data === 'depo') text = "📥 *PROTOCOLE DE DÉPÔT*\n\nCopiez l'adresse ET le MÉMO unique. Sans mémo, les fonds ne sont pas validés.";
    else if (data === 'buy') text = "💳 *ACQUISITION DE SOLANA*\n\nUtilisez Binance ou Coinbase.";
    else if (data === 'earn') text = "📊 *DIVIDENDES & RETRAITS*\n\nProfits redistribués selon votre part. Traitement < 1h.";
    else if (data === 'admin') text = "🏛 *ADMINISTRATION*\n\nÉcrivez votre message ci-dessous.";

    if (data.startsWith('reply_')) {
        bot.sendMessage(adminId, `Tapez : \`/rep ${data.split('_')[1]} message\``);
        bot.answerCallbackQuery(query.id);
        return;
    }

    bot.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown', reply_markup: menu }).catch(e => {});
    bot.answerCallbackQuery(query.id);
});

// COMMANDES ADMIN RÉPONSE & PHOTO
bot.onText(/\/rep (\d+) (.+)/, (msg, match) => {
    if (msg.from.id === adminId) {
        bot.sendMessage(match[1], `👨‍💻 *RÉPONSE ÉLITE :*\n\n${match[2]}`, { parse_mode: 'Markdown' });
        bot.sendMessage(adminId, "✅ Envoyé.");
    }
});

bot.on('photo', (msg) => {
    if (msg.from.id === adminId && msg.chat.type === 'private') {
        bot.sendPhoto(channelId, msg.photo[msg.photo.length - 1].file_id, {
            caption: `🔔 *ANNONCE COLLECTIVE*\n\n${msg.caption || ""}`,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "🚀 OUVRIR LE TERMINAL", url: `https://t.me/${mainBotUser}` }]] }
        });
    }
});

console.log("🚀 Bot Elite v4 (Mode Test Intégré) prêt !");
