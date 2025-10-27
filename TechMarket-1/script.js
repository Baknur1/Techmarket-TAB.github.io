document.addEventListener('DOMContentLoaded', () => {
  // Initialize features
  initializeFormValidation();
  initializeAccordion();
  initializeThemeChanger();
  initializeDateTimeDisplay();
  initAutoReadMoreAndModal(); // main new feature
  initKeyboardShortcuts(); // ESC, arrow nav
  renderProductsIfNeeded('.products-grid'); // optional render if container exists
});

function showGreeting() {
    const greetingElement = document.getElementById("greetingMessage");
    if (!greetingElement) return;

    const currentHour = new Date().getHours();
    let timeOfDay;

    if (currentHour < 12) {
        timeOfDay = "morning";
    } else if (currentHour < 18) {
        timeOfDay = "afternoon";
    } else {
        timeOfDay = "evening";
    }

    let message = "";

    switch (timeOfDay) {
        case "morning":
            message = "Good morning, welcome to TechMarket!";
            break;
        case "afternoon":
            message = "Good afternoon, welcome to TechMarket!";
            break;
        case "evening":
            message = "Good evening, welcome to TechMarket!";
            break;
        default:
            message = "Welcome to TechMarket!";
    }

    greetingElement.textContent = message;
}

document.addEventListener("DOMContentLoaded", showGreeting);

/* ===========================
   FORM VALIDATION
   =========================== */
function initializeFormValidation() {
  const form = document.querySelector('form');
  if (!form) return;

  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    field.addEventListener('blur', validateField);
    field.addEventListener('input', clearFieldError);
  });

  form.addEventListener('submit', handleFormSubmission);
}

function validateField(event) {
  const field = event.target;
  const value = (field.value || '').trim();
  let isValid = true;
  let errorMessage = '';

  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = `${getFieldLabel(field)} is required.`;
  } else if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address.';
    }
  } else if ((field.id === 'firstName' || field.id === 'lastName') && value && value.length < 2) {
    isValid = false;
    errorMessage = `${getFieldLabel(field)} must be at least 2 characters long.`;
  } else if (field.id === 'message' && value && value.length < 10) {
    isValid = false;
    errorMessage = 'Message must be at least 10 characters long.';
  }

  displayFieldError(field, isValid, errorMessage);
  return isValid;
}

function clearFieldError(event) {
  displayFieldError(event.target, true, '');
}

function displayFieldError(field, isValid, errorMessage) {
  if (!field) return;
  field.classList.remove('is-invalid', 'is-valid');
  const existing = field.parentNode ? field.parentNode.querySelector('.error-message') : null;
  if (existing) existing.remove();

  if (!isValid) {
    field.classList.add('is-invalid');
    const div = document.createElement('div');
    div.className = 'error-message text-danger mt-1';
    div.style.fontSize = '0.875rem';
    div.textContent = errorMessage;
    if (field.parentNode) field.parentNode.insertBefore(div, field.nextSibling);
  } else if ((field.value || '').trim()) {
    field.classList.add('is-valid');
  }
}

function getFieldLabel(field) {
  const label = document.querySelector(`label[for="${field.id}"]`);
  return label ? label.textContent.replace('*','').trim() : (field.name || 'This field');
}

function handleFormSubmission(e) {
  e.preventDefault();
  const form = e.target;
  const fields = form.querySelectorAll('input, select, textarea');
  let ok = true;
  fields.forEach(f => {
    if (!validateField({ target: f })) ok = false;
  });

  if (!ok) {
    showInlineAlert(form, 'danger', 'Please fix the errors above and try again.');
    return;
  }

  showInlineAlert(form, 'success', 'Success! Your message has been sent successfully.');
  form.reset();
  fields.forEach(f => {
    f.classList.remove('is-valid', 'is-invalid');
    const err = f.parentNode ? f.parentNode.querySelector('.error-message') : null;
    if (err) err.remove();
  });
}

function showInlineAlert(container, type, message) {
  const existing = container.querySelector('.form-inline-alert');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = `form-inline-alert alert alert-${type} mt-3`;
  div.innerHTML = message;
  container.appendChild(div);
  setTimeout(() => { if (div.parentNode) div.remove(); }, 4500);
}

/* ===========================
   ACCORDION
   =========================== */
function initializeAccordion() {
  const items = document.querySelectorAll('.accordion-item');
  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    if (!header || !content) return;
    header.setAttribute('tabindex', '0');
    header.addEventListener('click', () => toggleAccordion(item, content));
    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
    // ensure closed state
    if (!item.classList.contains('active')) content.style.maxHeight = '0';
  });
}

function toggleAccordion(item, content) {
  const open = item.classList.contains('active');
  // close others
  document.querySelectorAll('.accordion-item').forEach(other => {
    if (other !== item) {
      other.classList.remove('active');
      const oc = other.querySelector('.accordion-content');
      if (oc) oc.style.maxHeight = '0';
      const oi = other.querySelector('.accordion-icon');
      if (oi) oi.textContent = '+';
    }
  });

  const icon = item.querySelector('.accordion-icon');
  if (open) {
    item.classList.remove('active');
    content.style.maxHeight = '0';
    if (icon) icon.textContent = '+';
  } else {
    item.classList.add('active');
    content.style.maxHeight = content.scrollHeight + 'px';
    if (icon) icon.textContent = '−';
  }
}

/* ===========================
   SUBSCRIPTION POPUP (kept)
   =========================== */
function initializeSubscriptionPopup() {
  // create floating button & modal if not exist
  if (!document.querySelector('.subscribe-floating-btn')) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary subscribe-floating-btn';
    btn.textContent = 'Subscribe to Newsletter';
    btn.style.position = 'fixed';
    btn.style.right = '20px';
    btn.style.bottom = '20px';
    btn.style.zIndex = 1200;
    btn.addEventListener('click', openSubscriptionModal);
    document.body.appendChild(btn);
  }
  if (!document.getElementById('subscription-modal')) {
    const modal = document.createElement('div');
    modal.id = 'subscription-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Subscribe</h2>
          <button class="close-btn" type="button">&times;</button>
        </div>
        <div class="modal-body">
          <form id="subscription-form">
            <div class="form-group"><label for="sub-name">Full Name *</label><input id="sub-name" name="name" required></div>
            <div class="form-group"><label for="sub-email">Email *</label><input id="sub-email" name="email" type="email" required></div>
            <div class="form-group"><label><input type="checkbox" name="terms" required> I agree</label></div>
            <div class="modal-actions"><button class="btn btn-primary" type="submit">Subscribe</button><button type="button" class="btn btn-secondary close-btn">Cancel</button></div>
          </form>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) closeSubscriptionModal(); });
    modal.querySelectorAll('.close-btn').forEach(b => b.addEventListener('click', closeSubscriptionModal));
    const form = modal.querySelector('#subscription-form');
    form.addEventListener('submit', handleSubscriptionForm);
  }
}

function openSubscriptionModal() {
  const m = document.getElementById('subscription-modal');
  if (!m) return;
  m.style.display = 'flex';
  setTimeout(() => m.classList.add('show'), 10);
  document.body.classList.add('modal-open-blur');
}

function closeSubscriptionModal() {
  const m = document.getElementById('subscription-modal');
  if (!m) return;
  m.classList.remove('show');
  setTimeout(() => { m.style.display = 'none'; document.body.classList.remove('modal-open-blur'); }, 200);
}

function handleSubscriptionForm(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.name || !data.email) { alert('Fill required'); return; }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) { alert('Email invalid'); return; }
  Subscription.add({ name: data.name, email: data.email });
  showSubscriptionSuccess();
  form.reset();
  closeSubscriptionModal();
}

function showSubscriptionSuccess() {
  const d = document.createElement('div');
  d.className = 'subscription-success';
  d.innerHTML = `<div class="success-content"><div class="success-icon">✓</div><h3>Subscribed!</h3><p>Thanks — you'll receive updates.</p><button class="btn btn-primary" id="got-it">Got it</button></div>`;
  document.body.appendChild(d);
  document.getElementById('got-it').addEventListener('click', () => d.remove());
  setTimeout(() => { if (d.parentNode) d.remove(); }, 4500);
}

/* ===========================
   THEME CHANGER 
   =========================== */
function initializeThemeChanger() {
  // create toggle button if missing
  if (!document.getElementById('theme-toggle-btn')) {
    const btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.className = 'btn btn-secondary';
    btn.textContent = '🎨 Change Theme';
    btn.style.position = 'fixed';
    btn.style.right = '20px';
    btn.style.top = '100px';
    btn.style.zIndex = 1200;
    btn.addEventListener('click', changeBackgroundColor);
    document.body.appendChild(btn);
  }
}

