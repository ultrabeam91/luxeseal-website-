/* ═══════════════════════════════════════
   LUXESeal — Main JS
   ═══════════════════════════════════════ */

// ─── Popup ───
const popupOverlay = document.getElementById('popupOverlay');
const popupClose   = document.getElementById('popupClose');
const popupSkip    = document.getElementById('popupSkip');
const popupForm    = document.getElementById('popupForm');

function closePopup() { popupOverlay.classList.add('hidden'); }

popupClose.addEventListener('click', closePopup);
popupSkip.addEventListener('click', closePopup);
popupOverlay.addEventListener('click', e => { if (e.target === popupOverlay) closePopup(); });
document.getElementById('popupBookBtn').addEventListener('click', closePopup);

popupForm.addEventListener('submit', e => {
  e.preventDefault();
  const btn = popupForm.querySelector('.btn');
  btn.innerHTML = '<i class="fas fa-check"></i> You\'re on the list!';
  btn.style.background = '#4ecdc4';
  btn.style.color = '#07101f';
  setTimeout(closePopup, 1800);
});

// ─── Nav scroll ───
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ─── Mobile menu ───
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  hamburger.innerHTML = mobileMenu.classList.contains('open')
    ? '<i class="fas fa-times"></i>'
    : '<i class="fas fa-bars"></i>';
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
  });
});

// ─── Smooth scroll ───
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    }
  });
});

// ─── FAQ accordion ───
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

/* ═══════════════════════════════════════
   60-SECOND BOOKING FLOW
   ═══════════════════════════════════════ */

const SERVICES = {
  individual: [
    { id: 'standard', name: 'Standard Notarization', icon: 'fa-file-signature', price: 75, hasDocCount: true },
    { id: 'legal', name: 'Legal & Estate Documents', icon: 'fa-balance-scale', price: 150 },
  ],
  business: [
    { id: 'business_docs', name: 'Business & Corporate Docs', icon: 'fa-building', price: 125 },
    { id: 'standard', name: 'Standard Notarization', icon: 'fa-file-signature', price: 75, hasDocCount: true },
  ],
  realestate: [
    { id: 'loan_signing', name: 'Loan Signing / Real Estate', icon: 'fa-home', price: 200 },
    { id: 'standard', name: 'Standard Notarization', icon: 'fa-file-signature', price: 75, hasDocCount: true },
  ],
  legal: [
    { id: 'legal', name: 'Legal & Estate Documents', icon: 'fa-balance-scale', price: 150 },
    { id: 'apostille', name: 'Apostille Assistance', icon: 'fa-globe', price: 275 },
    { id: 'standard', name: 'Standard Notarization', icon: 'fa-file-signature', price: 75, hasDocCount: true },
  ],
};

let state = {
  segment: null,
  segmentLabel: '',
  service: null,
  serviceName: '',
  servicePrice: 0,
  hasDocCount: false,
  docCount: 1,
  travel: 0,
  travelLabel: '0–15 miles',
};

// ─── Step indicators ───
function setActiveStep(n) {
  [1, 2, 3].forEach(i => {
    const el = document.getElementById(`step-ind-${i}`);
    el.classList.remove('active', 'done');
    if (i < n) el.classList.add('done');
    if (i === n) el.classList.add('active');
  });
}

function showPanel(n) {
  document.querySelectorAll('.flow-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`flow-step-${n}`)?.classList.add('active');
  setActiveStep(n);
}

// ─── Step 1: Segment selection ───
document.querySelectorAll('.segment-card').forEach(card => {
  card.addEventListener('click', () => {
    const seg = card.dataset.segment;
    state.segment = seg;
    state.segmentLabel = card.querySelector('.segment-title').textContent;
    document.querySelectorAll('.segment-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    // Build service options for this segment
    buildServiceOptions(seg);

    setTimeout(() => showPanel(2), 300);
  });
});

// ─── Step 2: Build service options ───
function buildServiceOptions(segment) {
  const container = document.getElementById('serviceOptions');
  container.innerHTML = '';
  const services = SERVICES[segment] || [];

  services.forEach(svc => {
    const btn = document.createElement('button');
    btn.className = 'service-opt';
    btn.dataset.id = svc.id;
    btn.dataset.price = svc.price;
    btn.dataset.name = svc.name;
    btn.dataset.doccount = svc.hasDocCount ? '1' : '0';
    btn.innerHTML = `
      <div class="service-opt-left">
        <i class="fas ${svc.icon}"></i>
        <span class="service-opt-name">${svc.name}</span>
      </div>
      <span class="service-opt-price">$${svc.price}${svc.hasDocCount ? '+' : ''}</span>
    `;
    btn.addEventListener('click', () => selectService(btn, svc));
    container.appendChild(btn);
  });

  // Reset calculator
  state.service = null;
  state.servicePrice = 0;
  state.hasDocCount = false;
  state.docCount = 1;
  document.getElementById('docCount').textContent = '1';
  document.getElementById('docCountGroup').style.display = 'none';
  updatePriceSummary();
}

function selectService(btn, svc) {
  document.querySelectorAll('.service-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.service = svc.id;
  state.serviceName = svc.name;
  state.servicePrice = svc.price;
  state.hasDocCount = !!svc.hasDocCount;
  document.getElementById('docCountGroup').style.display = svc.hasDocCount ? 'block' : 'none';
  updatePriceSummary();
}

// ─── Doc counter ───
document.getElementById('docPlus').addEventListener('click', () => {
  state.docCount = Math.min(20, state.docCount + 1);
  document.getElementById('docCount').textContent = state.docCount;
  updatePriceSummary();
});
document.getElementById('docMinus').addEventListener('click', () => {
  state.docCount = Math.max(1, state.docCount - 1);
  document.getElementById('docCount').textContent = state.docCount;
  updatePriceSummary();
});

// ─── Travel selection ───
document.querySelectorAll('.travel-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.travel-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.travel = parseInt(btn.dataset.travel);
    state.travelLabel = btn.dataset.label;
    updatePriceSummary();
  });
});

