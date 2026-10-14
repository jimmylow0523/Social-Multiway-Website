const header = document.querySelector('.header');
if (header) {
  let scrollFramePending = false;
  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    scrollFramePending = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollFramePending) {
      scrollFramePending = true;
      window.requestAnimationFrame(updateHeader);
    }
  }, { passive: true });
  window.addEventListener('pageshow', updateHeader);
  updateHeader();
}
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-menu');
if (menuButton && navigation) {
  const setMenuOpen = isOpen => {
    navigation.hidden = !isOpen;
    header?.classList.toggle('is-menu-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  };
  const closeMenu = (restoreFocus = false) => {
    setMenuOpen(false);
    if (restoreFocus) menuButton.focus();
  };
  menuButton.addEventListener('click', () => setMenuOpen(navigation.hidden));
  menuButton.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setMenuOpen(true);
      navigation.querySelector('a')?.focus();
    }
  });
  navigation.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const destination = new URL(link.href, location.href);
    closeMenu();
    if (destination.origin === location.origin && destination.pathname === location.pathname && destination.hash) {
      document.getElementById(decodeURIComponent(destination.hash.slice(1)))?.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !navigation.hidden) closeMenu(true); });
  document.addEventListener('click', event => { if (!event.target.closest('.menu-cluster')) closeMenu(); });
  document.addEventListener('focusin', event => { if (!event.target.closest('.menu-cluster')) closeMenu(); });
  window.addEventListener('pageshow', () => closeMenu());
}
const enquiryForm = document.querySelector('#enquiry-form');
if (enquiryForm) {
  enquiryForm.addEventListener('submit', event => {
    event.preventDefault();
    const result = document.querySelector('#form-result');
    result.hidden = false;
    result.textContent = 'Preview complete. Your message has not been sent or saved.';
    result.focus();
  });
}