function changeBackgroundColor() {
  const themes = [
    { name: 'Dark Blue', gradient: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%)' },
    { name: 'Purple Galaxy', gradient: 'linear-gradient(135deg,#1a1a2e 0%,#533483 100%)' },
    { name: 'Cyberpunk', gradient: 'linear-gradient(135deg,#0c0c0c 0%,#533483 100%)' }
  ];
  let idx = parseInt(sessionStorage.getItem('themeIndex') || '0', 10);
  idx = (idx + 1) % themes.length;
  const g = themes[idx].gradient;
  const main = document.querySelector('.main');
  if (main) main.style.background = g; else document.body.style.background = g;
  changeButtonColor(g);
  sessionStorage.setItem('themeIndex', idx.toString());
  showThemeNotification(themes[idx].name);
  }

function changeButtonColor(gradient) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  btn.style.background = gradient;
  btn.style.color = '#fff';
  btn.style.border = '1px solid rgba(255,255,255,0.06)';
}

function showThemeNotification(name) {
  const el = document.createElement('div');
  el.className = 'theme-notification';
  el.innerHTML = `<div class="notification-content">🎨 Theme changed: ${name}</div>`;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => { el.classList.remove('show'); setTimeout(()=> { if (el.parentNode) el.remove(); }, 300); }, 2800);
}

/* ===========================
   DATE & TIME DISPLAY
   =========================== */
function initializeDateTimeDisplay() {
  if (!document.getElementById('current-time')) createDateTimeDisplay();
  updateDateTime();
  setInterval(updateDateTime, 1000);
}

function createDateTimeDisplay() {
  const container = document.createElement('div');
  container.id = 'datetime-display';
  container.className = 'datetime-container';
  container.innerHTML = `<div class="datetime-date" id="current-date"></div><div class="datetime-time" id="current-time"></div><div class="datetime-timezone" id="current-timezone"></div>`;
  const main = document.querySelector('main');
  if (main) main.insertBefore(container, main.firstChild);
  else document.body.insertBefore(container, document.body.firstChild);
}

function updateDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString('en-US', { weekday: 'long', year:'numeric', month:'long', day:'numeric' });
  const time = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true });
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const de = document.getElementById('current-date');
  const te = document.getElementById('current-time');
  const tze = document.getElementById('current-timezone');
  if (de) de.textContent = date;
  if (te) te.textContent = time;
  if (tze) tze.textContent = tz;
}


/* ===========================
   Read More 
   =========================== */
