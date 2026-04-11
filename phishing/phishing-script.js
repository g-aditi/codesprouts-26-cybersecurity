// OPERATION SHADOW INK — Phase 2: Phishing
// Teach real spam email patterns: spoofed senders, alarm subject lines,
// urgency language, threats of account termination, and pressure closings.
//
// Scoring: 8 fields (sender, target, subject, word1–word5).
// Each spam selection = 12.5 pts. Threshold = 87.5% (7 of 8 must be spam).

const THRESHOLD = 70.5;

const HINTS = [
  'Spam emails use lookalike domains to fake authority. Real orgs use clean domains like "@shadowclaw.org". Phishing addresses hide in subdomains: "verify-now.net", "account-alert.com", or replace letters with numbers ("sh4d0w").',
  'Subject lines are the first thing a spam filter reads. Legitimate subjects are calm and specific ("Mission Update: Sector Redeployment"). Phishing emails require action to be taken, and therefore, use alarm words: URGENT, FINAL NOTICE, CRITICAL ALERT.',
  'Every part of the email matters. A polite sign-off ("Best regards") looks legitimate. A phishing email would have a closing remark that emphasizes action to be taken.'
];

// 3 non-spam options first, then 3 spam options in each field.
// Non-spam → email reads like a normal operational update.
// All spam  → email looks like a textbook phishing attempt.
const CHOICES = {
  sender: {
    label: 'Sender Address',
    desc: 'Is the sender\'s email spoofed or from a suspicious domain?',
    options: [
      { value: 's1', text: 'operations@shadowclaw.org',                         spam: false },
      { value: 's2', text: 'dispatch@shadowclaw.org',                           spam: false },
      { value: 's3', text: 'commander.zhao@shadowclaw.org',                     spam: false },
      { value: 's4', text: 'URGENT-REDFANG@sh4d0wcl4w-alert.com',              spam: true  },
      { value: 's5', text: 'no-reply@shadowclaw-priority.verify-now.net',       spam: true  },
      { value: 's6', text: 'security@shadowclaw-account-verify.com',            spam: true  },
    ]
  },
  subject: {
    label: 'Subject Line',
    desc: 'Does the subject contain alarm words or excessive punctuation?',
    options: [
      { value: 'sub1', text: 'Mission Update: Sector Redeployment',                          spam: false },
      { value: 'sub2', text: 'Re: Yang Vault Assignment',                                    spam: false },
      { value: 'sub3', text: 'Operational Notice — Field Redeployment',                     spam: false },
      { value: 'sub4', text: '⚠️ URGENT: Action Required: Confirm Your Assignment!!!',              spam: true  },
      { value: 'sub5', text: '🔴 FINAL NOTICE: Verify Location IMMEDIATELY',                spam: true  },
      { value: 'sub6', text: 'REMINDER: Pending assignment confirmation',           spam: true  },
    ]
  },
  word1: {
    label: 'Salutation',
    desc: 'Does the greeting sound personalized to the recipient?',
    options: [
      { value: 'w1a', text: 'Hello,',      spam: false },
      { value: 'w1b', text: 'Greetings,',  spam: false },
      { value: 'w1c', text: 'Team,',       spam: false },
      { value: 'w1d', text: 'Hello Commander Zhao,',      spam: true },
      { value: 'w1e', text: 'Greetings Raider Kosuke,',   spam: true },
      { value: 'w1f', text: 'Dear Unit 7,', spam: true },
    ]
  },
  word2: {
    label: 'Status Change',
    desc: 'Does it correctly convey the status of the mission?',
    options: [
      { value: 'w2a', text: 'updated',  spam: true },
      { value: 'w2b', text: 'revised',  spam: true },
      { value: 'w2c', text: 'amended',  spam: true },
      { value: 'w2d', text: 'canceled',               spam: false },
      { value: 'w2e', text: 'revoked', spam: false },
      { value: 'w2f', text: 'terminated',   spam: false },
    ]
  },
  word3: {
    label: 'Action Phrase',
    desc: 'Does it contain an aggressive or bizarre action verb?',
    options: [
      { value: 'w3a', text: 'report to',  spam: false },
      { value: 'w3b', text: 'proceed to', spam: false },
      { value: 'w3c', text: 'deploy to',  spam: false },
      { value: 'w3d', text: 'CLAIM INFINITE YOUTH at',     spam: true },
      { value: 'w3e', text: 'WIN THE LOTTERY OF YOUR LIFETIME at', spam: true }
    ]
  },
  word4: {
    label: 'Body Text',
    desc: 'Does it include a subtle request or link to review?',
    options: [
      // Legit
      { value: 'w4a', text: 'Please confirm once you arrive at the assigned location.', spam: false },
      { value: 'w4b', text: 'Let us know when the redeployment is complete.', spam: false },
      { value: 'w4c', text: 'Follow standard protocol and report status as usual.', spam: false },
      { value: 'w4d', text: 'Please review the updated instructions ASAP at sc-command.internal/assignments.', spam: true },
      { value: 'w4e', text: 'Click on this link to confirm your assignment: confirm-assignment.com/fwerfewregt.', spam: true },
      { value: 'w4f', text: 'Check the updated deployment details here RIGHT NOW: sc-secure-verify.net/login.', spam: true },
    ]
  },
  word5: {
    label: 'Closing Line',
    desc: 'Does the sign-off sound normal but still pressure a response?',
    options: [
      // Legit (normal professional closings)
      { value: 'w5a', text: 'Best regards,', spam: false },
      { value: 'w5b', text: 'Sincerely,', spam: false },
      { value: 'w5c', text: 'Kind regards,', spam: false },
  
      // Phishing (subtle pressure, not loud)
      { value: 'w5d', text: 'Confirm once completed.', spam: true },
      { value: 'w5e', text: 'Respond to this email once you have read the instructions.', spam: true },
      { value: 'w5f', text: 'Awaiting your confirmation.', spam: true },
    ]
  }
};

