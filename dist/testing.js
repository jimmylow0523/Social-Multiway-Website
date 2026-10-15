// These previews and saved colors apply only to the Testing page.
(() => {
  const controls = [...document.querySelectorAll('.color-control[data-color]')];
  if (!controls.length) return;
  const note = document.getElementById('color-save-note');
  let storageAvailable = true;

  const normalizeColor = value => {
    const digits = value.trim().replace(/^#/, '');
    if (/^[\da-f]{6}$/i.test(digits)) return `#${digits.toUpperCase()}`;
    if (/^[\da-f]{3}$/i.test(digits)) {
      return `#${[...digits].map(digit => digit + digit).join('').toUpperCase()}`;
    }
    return null;
  };
  const updateNote = () => {
    note.textContent = storageAvailable
      ? 'Colors are remembered in this browser for the Testing page only.'
      : 'Colors apply to this visit on the Testing page only.';
  };

  controls.forEach(control => {
    const key = control.dataset.color;
    const defaultColor = control.dataset.default;
    const picker = control.querySelector('[data-picker]');
    const hex = control.querySelector('[data-hex]');
    const reset = control.querySelector('[data-reset]');
    const error = control.querySelector('.color-error');
    const storageKey = `social-multiway:testing-${key}-color`;
    let currentColor = defaultColor;

    const clearError = () => {
      hex.removeAttribute('aria-invalid');
      error.hidden = true;
    };
    const applyColor = (color, syncHex = true, persist = true) => {
      currentColor = color;
      document.body.style.setProperty(`--testing-${key}-color`, color);
      picker.value = color.toLowerCase();
      if (syncHex) hex.value = color;
      clearError();
      if (persist) {
        try {
          if (color === defaultColor) localStorage.removeItem(storageKey);
          else localStorage.setItem(storageKey, color);
        } catch { storageAvailable = false; }
      }
      updateNote();
    };

    let initialColor = defaultColor;
    try {
      initialColor = normalizeColor(localStorage.getItem(storageKey) || '') || defaultColor;
    } catch { storageAvailable = false; }
    applyColor(initialColor, true, false);
    control.disabled = false;

    picker.addEventListener('input', () => applyColor(picker.value.toUpperCase()));
    picker.addEventListener('change', () => applyColor(picker.value.toUpperCase()));
    hex.addEventListener('input', () => {
      clearError();
      const color = normalizeColor(hex.value);
      if (color) applyColor(color, false);
    });
    const finishHexEdit = () => {
      const color = normalizeColor(hex.value);
      if (color) applyColor(color);
      else {
        hex.setAttribute('aria-invalid', 'true');
        error.hidden = false;
      }
    };
    hex.addEventListener('blur', finishHexEdit);
    hex.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        finishHexEdit();
      } else if (event.key === 'Escape') {
        hex.value = currentColor;
        clearError();
      }
    });
    const resetColor = () => applyColor(defaultColor);
    reset.addEventListener('click', resetColor);
  });

  const target = document.getElementById('color-target');
  const showSelectedControl = () => {
    controls.forEach(control => { control.hidden = control.dataset.color !== target.value; });
  };
  target.addEventListener('change', showSelectedControl);
  showSelectedControl();

  const toggle = document.getElementById('color-panel-toggle');
  const panelBody = document.getElementById('color-panel-body');
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    panelBody.hidden = expanded;
    toggle.textContent = expanded ? 'Expand' : 'Minimize';
  });
})();
