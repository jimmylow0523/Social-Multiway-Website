(() => {
  const form = document.getElementById('contact-enquiry');
  if (!form) return;
  const name = form.elements.namedItem('name');
  const email = form.elements.namedItem('email');
  const message = form.elements.namedItem('message');
  const result = document.getElementById('form-result');
  const count = document.getElementById('message-count');
  const checked = new Set();
  form.noValidate = true;

  function errorFor(field) {
    if (!field.value.trim()) return field === email ? 'Enter your email address.' : 'Please write a message.';
    if (field === email && field.validity.typeMismatch) return 'Enter a valid email, such as name@example.com.';
    return '';
  }
  function validate(field) {
    const error = errorFor(field);
    const note = document.getElementById(`${field.id}-error`);
    field.setAttribute('aria-invalid', String(Boolean(error)));
    note.textContent = error;
    note.hidden = !error;
    return !error;
  }
  function updateCount() {
    count.textContent = `${message.value.length.toLocaleString('en-US')} / 5,000`;
  }
  [email, message].forEach(field => {
    field.addEventListener('blur', () => {
      if (field.value || checked.has(field)) {
        checked.add(field);
        validate(field);
      }
    });
    field.addEventListener('input', () => {
      if (checked.has(field)) validate(field);
    });
  });
  form.addEventListener('input', () => {
    result.hidden = true;
    updateCount();
  });
  window.addEventListener('pageshow', updateCount);
  updateCount();
  form.addEventListener('submit', event => {
    event.preventDefault();
    email.value = email.value.trim();
    const invalid = [email, message].filter(field => {
      checked.add(field);
      return !validate(field);
    });
    if (invalid.length) {
      result.hidden = true;
      invalid[0].focus();
      return;
    }
    document.getElementById('preview-name-row').hidden = !name.value.trim();
    document.getElementById('preview-name').textContent = name.value.trim();
    document.getElementById('preview-email').textContent = email.value;
    document.getElementById('preview-message').textContent = message.value.trim();
    result.hidden = false;
    document.getElementById('preview-title').focus({ preventScroll: true });
    result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  });
  form.querySelector('.edit-message').addEventListener('click', () => {
    result.hidden = true;
    message.focus();
  });
  form.querySelectorAll('input, textarea, button[type=submit]').forEach(control => { control.disabled = false; });
})();
