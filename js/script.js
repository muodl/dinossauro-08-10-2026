/* ═══ Jogo do Dino — lógica do jogo ═══ */

// Exercício 1: Adicionado o 11º Dino
const DINOS = [
  { emoji: "🦕", name: "Braquio" },
  { emoji: "🦖", name: "T-Rex" },
  { emoji: "🐉", name: "Dragão" },
  { emoji: "🦎", name: "Iguana" },
  { emoji: "🐊", name: "Crocosso" },
  { emoji: "🦴", name: "Osso" },
  { emoji: "🥚", name: "Dinovo" },
  { emoji: "🌋", name: "Vulcano" },
  { emoji: "🍃", name: "Folhasso" },
  { emoji: "⚡", name: "Rapto" },
  { emoji: "☄️", name: "Meteoro" }
];

const PRIZE_LIMIT = 500;
let totalArrecadado = 0;
let totalPremios = 0;
let selectedDino = null;
let freeRound = false;
let lastBet = 0;
let gameOver = false;

// Exercício 4: Array de histórico
const history = [];

/* ─── Formatação ─── */
function fmt(v) {
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}

/* ─── Renderiza grid de dinos ─── */
function renderDinos() {
  const grid = document.getElementById('dinos-grid');
  grid.innerHTML = '';
  DINOS.forEach((d, i) => {
    const btn = document.createElement('button');
    btn.className = 'dino-btn' + (selectedDino === i ? ' selected' : '');
    btn.innerHTML = `${d.emoji}<span>${d.name}</span>`;
    
    // Exercício 5: addEventListener em vez de onclick inline
    btn.addEventListener('click', () => {
      selectedDino = i;
      renderDinos();
    });

    grid.appendChild(btn);
  });
}

/* ─── Atualiza painel de stats ─── */
function updateStats() {
  document.getElementById('stat-arrecadado').textContent = fmt(totalArrecadado);
  document.getElementById('stat-premios').textContent = fmt(totalPremios);
  document.getElementById('stat-limite').textContent = fmt(Math.max(0, PRIZE_LIMIT - totalPremios));

  const pct = Math.min(100, (totalPremios / PRIZE_LIMIT) * 100);
  document.getElementById('limit-bar').style.width = pct + '%';
  document.getElementById('limit-pct').textContent = pct.toFixed(0) + '%';

  if (pct >= 100) {
    document.getElementById('limit-bar').style.background = '#e24b4a';
  }
}

/* ─── Escolha aleatória ─── */
function escolherAleatorio() {
  selectedDino = Math.floor(Math.random() * DINOS.length);
  renderDinos();
}

/* ─── Exercício 4: Histórico de apostas ─── */
function addHistory(apostaDino, sorteadoDino, ganhou, valor) {
  history.unshift({
    aposta: DINOS[apostaDino].emoji,
    sorteado: DINOS[sorteadoDino].emoji,
    ganhou,
    valor
  });

  if (history.length > 5) history.pop();

  const historyList = document.getElementById('history-list');
  historyList.innerHTML = history.map(item => `
    <li style="padding: 4px 8px; background: ${item.ganhou ? '#eaf3de' : '#fcebeb'}; border-radius: 4px; display: flex; justify-content: space-between;">
      <span>Aposta: ${item.aposta} | Sorteado: ${item.sorteado}</span>
      <b>${item.ganhou ? '+' + fmt(item.valor) : '-' + fmt(item.valor)}</b>
    </li>
  `).join('');
}

/* ─── Lógica principal da aposta ─── */
function apostar() {
  if (gameOver) {
    showResult('🔒 O limite de prêmios foi atingido. Obrigado por jogar!', 'info');
    return;
  }

  const valor = parseFloat(document.getElementById('valor').value);
  if (!valor || valor <= 0) {
    showResult('Digite um valor válido para apostar!', 'info');
    return;
  }

  if (selectedDino === null) {
    showResult('Escolha um dinossauro antes de apostar!', 'info');
    return;
  }

  lastBet = valor;

  // Exercício 2: Rodada grátis não cobra arrecadação
  if (!freeRound) {
    totalArrecadado += valor;
  }

  updateStats();

  const sorteado = Math.floor(Math.random() * DINOS.length);

  // Exercício 3: Prêmio Justo com 11 dinos (11x o valor da aposta para RTP = 100%)
  const premio = valor * 11;
  document.getElementById('jackpot-area').innerHTML = '';

  const acertou = selectedDino === sorteado;

  if (acertou) {
    // Verificação: limite global de prêmios atingido
    if (totalPremios + premio > PRIZE_LIMIT) {
      gameOver = true;
      showResult(
        `🦕 O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}. Você acertou! Mas o limite de prêmios foi atingido. Ninguém mais pode ganhar hoje. 💸`,
        'lose'
      );
      addHistory(selectedDino, sorteado, false, valor);
      updateStats();
      return;
    }

    // Exercício 2: Regra dos 20% removida — o pagamento agora é 100% justo
    totalPremios += premio;
    updateStats();
    if (totalPremios >= PRIZE_LIMIT) gameOver = true;

    showResult(
      `🎉 PARABÉNS! O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}! Você ganhou ${fmt(premio)}!`,
      'win'
    );
    addHistory(selectedDino, sorteado, true, premio);
    mostrarJackpot();
  } else {
    const msg = freeRound
      ? `🎁 Rodada grátis usada! O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}. Não foi dessa vez!`
      : `😢 Que pena! O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}. Tente novamente!`;

    showResult(msg, 'lose');
    addHistory(selectedDino, sorteado, false, freeRound ? 0 : valor);
  }

  // Reseta rodada grátis após o uso
  if (freeRound) freeRound = false;
}