// ─── Price calculator ───
function calcTotal() {
  if (!state.service) return null;
  let base = state.servicePrice;
  let extraDocs = 0;
  if (state.hasDocCount && state.docCount > 2) {
    extraDocs = (state.docCount - 2) * 25;
  }
  return { base, extraDocs, travel: state.travel, total: base + extraDocs + state.travel };
}

function updatePriceSummary() {
  const calc = calcTotal();
  const btn = document.getElementById('proceedToBook');

  if (!calc) {
    document.getElementById('ps-service-label').textContent = 'Select a service';
    document.getElementById('ps-service-price').textContent = '—';
    document.getElementById('ps-extra-line').style.display = 'none';
    document.getElementById('ps-travel-line').style.display = 'none';
    document.getElementById('ps-total').textContent = '$—';
    btn.disabled = true;
    return;
  }

  document.getElementById('ps-service-label').textContent = state.serviceName;
  document.getElementById('ps-service-price').textContent = `$${calc.base}`;

  if (calc.extraDocs > 0) {
    document.getElementById('ps-extra-line').style.display = 'flex';
    document.getElementById('ps-extra-label').textContent = `${state.docCount - 2} extra doc(s)`;
    document.getElementById('ps-extra-price').textContent = `$${calc.extraDocs}`;
  } else {
    document.getElementById('ps-extra-line').style.display = 'none';
  }

  if (calc.travel > 0) {
    document.getElementById('ps-travel-line').style.display = 'flex';
    document.getElementById('ps-travel-label').textContent = `Travel (${state.travelLabel})`;
    document.getElementById('ps-travel-price').textContent = `$${calc.travel}`;
  } else {
    document.getElementById('ps-travel-line').style.display = 'none';
  }

  document.getElementById('ps-total').textContent = `$${calc.total}`;
  btn.disabled = false;
}

// ─── Proceed to booking ───
document.getElementById('proceedToBook').addEventListener('click', () => {
  const calc = calcTotal();
  if (!calc) return;

  // Populate booking summary
  document.getElementById('bs-segment').textContent = state.segmentLabel;
  document.getElementById('bs-service').textContent = state.serviceName;
  document.getElementById('bs-total').textContent = `$${calc.total}`;

  if (calc.extraDocs > 0) {
    document.getElementById('bs-extra-row').style.display = 'flex';
    document.getElementById('bs-extra').textContent = `+$${calc.extraDocs}`;
  } else {
    document.getElementById('bs-extra-row').style.display = 'none';
  }

  if (calc.travel > 0) {
    document.getElementById('bs-travel-row').style.display = 'flex';
    document.getElementById('bs-travel').textContent = `+$${calc.travel}`;
  } else {
    document.getElementById('bs-travel-row').style.display = 'none';
  }

  // Populate hidden fields
  document.getElementById('hf-service').value = state.serviceName;
  document.getElementById('hf-segment').value = state.segmentLabel;
  document.getElementById('hf-total').value = `$${calc.total}`;
  document.getElementById('hf-travel').value = state.travelLabel;

  showPanel(3);
});

// ─── Back buttons ───
document.getElementById('backTo1').addEventListener('click', () => showPanel(1));
document.getElementById('backTo2').addEventListener('click', () => showPanel(2));

// ─── Form submit ───
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    // If Formspree not yet set up, simulate success
    const action = bookingForm.action;
    if (action.includes('YOUR_FORM_ID')) {
      setTimeout(() => {
        document.querySelectorAll('.flow-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('flow-success').classList.add('active');
        setActiveStep(3);
      }, 1200);
      return;
    }

    try {
      const res = await fetch(action, {
        method: 'POST',
        body: new FormData(bookingForm),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        document.querySelectorAll('.flow-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('flow-success').classList.add('active');
      } else {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Appointment Request';
        btn.disabled = false;
        alert('Something went wrong. Please try again or contact us directly.');
      }
    } catch {
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Appointment Request';
      btn.disabled = false;
    }
  });
}

function resetFlow() {
  state = { segment: null, segmentLabel: '', service: null, serviceName: '', servicePrice: 0, hasDocCount: false, docCount: 1, travel: 0, travelLabel: '0–15 miles' };
  document.querySelectorAll('.segment-card').forEach(c => c.classList.remove('selected'));
  showPanel(1);
  bookingForm?.reset();
}

// ─── Contact form ───
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    const btn = contactForm.querySelector('.form-submit');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
  });
}
