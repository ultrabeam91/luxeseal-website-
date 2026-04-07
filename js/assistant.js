/* ═══════════════════════════════════════
   LUXE Chat Assistant
   ═══════════════════════════════════════ */

const chatBubble  = document.getElementById('chatBubble');
const chatWindow  = document.getElementById('chatWindow');
const chatClose   = document.getElementById('chatClose');
const chatMsgs    = document.getElementById('chatMessages');
const chatOpts    = document.getElementById('chatOptions');
const chatIcon    = document.getElementById('chatIcon');
const chatPreview = document.getElementById('chatPreview');

let isOpen = false;
let started = false;

// ─── Toggle window ───
chatBubble.addEventListener('click', () => {
  isOpen = !isOpen;
  chatWindow.classList.toggle('open', isOpen);
  chatIcon.className = isOpen ? 'fas fa-times' : 'fas fa-comment-dots';
  if (chatPreview) chatPreview.style.display = isOpen ? 'none' : '';
  if (!started && isOpen) {
    started = true;
    startChat();
  }
});

chatClose.addEventListener('click', () => {
  isOpen = false;
  chatWindow.classList.remove('open');
  chatIcon.className = 'fas fa-comment-dots';
  if (chatPreview) chatPreview.style.display = '';
});

// Auto-hide preview after 5s
setTimeout(() => {
  if (chatPreview) chatPreview.style.display = 'none';
}, 5000);

// ─── Message helpers ───
function addBotMsg(text, delay = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      // Typing indicator
      const typing = document.createElement('div');
      typing.className = 'chat-msg bot';
      typing.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
      chatMsgs.appendChild(typing);
      scrollDown();

      setTimeout(() => {
        typing.remove();
        const msg = document.createElement('div');
        msg.className = 'chat-msg bot';
        msg.innerHTML = `<div class="chat-bubble-msg">${text}</div>`;
        chatMsgs.appendChild(msg);
        scrollDown();
        resolve();
      }, 900);
    }, delay);
  });
}

function addUserMsg(text) {
  const msg = document.createElement('div');
  msg.className = 'chat-msg user';
  msg.innerHTML = `<div class="chat-bubble-msg">${text}</div>`;
  chatMsgs.appendChild(msg);
  scrollDown();
}

function setOptions(options) {
  chatOpts.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'chat-opt';
    btn.textContent = opt.label;
    btn.addEventListener('click', () => {
      addUserMsg(opt.label);
      chatOpts.innerHTML = '';
      opt.action();
    });
    chatOpts.appendChild(btn);
  });
}