function initAutoReadMoreAndModal() {
  // find buttons either with class 'read-more-btn' or with innerText 'Read More'
  const btns = Array.from(document.querySelectorAll('button')).filter(b => {
    const t = (b.innerText || '').trim().toLowerCase();
    return b.classList.contains('read-more-btn') || t === 'read more';
  });

  // attach class 
  btns.forEach((b, i) => {
    b.classList.add('read-more-btn');
    if (!b.dataset.id) b.dataset.id = String(i);
  });

  // create modal 
  if (!document.getElementById('review-modal')) {
    const modal = document.createElement('div');
    modal.id = 'review-modal';
    modal.className = 'modal-overlay review-modal';
    modal.innerHTML = `
      <div class="review-modal-content" role="dialog" aria-modal="true">
        <div class="review-modal-header">
          <h3 id="review-modal-title"></h3>
          <button class="close-review-btn" aria-label="Close">&times;</button>
        </div>
        <img id="review-modal-image" class="review-modal-image" src="" alt="">
        <div id="review-modal-text" class="review-modal-text"></div>
        <div style="margin-top:12px;text-align:right;">
          <button class="btn btn-secondary close-review-btn">Close</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  const modal = document.getElementById('review-modal');
  const titleEl = document.getElementById('review-modal-title');
  const imgEl = document.getElementById('review-modal-image');
  const textEl = document.getElementById('review-modal-text');

  // reviews data 
  const reviews = [
    {
    id: '0',
    title: "MacBook Pro 16\" (M3 Pro)",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1200",
    full: `
        <h4>Performance and Chipset</h4>
        <p>The MacBook Pro 16\" equipped with the Apple M3 Pro chip delivers exceptional performance for professional workloads such as 3D rendering, software development, and video production. The 3nm architecture provides increased efficiency and better sustained performance under heavy workloads with minimal thermal throttling.</p>

        <h4>Display Quality</h4>
        <p>Features a 16.2-inch Liquid Retina XDR display with mini-LED technology. It reaches up to 1600 nits peak brightness in HDR and supports ProMotion up to 120Hz for fluid animations and highly accurate color reproduction.</p>

        <h4>Memory and Storage</h4>
        <ul class="read-more-highlight">
            <li>Unified memory: 16GB to 36GB</li>
            <li>SSD options: from 512GB up to 4TB</li>
            <li>High sustained read/write speeds ideal for large project workflows</li>
        </ul>

        <h4>Battery Life</h4>
        <p>One of the strongest battery performances in the laptop category. Up to 18–20 hours of media playback or browsing, and approximately 10–12 hours under development workloads.</p>

        <h4>Ports and Connectivity</h4>
        <ul class="read-more-highlight">
            <li>3 × Thunderbolt 4</li>
            <li>HDMI 2.1 with support for 8K/60Hz</li>
            <li>MagSafe 3 fast charging</li>
            <li>SDXC card reader</li>
        </ul>

        <h4>Who is it for?</h4>
        <p>Designed for developers, video editors, 3D designers, and professionals seeking long-term reliability, high performance, and a world-class display. Ideal for those within the Apple ecosystem looking for a powerful mobile workstation.</p>
    `},
    {
    id: '1',
    title: "iPhone 15 Pro",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200",
    full: `
        <h4>Performance and Chipset</h4>
        <p>The iPhone 15 Pro is powered by the A17 Pro chip built on a 3nm architecture. It delivers flagship-level performance in gaming, video recording and real-time rendering tasks. Thermal efficiency is improved compared to the previous generation.</p>

        <h4>Display</h4>
        <p>Features a 6.1-inch Super Retina XDR OLED display with ProMotion up to 120Hz. Excellent brightness levels and outstanding HDR performance suitable for photo/video editing on the go.</p>

        <h4>Camera System</h4>
        <ul class="read-more-highlight">
            <li>48MP main sensor with sensor-shift stabilization</li>
            <li>Improved low light performance and dynamic range</li>
            <li>ProRAW and ProRes support</li>
            <li>3x telephoto with lossless zoom</li>
        </ul>

        <h4>Build and Materials</h4>
        <p>The device uses a titanium frame, reducing overall weight while maintaining durability. The bezels are thinner and the grip is noticeably better compared to stainless steel housings.</p>

        <h4>Battery and Charging</h4>
        <p>A full day of heavy usage is easily achievable. The USB-C port now supports faster data transfers, especially when used with external storage for video recording.</p>

        <h4>Who is it for?</h4>
        <p>The iPhone 15 Pro is ideal for users who create content on the go, mobile filmmakers, photographers and power users who rely on the Apple ecosystem for productivity.</p>
    `},
    {
    id: '2',
    title: "Dell XPS 15",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200",
    full: `
        <h4>Performance</h4>
        <p>The Dell XPS 15 offers Intel Core i7 and i9 configurations paired with NVIDIA RTX graphics. It performs excellently in productivity tasks such as compiling code, photo editing and multi-monitor workflows.</p>

        <h4>Display</h4>
        <p>Available in both FHD+ and 4K OLED variants. The OLED version provides deep blacks, high contrast and exceptional color accuracy, making it a strong choice for creative work.</p>

        <h4>Memory and Storage</h4>
        <ul class="read-more-highlight">
            <li>RAM: up to 64GB DDR5</li>
            <li>SSD: up to 4TB NVMe</li>
            <li>Upgradeable storage and memory</li>
        </ul>

        <h4>Build Quality</h4>
        <p>Premium aluminum and carbon-fiber chassis. The keyboard and trackpad offer excellent tactile feedback. One of the most premium designs in the Windows ultrabook class.</p>

        <h4>Battery Life</h4>
        <p>With the FHD+ panel, the laptop can last a full workday. The 4K OLED version consumes more power but still offers respectable battery life for a performance laptop.</p>

        <h4>Use Case</h4>
        <p>Best suited for professionals who need a Windows-based workstation with high display quality, good portability and powerful specs for content creation or development.</p>
    `}
  ];


  const ReviewHandler = {
    open(id) {
      // find review (by id or index)
      const r = reviews.find(x => x.id === String(id)) || reviews[Number(id)];
      if (!r) return;
      // switch-case example (not necessary but satisfies criterion)
      let selected;
      switch (r.id) {
        case '0': selected = r; break;
        case '1': selected = r; break;
        case '2': selected = r; break;
        default: selected = r;
      }
      titleEl.textContent = selected.title;
      imgEl.src = selected.image;
      imgEl.alt = selected.title;
      textEl.innerHTML = selected.full;
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('show'), 10);
      document.body.classList.add('modal-open-blur');
      modal.dataset.open = 'true';
    },
    close() {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.dataset.open = 'false';
        document.body.classList.remove('modal-open-blur');
      }, 180);
    }
  };

  // attach to buttons
  const readBtns = Array.from(document.querySelectorAll('.read-more-btn'));
  if (readBtns.length === 0) {
    console.warn('No Read More buttons found on the page (script auto-scan).');
  }
  readBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      ReviewHandler.open(id);
    });
  });

  // close on overlay or close buttons
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.classList.contains('close-review-btn')) ReviewHandler.close();
  });
}

/* ===========================
   KEYBOARD SHORTCUTS  
   =========================== */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      // close review modal
      const rm = document.getElementById('review-modal');
      if (rm && rm.classList.contains('show')) { rm.classList.remove('show'); setTimeout(()=> { rm.style.display='none'; document.body.classList.remove('modal-open-blur'); }, 160); return; }
      const sm = document.getElementById('subscription-modal');
      if (sm && sm.classList.contains('show')) closeSubscriptionModal();
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const items = Array.from(document.querySelectorAll('.accordion-item'));
      if (!items.length) return;
      const activeIndex = items.findIndex(i => i.classList.contains('active'));
      let nextIndex = activeIndex;
      if (e.key === 'ArrowDown') nextIndex = (activeIndex + 1) % items.length;
      if (e.key === 'ArrowUp') nextIndex = (activeIndex - 1 + items.length) % items.length;
      const next = items[nextIndex];
      if (next) {
        const header = next.querySelector('.accordion-header');
        if (header) { header.focus(); header.click(); }
      }
    }
  });
}

/* ===========================
   Subscription object (demonstrates object + method)
   =========================== */
const Subscription = {
  subscribers: [],
  add(sub) {
    if (!sub || !sub.email) return;
    this.subscribers.push(sub);
    this.onSubscribe(sub);
  },
  onSubscribe(sub) {
    // placeholder: here you could send to server
    console.log('Subscribed:', sub);
  }
};

/* ===========================
   Products render (arrays + map example)
   =========================== */


/* ===========================
   Switch-case demo (category)
   =========================== */
function handleCategoryAction(action) {
  switch (action) {
    case 'laptops': console.log('Filter laptops'); break;
    case 'smartphones': console.log('Filter smartphones'); break;
    default: console.log('Show all categories'); break;
  }
}

/* ===========================
   End of file
   =========================== */

// ========================================
// ADDITIONAL CSS STYLES (injected via JavaScript)
// ========================================
function injectAdditionalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Form Validation Styles */
        .form-control.is-invalid {
            border-color: #dc3545;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }
        
        .form-control.is-valid {
            border-color: #28a745;
            box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
        }
        
        .error-message {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        
        /* Accordion Styles */
        .accordion {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .accordion-item {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            margin-bottom: 1rem;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .accordion-item:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: var(--primary-color);
        }
        
        .accordion-header {
            padding: 1.5rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
        }
        
        .accordion-header:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .accordion-header h3 {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.125rem;
            font-weight: 600;
        }
        
        .accordion-icon {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary-color);
            transition: transform 0.3s ease;
        }
        
        .accordion-item.active .accordion-icon {
            transform: rotate(180deg);
        }
        
        .accordion-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
            background: rgba(255, 255, 255, 0.05);
        }
        
        .accordion-content p {
            padding: 0 1.5rem 1.5rem;
            margin: 0;
            color: var(--text-secondary);
            line-height: 1.6;
        }
        
        /* Modal/Popup Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .modal-overlay.show {
            opacity: 1;
        }
        
        .modal-content {
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 20px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        }
        
        .modal-overlay.show .modal-content {
            transform: scale(1);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        
        .modal-header h2 {
            color: var(--primary-color);
            margin: 0;
            font-size: 1.5rem;
        }
        
        .close-btn {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 2rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-primary);
        }
        
        .modal-body p {
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--surface);
            color: var(--text-primary);
            font-size: 0.875rem;
        }
        
        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }
        
        .checkbox-label {
            display: flex !important;
            align-items: center !important;
            gap: 0.75rem !important;
            cursor: pointer;
            color: var(--text-secondary);
            font-size: 0.875rem;
            padding: 0.5rem;
            border-radius: 8px;
            transition: background-color 0.2s ease;
            flex-wrap: nowrap !important;
            line-height: 1.5;
            flex-direction: row !important;
        }
        
        .checkbox-label:hover {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .checkbox-label input[type="checkbox"] {
            display: none;
        }
        
        .checkmark {
            width: 1.rem;
            height: 1.rem;
            border: 3px solid #ffffff;
            border-radius: 6px;
            position: relative;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            white-space: nowrap;
        }
        
        .checkbox-label input[type="checkbox"]:checked + .checkmark {
            background: var(--primary-color);
            border-color: var(--primary-color);
            box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
            transform: scale(1.05);
        }
        
        .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 0.850rem;
            font-weight: bold;
        }
        
        .checkbox-label:hover .checkmark {
            border-color: var(--primary-color);
            box-shadow: 0 0 12px rgba(0, 212, 255, 0.4);
            background: rgba(255, 255, 255, 0.2);
        }
        
        .checkbox-label input[type="checkbox"] {
            display: none !important;
        }
        
        .checkbox-label span.checkmark {
            order: -1;
        }
        
        .checkbox-label:not(:has(span)) {
            text-indent: 2rem;
        }
        
        .modal-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .modal-actions .btn {
            flex: 1;
            font-size: 0.875rem;
            font-weight: 500;
            padding: 0.875rem 2rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            border: 1px solid transparent;
            min-height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-actions .btn-primary {
            background: linear-gradient(135deg, var(--primary-color), #0056CC);
            color: white;
            border-color: var(--primary-color);
            box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
        }
        
        .modal-actions .btn-primary:hover {
            background: linear-gradient(135deg, var(--primary-hover), #0044AA);
            border-color: var(--primary-hover);
            color: white;
            text-decoration: none;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
        }
        
        .modal-actions .btn-secondary,
        .modal-content .btn-secondary {
            background: linear-gradient(135deg, #6b7280, #4b5563) !important;
            color: white !important;
            border-color: #6b7280 !important;
            box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3) !important;
        }
        
        .modal-actions .btn-secondary:hover,
        .modal-content .btn-secondary:hover {
            background: linear-gradient(135deg, #4b5563, #374151) !important;
            border-color: #4b5563 !important;
            color: white !important;
            text-decoration: none !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(107, 114, 128, 0.4) !important;
        }
        
        /* Success Message Styles */
        .subscription-success {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 3000;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(40, 167, 69, 0.3);
            border-radius: 20px;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }
        
        .success-icon {
            font-size: 3rem;
            color: #28a745;
            margin-bottom: 1rem;
        }
        
        .success-content h3 {
            color: var(--text-primary);
            margin-bottom: 1rem;
        }
        
        .success-content p {
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
        }
        
        /* Theme Notification Styles */
        .theme-notification {
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--primary-color);
            border-radius: 10px;
            padding: 1rem 1.5rem;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        
        .theme-notification.show {
            transform: translateX(0);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .notification-icon {
            font-size: 1.25rem;
        }
        
        .notification-text {
            color: var(--text-primary);
            font-weight: 500;
        }
        
        /* Date Time Display Styles */
        .datetime-container {
            position: absolute;
            top: 90px;
            left: 20px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            padding: 1rem 1.5rem;
            z-index: 100;
        }
        
        .datetime-date {
            color: var(--text-primary);
            font-weight: 600;
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
        }
        
        .datetime-time {
            color: var(--primary-color);
            font-weight: 700;
            font-size: 1.125rem;
            margin-bottom: 0.25rem;
        }
        
        .datetime-timezone {
            color: var(--text-secondary);
            font-size: 0.75rem;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .datetime-container {
                position: relative;
                top: auto;
                left: auto;
                margin: 1rem auto;
                max-width: 300px;
                text-align: center;
            }
            
            .modal-content {
                margin: 1rem;
                width: calc(100% - 2rem);
            }
            
            .accordion-header h3 {
                font-size: 1rem;
            }
            
            .theme-notification {
                right: 10px;
                left: 10px;
                transform: translateY(-100%);
            }
            
            .theme-notification.show {
                transform: translateY(0);
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize additional styles when DOM is loaded
document.addEventListener('DOMContentLoaded', injectAdditionalStyles);

// ========================================
// JQUERY FEATURES IMPLEMENTATION
// ========================================

$(document).ready(function() {
    // Initialize all jQuery features
    initRealTimeSearch();
    initAutocompleteSearch();
    initSearchHighlighting();
    initScrollProgressBar();
    initAnimatedCounters();
    initLoadingSpinner();
    initNotificationSystem();
    initCopyToClipboard();
    initLazyLoading();
    
    // Initialize catalog page immediately
    if (window.location.pathname.includes('catalog.html')) {
        console.log('Initializing catalog page...');
        
        // Show all product cards
        $('.product-card').show();
        
        // Update results count
        const visibleCount = $('.product-card:visible').length;
        $('.results-count').text(visibleCount + ' products found');
        
        // Add to Cart functionality
        $('.add-to-cart-btn').on('click', function() {
            const $card = $(this).closest('.product-card');
            const productName = $card.find('.product-title').text();
            showNotification(productName + ' added to cart!', 'success');
            
            // Add animation effect
            $(this).html('✓ Added').addClass('btn-success');
            setTimeout(() => {
                $(this).html('Add to Cart').removeClass('btn-success');
            }, 2000);
        });
        
        // Compare functionality
        $('.compare-btn').on('click', function() {
            const $card = $(this).closest('.product-card');
            const productName = $card.find('.product-title').text();
            
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected').text('Compare');
                showNotification(productName + ' removed from comparison', 'info');
            } else {
                $(this).addClass('selected').text('Remove');
                showNotification(productName + ' added to comparison', 'success');
            }
        });
        
        // View Details functionality
        $('.btn-primary').on('click', function() {
            if ($(this).text() === 'View Details') {
                const $card = $(this).closest('.product-card');
                const productName = $card.find('.product-title').text();
                showNotification('Opening details for ' + productName, 'info');
            }
        });
        
        console.log('Catalog page initialized with ' + visibleCount + ' products');
    }
});

// ========================================
// TASK 1: Real-time Search and Live Filter
// ========================================
function initRealTimeSearch() {
    // Add search functionality to existing search input
    $('.search-container input').on('keyup', function() {
        const searchTerm = $(this).val().toLowerCase();
        
        // Filter product cards
        $('.product-card, .card').each(function() {
            const cardText = $(this).text().toLowerCase();
            if (cardText.includes(searchTerm) || searchTerm === '') {
                $(this).show().addClass('search-match');
            } else {
                $(this).hide().removeClass('search-match');
            }
        });
        
        // Filter FAQ items
        $('.accordion-item').each(function() {
            const faqText = $(this).text().toLowerCase();
            if (faqText.includes(searchTerm) || searchTerm === '') {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
        
        // Show/hide "no results" message
        const visibleItems = $('.product-card:visible, .card:visible, .accordion-item:visible').length;
        if (searchTerm !== '' && visibleItems === 0) {
            if ($('#no-results').length === 0) {
                $('.search-container').after('<div id="no-results" class="alert alert-info mt-3">No results found for "' + searchTerm + '"</div>');
            }
        } else {
            $('#no-results').remove();
        }
    });
}

// ========================================
// PAGE-SPECIFIC FUNCTIONALITY
// ========================================

// Catalog Page Functions
function initCatalogPage() {
    if ($('#catalogSearch').length > 0) {
        // Catalog-specific search
        $('#catalogSearch').on('keyup', function() {
            const searchTerm = $(this).val().toLowerCase();
            
            $('.product-card').each(function() {
                const cardText = $(this).text().toLowerCase();
                if (cardText.includes(searchTerm) || searchTerm === '') {
                    $(this).show().addClass('search-match');
                } else {
                    $(this).hide().removeClass('search-match');
                }
            });
            
            // Update results count
            const visibleCount = $('.product-card:visible').length;
            $('.results-count').text(visibleCount + ' products found');
        });
        
        // Filter functionality
        $('.filter-apply').on('click', function() {
            showNotification('Filters applied successfully!', 'success');
        });
        
        $('.filter-clear').on('click', function() {
            $('input[type="checkbox"]').prop('checked', false);
            $('input[type="number"]').val('');
            showNotification('All filters cleared!', 'info');
        });
        
        // Compare functionality
        $('.compare-btn').on('click', function() {
            const $card = $(this).closest('.product-card');
            const productName = $card.find('.product-title').text();
            
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected').text('Compare');
                showNotification(productName + ' removed from comparison', 'info');
            } else {
                $(this).addClass('selected').text('Remove');
                showNotification(productName + ' added to comparison', 'success');
            }
        });
    }
}

// Cart Page Functions
function initCartPage() {
    if ($('.cart-item').length > 0) {
        // Quantity controls
        $('.quantity-btn').on('click', function() {
            const $btn = $(this);
            const $item = $btn.closest('.cart-item');
            const $quantity = $item.find('.quantity-value');
            const $price = $item.find('.item-price');
            const currentQty = parseInt($quantity.text());
            const basePrice = parseFloat($price.text().replace('$', '').replace(',', ''));
            
            if ($btn.text() === '+' && currentQty < 10) {
                const newQty = currentQty + 1;
                $quantity.text(newQty);
                $price.text('$' + (basePrice * newQty).toLocaleString());
                updateCartTotal();
                showNotification('Quantity updated', 'success');
            } else if ($btn.text() === '-' && currentQty > 1) {
                const newQty = currentQty - 1;
                $quantity.text(newQty);
                $price.text('$' + (basePrice * newQty).toLocaleString());
                updateCartTotal();
                showNotification('Quantity updated', 'success');
            }
        });
        
        // Remove items
        $('.remove-btn').on('click', function() {
            const $item = $(this).closest('.cart-item');
            const productName = $item.find('.item-title').text();
            
            $item.fadeOut(300, function() {
                $(this).remove();
                updateCartTotal();
                showNotification(productName + ' removed from cart', 'info');
            });
        });
        
        // Promo code
        $('.promo-btn').on('click', function() {
            const code = $('.promo-input').val().toUpperCase();
            const validCodes = ['SAVE10', 'WELCOME20', 'TECH15'];
            
            if (validCodes.includes(code)) {
                showNotification('Promo code applied! 10% discount', 'success');
                $('.promo-input').val('');
            } else {
                showNotification('Invalid promo code', 'error');
            }
        });
    }
}

function updateCartTotal() {
    let total = 0;
    $('.cart-item').each(function() {
        const price = parseFloat($(this).find('.item-price').text().replace('$', '').replace(',', ''));
        total += price;
    });
    
    const tax = total * 0.08;
    const finalTotal = total + tax;
    
    $('.summary-row').eq(0).find('.summary-value').text('$' + total.toLocaleString());
    $('.summary-row').eq(2).find('.summary-value').text('$' + tax.toFixed(2));
    $('.summary-row.total .summary-value').text('$' + finalTotal.toFixed(2));
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        $('.cart-item').fadeOut(300, function() {
            $(this).remove();
        });
        showNotification('Cart cleared successfully', 'success');
        setTimeout(() => {
            $('.results-count').text('0 products found');
        }, 300);
    }
}

function proceedToCheckout() {
    showNotification('Redirecting to checkout...', 'info');
    setTimeout(() => {
        showNotification('Checkout page would open here', 'success');
    }, 1000);
}

// Product Page Functions
function initProductPage() {
    if ($('.product-container').length > 0) {
        // Image thumbnail switching
        $('.thumbnail').on('click', function() {
            const newSrc = $(this).attr('src').replace('100x100', '600x400');
            $('#mainImage').attr('src', newSrc);
            
            $('.thumbnail').removeClass('active');
            $(this).addClass('active');
        });
        
        // Specifications toggle
        $('.specs-toggle').on('click', function() {
            const $specs = $('#allSpecs');
            if ($specs.is(':visible')) {
                $specs.slideUp();
                $(this).text('View All Specifications');
            } else {
                $specs.slideDown();
                $(this).text('Hide Specifications');
            }
        });
        
        // Seller buy buttons
        $('.seller-buy').on('click', function() {
            const sellerName = $(this).closest('.seller-item').find('.seller-name').text();
            showNotification('Redirecting to ' + sellerName + '...', 'info');
        });
    }
}

function addToCart() {
    const productName = $('.product-title').text();
    showNotification(productName + ' added to cart!', 'success');
}

function addToCompare() {
    const productName = $('.product-title').text();
    showNotification(productName + ' added to comparison', 'success');
}

function saveForLater() {
    const productName = $('.product-title').text();
    showNotification(productName + ' saved for later', 'success');
}

// Initialize page-specific functions
$(document).ready(function() {
    // Check which page we're on and initialize appropriate functions
    if (window.location.pathname.includes('catalog.html')) {
        initCatalogPage();
    } else if (window.location.pathname.includes('cart.html')) {
        initCartPage();
    } else if (window.location.pathname.includes('product.html')) {
        initProductPage();
    }
});

// ========================================
// TASK 2: Autocomplete Search Suggestions
// ========================================
function initAutocompleteSearch() {
    const suggestions = [
        'MacBook Pro', 'iPhone 15', 'Dell XPS', 'Samsung Galaxy', 'iPad Pro',
        'Sony WH-1000XM5', 'Apple Watch', 'AirPods Pro', 'laptop', 'smartphone',
        'tablet', 'headphones', 'smartwatch'
    ];
    
    // Create autocomplete dropdown
    const autocompleteHtml = '<div id="autocomplete-dropdown" class="autocomplete-dropdown"></div>';
    $('.search-container').append(autocompleteHtml);
    
    $('.search-container input').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        const filteredSuggestions = suggestions.filter(item => 
            item.toLowerCase().includes(searchTerm)
        ).slice(0, 5);
        
        if (searchTerm.length > 0 && filteredSuggestions.length > 0) {
            let dropdownHtml = '';
            filteredSuggestions.forEach(suggestion => {
                dropdownHtml += `<div class="autocomplete-item" data-suggestion="${suggestion}">${suggestion}</div>`;
            });
            $('#autocomplete-dropdown').html(dropdownHtml).show();
        } else {
            $('#autocomplete-dropdown').hide();
        }
    });
    
    // Handle suggestion clicks
    $(document).on('click', '.autocomplete-item', function() {
        const suggestion = $(this).data('suggestion');
        $('.search-container input').val(suggestion);
        $('#autocomplete-dropdown').hide();
        $('.search-container input').trigger('keyup');
    });
    
    // Hide dropdown when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.search-container').length) {
            $('#autocomplete-dropdown').hide();
        }
    });
}

// ========================================
// PAGE-SPECIFIC FUNCTIONALITY
// ========================================

// Catalog Page Functions
function initCatalogPage() {
    if ($('#catalogSearch').length > 0) {
        // Catalog-specific search
        $('#catalogSearch').on('keyup', function() {
            const searchTerm = $(this).val().toLowerCase();
            
            $('.product-card').each(function() {
                const cardText = $(this).text().toLowerCase();
                if (cardText.includes(searchTerm) || searchTerm === '') {
                    $(this).show().addClass('search-match');
                } else {
                    $(this).hide().removeClass('search-match');
                }
            });
            
            // Update results count
            const visibleCount = $('.product-card:visible').length;
            $('.results-count').text(visibleCount + ' products found');
        });
        
        // Filter functionality
        $('.filter-apply').on('click', function() {
            showNotification('Filters applied successfully!', 'success');
        });
        
        $('.filter-clear').on('click', function() {
            $('input[type="checkbox"]').prop('checked', false);
            $('input[type="number"]').val('');
            showNotification('All filters cleared!', 'info');
        });
        
        // Compare functionality
        $('.compare-btn').on('click', function() {
            const $card = $(this).closest('.product-card');
            const productName = $card.find('.product-title').text();
            
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected').text('Compare');
                showNotification(productName + ' removed from comparison', 'info');
            } else {
                $(this).addClass('selected').text('Remove');
                showNotification(productName + ' added to comparison', 'success');
            }
        });
    }
}

// Cart Page Functions
function initCartPage() {
    if ($('.cart-item').length > 0) {
        // Quantity controls
        $('.quantity-btn').on('click', function() {
            const $btn = $(this);
            const $item = $btn.closest('.cart-item');
            const $quantity = $item.find('.quantity-value');
            const $price = $item.find('.item-price');
            const currentQty = parseInt($quantity.text());
            const basePrice = parseFloat($price.text().replace('$', '').replace(',', ''));
            
            if ($btn.text() === '+' && currentQty < 10) {
                const newQty = currentQty + 1;
                $quantity.text(newQty);
                $price.text('$' + (basePrice * newQty).toLocaleString());
                updateCartTotal();
                showNotification('Quantity updated', 'success');
            } else if ($btn.text() === '-' && currentQty > 1) {
                const newQty = currentQty - 1;
                $quantity.text(newQty);
                $price.text('$' + (basePrice * newQty).toLocaleString());
                updateCartTotal();
                showNotification('Quantity updated', 'success');
            }
        });
        
        // Remove items
        $('.remove-btn').on('click', function() {
            const $item = $(this).closest('.cart-item');
            const productName = $item.find('.item-title').text();
            
            $item.fadeOut(300, function() {
                $(this).remove();
                updateCartTotal();
                showNotification(productName + ' removed from cart', 'info');
            });
        });
        
        // Promo code
        $('.promo-btn').on('click', function() {
            const code = $('.promo-input').val().toUpperCase();
            const validCodes = ['SAVE10', 'WELCOME20', 'TECH15'];
            
            if (validCodes.includes(code)) {
                showNotification('Promo code applied! 10% discount', 'success');
                $('.promo-input').val('');
            } else {
                showNotification('Invalid promo code', 'error');
            }
        });
    }
}

function updateCartTotal() {
    let total = 0;
    $('.cart-item').each(function() {
        const price = parseFloat($(this).find('.item-price').text().replace('$', '').replace(',', ''));
        total += price;
    });
    
    const tax = total * 0.08;
    const finalTotal = total + tax;
    
    $('.summary-row').eq(0).find('.summary-value').text('$' + total.toLocaleString());
    $('.summary-row').eq(2).find('.summary-value').text('$' + tax.toFixed(2));
    $('.summary-row.total .summary-value').text('$' + finalTotal.toFixed(2));
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        $('.cart-item').fadeOut(300, function() {
            $(this).remove();
        });
        showNotification('Cart cleared successfully', 'success');
        setTimeout(() => {
            $('.results-count').text('0 products found');
        }, 300);
    }
}

function proceedToCheckout() {
    showNotification('Redirecting to checkout...', 'info');
    setTimeout(() => {
        showNotification('Checkout page would open here', 'success');
    }, 1000);
}

// Product Page Functions
function initProductPage() {
    if ($('.product-container').length > 0) {
        // Image thumbnail switching
        $('.thumbnail').on('click', function() {
            const newSrc = $(this).attr('src').replace('100x100', '600x400');
            $('#mainImage').attr('src', newSrc);
            
            $('.thumbnail').removeClass('active');
            $(this).addClass('active');
        });
        
        // Specifications toggle
        $('.specs-toggle').on('click', function() {
            const $specs = $('#allSpecs');
            if ($specs.is(':visible')) {
                $specs.slideUp();
                $(this).text('View All Specifications');
            } else {
                $specs.slideDown();
                $(this).text('Hide Specifications');
            }
        });
        
        // Seller buy buttons
        $('.seller-buy').on('click', function() {
            const sellerName = $(this).closest('.seller-item').find('.seller-name').text();
            showNotification('Redirecting to ' + sellerName + '...', 'info');
        });
    }
}

function addToCart() {
    const productName = $('.product-title').text();
    showNotification(productName + ' added to cart!', 'success');
}

function addToCompare() {
    const productName = $('.product-title').text();
    showNotification(productName + ' added to comparison', 'success');
}

function saveForLater() {
    const productName = $('.product-title').text();
    showNotification(productName + ' saved for later', 'success');
}

// Initialize page-specific functions
$(document).ready(function() {
    // Check which page we're on and initialize appropriate functions
    if (window.location.pathname.includes('catalog.html')) {
        initCatalogPage();
    } else if (window.location.pathname.includes('cart.html')) {
        initCartPage();
    } else if (window.location.pathname.includes('product.html')) {
        initProductPage();
    }
});

// ========================================
// TASK 3: Search Highlighting
// ========================================
function initSearchHighlighting() {
    let originalContent = {};
    
    $('.search-container input').on('keyup', function() {
        const searchTerm = $(this).val().trim();
        
        if (searchTerm === '') {
            // Restore original content
            Object.keys(originalContent).forEach(selector => {
                $(selector).html(originalContent[selector]);
            });
            originalContent = {};
            return;
        }
        
        // Store original content if not already stored
        $('.card-text, .accordion-content p, .hero-description').each(function() {
            const selector = '#' + $(this).attr('id') || '.card-text, .accordion-content p, .hero-description';
            if (!originalContent[selector]) {
                originalContent[selector] = $(this).html();
            }
        });
        
        // Highlight matching text
        $('.card-text, .accordion-content p, .hero-description').each(function() {
            const originalText = originalContent['#' + $(this).attr('id')] || $(this).text();
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            const highlightedText = originalText.replace(regex, '<mark class="search-highlight">$1</mark>');
            $(this).html(highlightedText);
        });
    });
}

// ========================================
// TASK 4: Colorful Scroll Progress Bar
// ========================================
function initScrollProgressBar() {
    // Create progress bar
    const progressBarHtml = `
        <div id="scroll-progress-container">
            <div id="scroll-progress-bar"></div>
            <div id="scroll-progress-text">0%</div>
        </div>
    `;
    $('body').append(progressBarHtml);
    
    $(window).on('scroll', function() {
        const scrollTop = $(window).scrollTop();
        const docHeight = $(document).height();
        const winHeight = $(window).height();
        const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
        
        $('#scroll-progress-bar').css('width', scrollPercent + '%');
        $('#scroll-progress-text').text(Math.round(scrollPercent) + '%');
        
        // Change color based on scroll percentage
        if (scrollPercent < 25) {
            $('#scroll-progress-bar').css('background', 'linear-gradient(90deg, #ff6b6b, #ff8e8e)');
        } else if (scrollPercent < 50) {
            $('#scroll-progress-bar').css('background', 'linear-gradient(90deg, #4ecdc4, #6dd5ed)');
        } else if (scrollPercent < 75) {
            $('#scroll-progress-bar').css('background', 'linear-gradient(90deg, #45b7d1, #96c7ed)');
        } else {
            $('#scroll-progress-bar').css('background', 'linear-gradient(90deg, #f9ca24, #f0932b)');
        }
    });
}

// ========================================
// PAGE-SPECIFIC FUNCTIONALITY
// ========================================

// Catalog Page Functions
function initCatalogPage() {
    if ($('#catalogSearch').length > 0) {
        // Catalog-specific search
        $('#catalogSearch').on('keyup', function() {
            const searchTerm = $(this).val().toLowerCase();
            
            $('.product-card').each(function() {
                const cardText = $(this).text().toLowerCase();
                if (cardText.includes(searchTerm) || searchTerm === '') {
                    $(this).show().addClass('search-match');
                } else {
                    $(this).hide().removeClass('search-match');
                }
            });
            
            // Update results count
            const visibleCount = $('.product-card:visible').length;
            $('.results-count').text(visibleCount + ' products found');
        });
        
        // Filter functionality
        $('.filter-apply').on('click', function() {
            showNotification('Filters applied successfully!', 'success');
        });
        
        $('.filter-clear').on('click', function() {
            $('input[type="checkbox"]').prop('checked', false);
            $('input[type="number"]').val('');
            showNotification('All filters cleared!', 'info');
        });
        
        // Compare functionality
        $('.compare-btn').on('click', function() {
            const $card = $(this).closest('.product-card');
            const productName = $card.find('.product-title').text();
            
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected').text('Compare');
                showNotification(productName + ' removed from comparison', 'info');
            } else {
                $(this).addClass('selected').text('Remove');
                showNotification(productName + ' added to comparison', 'success');
            }
        });
    }
}

function initfilterFunctionality() {

    // Select all product cards and the counter element
    const cards = document.querySelectorAll('.product-card');
    const counter = document.querySelector('.results-count');

    function applyFilters() {
        // 1. Get Price Range (Assuming you still have minPrice/maxPrice inputs)
        // Если у вас нет инпутов для цены, закомментируйте эти строки.
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        
        // Получаем значение цены. В HTML цена находится в теге <div>. 
        // Мы будем использовать data-price, если вы его добавили, иначе парсим из текста.
        // Если вы не фильтруете по цене, оставьте 0 и Infinity.
        const minPrice = minPriceInput ? parseFloat(minPriceInput.value) || 0 : 0;
        const maxPrice = maxPriceInput ? parseFloat(maxPriceInput.value) || Infinity : Infinity;

        // 2. Get Selected Checkboxes for CATEGORY, BRAND, RAM, and STORAGE
        
        // Category
        const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
        const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value.toLowerCase()); // Важно: приводим к нижнему регистру для сравнения

        // Brand
        const brandCheckboxes = document.querySelectorAll('input[name="brand"]:checked');
        const selectedBrands = Array.from(brandCheckboxes).map(cb => cb.value.toLowerCase());
        
        // RAM
        const ramCheckboxes = document.querySelectorAll('input[name="ram"]:checked');
        const selectedRAMs = Array.from(ramCheckboxes).map(cb => cb.value); // RAM у вас в виде "6", "12", "32"

        // Storage
        const storageCheckboxes = document.querySelectorAll('input[name="storage"]:checked');
        const selectedStorages = Array.from(storageCheckboxes).map(cb => cb.value); // Storage у вас в виде "128", "256", "512"


        let visibleCount = 0;

        cards.forEach(card => {
            // Read product data from the data-attributes
            // .toLowerCase() для категорий и брендов, чтобы избежать ошибок из-за регистра
            const productPriceText = card.querySelector('.product-price').textContent.replace('$', '').replace(',', '').trim();
            const productPrice = parseFloat(productPriceText) || 0; // Получаем цену из текста, если нет data-price
            
            const productCategory = card.getAttribute('data-category');
            const productBrand = card.getAttribute('data-brand');
            const productRAM = card.getAttribute('data-ram');
            const productStorage = card.getAttribute('data-storage');
            
            // --- Check Matches ---
            
            // 1. Price Match
            let isPriceMatch = productPrice >= minPrice && productPrice <= maxPrice;

            // 2. Category Match
            let isCategoryMatch = selectedCategories.length === 0 || selectedCategories.includes(productCategory);

            // 3. Brand Match
            let isBrandMatch = selectedBrands.length === 0 || selectedBrands.includes(productBrand);

            // 4. RAM Match (сравниваем строковые значения, т.к. они взяты из data-атрибутов)
            let isRAMMatch = selectedRAMs.length === 0 || selectedRAMs.includes(productRAM);
            
            // 5. Storage Match
            let isStorageMatch = selectedStorages.length === 0 || selectedStorages.includes(productStorage);

            // --- Final decision: MUST pass ALL enabled filters ---
            if (isPriceMatch && isCategoryMatch && isBrandMatch && isRAMMatch && isStorageMatch) {
                card.style.display = 'grid'; // Используем 'grid' или 'block' в зависимости от вашего CSS
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update the results count
        if (counter) {
            counter.textContent = visibleCount + ' products found';
        }
    }

    // Function to handle clearing filters
    function clearFiltersAndShowAll() {
        // Clear all checkboxes
        document.querySelectorAll('.filters-sidebar input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear number inputs (Price Range)
        document.querySelectorAll('.filters-sidebar input[type="number"]').forEach(input => {
            input.value = '';
        });
        
        // Re-apply filters to ensure all are shown correctly
        applyFilters(); 
        
        // (Опционально: можно добавить сюда уведомление)
    }
    
    // Attach the new functions to the buttons
    const filterApplyBtn = document.querySelector('.filter-apply');
    if (filterApplyBtn) {
        filterApplyBtn.addEventListener('click', applyFilters);
    }

    const filterClearBtn = document.querySelector('.filter-clear');
    if (filterClearBtn) {
        filterClearBtn.addEventListener('click', clearFiltersAndShowAll);
    }
    
    // Add event listener to the whole sidebar for a better UX (фильтрация при клике на чекбокс)
    const filtersSidebar = document.querySelector('.filters-sidebar');
    if (filtersSidebar) {
        filtersSidebar.addEventListener('change', (event) => {
            // Запускаем фильтрацию, если изменено значение в инпуте цены или чекбоксе
            if (event.target.type === 'number' || event.target.type === 'checkbox') {
                applyFilters();
            }
        });
    }
}

// Cart Page Functions
function initCartPage() {
    if ($('.cart-item').length > 0) {
        // Quantity controls
        $('.quantity-btn').on('click', function() {
            const $btn = $(this);
            const $item = $btn.closest('.cart-item');
            const $quantity = $item.find('.quantity-value');
            const $price = $item.find('.item-price');
            const currentQty = parseInt($quantity.text());
            const basePrice = parseFloat($price.text().replace('$', '').replace(',', ''));
            
            if ($btn.text() === '+' && currentQty < 10) {
                const newQty = currentQty + 1;
                $quantity.text(newQty);
                $price.text('$' + (basePrice * newQty).toLocaleString());
                updateCartTotal();
                showNotification('Quantity updated', 'success');
            } else if ($btn.text() === '-' && currentQty > 1) {
                const newQty = currentQty - 1;
                $quantity.text(newQty);
                $price.text('$' + (basePrice * newQty).toLocaleString());
                updateCartTotal();
                showNotification('Quantity updated', 'success');
            }
        });
        
        // Remove items
        $('.remove-btn').on('click', function() {
            const $item = $(this).closest('.cart-item');
            const productName = $item.find('.item-title').text();
            
            $item.fadeOut(300, function() {
                $(this).remove();
                updateCartTotal();
                showNotification(productName + ' removed from cart', 'info');
            });
        });
        
        // Promo code
        $('.promo-btn').on('click', function() {
            const code = $('.promo-input').val().toUpperCase();
            const validCodes = ['SAVE10', 'WELCOME20', 'TECH15'];
            
            if (validCodes.includes(code)) {
                showNotification('Promo code applied! 10% discount', 'success');
                $('.promo-input').val('');
            } else {
                showNotification('Invalid promo code', 'error');
            }
        });
    }
}

function updateCartTotal() {
    let total = 0;
    $('.cart-item').each(function() {
        const price = parseFloat($(this).find('.item-price').text().replace('$', '').replace(',', ''));
        total += price;
    });
    
    const tax = total * 0.08;
    const finalTotal = total + tax;
    
    $('.summary-row').eq(0).find('.summary-value').text('$' + total.toLocaleString());
    $('.summary-row').eq(2).find('.summary-value').text('$' + tax.toFixed(2));
    $('.summary-row.total .summary-value').text('$' + finalTotal.toFixed(2));
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        $('.cart-item').fadeOut(300, function() {
            $(this).remove();
        });
        showNotification('Cart cleared successfully', 'success');
        setTimeout(() => {
            $('.results-count').text('0 products found');
        }, 300);
    }
}

function proceedToCheckout() {
    showNotification('Redirecting to checkout...', 'info');
    setTimeout(() => {
        showNotification('Checkout page would open here', 'success');
    }, 1000);
}

// Product Page Functions
function initProductPage() {
    if ($('.product-container').length > 0) {
        // Image thumbnail switching
        $('.thumbnail').on('click', function() {
            const newSrc = $(this).attr('src').replace('100x100', '600x400');
            $('#mainImage').attr('src', newSrc);
            
            $('.thumbnail').removeClass('active');
            $(this).addClass('active');
        });
        
        // Specifications toggle
        $('.specs-toggle').on('click', function() {
            const $specs = $('#allSpecs');
            if ($specs.is(':visible')) {
                $specs.slideUp();
                $(this).text('View All Specifications');
            } else {
                $specs.slideDown();
                $(this).text('Hide Specifications');
            }
        });
        
        // Seller buy buttons
        $('.seller-buy').on('click', function() {
            const sellerName = $(this).closest('.seller-item').find('.seller-name').text();
            showNotification('Redirecting to ' + sellerName + '...', 'info');
        });
    }
}

function addToCart() {
    const productName = $('.product-title').text();
    showNotification(productName + ' added to cart!', 'success');
}

function addToCompare() {
    const productName = $('.product-title').text();
    showNotification(productName + ' added to comparison', 'success');
}

function saveForLater() {
    const productName = $('.product-title').text();
    showNotification(productName + ' saved for later', 'success');
}

// Initialize page-specific functions
$(document).ready(function() {
    // Check which page we're on and initialize appropriate functions
    if (window.location.pathname.includes('catalog.html')) {
        initCatalogPage();
    } else if (window.location.pathname.includes('cart.html')) {
        initCartPage();
    } else if (window.location.pathname.includes('product.html')) {
        initProductPage();
    }
});

// ========================================
// TASK 5: Animated Number Counter
// ========================================
function initAnimatedCounters() {
    // Add counter elements to stats sections
    const statsHtml = `
        <section class="stats-section py-5">
            <div class="container">
                <h2 class="section-title mb-4">Our Impact</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number" data-target="1000">0</div>
                        <div class="stat-label">Happy Customers</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" data-target="500">0</div>
                        <div class="stat-label">Products Sold</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" data-target="50">0</div>
                        <div class="stat-label">Countries Served</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" data-target="99">0</div>
                        <div class="stat-label">% Satisfaction Rate</div>
                    </div>
                </div>
            </div>
        </section>
    `;
    
    $('.features').after(statsHtml);
    
    // Animate counters when they come into view
    $(window).on('scroll', function() {
        $('.stat-number').each(function() {
            const $this = $(this);
            const target = parseInt($this.data('target'));
            const rect = this.getBoundingClientRect();
            
            if (rect.top < window.innerHeight && rect.bottom > 0 && !$this.hasClass('animated')) {
                $this.addClass('animated');
                animateCounter($this, target);
            }
        });
    });
}

function animateCounter($element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        $element.text(Math.floor(current));
    }, 20);
}

// ========================================
// TASK 6: Loading Spinner on Submit
// ========================================
function initLoadingSpinner() {
    $('.view-details-btn').on('click', function(e) {
        // Предотвращаем стандартный переход по ссылке сразу
        e.preventDefault(); 
        
        const $btn = $(this);
        const $link = $btn.find('a'); // Находим вложенный тег <a> для перехода
        const originalText = $link.text(); // Сохраняем оригинальный текст ('View Details')
        const targetUrl = $link.attr('href'); // Сохраняем URL для перехода

        $btn.prop('disabled', true);
        $link.html('<span class="spinner"></span> Please wait...'); 
        setTimeout(function() {
            
            $btn.prop('disabled', false);
            $link.html(originalText);
            window.location.href = targetUrl;
        }, 2000); 
    });
}

// ========================================
// TASK 7: Notification System
// ========================================
function initNotificationSystem() {
    // Create notification container
    $('body').append('<div id="notification-container"></div>');
}

function showNotification(message, type = 'info') {
    const notificationId = 'notification-' + Date.now();
    const notificationHtml = `
        <div id="${notificationId}" class="notification notification-${type}">
            <div class="notification-content">
                <span class="notification-icon">${getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        </div>
    `;
    
    $('#notification-container').append(notificationHtml);
    
    // Show notification with animation
    setTimeout(() => {
        $(`#${notificationId}`).addClass('show');
    }, 100);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        hideNotification(notificationId);
    }, 4000);
    
    // Manual close
    $(`#${notificationId} .notification-close`).on('click', () => {
        hideNotification(notificationId);
    });
}

