const ORIGINAL_DESTINATION = 'Fountain of Youth';
const MESSAGE_PREFIX = 'White Lotus travel directive. If you seek the Fountain of Youth, leave the eastern ridge before sunrise and pass beneath the cedar arch. Continue along the lantern path until the stone wayfinder splits in two, then follow the marked route to ';
const MESSAGE_SUFFIX = ' where the basin lies behind the veil of mist. Approach in silence, take only one sip, and burn this scroll once the water is found.';
const HINTS = [
  'Your forged destination must point to Fountain of Tooth. Spaces and punctuation do not change the hash at all.',
  'Fountain of Tooth is 11 lower than Fountain of Youth under this hash rule.',
  'Add digits that total 11 somewhere in the destination. For example, Fountain of Tooth 29 works.'
];

const addressInput = document.getElementById('address-input');
const originalHashEl = document.getElementById('original-hash');
const currentHashEl = document.getElementById('current-hash');
const currentHashText = document.getElementById('current-hash-text');
const collisionReadout = document.getElementById('collision-readout');
const collisionSubtext = document.getElementById('collision-subtext');
const collisionCard = document.querySelector('.collision-card');
const currentCard = document.querySelector('.current-card');
const statusDot = document.getElementById('status-dot');
const statusMsg = document.getElementById('status-msg');
const statusPill = document.getElementById('status-pill');
const submitBtn = document.getElementById('submit-btn');
const hintDisplay = document.getElementById('hint-display');
const resultCard = document.getElementById('result-card');
const resultIcon = document.getElementById('result-icon');
const resultTitle = document.getElementById('result-title');
const resultMsg = document.getElementById('result-msg');
const retryBtn = document.getElementById('retry-btn');

const originalMessage = buildMessage(ORIGINAL_DESTINATION);
const originalHash = hashMessage(originalMessage).mod;
let solved = false;
let hintsUsed = 0;

originalHashEl.textContent = padHash(originalHash);

function buildMessage(destination) {
  return `${MESSAGE_PREFIX}${destination}${MESSAGE_SUFFIX}`;
}

function hashMessage(text) {
  let total = 0;
  for (const ch of text.toUpperCase()) {
    if (ch >= 'A' && ch <= 'Z') total += ch.charCodeAt(0) - 64;
    else if (ch >= '0' && ch <= '9') total += Number(ch);
  }
  return { total, mod: total % 100 };
}

function padHash(value) {
  return String(value).padStart(2, '0');
}

