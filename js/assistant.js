/* ═══════════════════════════════════════
   LUXE AI Assistant — Powered by Claude
   ═══════════════════════════════════════ */

const chatBubble  = document.getElementById('chatBubble');
const chatWindow  = document.getElementById('chatWindow');
const chatClose   = document.getElementById('chatClose');
const chatMsgs    = document.getElementById('chatMessages');
const chatInput   = document.getElementById('chatInput');
const chatSend    = document.getElementById('chatSend');
const chatIcon    = document.getElementById('chatIcon');
const chatPreview = document.getElementById('chatPreview');

let isOpen   = false;
let started  = false;
let history  = [];

// ─── Toggle ───
chatBubble.addEventListener('click', () => {
  isOpen = !isOpen;
  chatWindow.classList.toggle('open', isOpen);
  chatIcon.className = isOpen ? 'fas fa-times' : 'fas fa-comment-dots';
  if (chatPreview) chatPreview.style.display = isOpen ? 'none' : '';
  if (!started && isOpen) { started = true; greet(); }
  if (isOpen) setTimeout(() => chatInput.focus(), 300);
});

chatClose.addEventListener('click', () => {
  isOpen = false;
  chatWindow.classList.remove('open');
  chatIcon.className = 'fas fa-comment-dots';
  if (chatPreview) chatPreview.style.display = '';
});

setTimeout(() => { if (chatPreview) chatPreview.style.display = 'none'; }, 6000);

// ─── Send ───
chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  chatSend.disabled = true;

  addMsg('user', text);
  history.push({ role: 'user', content: text });

  const typing = addTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });

    const data = await res.json();
    typing.remove();

    if (data.content) {
      addMsg('bot', data.content);
      history.push({ role: 'assistant', content: data.content });
    } else {
      addMsg('bot', "I'm having trouble connecting right now. Please try again or use the booking form above.");
    }
  } catch {
    typing.remove();
    addMsg('bot', "Something went wrong. Please use the booking form above or reach out directly.");
  }

  chatSend.disabled = false;
  chatInput.focus();
}

// ─── Greeting ───
async function greet() {
  const typing = addTyping();
  await delay(800);
  typing.remove();
  addMsg('bot', "Hi! I'm <strong>LUXE</strong>, your LUXESeal booking assistant. I can help you get a price quote, learn about our services, or guide you through booking. What can I help you with?");
  history.push({ role: 'assistant', content: "Hi! I'm LUXE, your LUXESeal booking assistant. I can help you get a price quote, learn about our services, or guide you through booking. What can I help you with?" });
}

// ─── Helpers ───
function addMsg(role, html) {
  const wrap = document.createElement('div');
  wrap.className = `chat-msg ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble-msg';
  bubble.innerHTML = html;
  wrap.appendChild(bubble);
  chatMsgs.appendChild(wrap);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return wrap;
}

function addTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg bot';
  wrap.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
  chatMsgs.appendChild(wrap);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return wrap;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
