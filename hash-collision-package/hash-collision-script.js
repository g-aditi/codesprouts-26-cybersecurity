const ORIGINAL_ADDRESS = '11 Lotus Alley';
const MESSAGE_PREFIX = 'White Lotus courier note. Move the decoy scroll before sunset. Shadow Claw scouts are tracking the western route. Carry the false scroll to ';
const MESSAGE_SUFFIX = ' and leave it under the red gate lantern. Travel alone, speak to no one, and destroy this note after delivery.';
const HINTS = [
  'The forged address must end with Bamboo Street. Spaces and punctuation do not change the hash at all.',
  'Bamboo Street is worth 35 before you add the house-number digits. The live hash has to come back to the original hash.',
  'You do not need one exact house number. Any number whose digits add to 9 will create the collision.'
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

const originalMessage = buildMessage(ORIGINAL_ADDRESS);
const originalHash = hashMessage(originalMessage).mod;
let solved = false;
let hintsUsed = 0;

originalHashEl.textContent = padHash(originalHash);

function buildMessage(address) {
  return `${MESSAGE_PREFIX}${address}${MESSAGE_SUFFIX}`;
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

function isBambooAddress(address) {
  return /^\d+\s+Bamboo Street$/i.test(normalizeSpaces(address));
}

function autoSizeAddressInput() {
  const len = Math.max(12, Math.min(24, addressInput.value.length + 1));
  addressInput.style.width = `${len}ch`;
}

function updateState() {
  const currentAddress = normalizeSpaces(addressInput.value);
  const { mod } = hashMessage(buildMessage(currentAddress));
  const changed = currentAddress.toUpperCase() !== ORIGINAL_ADDRESS.toUpperCase();
  const bamboo = isBambooAddress(currentAddress);
  const collisionReady = changed && bamboo && mod === originalHash;

  currentHashEl.textContent = padHash(mod);
  currentHashText.textContent = mod === originalHash
    ? 'Live hash matches the original.'
    : `Target is ${padHash(originalHash)}.`;

  currentCard.classList.toggle('match', mod === originalHash);
  collisionCard.classList.toggle('ready', collisionReady);
  collisionCard.classList.toggle('miss', changed && !collisionReady);
  addressInput.classList.toggle('ready', collisionReady);

  if (!changed) {
    collisionReadout.textContent = 'Original message still unchanged.';
    collisionSubtext.textContent = 'Edit the address to create a different message.';
    statusDot.className = 'status-dot idle';
    statusMsg.textContent = 'Edit the address and watch the live hash.';
    statusMsg.className = 'status-msg';
    statusPill.textContent = 'AWAITING COLLISION';
  } else if (collisionReady) {
    collisionReadout.textContent = 'Collision ready.';
    collisionSubtext.textContent = 'Different address, same hash, Bamboo Street achieved.';
    statusDot.className = 'status-dot success';
    statusMsg.textContent = 'Perfect. The forged message collides with the original.';
    statusMsg.className = 'status-msg success';
    statusPill.textContent = 'HASH MATCH';
  } else if (!bamboo) {
    collisionReadout.textContent = 'Different message, wrong street.';
    collisionSubtext.textContent = 'The forged address must be a number followed by Bamboo Street.';
    statusDot.className = 'status-dot active';
    statusMsg.textContent = 'Good start. Now redirect the scroll to Bamboo Street.';
    statusMsg.className = 'status-msg';
    statusPill.textContent = 'ADDRESS CHANGED';
  } else {
    collisionReadout.textContent = 'Bamboo Street set, hash still off.';
    collisionSubtext.textContent = `Original hash ${padHash(originalHash)} vs live hash ${padHash(mod)}.`;
    statusDot.className = 'status-dot active';
    statusMsg.textContent = 'Adjust the house number until the live hash matches the original.';
    statusMsg.className = 'status-msg';
    statusPill.textContent = 'CHECK COLLISION VALUE';
  }

  autoSizeAddressInput();
  return { currentAddress, mod, collisionReady, bamboo, changed };
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
    resultMsg.textContent = 'The message now points to Bamboo Street, but the hash still matches the original transmission. Shadow Claw would accept the forged note.';
    retryBtn.textContent = 'Reset Mission';
    launchConfetti();
  } else {
    resultCard.className = 'result-card fail-card';
    resultIcon.textContent = '☠️';
    resultTitle.className = 'result-title lose';
    resultTitle.textContent = 'Collision Failed';

    if (!state.changed) {
      resultMsg.textContent = 'The message has not changed yet. Edit the address so the forged note is different from the original.';
    } else if (!state.bamboo) {
      resultMsg.textContent = 'The forged address must be a number followed by Bamboo Street. Change the address, then check the hash again.';
    } else {
      resultMsg.textContent = 'Not quite. Check the original hash value and adjust the house number until the live hash matches it exactly.';
    }

    retryBtn.textContent = 'Keep Editing';
  }

  resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

retryBtn.addEventListener('click', () => {
  if (solved) {
    solved = false;
    addressInput.disabled = false;
    addressInput.value = ORIGINAL_ADDRESS;
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
