const BOT_TOKEN = '8002767668:AAHCNXTGL17xRP1Bgz_bKo6GiEeJWx0bz24';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

function generateUUID() {
  return crypto.randomUUID();
}

function generateVLESS(location = "sddo") {
  const uuid = generateUUID();
  const domain = "quiz.vidio.com";      // Domain asli server
  const bug = "violetvpn.biz.id";       // Host SNI
  const akun = "Riswan Store";          // Nama akun

  let path = "/sg-do"; // default
  if (location === "melbi") {
    path = "/sg-melbi";
  }

  return `vless://${uuid}@${domain}:443?encryption=none&security=tls&type=ws&sni=${bug}&host=${bug}&path=${encodeURIComponent(path)}#${encodeURIComponent(akun)}`;
}

async function sendMessage(chatId, text, replyMarkup = null, parseMode = null) {
  const body = {
    chat_id: chatId,
    text,
  };
  if (replyMarkup) body.reply_markup = replyMarkup;
  if (parseMode) body.parse_mode = parseMode;

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function answerCallbackQuery(callbackQueryId, text) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

async function handleUpdate(update) {
  if (update.message && update.message.text === '/start') {
    const chatId = update.message.chat.id;
    const keyboard = {
      inline_keyboard: [
        [{ text: '🇸🇬🇸🇬 SERVER (SG) SGDO', callback_data: 'vless_sddo' }],
        [{ text: '🇸🇬 SERVER (SG) MELBI', callback_data: 'vless_melbi' }],
      ],
    };
    await sendMessage(chatId, 'Halo! Pilih server VLESS:', keyboard);

  } else if (update.callback_query) {
    const chatId = update.callback_query.message.chat.id;
    const data = update.callback_query.data;
    const callbackId = update.callback_query.id;

    let reply = '';
    let parseMode = null;

    if (data === 'vless_sddo') {
      const akun = generateVLESS("sddo");
      reply = `🔐 Berikut adalah akun VLESS SDDO:\n\n<pre>${akun}</pre>`;
      parseMode = "HTML";
    } else if (data === 'vless_melbi') {
      const akun = generateVLESS("melbi");
      reply = `🔐 Berikut adalah akun VLESS MELBI:\n\n<pre>${akun}</pre>`;
      parseMode = "HTML";
    }

    await answerCallbackQuery(callbackId, `Dipilih: ${data}`);
    await sendMessage(chatId, reply, null, parseMode);
  }

  return new Response('OK', { status: 200 });
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'POST') {
      const update = await request.json();
      return await handleUpdate(update);
    }
    return new Response('🤖 Bot Telegram aktif.', { status: 200 });
  },
};
