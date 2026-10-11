// Scroll reveal
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(function (e) { io.observe(e); });
})();

// FAQ: expand/collapse all
(function () {
  var btn = document.getElementById('toggle-all');
  if (!btn) return;
  var open = false;
  btn.addEventListener('click', function () {
    open = !open;
    document.querySelectorAll('.faq-wrap details').forEach(function (d) { d.open = open; });
    btn.textContent = open ? 'Collapse all' : 'Expand all';
  });
})();

// Tester sign-up: embed the Google Form once its URL is set in testers.html
(function () {
  var mount = document.getElementById('form-mount');
  if (!mount) return;
  var url = mount.getAttribute('data-form-url');
  if (!url) return; // placeholder stays visible
  var f = document.createElement('iframe');
  f.src = url;
  f.title = 'Twyne tester sign-up form';
  f.loading = 'lazy';
  f.textContent = 'Loading…';
  mount.innerHTML = '';
  mount.appendChild(f);
})();
