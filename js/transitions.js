/*
╔═══════════════════════════════════════════════════════════════╗
║  js/shared/transitions.js  –  PAGE TRANSITIONS + REVEAL      ║
║                                                               ║
║  What this file does:                                         ║
║  1. PAGE TRANSITIONS — smooth fade when navigating between   ║
║     pages instead of an instant jump.                        ║
║  2. SCROLL REVEAL — elements with class .reveal slide into   ║
║     view as they enter the viewport while scrolling.         ║
║                                                               ║
║  Runs on: every page                                          ║
║  Corresponding CSS: css/shared/components.css (.page-overlay)║
╚═══════════════════════════════════════════════════════════════╝
*/


/* ══════════════════════════════════════════════════════════════
   PAGE TRANSITIONS
   ══════════════════════════════════════════════════════════════

   The .page-overlay div sits in every HTML file.
   It covers the whole screen and fades in/out.

   ENTERING a page:
     overlay starts visible → fades out to reveal the page.

   LEAVING a page:
     overlay fades in to cover the page →
     browser navigates → on arrival, step above runs.
*/

const overlay = document.querySelector('.page-overlay');

/* ── On page LOAD: fade the overlay out ──────────────────────── */
if (overlay) {
  /* Set starting state — visible */
  overlay.classList.add('fade-in');

  /*
   * requestAnimationFrame fires just before the browser paints.
   * Two nested calls give the browser one frame to register
   * the .fade-in class before we swap to .fade-out.
   * Without this double RAF, the transition doesn't animate.
   */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.remove('fade-in');
      overlay.classList.add('fade-out');
    });
  });
}


/* ── On link CLICK: fade the overlay in, then navigate ───────── */
document.addEventListener('click', function (e) {
  /* Find the nearest <a> ancestor of whatever was clicked */
  const link = e.target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href');

  /*
   * Only intercept "internal" links — same-site pages.
   * Leave alone: external URLs, mailto/tel, anchor jumps,
   * links that open a new tab, download links.
   */
  if (
    !href ||
    href.startsWith('http') ||
    href.startsWith('mailto') ||
    href.startsWith('tel') ||
    href.startsWith('#') ||
    link.getAttribute('target') === '_blank' ||
    link.hasAttribute('download')
  ) {
    return;
  }

  /* Stop the default instant navigation */
  e.preventDefault();

  /* Fade overlay in */
  if (overlay) {
    overlay.classList.remove('fade-out');
    overlay.classList.add('fade-in');
  }

  /*
   * Wait for the fade-in animation to finish (--duration-slow = 400ms),
   * then let the browser navigate to the new page.
   */
  setTimeout(() => {
    window.location.href = href;
  }, 400);
});


/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL
   ══════════════════════════════════════════════════════════════

   Any HTML element with class .reveal will:
     — Start invisible and slightly below its final position
     — Animate smoothly into view when it enters the viewport

   We use IntersectionObserver (more efficient than listening
   to the 'scroll' event and manually checking positions).

   IntersectionObserver fires a callback when a watched element
   is X% visible on screen. threshold: 0.15 = 15% visible.
*/

/* Inject the .reveal / .revealed CSS directly from JS.
   We do this here because the reveal logic and CSS are tightly
   coupled — if you delete this file the CSS is also gone.    */
const revealStyle = document.createElement('style');
revealStyle.textContent = `
  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.55s var(--ease-out), transform 0.55s var(--ease-out);
  }
  .reveal.revealed {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(revealStyle);


/* Build the observer */
const revealObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        /* Stop watching after first reveal — no need to re-animate */
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);


/* Start watching every .reveal element once the DOM is ready */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });
});
