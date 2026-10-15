// Local demo only. No submission, persistence, or external requests.
(() => {
  const form = document.getElementById('contact-enquiry');
  if (!form) return;
  const email = form.elements.namedItem('email');
  const message = form.elements.namedItem('message');
  const result = document.getElementById('form-result');

  message.addEventListener('input', () => message.setCustomValidity(''));
  form.addEventListener('input', () => {
    result.hidden = true;
    result.textContent = '';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    email.value = email.value.trim();
    message.setCustomValidity(message.value.trim() ? '' : 'Please write a message.');
    if (!form.reportValidity()) return;
    result.hidden = false;
    result.textContent = 'Thanks for trying the form. This is a demo, so your message has not been sent or saved.';
  });
  form.querySelectorAll('input, textarea, button[type="submit"]').forEach(control => {
    control.disabled = false;
  });
})();