const FIELD_IDS = ['sender', 'subject', 'word1', 'word2', 'word3', 'word4', 'word5'];

let hintsUsed = 0;
let solved    = false;

// DOM refs
const scoreNumberEl   = document.getElementById('score-number');
const scoreBarFillEl  = document.getElementById('score-bar-fill');
const scoreVerdictEl  = document.getElementById('score-verdict');
const analyzerTagEl   = document.getElementById('analyzer-tag');
const dimensionListEl = document.getElementById('dimension-list');
const spamAlertBar    = document.getElementById('spam-alert-bar');
const submitBtn       = document.getElementById('submit-btn');
const resultCard      = document.getElementById('result-card');
const retryBtn        = document.getElementById('retry-btn');
const hintDisplay     = document.getElementById('hint-display');

// ── Populate selects ────────────────────────────────────────────────────────
function populateSelects() {
  for (const [id, config] of Object.entries(CHOICES)) {
    const sel = document.getElementById(`sel-${id}`);
    if (!sel) continue;
    for (const opt of config.options) {
      const el = document.createElement('option');
      el.value = opt.value;
      el.textContent = opt.text;
      sel.appendChild(el);
    }
  }
}

// ── Build dimension checklist ───────────────────────────────────────────────
function buildDimensionList() {
  dimensionListEl.innerHTML = '';
  for (const id of FIELD_IDS) {
    const { label, desc } = CHOICES[id];
    const item = document.createElement('div');
    item.className = 'dimension-item';
    item.id = `dim-${id}`;
    item.innerHTML = `
      <span class="dim-status" id="dimstatus-${id}">○</span>
      <div class="dim-text">
        <span class="dim-label">${label}</span>
        <span class="dim-desc">${desc}</span>
      </div>`;
    dimensionListEl.appendChild(item);
  }
}

// ── Get spam state for a field ──────────────────────────────────────────────
function getState(id) {
  const sel = document.getElementById(`sel-${id}`);
  if (!sel || !sel.value) return null;
  const opt = CHOICES[id].options.find(o => o.value === sel.value);
  return opt ? opt.spam : null;
}