function scrollDown() {
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

// ─── Chat flow ───
async function startChat() {
  await addBotMsg("Hi! I'm <strong>LUXE</strong>, your LUXESeal booking assistant. 👋");
  await addBotMsg("I can help you get a price quote, book an appointment, or learn about our services. What can I help you with?", 400);
  setOptions([
    { label: '📋 I need something notarized', action: flowNeedNotarized },
    { label: '💰 Get a price quote', action: flowQuote },
    { label: '📦 Tell me about your packages', action: flowPackages },
    { label: '🤝 I want to become a partner', action: flowPartner },
  ]);
}

async function flowNeedNotarized() {
  await addBotMsg("Great! Let's get you taken care of. What type of document do you need notarized?");
  setOptions([
    { label: '📄 Personal document (affidavit, consent, etc.)', action: () => flowSelectTravel('Standard Notarization', 75, true) },
    { label: '🏠 Loan signing / Real estate closing', action: () => flowSelectTravel('Loan Signing / Real Estate', 200, false) },
    { label: '🏢 Business or corporate document', action: () => flowSelectTravel('Business & Corporate Docs', 125, false) },
    { label: '⚖️ Will, trust, or power of attorney', action: () => flowSelectTravel('Legal & Estate Documents', 150, false) },
    { label: '🌍 Apostille assistance', action: () => flowSelectTravel('Apostille Assistance', 275, false) },
    { label: "🤷 I'm not sure", action: flowNotSure },
  ]);
}

async function flowSelectTravel(serviceName, price, hasDocCount) {
  if (hasDocCount) {
    await addBotMsg(`Perfect — <strong>${serviceName}</strong> starts at <strong>$${price}</strong>. How many documents do you need notarized?`);
    setOptions([
      { label: '1 document', action: () => flowTravel(serviceName, price, 1) },
      { label: '2 documents', action: () => flowTravel(serviceName, price, 2) },
      { label: '3 documents (+$25)', action: () => flowTravel(serviceName, price + 25, 3) },
      { label: '4 documents (+$50)', action: () => flowTravel(serviceName, price + 50, 4) },
      { label: '5+ documents', action: () => flowTravel(serviceName, price + 75, 5) },
    ]);
  } else {
    await addBotMsg(`Got it — <strong>${serviceName}</strong> is <strong>$${price}</strong>. Where are you located relative to DeKalb County?`);
    showTravelOptions(serviceName, price);
  }
}

async function flowTravel(serviceName, price, docCount) {
  await addBotMsg(`Got it — ${docCount} document${docCount > 1 ? 's' : ''}. Now, how far are you from DeKalb County, GA?`);
  showTravelOptions(serviceName, price);
}

function showTravelOptions(serviceName, price) {
  setOptions([
    { label: '📍 Within 15 miles — no travel fee', action: () => flowShowTotal(serviceName, price, 0) },
    { label: '🚗 15–30 miles away (+$35)', action: () => flowShowTotal(serviceName, price, 35) },
    { label: '🚗 30+ miles away (+$60)', action: () => flowShowTotal(serviceName, price, 60) },
  ]);
}

async function flowShowTotal(serviceName, price, travel) {
  const total = price + travel;
  await addBotMsg(`Here's your estimate:<br><br><strong>${serviceName}</strong>: $${price}${travel > 0 ? `<br>Travel fee: $${travel}` : ''}<br><br>💰 <strong>Total: $${total}</strong><br><br>Ready to book? I'll take you to our 60-second booking form!`);
  setOptions([
    { label: '✅ Yes, book my appointment!', action: () => flowGoBook() },
    { label: '🔄 Start over', action: () => { chatOpts.innerHTML = ''; startChat(); } },
  ]);
}

function flowGoBook() {
  chatWindow.classList.remove('open');
  isOpen = false;
  chatIcon.className = 'fas fa-comment-dots';
  const target = document.getElementById('book');
  if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
}

async function flowQuote() {
  await addBotMsg("Of course! Let's calculate your price. What service do you need?");
  setOptions([
    { label: '📄 Standard Notarization', action: () => flowSelectTravel('Standard Notarization', 75, true) },
    { label: '🏠 Loan Signing / Real Estate', action: () => flowSelectTravel('Loan Signing / Real Estate', 200, false) },
    { label: '🏢 Business & Corporate Docs', action: () => flowSelectTravel('Business & Corporate Docs', 125, false) },
    { label: '⚖️ Legal & Estate Documents', action: () => flowSelectTravel('Legal & Estate Documents', 150, false) },
    { label: '🌍 Apostille Assistance', action: () => flowSelectTravel('Apostille Assistance', 275, false) },
  ]);
}

async function flowPackages() {
  await addBotMsg("We have plans for every type of client! Here's a quick overview:<br><br>📋 <strong>Individual</strong> — Pay as you go, standard pricing<br>💼 <strong>Business Bundle</strong> — $200/mo · 5 notarizations + priority scheduling<br>🏠 <strong>Real Estate Pro</strong> — $350/mo · 10 loan signings + top priority<br>🏢 <strong>Corporate Elite</strong> — Custom · Volume pricing + dedicated account manager");
  await addBotMsg("Which one sounds like the right fit for you?", 400);
  setOptions([
    { label: '👤 Individual — Pay as you go', action: () => flowGoBook() },
    { label: '💼 Business Bundle — $200/mo', action: () => flowContact('Business Bundle') },
    { label: '🏠 Real Estate Pro — $350/mo', action: () => flowContact('Real Estate Pro') },
    { label: '🏢 Corporate Elite — Custom', action: () => flowContact('Corporate Elite') },
  ]);
}

async function flowContact(plan) {
  await addBotMsg(`Great choice! The <strong>${plan}</strong> plan is perfect for building a long-term relationship with a dedicated notary partner. Send us a message and we'll get everything set up for you.`);
  setOptions([
    { label: '✉️ Send a message', action: () => { flowGoSection('contact-form'); } },
    { label: '🔙 Back to main menu', action: () => { chatOpts.innerHTML = ''; startChat(); } },
  ]);
}

async function flowPartner() {
  await addBotMsg("We'd love to partner with you! LUXESeal works with real estate agents, title companies, and law firms across Greater Atlanta.");
  await addBotMsg("As a partner, you get priority scheduling, discounted rates, and a reliable notary who shows up on time — every time.", 400);
  setOptions([
    { label: '🏠 I\'m a Real Estate Agent', action: () => flowContact('Real Estate Partnership') },
    { label: '🏦 I\'m from a Title Company', action: () => flowContact('Title Company Partnership') },
    { label: '⚖️ I\'m from a Law Firm', action: () => flowContact('Law Firm Partnership') },
    { label: '🔙 Back to main menu', action: () => { chatOpts.innerHTML = ''; startChat(); } },
  ]);
}

async function flowNotSure() {
  await addBotMsg("No worries at all — that's what I'm here for! Just tell us what you're trying to get signed or certified, and we'll point you in the right direction.");
  setOptions([
    { label: '✉️ Send us a message', action: () => flowGoSection('contact-form') },
    { label: '🔙 Back to main menu', action: () => { chatOpts.innerHTML = ''; startChat(); } },
  ]);
}

function flowGoSection(id) {
  chatWindow.classList.remove('open');
  isOpen = false;
  chatIcon.className = 'fas fa-comment-dots';
  const target = document.getElementById(id);
  if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
}