function hideNotification(notificationId) {
    $(`#${notificationId}`).removeClass('show');
    setTimeout(() => {
        $(`#${notificationId}`).remove();
    }, 300);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// ========================================
// TASK 8: Copied to Clipboard Button
// ========================================
function initCopyToClipboard() {
    // Add copy buttons to code snippets and important text
    $('.card-text, .accordion-content p').each(function() {
        if ($(this).text().length > 50) {
            const $copyBtn = $('<button class="copy-btn" title="Copy to clipboard">📋</button>');
            $(this).append($copyBtn);
        }
    });
    
    // Handle copy functionality
    $(document).on('click', '.copy-btn', function() {
        const $btn = $(this);
        const textToCopy = $btn.parent().text().replace('📋', '').trim();
        
        // Copy to clipboard
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Show success feedback
            $btn.html('✓').addClass('copied');
            $btn.attr('title', 'Copied to clipboard!');
            
            setTimeout(() => {
                $btn.html('📋').removeClass('copied');
                $btn.attr('title', 'Copy to clipboard');
            }, 2000);
            
            showNotification('Text copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy text', 'error');
        });
    });
}

// ========================================
// TASK 9: Image Lazy Loading
// ========================================
function initLazyLoading() {
    // Add lazy loading to all images
    $('img').each(function() {
        const $img = $(this);
        const src = $img.attr('src');
        
        if (src) {
            $img.attr('data-src', src);
            $img.attr('src', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+');
            $img.addClass('lazy-load');
        }
    });
    
    // Load images when they come into view
    $(window).on('scroll', function() {
        $('.lazy-load').each(function() {
            const $img = $(this);
            const rect = this.getBoundingClientRect();
            
            if (rect.top < window.innerHeight + 100 && rect.bottom > -100) {
                const src = $img.attr('data-src');
                if (src) {
                    $img.attr('src', src);
                    $img.removeClass('lazy-load');
                }
            }
        });
    });
    
    // Load images that are already visible
    $('.lazy-load').each(function() {
        const $img = $(this);
        const rect = this.getBoundingClientRect();
        
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const src = $img.attr('data-src');
            if (src) {
                $img.attr('src', src);
                $img.removeClass('lazy-load');
            }
        }
    });
}

