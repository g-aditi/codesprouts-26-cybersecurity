// OPERATION DRAGON SCROLL
// Keyword: SHURIKEN | Cipher: SHURIKENABCDFGJLMOPQTVWXYZ
// Letters AND digits encrypted

const KEYWORD      = 'SHURIKEN';
const CIPHER_ALPHA = 'SHURIKENABCDFGJLMOPQTVWXYZ';
const DIGIT_ENC    = {'0':'7','1':'3','2':'8','3':'1','4':'5','5':'0','6':'9','7':'4','8':'6','9':'2'};
const DIGIT_DEC    = {'7':'0','3':'1','8':'2','1':'3','5':'4','0':'5','9':'6','4':'7','6':'8','2':'9'};

const CIPHERTEXT =
`ENJPQ GIIRDI, QNAP AP WNAQI DJQTP. IXIUTQI JORIO ZIOJ JG QNI KJTOQIIGQN.

PNSRJW UDSW NSP UJGKAOFIR LDSGP QJ OSAR YSGE VSTDQ. YJTO BJH: RJ GJQ DIQ QNIF OISUN AQ.

OIRAOIUQ QNI PMTSR QJ YAG VSTDQ SQ 13 LSDI FJJG SDDIY, PIUQJO 2, ISPQ RAPQOAUQ, EOAR OIK 84-M. WI WADD LDSGQ S KSCI PUOJDD AGPARI. FSOC AQ WAQN QNI OIR PIOLIGQ PISD. FSCI AQ UJGVAGUAGE. PNSRJW UDSW FTPQ HIDAIVI QNIY NSVI QNI LOAZI.

JGUI QNI PMTSR NSP HIIG OIRAOIUQIR, FJVI QJ IXQOSUQAJG ZJGI 9. OIGRIZVJTP WAQN JTO SEIGQP SQ UNIUCLJAGQ 4-SDLNS. UJFI SDJGI. PLISC QJ GJ JGI. QOTPQ ZIOJ LIJLDI AGPARI PNSRJW UDSW.

QNI ROSEJG PUOJDD FTPQ OIFSAG AG YSGE VSTDQ. ETSOR AQ WAQN YJTO DAKI. QNI UDSG IXLIUQP IXSUQ IXIUTQAJG. GJ IXUILQAJGP.

WNAQI DJQTP JTQ.`;

const FREQ_PANEL = [
  { cipher:'QNI', count:7,  hint:'— ×7'  },
  { cipher:'QJ',  count:4,  hint:'— ×4'  },
  { cipher:'AQ',  count:4,  hint:'— ×4'  },
  { cipher:'SQ',  count:2,  hint:'— ×2'  },
  { cipher:'AP',  count:1,  hint:'— ×1'  },
  { cipher:'RJ',  count:1,  hint:'— ×1'  },
  { cipher:'GJQ', count:1,  hint:'— ×1'  },
  { cipher:'JG',  count:1,  hint:'— ×1'  },
];

const HINTS = [
  'The most frequent cipher word QNI appears 7 times. In English the most common 3-letter word is THE.',
  'Try: QNI=THE, QJ=TO, AQ=IT, SQ=AT. You now have T, H, E, O, I, A confirmed — use those to read more.',
  'The keyword is the name of a famous ninja throwing weapon — 8 letters. Look at the first 8 highlighted letters in your cipher row.'
];

// Build decrypt map
const CORRECT_MAP = {};
for (let i = 0; i < 26; i++) CORRECT_MAP[CIPHER_ALPHA[i]] = String.fromCharCode(65 + i);

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let userMap = {}, hintsUsed = 0, solved = false;

// DOM refs
const ciphertextEl    = document.getElementById('ciphertext-display');
const decodedEl       = document.getElementById('decoded-display');
const decodeLabel     = document.getElementById('decode-status-label');
const statusDot       = document.getElementById('status-dot');
const statusMsg       = document.getElementById('status-msg');
const mappingGrid     = document.getElementById('mapping-grid');
const mappingProgress = document.getElementById('mapping-progress');
const freqTableEl     = document.getElementById('freq-table');
const freqBody        = document.getElementById('freq-body');
const freqToggle      = document.getElementById('freq-toggle');
const freqToggleLabel = document.getElementById('freq-toggle-label');
const alphaPlainRow   = document.getElementById('alpha-plain-row');
const alphaCipherRow  = document.getElementById('alpha-cipher-row');
const keywordInput    = document.getElementById('keyword-input');
const keywordStatus   = document.getElementById('keyword-status');
const keywordPanelTag = document.getElementById('keyword-panel-tag');
const submitBtn       = document.getElementById('submit-btn');
const resultCard      = document.getElementById('result-card');
const retryBtn        = document.getElementById('retry-btn');
const hintDisplay     = document.getElementById('hint-display');

// INIT
ciphertextEl.textContent = CIPHERTEXT;
buildFreqTable();
buildMappingGrid();
buildAlphaPlainRow();
updateAlphaCipherRow();
updateDecodedOutput();