function normalizeSpaces(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function isToothDestination(destination) {
  return normalizeSpaces(destination).toUpperCase().includes('FOUNTAIN OF TOOTH');
}

function autoSizeAddressInput() {
  const len = Math.max(18, Math.min(30, addressInput.value.length + 1));
  addressInput.style.width = `${len}ch`;
}

function updateState() {
  const currentDestination = normalizeSpaces(addressInput.value);
  const { mod } = hashMessage(buildMessage(currentDestination));
  const changed = currentDestination.toUpperCase() !== ORIGINAL_DESTINATION.toUpperCase();
  const tooth = isToothDestination(currentDestination);
  const collisionReady = changed && tooth && mod === originalHash;

  currentHashEl.textContent = padHash(mod);
  currentHashText.textContent = mod === originalHash
    ? 'Live hash matches the original.'
    : `Target is ${padHash(originalHash)}.`;

  currentCard.classList.toggle('match', mod === originalHash);
  collisionCard.classList.toggle('ready', collisionReady);
  collisionCard.classList.toggle('miss', changed && !collisionReady);
  addressInput.classList.toggle('ready', collisionReady);

  if (!changed) {
    collisionReadout.textContent = 'Original scroll still unchanged.';
    collisionSubtext.textContent = 'Edit the destination to forge a different message.';
    statusDot.className = 'status-dot idle';
    statusMsg.textContent = 'Edit the destination and watch the live hash.';
    statusMsg.className = 'status-msg';
    statusPill.textContent = 'AWAITING COLLISION';
  } else if (collisionReady) {
    collisionReadout.textContent = 'Collision ready.';
    collisionSubtext.textContent = 'Different destination, same hash, Fountain of Tooth achieved.';
    statusDot.className = 'status-dot success';
    statusMsg.textContent = 'Perfect. The forged scroll now redirects them convincingly.';
    statusMsg.className = 'status-msg success';
    statusPill.textContent = 'HASH MATCH';
  } else if (!tooth) {
    collisionReadout.textContent = 'Different message, wrong fountain.';
    collisionSubtext.textContent = 'The forged destination must redirect them to Fountain of Tooth.';
    statusDot.className = 'status-dot active';
    statusMsg.textContent = 'Good start. Now make the scroll point to Fountain of Tooth.';
    statusMsg.className = 'status-msg';
    statusPill.textContent = 'DESTINATION CHANGED';
  } else {
    collisionReadout.textContent = 'Fountain of Tooth set, hash still off.';
    collisionSubtext.textContent = `Original hash ${padHash(originalHash)} vs live hash ${padHash(mod)}.`;
    statusDot.className = 'status-dot active';
    statusMsg.textContent = 'Adjust the destination with digits until the live hash matches the original.';
    statusMsg.className = 'status-msg';
    statusPill.textContent = 'CHECK COLLISION VALUE';
  }

  autoSizeAddressInput();
  return { currentDestination, mod, collisionReady, tooth, changed };
}

addressInput.addEventListener('input', () => {
  if (solved) return;
  updateState();
});

[1, 2, 3].forEach((n) => {
  document.getElementById(`hint-btn-${n}`).addEventListener('click', () => {
    if (hintsUsed >= n) return;
    hintsUsed = n;
    hintDisplay.textContent = `🗡 ${HINTS[n - 1]}`;
    for (let i = 1; i <= n; i += 1) {
      document.getElementById(`hint-btn-${i}`).disabled = true;
    }
  });
});

submitBtn.addEventListener('click', () => {
  const state = updateState();
  resultCard.style.cssText = 'display:flex;flex-direction:column;align-items:center;';

  if (state.collisionReady) {
    solved = true;
    addressInput.disabled = true;
    submitBtn.disabled = true;
    resultCard.className = 'result-card success-card';
    resultIcon.textContent = '🏮';
    resultTitle.className = 'result-title win';
    resultTitle.textContent = 'Collision Achieved!';
    resultMsg.textContent = 'The scroll now sends them to Fountain of Tooth while preserving the original hash. A careless reader would trust the forged route.';
    retryBtn.textContent = 'Reset Mission';
    launchConfetti();
  } else {
    resultCard.className = 'result-card fail-card';
    resultIcon.textContent = '☠️';
    resultTitle.className = 'result-title lose';
    resultTitle.textContent = 'Collision Failed';

    if (!state.changed) {
      resultMsg.textContent = 'The scroll has not changed yet. Edit the destination so the forged message differs from the original.';
    } else if (!state.tooth) {
      resultMsg.textContent = 'The forged scroll must redirect the reader to Fountain of Tooth. Change the destination, then check the hash again.';
    } else {
      resultMsg.textContent = 'Almost there. Fountain of Tooth is correct, but the hash still does not match. Add or adjust digits until the live hash matches exactly.';
    }

    retryBtn.textContent = 'Keep Editing';
  }

  resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

retryBtn.addEventListener('click', () => {
  if (solved) {
    solved = false;
    addressInput.disabled = false;
    addressInput.value = ORIGINAL_DESTINATION;
    submitBtn.disabled = false;
    hintDisplay.textContent = '';
    hintsUsed = 0;
    [1, 2, 3].forEach((n) => {
      document.getElementById(`hint-btn-${n}`).disabled = false;
    });
  }
  resultCard.style.display = 'none';
  updateState();
  addressInput.focus();
});

function launchConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#c0392b', '#c9a84c', '#6dbf67', '#e8e0d5', '#ffffff'];
  for (let i = 0; i < 90; i += 1) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = Math.random() * 7 + 4;
    piece.style.cssText = `left:${Math.random() * 100}vw;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random() * colors.length)]};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation-duration:${Math.random() * 2 + 1.5}s;animation-delay:${Math.random() * 0.8}s;`;
    container.appendChild(piece);
  }
  setTimeout(() => {
    container.innerHTML = '';
  }, 4500);
}

(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = 'dark';
  root.setAttribute('data-theme', theme);

  toggle?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    toggle.innerHTML = theme === 'dark'
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  });
})();

updateState();