// ── Recompute and repaint ───────────────────────────────────────────────────
function updateState() {
  let spamCount = 0;

  for (const id of FIELD_IDS) {
    const state    = getState(id);
    const statusEl = document.getElementById(`dimstatus-${id}`);
    const itemEl   = document.getElementById(`dim-${id}`);
    const sel      = document.getElementById(`sel-${id}`);

    sel.classList.remove('spam-selected', 'legit-selected');
    itemEl.classList.remove('dim-spam', 'dim-legit');

    if (state === true) {
      spamCount++;
      statusEl.textContent = '✓';
      statusEl.className   = 'dim-status dim-ok';
      itemEl.classList.add('dim-spam');
      sel.classList.add('spam-selected');
    } else if (state === false) {
      statusEl.textContent = '✗';
      statusEl.className   = 'dim-status dim-miss';
      itemEl.classList.add('dim-legit');
      sel.classList.add('legit-selected');
    } else {
      statusEl.textContent = '○';
      statusEl.className   = 'dim-status';
    }
  }

  const score        = (spamCount / FIELD_IDS.length) * 100;
  const scoreRounded = Math.round(score);

  scoreNumberEl.textContent  = `${scoreRounded}%`;
  scoreBarFillEl.style.width = `${scoreRounded}%`;
  scoreBarFillEl.classList.remove('fill-low', 'fill-mid', 'fill-high');

  // Spam alert bar appears when half the signals are phishing
  spamAlertBar.style.display = score >= 50 ? 'flex' : 'none';

  if (score >= THRESHOLD) {
    scoreBarFillEl.classList.add('fill-high');
    scoreNumberEl.style.color  = 'var(--color-primary)';
    scoreVerdictEl.textContent = 'Convincing phishing detected. Hit Send.';
    scoreVerdictEl.className   = 'score-verdict verdict-success';
    analyzerTagEl.textContent  = 'PHISHING DETECTED';
  } else if (score >= 50) {
    scoreBarFillEl.classList.add('fill-mid');
    scoreNumberEl.style.color  = 'var(--color-gold)';
    scoreVerdictEl.textContent = 'Partially convincing — keep swapping in phishing phrases.';
    scoreVerdictEl.className   = 'score-verdict';
    analyzerTagEl.textContent  = 'PARTIALLY CONVINCING';
  } else if (score > 0) {
    scoreBarFillEl.classList.add('fill-low');
    scoreNumberEl.style.color  = 'var(--color-text-muted)';
    scoreVerdictEl.textContent = 'Too many legitimate signals. Choose phishing phrases.';
    scoreVerdictEl.className   = 'score-verdict';
    analyzerTagEl.textContent  = 'NOT CONVINCING';
  } else {
    scoreNumberEl.style.color  = 'var(--color-gold)';
    scoreVerdictEl.textContent = 'Select all fields to begin analysis.';
    scoreVerdictEl.className   = 'score-verdict';
    analyzerTagEl.textContent  = 'AWAITING INPUT';
  }

  return { score, spamCount };
}

// ── Hints ───────────────────────────────────────────────────────────────────
[1, 2, 3].forEach(n => {
  document.getElementById(`hint-btn-${n}`).addEventListener('click', () => {
    if (hintsUsed >= n) return;
    hintsUsed = n;
    hintDisplay.textContent = `💡 ${HINTS[n - 1]}`;
    for (let i = 1; i <= n; i++) document.getElementById(`hint-btn-${i}`).disabled = true;
  });
});

// ── Submit (Send button) ────────────────────────────────────────────────────
// The goal is a convincing phish, not the most extreme spam.
// Students should land in a "middle-high" suspicious range.
const IDEAL_MIN = 62.5;
const IDEAL_MAX = 70.5;
const MIN_SPAM_FIELDS = 5;

function getMissionResult(score, spamCount) {
  if (spamCount >= MIN_SPAM_FIELDS && score >= IDEAL_MIN && score <= IDEAL_MAX) {
    return 'success';
  }
  if (score > IDEAL_MAX) {
    return 'too-obvious';
  }
  if (score >= 50) {
    return 'almost';
  }
  return 'not-enough';
}

