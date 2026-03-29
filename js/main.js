/**
 * Auckland Precision Plumbing — main.js
 * Scroll animations, mobile nav, contact form, analytics events.
 */

'use strict';

/* Enable JS-dependent styles (progressive enhancement) */
document.documentElement.classList.add('js');

/* ----------------------------------------------------------------
   Scroll fade-in animations via IntersectionObserver
---------------------------------------------------------------- */
(function initScrollAnimations() {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach(function (el) {
    observer.observe(el);
  });
}());

/* ----------------------------------------------------------------
   Mobile navigation toggle
---------------------------------------------------------------- */
(function initMobileNav() {
  var toggle = document.querySelector('.nav__toggle');
  var nav = document.querySelector('.nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('is-open', !isOpen);
  });

  nav.querySelectorAll('.nav__link, .nav__cta').forEach(function (link) {
    link.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    });
  });

  document.addEventListener('click', function (e) {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });
}());

/* ----------------------------------------------------------------
   Update footer copyright year
---------------------------------------------------------------- */
(function updateYear() {
  var yearEl = document.getElementById('footer-year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }
}());

/* ----------------------------------------------------------------
   Contact form — client-side validation + Formspree AJAX submit
---------------------------------------------------------------- */
(function initContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var successMsg = document.getElementById('form-success');
  var errorMsg = document.getElementById('form-error');
  var submitBtn = form.querySelector('.contact-form__submit');

  function validateField(input) {
    var value = input.value.trim();
    if (input.required && !value) return 'This field is required.';
    if (input.type === 'email' && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.';
    }
    if (input.type === 'tel' && value) {
      if (!/^[\d\s\+\-\(\)]{7,20}$/.test(value)) return 'Please enter a valid phone number.';
    }
    return '';
  }

  function setFieldError(input, message) {
    var errorEl = document.getElementById(input.id + '-error');
    if (!errorEl) return;
    errorEl.textContent = message;
    if (message) {
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
    }
  }

  form.querySelectorAll('.form-input[required], .form-input[type="email"], .form-input[type="tel"]').forEach(function (input) {
    input.addEventListener('blur', function () { setFieldError(input, validateField(input)); });
    input.addEventListener('input', function () {
      if (input.classList.contains('is-invalid')) { setFieldError(input, validateField(input)); }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var isValid = true;
    form.querySelectorAll('.form-input[required]').forEach(function (input) {
      var error = validateField(input);
      setFieldError(input, error);
      if (error) isValid = false;
    });
    if (!isValid) return;

    form.classList.add('is-loading');
    submitBtn.disabled = true;
    successMsg.hidden = true;
    errorMsg.hidden = true;

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
    .then(function (response) {
      form.classList.remove('is-loading');
      submitBtn.disabled = false;
      if (response.ok) {
        form.reset();
        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        fireEvent('form_submit', { form_name: 'contact' });
      } else {
        errorMsg.hidden = false;
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    })
    .catch(function () {
      form.classList.remove('is-loading');
      submitBtn.disabled = false;
      errorMsg.hidden = false;
      errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}());

/* ----------------------------------------------------------------
   Analytics event tracking (GA4)
---------------------------------------------------------------- */
function fireEvent(eventName, params) {
  if (typeof gtag === 'function') { gtag('event', eventName, params || {}); }
}

(function initAnalyticsTracking() {
  document.querySelectorAll('[data-event="cta_click"]').forEach(function (el) {
    el.addEventListener('click', function () {
      fireEvent('cta_click', { button_label: el.getAttribute('data-label') || 'unknown' });
    });
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
    el.addEventListener('click', function () {
      fireEvent('phone_click', { phone_number: el.getAttribute('href') || 'unknown' });
    });
  });
}());