// ========================================
// PAGE-SPECIFIC FUNCTIONALITY
// ========================================

// Catalog Page Functions
function initCatalogPage() {
    if ($('#catalogSearch').length > 0) {
        // Catalog-specific search
        $('#catalogSearch').on('keyup', function() {
            const searchTerm = $(this).val().toLowerCase();
            
            $('.product-card').each(function() {
                const cardText = $(this).text().toLowerCase();
                if (cardText.includes(searchTerm) || searchTerm === '') {
                    $(this).show().addClass('search-match');
                } else {
                    $(this).hide().removeClass('search-match');
                }
            });
            
            // Update results count
            const visibleCount = $('.product-card:visible').length;
            $('.results-count').text(visibleCount + ' products found');
        });
        
        // Filter functionality
        $('.filter-apply').on('click', function() {
            showNotification('Filters applied successfully!', 'success');
        });
        
        $('.filter-clear').on('click', function() {
            $('input[type="checkbox"]').prop('checked', false);
            $('input[type="number"]').val('');
            showNotification('All filters cleared!', 'info');
        });
        
        // Compare functionality
        $('.compare-btn').on('click', function() {
            const $card = $(this).closest('.product-card');
            const productName = $card.find('.product-title').text();
            
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected').text('Compare');
                showNotification(productName + ' removed from comparison', 'info');
            } else {
                $(this).addClass('selected').text('Remove');
                showNotification(productName + ' added to comparison', 'success');
            }
        });
    }
}