submitBtn.addEventListener('click', () => {
  const { score, spamCount } = updateState();
  const result = getMissionResult(score, spamCount);

  resultCard.style.cssText = 'display:flex;flex-direction:column;align-items:center;';

  if (result === 'success') {
    solved = true;
    submitBtn.disabled = true;

    for (const id of FIELD_IDS) {
      const sel = document.getElementById(`sel-${id}`);
      if (sel) sel.disabled = true;
    }

    resultCard.className = 'result-card success-card';
    document.getElementById('result-icon').textContent = '🎭';
    document.getElementById('result-title').className = 'result-title win';
    document.getElementById('result-title').textContent = 'Convincing Phishing Email!';
    document.getElementById('result-msg').textContent =
      'The message is suspicious enough to be phishing, but not so exaggerated that it looks like obvious spam.';
    launchConfetti();
  } else if (result === 'too-obvious') {
    resultCard.className = 'result-card fail-card';
    document.getElementById('result-icon').textContent = '⚠️';
    document.getElementById('result-title').className = 'result-title lose';
    document.getElementById('result-title').textContent = 'Too Obvious';
    document.getElementById('result-msg').textContent =
      'This reads like spam. Try making the message more realistic and less theatrical.';
  } else if (result === 'almost') {
    resultCard.className = 'result-card fail-card';
    document.getElementById('result-icon').textContent = '⚠️';
    document.getElementById('result-title').className = 'result-title lose';
    document.getElementById('result-title').textContent = 'Close, But Not Quite';
    document.getElementById('result-msg').textContent =
      'The message has some suspicious signals, but it is not yet convincing enough for this exercise.';
  } else {
    resultCard.className = 'result-card fail-card';
    document.getElementById('result-icon').textContent = '⚠️';
    document.getElementById('result-title').className = 'result-title lose';
    document.getElementById('result-title').textContent = 'Not Suspicious Enough';
    document.getElementById('result-msg').textContent =
      'The message needs more phishing indicators before it counts as a convincing attempt.';
  }

  resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ── Retry ───────────────────────────────────────────────────────────────────
retryBtn.addEventListener('click', () => {
  solved = false;
  submitBtn.disabled = false;
  hintDisplay.textContent = '';
  hintsUsed = 0;
  [1, 2, 3].forEach(n => { document.getElementById(`hint-btn-${n}`).disabled = false; });
  for (const id of FIELD_IDS) {
    const sel = document.getElementById(`sel-${id}`);
    if (sel) { sel.value = ''; sel.disabled = false; }
  }
  resultCard.style.display = 'none';
  updateState();
});

// ── Confetti ────────────────────────────────────────────────────────────────
function launchConfetti() {
  const c = document.getElementById('confetti-container');
  c.innerHTML = '';
  const colors = ['#c0392b', '#c9a84c', '#6dbf67', '#e8e0d5', '#fff'];
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    const s = Math.random() * 7 + 4;
    p.style.cssText = `left:${Math.random() * 100}vw;width:${s}px;height:${s}px;background:${colors[Math.floor(Math.random() * 5)]};border-radius:${Math.random() > .5 ? '50%' : '2px'};animation-duration:${Math.random() * 2 + 1.5}s;animation-delay:${Math.random() * .8}s;`;
    c.appendChild(p);
  }
  setTimeout(() => { c.innerHTML = ''; }, 4500);
}

// ── Theme toggle ─────────────────────────────────────────────────────────────
(function () {
  const t = document.querySelector('[data-theme-toggle]');
  const r = document.documentElement;
  let theme = 'dark';
  r.setAttribute('data-theme', theme);
  t?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    r.setAttribute('data-theme', theme);
    t.innerHTML = theme === 'dark'
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  });
})();

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  populateSelects();
  buildDimensionList();
  for (const id of FIELD_IDS) {
    const sel = document.getElementById(`sel-${id}`);
    if (sel) sel.addEventListener('change', () => { if (!solved) updateState(); });
  }
  updateState();
}

init();
