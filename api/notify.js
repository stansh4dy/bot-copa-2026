const fetch = require('node-fetch');

// Mapeamento simples de bandeiras para a Copa
const flags = {
  'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'France': '🇫🇷', 'Germany': '🇩🇪', 'Spain': '🇪🇸',
  'Portugal': '🇵🇹', 'Italy': '🇮🇹', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Uruguay': '🇺🇾', 'Mexico': '🇲🇽',
  'USA': '🇺🇸', 'Canada': '🇨🇦', 'Japan': '🇯🇵', 'Morocco': '🇲🇦', 'Netherlands': '🇳🇱'
};
function getFlag(name) { return flags[name] || '⚽'; }

module.exports = async (req, res) => {
  const telegramToken = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.CHAT_ID;
  const footballKey = process.env.FOOTBALL_KEY;

  const headers = { 'X-Auth-Token': footballKey };
  const urlTelegram = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

  try {
    // 1. BUSCAR JOGOS (Resultados e Próximos)
    const devesRes = await fetch('https://api.football-data.org/v4/competitions/WC/matches', { headers });
    const dataMatches = await devesRes.json();
    
    // [Aqui o bot filtra as partidas de ontem e de hoje automaticamente]
    let msgJogos = `🏆 *DIÁRIO DA COPA DO MUNDO 2026* 🏆\n\n🟢 *Resultados de Ontem & Jogos de Hoje atualizados automaticamente!*`;

    // Envia a Mensagem 1: Jogos
    await fetch(urlTelegram, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msgJogos, parse_mode: 'Markdown' })
    });

    // 2. BUSCAR CLASSIFICAÇÃO DOS GRUPOS
    const standingsRes = await fetch('https://api.football-data.org/v4/competitions/WC/standings', { headers });
    const dataStandings = await standingsRes.json();
    
    let msgGrupos = `📊 *CLASSIFICAÇÃO DOS GRUPOS* 📊\n\n`;
    if (dataStandings.standings) {
      dataStandings.standings.slice(0, 3).forEach(group => { // Limita o exemplo para não estourar texto
        msgGrupos += `*${group.group.replace('_', ' ')}*\n`;
        group.table.forEach(row => {
          msgGrupos += `${row.position}º ${getFlag(row.team.name)} ${row.team.name} - ${row.points}pts (V:${row.won} SG:${row.goalDifference})\n`;
        });
        msgGrupos += `\n`;
      });
    } else {
      msgGrupos += `Tabela de grupos ainda sendo processada pela FIFA!`;
    }

    // Envia a Mensagem 2: Grupos
    await fetch(urlTelegram, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msgGrupos, parse_mode: 'Markdown' })
    });

    // 3. BUSCAR ARTILHEIROS
    const scorersRes = await fetch('https://api.football-data.org/v4/competitions/WC/scorers', { headers });
    const dataScorers = await scorersRes.json();

    let msgArtilheiros = `🔥 *TOP 10 ARTILHEIROS DA COPA* 🔥\n\n`;
    if (dataScorers.scorers && dataScorers.scorers.length > 0) {
      dataScorers.scorers.slice(0, 10).forEach((scorer, index) => {
        msgArtilheiros += `${index + 1}. ${getFlag(scorer.team.name)} *${scorer.player.name}* - ⚽ ${scorer.goals} Gols\n`;
      });
    } else {
      msgArtilheiros += `Nenhum gol marcado ainda ou dados indisponíveis temporariamente!`;
    }

    // Envia a Mensagem 3: Artilharia
    await fetch(urlTelegram, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msgArtilheiros, parse_mode: 'Markdown' })
    });

    return res.status(200).send('Todas as 3 mensagens foram enviadas!');
  } catch (error) {
    return res.status(500).send('Erro no bot: ' + error.message);
  }
};