// Cart Page Functions
function initCartPage() {
    if ($('.cart-item').length > 0) {
        // Quantity controls
        $('.quantity-btn').on('click', function() {
            const $btn = $(this);
            const $item = $btn.closest('.cart-item');
            const $quantity = $item.find('.quantity-value');
            const $price = $item.find('.item-price');
            const currentQty = parseInt($quantity.text());
            const basePrice = parseFloat($price.text().replace('$', '').replace(',', ''));
            
            if ($btn.text() === '+' && currentQty < 10) {
                const newQty = currentQty + 1;
                $quantity.text(newQty);
                $price.text('$' + (basePrice * newQty).toLocaleString());
                updateCartTotal();
                showNotification('Quantity updated', 'success');
            } else if ($btn.text() === '-' && currentQty > 1) {
                const newQty = currentQty - 1;
                $quantity.text(newQty);
                $price.text('$' + (basePrice * newQty).toLocaleString());
                updateCartTotal();
                showNotification('Quantity updated', 'success');
            }
        });
        
        // Remove items
        $('.remove-btn').on('click', function() {
            const $item = $(this).closest('.cart-item');
            const productName = $item.find('.item-title').text();
            
            $item.fadeOut(300, function() {
                $(this).remove();
                updateCartTotal();
                showNotification(productName + ' removed from cart', 'info');
            });
        });
        
        // Promo code
        $('.promo-btn').on('click', function() {
            const code = $('.promo-input').val().toUpperCase();
            const validCodes = ['SAVE10', 'WELCOME20', 'TECH15'];
            
            if (validCodes.includes(code)) {
                showNotification('Promo code applied! 10% discount', 'success');
                $('.promo-input').val('');
            } else {
                showNotification('Invalid promo code', 'error');
            }
        });
    }
}