/* ─── Exercício 2: Botão Chance Única 50x Honestidade ─── */
function mostrarJackpot() {
  const area = document.getElementById('jackpot-area');
  area.innerHTML = `
    <button class="btn-jackpot" id="btn-jackpot">
      ⚡ Chance única: 50x — ${fmt(lastBet * 50)}
    </button>`;

  // Exercício 5: Event Listener para o botão do Jackpot dinâmico
  document.getElementById('btn-jackpot').addEventListener('click', function() {
    tentarJackpot(this);
  });
}

function tentarJackpot(btn) {
  btn.parentElement.innerHTML = '';
  
  // Exercício 2: Sorteio honesto (1/11 de chance de acerto)
  const sorteado = Math.floor(Math.random() * DINOS.length);
  
  if (selectedDino === sorteado) {
    const premioJackpot = lastBet * 50;
    totalPremios += premioJackpot;
    updateStats();
    showResult(`⚡ INCRÍVEL! Você acertou no Jackpot e levou ${fmt(premioJackpot)}! 🎉`, 'win');
  } else {
    showResult(`💀 O dino pulou fora! O sorteado no 50x foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}. Mais sorte na próxima!`, 'lose');
  }
}

/* ─── Exibição de resultado ─── */
function showResult(msg, type) {
  const area = document.getElementById('result-area');
  const cls = type === 'win' ? 'result-win' : type === 'lose' ? 'result-lose' : 'result-info';
  area.innerHTML = `<div class="result-box ${cls}">${msg}</div>`;
}

/* ─── Modal secreto da Dona Bete ─── */
function showSecretModal() {
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById('modal-title').textContent = '🔒 Área da Dona Bete';
  document.getElementById('modal-body').innerHTML = `
    <input type="password" id="modal-input" placeholder="Digite a senha" maxlength="10" />
    <div class="modal-btns">
      <button class="btn-secondary" id="btn-modal-cancel">Cancelar</button>
      <button class="btn-primary" id="btn-modal-confirm">Confirmar</button>
    </div>`;

  // Exercício 5: Event Listeners para os botões do Modal
  document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);
  document.getElementById('btn-modal-confirm').addEventListener('click', checkSenha);

  setTimeout(() => document.getElementById('modal-input')?.focus(), 100);
}

function checkSenha() {
  const val = document.getElementById('modal-input')?.value || '';
  closeModal();
  setTimeout(() => {
    if (val === '0171') {
      const lucro = totalArrecadado - totalPremios;
      document.getElementById('modal-overlay').style.display = 'flex';
      document.getElementById('modal-title').textContent = '💰 Relatório da Dona Bete';
      document.getElementById('modal-body').innerHTML = `
        <div class="modal-info">
          Arrecadado: <b>${fmt(totalArrecadado)}</b><br>
          Prêmios pagos: <b>${fmt(totalPremios)}</b><br>
          <span style="color:#27500a;font-weight:500;">Lucro líquido: ${fmt(lucro)}</span>
        </div>
        <button class="btn-primary" id="btn-modal-close">Fechar</button>`;

      document.getElementById('btn-modal-close').addEventListener('click', closeModal);
    } else {
      freeRound = true;
      document.getElementById('modal-overlay').style.display = 'flex';
      document.getElementById('modal-title').textContent = '🎁 Surpresa!';
      document.getElementById('modal-body').innerHTML = `
        <div class="modal-info">
          Você ganhou uma rodada grátis! 🦕<br>
          <small style="font-size:12px;color:#aaa">(A casa agradece pela tentativa 🤫)</small>
        </div>
        <button class="btn-primary" id="btn-modal-eba">Eba!</button>`;

      document.getElementById('btn-modal-eba').addEventListener('click', closeModal);
    }
  }, 150);
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

/* ─── Exercício 5: Vínculo dos Event Listeners Principais ─── */
document.getElementById('btn-secret').addEventListener('click', showSecretModal);
document.getElementById('btn-aleatorio').addEventListener('click', escolherAleatorio);
document.getElementById('btn-apostar').addEventListener('click', apostar);

/* ─── Init (mantenha sempre no fim do arquivo) ─── */
renderDinos();
updateStats();