// FREQ TOGGLE (shuriken button)
freqToggle.addEventListener('click', () => {
  const expanded = freqToggle.getAttribute('aria-expanded') === 'true';
  freqToggle.setAttribute('aria-expanded', String(!expanded));
  freqBody.style.display        = expanded ? 'none' : 'block';
  freqToggleLabel.textContent   = expanded ? 'Reveal Intel' : 'Hide Intel';
  // re-trigger spin animation
  const icon = freqToggle.querySelector('.shuriken-icon');
  icon.style.animation = 'none';
  requestAnimationFrame(() => { icon.style.animation = ''; });
});

// FREQ TABLE — plain table, no bars
function buildFreqTable() {
  freqTableEl.innerHTML = '';
  FREQ_PANEL.forEach(({ cipher, count }) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="freq-cipher-word">${cipher}</td>
      <td class="freq-count">×${count}</td>`;
    freqTableEl.appendChild(tr);
  });
}

// ALPHA PLAIN ROW
function buildAlphaPlainRow() {
  alphaPlainRow.innerHTML = '';
  for (let i = 0; i < 26; i++) {
    const cell = document.createElement('span');
    cell.className = 'alpha-cell plain';
    cell.textContent = String.fromCharCode(65 + i);
    alphaPlainRow.appendChild(cell);
  }
}

// ALPHA CIPHER ROW — updates live
function updateAlphaCipherRow() {
  alphaCipherRow.innerHTML = '';
  for (let i = 0; i < 26; i++) {
    const plainLetter   = String.fromCharCode(65 + i);
    const correctCipher = CIPHER_ALPHA[i];
    const isKw          = i < KEYWORD.length;
    const cell          = document.createElement('span');
    if (userMap[correctCipher] === plainLetter) {
      cell.className   = `alpha-cell ${isKw ? 'kw' : 'filled'}`;
      cell.textContent = correctCipher;
    } else {
      cell.className   = 'alpha-cell empty';
      cell.textContent = '?';
    }
    alphaCipherRow.appendChild(cell);
  }
}

// MAPPING GRID
function buildMappingGrid() {
  mappingGrid.innerHTML = '';
  ALL_LETTERS.forEach(cl => {
    const cell = document.createElement('div');
    cell.className = 'map-cell';
    cell.innerHTML = `
      <span class="map-cipher-letter">${cl}</span>
      <span class="map-arrow">↓</span>
      <input class="map-input" type="text" maxlength="1" data-cipher="${cl}"
        autocomplete="off" autocorrect="off" spellcheck="false" />`;
    const inp = cell.querySelector('input');
    inp.addEventListener('input',   onMapInput);
    inp.addEventListener('keydown', onMapKeydown);
    mappingGrid.appendChild(cell);
  });
}

function onMapKeydown(e) {
  const inputs = [...mappingGrid.querySelectorAll('.map-input')];
  const idx    = inputs.indexOf(e.target);
  if (e.key.length === 1 && /[a-zA-Z]/.test(e.key) && idx < inputs.length - 1)
    setTimeout(() => inputs[idx + 1].focus(), 55);
  if (e.key === 'Backspace' && e.target.value === '' && idx > 0)
    inputs[idx - 1].focus();
}

function onMapInput(e) {
  if (solved) return;
  const input = e.target, cl = input.dataset.cipher;
  const typed = input.value.toUpperCase().replace(/[^A-Z]/g,'');
  input.value = typed;
  if (typed) { userMap[cl] = typed; input.className = typed === CORRECT_MAP[cl] ? 'map-input correct' : 'map-input wrong'; }
  else       { delete userMap[cl]; input.className = 'map-input'; }
  updateDecodedOutput();
  updateAlphaCipherRow();
  updateProgress();
}

// DECODED OUTPUT
function updateDecodedOutput() {
  let html = '', correct = 0, total = 0;
  for (const ch of CIPHERTEXT) {
    if (ch >= 'A' && ch <= 'Z') {
      total++;
      const m = userMap[ch];
      if (m && m === CORRECT_MAP[ch]) { correct++; html += `<span class="revealed">${m}</span>`; }
      else html += `<span class="unrevealed">${ch}</span>`;
    } else { html += ch; }
  }
  decodedEl.innerHTML = html;
  if (!Object.keys(userMap).length) {
    statusDot.className = 'status-dot idle'; statusMsg.textContent = 'Waiting for mappings…'; statusMsg.className = 'status-msg';
    decodeLabel.textContent = 'AWAITING MAP…'; submitBtn.disabled = true;
  } else if (correct === total) {
    statusDot.className = 'status-dot success'; statusMsg.textContent = 'All letters decoded — enter the keyword in Step 3!';
    statusMsg.className = 'status-msg success'; decodeLabel.textContent = '✓ FULLY DECODED'; keywordPanelTag.textContent = 'UNLOCKED';
  } else {
    statusDot.className = 'status-dot active'; statusMsg.textContent = `${correct} of ${total} letters decoded…`;
    statusMsg.className = 'status-msg'; decodeLabel.textContent = `${Math.round(correct/total*100)}% DECODED`;
  }
}

function updateProgress() {
  const n = ALL_LETTERS.filter(cl => userMap[cl] === CORRECT_MAP[cl]).length;
  mappingProgress.textContent = `${n} / 26 correct`;
}

// KEYWORD
keywordInput.addEventListener('input', () => {
  if (solved) return;
  const val = keywordInput.value.toUpperCase().replace(/[^A-Z]/g,'');
  keywordInput.value = val;
  if (val === KEYWORD) {
    keywordInput.className = 'keyword-input correct';
    keywordStatus.textContent = '✓ Correct! Submit your report.'; keywordStatus.className = 'keyword-status ok';
    submitBtn.disabled = false;
  } else if (val.length) {
    keywordInput.className = 'keyword-input';
    keywordStatus.textContent = 'Not quite — read the highlighted red letters at the start of the cipher row.';
    keywordStatus.className = 'keyword-status'; submitBtn.disabled = true;
  } else {
    keywordInput.className = 'keyword-input';
    keywordStatus.textContent = '';
    keywordStatus.className = 'keyword-status'; submitBtn.disabled = true;
  }
});

// HINTS
[1,2,3].forEach(n => {
  document.getElementById(`hint-btn-${n}`).addEventListener('click', () => {
    if (hintsUsed >= n) return;
    hintsUsed = n;
    hintDisplay.textContent = `🗡 ${HINTS[n-1]}`;
    for (let i = 1; i <= n; i++) document.getElementById(`hint-btn-${i}`).disabled = true;
  });
});

// SUBMIT
submitBtn.addEventListener('click', () => {
  const allOk = ALL_LETTERS.every(cl => userMap[cl] === CORRECT_MAP[cl]);
  const kwOk  = keywordInput.value.toUpperCase().replace(/[^A-Z]/g,'') === KEYWORD;
  resultCard.style.cssText = 'display:flex;flex-direction:column;align-items:center;';
  const icon = document.getElementById('result-icon'), title = document.getElementById('result-title'), msg = document.getElementById('result-msg');
  if (allOk && kwOk) {
    solved = true; resultCard.className = 'result-card success-card';
    icon.textContent = '🏮'; title.className = 'result-title win'; title.textContent = 'Mission Accomplished!';
    msg.textContent = 'Ghost Needle received the decoded message. Raiders redirected to Yin Vault at 31 Pale Moon Alley, Sector 9. Yang Vault is safe. The Dragon Scroll is secure. White Lotus is proud.';
    retryBtn.textContent = ''; submitBtn.disabled = true; launchConfetti();
  } else {
    resultCard.className = 'result-card fail-card'; icon.textContent = '☠️';
    title.className = 'result-title lose'; title.textContent = 'Transmission Corrupted';
    msg.textContent = !allOk ? 'Some letter mappings are still wrong — fix the red cells and try again.' : 'Keyword incorrect — read the first highlighted letters in the cipher row above.';
    retryBtn.textContent = 'Back to Fix';
  }
  resultCard.scrollIntoView({ behavior:'smooth', block:'center' });
});

retryBtn.addEventListener('click', () => {
  solved = false; userMap = {}; hintsUsed = 0;
  resultCard.style.display = 'none'; submitBtn.disabled = true;
  keywordInput.value = ''; keywordInput.className = 'keyword-input';
  keywordStatus.textContent = '';
  keywordStatus.className = 'keyword-status'; keywordPanelTag.textContent = 'LOCKED';
  hintDisplay.textContent = '';
  [1,2,3].forEach(n => { document.getElementById(`hint-btn-${n}`).disabled = false; });
  buildMappingGrid(); updateAlphaCipherRow(); updateDecodedOutput(); updateProgress();
});

// CONFETTI
function launchConfetti() {
  const c = document.getElementById('confetti-container'); c.innerHTML = '';
  const colors = ['#c0392b','#c9a84c','#6dbf67','#e8e0d5','#fff'];
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('div'); p.className = 'confetti-piece';
    const s = Math.random()*7+4;
    p.style.cssText = `left:${Math.random()*100}vw;width:${s}px;height:${s}px;background:${colors[Math.floor(Math.random()*5)]};border-radius:${Math.random()>.5?'50%':'2px'};animation-duration:${Math.random()*2+1.5}s;animation-delay:${Math.random()*.8}s;`;
    c.appendChild(p);
  }
  setTimeout(() => { c.innerHTML = ''; }, 4500);
}

// THEME TOGGLE
(function(){
  const t = document.querySelector('[data-theme-toggle]'), r = document.documentElement;
  let theme = 'dark'; r.setAttribute('data-theme', theme);
  t && t.addEventListener('click', () => {
    theme = theme==='dark'?'light':'dark'; r.setAttribute('data-theme', theme);
    t.innerHTML = theme==='dark'
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  });
})();