function updateCartTotal() {
    let total = 0;
    $('.cart-item').each(function() {
        const price = parseFloat($(this).find('.item-price').text().replace('$', '').replace(',', ''));
        total += price;
    });
    
    const tax = total * 0.08;
    const finalTotal = total + tax;
    
    $('.summary-row').eq(0).find('.summary-value').text('$' + total.toLocaleString());
    $('.summary-row').eq(2).find('.summary-value').text('$' + tax.toFixed(2));
    $('.summary-row.total .summary-value').text('$' + finalTotal.toFixed(2));
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        $('.cart-item').fadeOut(300, function() {
            $(this).remove();
        });
        showNotification('Cart cleared successfully', 'success');
        setTimeout(() => {
            $('.results-count').text('0 products found');
        }, 300);
    }
}

function proceedToCheckout() {
    showNotification('Redirecting to checkout...', 'info');
    setTimeout(() => {
        showNotification('Checkout page would open here', 'success');
    }, 1000);
}

// Product Page Functions
function initProductPage() {
    if ($('.product-container').length > 0) {
        // Image thumbnail switching
        $('.thumbnail').on('click', function() {
            const newSrc = $(this).attr('src').replace('100x100', '600x400');
            $('#mainImage').attr('src', newSrc);
            
            $('.thumbnail').removeClass('active');
            $(this).addClass('active');
        });
        
        // Specifications toggle
        $('.specs-toggle').on('click', function() {
            const $specs = $('#allSpecs');
            if ($specs.is(':visible')) {
                $specs.slideUp();
                $(this).text('View All Specifications');
            } else {
                $specs.slideDown();
                $(this).text('Hide Specifications');
            }
        });
        
        // Seller buy buttons
        $('.seller-buy').on('click', function() {
            const sellerName = $(this).closest('.seller-item').find('.seller-name').text();
            showNotification('Redirecting to ' + sellerName + '...', 'info');
        });
    }
}

