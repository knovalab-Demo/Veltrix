(function () {
  var script = document.currentScript;
  var base = new URL('../../', script.src).href; // site root; works locally and on sub-path hosts

  function load(mountId, file) {
    var mount = document.getElementById(mountId);
    if (!mount) return Promise.resolve(false);
    return fetch(base + 'assets/components/' + file)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) { mount.innerHTML = html.split('{{base}}').join(base); return true; })
      .catch(function () {
        mount.innerHTML = '<nav class="wrap fallback" aria-label="Main"><a href="' + base + '">Home</a> <a href="' + base + 'about/">About Us</a> <a href="' + base + 'contact/">Contact</a></nav>';
        return false;
      });
  }

  function initNav() {
    var page = document.body.dataset.page;
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.dataset.nav === page) a.setAttribute('aria-current', 'page');
    });
    var btn = document.querySelector('.nav-toggle'), menu = document.getElementById('nav-menu');
    if (!btn || !menu) return;
    function set(open) {
      btn.setAttribute('aria-expanded', open);
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('open', open);
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) { set(false); btn.focus(); }
    });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') set(false); });
    var nav = document.querySelector('.nav');
    function scrolled() { nav.classList.toggle('scrolled', window.scrollY > 10); }
    scrolled(); window.addEventListener('scroll', scrolled, { passive: true });
  }

  function initFooter() { var y = document.getElementById('yr'); if (y) y.textContent = new Date().getFullYear(); }

  function initForm() {
    var form = document.getElementById('enquiry');
    if (!form) return;
    var status = document.getElementById('form-status');
    function f(id) { return form.elements[id]; }
    function err(id, msg) {
      document.getElementById('e-' + id).textContent = msg || '';
      f(id).setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = f('phone').value.replace(/[\s\-()]/g, '');
      var ok = [
        err('name', f('name').value.trim() ? '' : 'Enter your name.'),
        err('phone', /^\+?\d{10,13}$/.test(phone) ? '' : 'Enter a valid phone number.'),
        err('email', !f('email').value || f('email').validity.valid ? '' : 'Enter a valid email address.'),
        err('type', f('type').value ? '' : 'Choose an enquiry type.'),
        err('message', f('message').value.trim() ? '' : 'Write a short message.')
      ].every(Boolean);
      status.className = 'status';
      if (!ok) {
        status.textContent = 'Please fix the highlighted fields.'; status.classList.add('bad');
        form.querySelector('[aria-invalid="true"]').focus(); return;
      }
      var lines = ['Hello Veltrix, I would like to make an enquiry.', 'Name: ' + f('name').value.trim(), 'Phone: ' + f('phone').value.trim()];
      if (f('email').value) lines.push('Email: ' + f('email').value.trim());
      lines.push('Enquiry type: ' + f('type').value, 'Message: ' + f('message').value.trim());
      window.open('https://wa.me/919767155367?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
      status.textContent = 'WhatsApp should now be open with your message ready. Press send there to reach us.';
      status.classList.add('good');
    });
  }

  function initImages() {
    document.querySelectorAll('img').forEach(function (img) {
      function fail() { img.classList.add('img-failed'); }
      img.addEventListener('error', fail);
      if (img.complete && img.naturalWidth === 0 && img.src) fail();
    });
  }

  Promise.all([load('site-navbar', 'navbar.html'), load('site-footer', 'footer.html')]).then(function () {
    initNav(); initFooter(); initForm(); initImages();
  });
})();

// Pointer spotlight on cards
document.addEventListener('pointermove', function (e) {
  var c = e.target.closest && e.target.closest('.fx');
  if (!c) return;
  var r = c.getBoundingClientRect();
  c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  c.style.setProperty('--my', (e.clientY - r.top) + 'px');
}, { passive: true });
