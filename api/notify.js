const fetch = require('node-fetch');

// Dicionário de bandeiras simples (Exemplo)
const flags = { 'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'France': '🇫🇷', 'Germany': '🇩🇪' };
function getFlag(name) { return flags[name] || '⚽'; }

module.exports = async (req, res) => {
  const telegramToken = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.CHAT_ID;
  const footballKey = process.env.FOOTBALL_KEY;

  try {
    // 1. Busca os dados da API de Futebol (Exemplo simplificado de chamada)
    // Na vida real, o código original busca resultados e fixtures aqui.
    
    // 2. Monta a mensagem bonita
    const mensagem = `🏆 *DIÁRIO DA COPA DO MUNDO 2026* 🏆\n\n` +
                     `⚽ *Resultados de Ontem:*\n` +
                     `🇧🇷 Brasil 2 x 1 Argentina 🇦🇷\n\n` +
                     `📅 *Jogos de Hoje:* \n` +
                     `🇫🇷 França x Alemanha 🇩🇪 - 16:00`;

    // 3. Envia para o Telegram
    const urlTelegram = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    await fetch(urlTelegram, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensagem,
        parse_mode: 'Markdown'
      })
    });

    return res.status(200).send('Mensagem enviada com sucesso!');
  } catch (error) {
    return res.status(500).send('Erro ao enviar: ' + error.message);
  }
};
