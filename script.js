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

// Support forms: file a request straight into the Twyne support queue
(function () {
  var API = 'https://pvvvphzlihqqwfxdnedb.supabase.co/rest/v1/rpc/submit_web_support_request';
  var KEY = 'sb_publishable_yVs9A_3YQHI15ubThwEA9g_3GjAqNe_';
  var forms = document.querySelectorAll('form[data-support-form]');
  if (!forms.length) return;

  var ERRORS = {
    invalid_category: 'Please choose what you need help with.',
    invalid_email: 'Please enter a valid email address.',
    invalid_subject: 'Please add a short subject.',
    invalid_body: 'Please tell us a little more.',
    rate_limited: 'You’ve sent a few requests already. Please wait a while and try again, or email contact@twyne-dating.com.'
  };

  forms.forEach(function (form) {
    var msg = form.querySelector('.form-msg');
    var btn = form.querySelector('button[type="submit"]');
    var label = btn.textContent;
    var note = form.querySelector('.deletion-note');
    var subjectRow = form.querySelector('[data-subject-row]');
    var emailLabel = form.querySelector('[data-label-email]');
    var messageLabel = form.querySelector('[data-label-message]');

    function sync() {
      var del = form.category.value === 'deletion';
      note.hidden = !del;
      subjectRow.hidden = del;
      emailLabel.textContent = del ? 'Email address on your Twyne account' : 'Your email address';
      messageLabel.innerHTML = del ? 'Anything we should know? <span class="opt">(optional)</span>' : 'How can we help?';
      label = del ? 'Request account deletion' : 'Send message';
      btn.textContent = label;
    }
    form.category.addEventListener('change', sync);
    sync();

    function fail(text) {
      msg.textContent = text;
      msg.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.hidden = true;
      var email = form.email.value.trim();
      var isDeletion = form.category.value === 'deletion';
      var subject = isDeletion ? 'Account deletion request' : form.subject.value.trim();
      var body;
      if (isDeletion) {
        var note = form.message.value.trim();
        body = 'Please delete my Twyne account and all associated data.' +
          (note ? '\n\nNotes: ' + note : '') + '\n\nI understand deletion is permanent.';
      } else {
        body = form.message.value.trim();
      }
      if (!form.category.value) { fail(ERRORS.invalid_category); form.category.focus(); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { fail(ERRORS.invalid_email); form.email.focus(); return; }
      if (!subject) { fail(ERRORS.invalid_subject); form.subject.focus(); return; }
      if (!body) { fail(ERRORS.invalid_body); form.message.focus(); return; }

      btn.disabled = true;
      btn.textContent = 'Sending…';
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: KEY },
        body: JSON.stringify({
          p_email: email,
          p_name: form.name.value.trim(),
          p_category: form.category.value,
          p_subject: subject,
          p_body: body,
          p_website: form.website.value
        })
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok) { throw new Error((data && data.message) || 'error'); }
          var ok = document.createElement('div');
          ok.className = 'form-success';
          ok.setAttribute('role', 'status');
          ok.innerHTML = '<h3>Thanks, we’ve got it.</h3><p>' +
            (isDeletion
              ? 'We’ll email you at the address you gave to confirm your deletion request.'
              : 'We’ll reply to the email address you gave, usually within 2 business days.') + '</p>';
          form.replaceWith(ok);
        });
      }).catch(function (err) {
        btn.disabled = false;
        btn.textContent = label;
        fail(ERRORS[err.message] || 'Sorry, something went wrong sending that. Please try again, or email contact@twyne-dating.com.');
      });
    });
  });
})();

// Support: links that preselect a topic (e.g. ?topic=deletion)
(function () {
  var sel = document.getElementById('cf-category');
  if (!sel) return;
  function pick(topic) {
    if (![].some.call(sel.options, function (o) { return o.value === topic; })) return;
    sel.value = topic;
    sel.dispatchEvent(new Event('change'));
  }
  var m = /[?&]topic=([a-z]+)/.exec(location.search);
  if (m) pick(m[1]);
  document.querySelectorAll('[data-topic]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      pick(a.getAttribute('data-topic'));
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      sel.focus({ preventScroll: true });
    });
  });
})();