function addToCart() {
    const productName = $('.product-title').text();
    showNotification(productName + ' added to cart!', 'success');
}

function addToCompare() {
    const productName = $('.product-title').text();
    showNotification(productName + ' added to comparison', 'success');
}

function saveForLater() {
    const productName = $('.product-title').text();
    showNotification(productName + ' saved for later', 'success');
}

// Initialize page-specific functions
$(document).ready(function() {
    // Check which page we're on and initialize appropriate functions
    if (window.location.pathname.includes('catalog.html')) {
        initCatalogPage();
        // Ensure all cards are visible on page load
        $('.product-card').show();
        // Update results count on page load
        const visibleCount = $('.product-card:visible').length;
        $('.results-count').text(visibleCount + ' products found');
    } else if (window.location.pathname.includes('cart.html')) {
        initCartPage();
    } else if (window.location.pathname.includes('product.html')) {
        initProductPage();
    }
});

// Fix for catalog page - ensure cards are visible
$(document).ready(function() {
    if (window.location.pathname.includes('catalog.html')) {
        console.log('Catalog page detected, initializing...');
        $('.product-card').show();
        const visibleCount = $('.product-card:visible').length;
        $('.results-count').text(visibleCount + ' products found');
        console.log('Found ' + visibleCount + ' product cards');
    }
});

// Fix for cart page - correct quantity and price handling
$(document).ready(function() {
    if (window.location.pathname.includes('cart.html')) {
        // Store base prices for each item
        const basePrices = {
            'macbook': 2499,
            'iphone': 999,
            'tv': 1299
        };
        
        // Override quantity controls with correct logic
        $('.quantity-btn').off('click').on('click', function() {
            const $btn = $(this);
            const $item = $btn.closest('.cart-item');
            const $quantity = $item.find('.quantity-value');
            const $price = $item.find('.item-price');
            const currentQty = parseInt($quantity.text());
            const productId = $item.data('product');
            const basePrice = basePrices[productId];
            
            if ($btn.text() === '+' && currentQty < 10) {
                const newQty = currentQty + 1;
                $quantity.text(newQty);
                $price.text('$' + (basePrice * newQty).toLocaleString());
                updateCartTotal();
                showNotification('Quantity updated', 'success');
            } else if ($btn.text() === '-' && currentQty > 1) {
                const newQty = currentQty - 1;
                $quantity.text(newQty);
                $price.text('$' + (basePrice * newQty).toLocaleString());
                updateCartTotal();
                showNotification('Quantity updated', 'success');
            } else if ($btn.text() === '-' && currentQty === 1) {
                // Remove item from cart when quantity is 1 and minus is clicked
                const productName = $item.find('.item-title').text();
                $item.fadeOut(300, function() {
                    $(this).remove();
                    updateCartTotal();
                    showNotification(productName + ' removed from cart', 'info');
                });
            }
        });
        
        // Update cart total on page load
        updateCartTotal();
    }
});

// Fixed updateCartTotal function
function updateCartTotal() {
    let total = 0;
    let itemCount = 0;
    
    $('.cart-item').each(function() {
        const price = parseFloat($(this).find('.item-price').text().replace('$', '').replace(',', ''));
        const quantity = parseInt($(this).find('.quantity-value').text());
        total += price;
        itemCount += quantity;
    });
    
    const tax = total * 0.08;
    const finalTotal = total + tax;
    
    // Update summary
    $('.summary-row').eq(0).find('.summary-label').text(`Subtotal (${itemCount} items)`);
    $('.summary-row').eq(0).find('.summary-value').text('$' + total.toLocaleString());
    $('.summary-row').eq(2).find('.summary-value').text('$' + tax.toFixed(2));
    $('.summary-row.total .summary-value').text('$' + finalTotal.toFixed(2));
}

// Enhanced catalog filtering
$(document).ready(function() {
    if (window.location.pathname.includes('catalog.html')) {
        // Override filter functionality with enhanced logic
        $('.filter-apply').off('click').on('click', function() {
            applyFilters();
            showNotification('Filters applied successfully!', 'success');
        });
        
        $('.filter-clear').off('click').on('click', function() {
            $('input[type="checkbox"]').prop('checked', false);
            $('input[type="number"]').val('');
            $('.product-card').show();
            updateResultsCount();
            showNotification('All filters cleared!', 'info');
        });
        
        function applyFilters() {
            const selectedCategories = $('input[value="laptop"], input[value="smartphone"], input[value="tablet"], input[value="tv"], input[value="headphones"]:checked').map(function() {
                return $(this).val();
            }).get();
            
            const selectedBrands = $('input[value="apple"], input[value="samsung"], input[value="dell"], input[value="hp"], input[value="sony"], input[value="lg"]:checked').map(function() {
                return $(this).val();
            }).get();
            
            const selectedRAM = $('input[value="8"], input[value="16"], input[value="32"]:checked').map(function() {
                return parseInt($(this).val());
            }).get();
            
            const selectedStorage = $('input[value="256"], input[value="512"], input[value="1024"]:checked').map(function() {
                return parseInt($(this).val());
            }).get();
            
            const minPrice = parseInt($('#minPrice').val()) || 0;
            const maxPrice = parseInt($('#maxPrice').val()) || Infinity;
            
            $('.product-card').each(function() {
                const $card = $(this);
                const category = $card.data('category');
                const brand = $card.data('brand');
                const ram = parseInt($card.data('ram'));
                const storage = parseInt($card.data('storage'));
                const price = parseInt($card.find('.product-price').text().replace('$', '').replace(',', ''));
                
                let show = true;
                
                // Category filter
                if (selectedCategories.length > 0 && !selectedCategories.includes(category)) {
                    show = false;
                }
                
                // Brand filter
                if (selectedBrands.length > 0 && !selectedBrands.includes(brand)) {
                    show = false;
                }
                
                // RAM filter
                if (selectedRAM.length > 0 && !selectedRAM.includes(ram)) {
                    show = false;
                }
                
                // Storage filter
                if (selectedStorage.length > 0 && !selectedStorage.includes(storage)) {
                    show = false;
                }
                
                // Price filter
                if (price < minPrice || price > maxPrice) {
                    show = false;
                }
                
                if (show) {
                    $card.show();
                } else {
                    $card.hide();
                }
            });
            
            updateResultsCount();
        }
        
        function updateResultsCount() {
            const visibleCount = $('.product-card:visible').length;
            $('.results-count').text(visibleCount + ' products found');
        }
        
        // Add to Cart functionality
        $('.add-to-cart-btn').on('click', function() {
            const $card = $(this).closest('.product-card');
            const productName = $card.find('.product-title').text();
            const productPrice = $card.find('.product-price').text();
            
            showNotification(productName + ' added to cart!', 'success');
            
            // Add animation effect
            $(this).html('✓ Added').addClass('btn-success').removeClass('btn-success');
            setTimeout(() => {
                $(this).html('Add to Cart').removeClass('btn-success').addClass('btn-success');
            }, 2000);
        });
        
        // View Details functionality
        $('.btn-primary').on('click', function() {
            if ($(this).text() === 'View Details') {
                const $card = $(this).closest('.product-card');
                const productName = $card.find('.product-title').text();
                showNotification('Opening details for ' + productName, 'info');
            }
        });
    }
});




