/*
╔═══════════════════════════════════════════════════════════════╗
║  js/shared/nav.js  –  NAVIGATION BEHAVIOUR                   ║
║                                                               ║
║  What this file does:                                         ║
║  1. Glass-blur effect: adds .scrolled to .navbar when the    ║
║     user scrolls more than 60px from the top.                ║
║  2. Active link: highlights the nav link matching the        ║
║     current page URL.                                         ║
║  3. Mobile menu: toggles the hamburger open/close.           ║
║                                                               ║
║  Runs on: every page (loaded in every HTML <body>)           ║
║  Corresponding CSS: css/shared/nav.css                       ║
╚═══════════════════════════════════════════════════════════════╝
*/


/* ── DOM REFERENCES ───────────────────────────────────────────────
   Grab all nav elements once at the top.
   Re-querying the DOM inside every function is slower.
   ──────────────────────────────────────────────────────────────── */
const navbar         = document.querySelector('.navbar');
const navToggle      = document.querySelector('.nav-toggle');
const mobilePanel    = document.querySelector('.nav-mobile-panel');
const navLinks       = document.querySelectorAll('.nav-link');
const mobileLinks    = document.querySelectorAll('.nav-mobile-link');


/* ══════════════════════════════════════════════════════════════
   FEATURE 1: Scroll-triggered glass effect
   ══════════════════════════════════════════════════════════════

   How it works:
   window.scrollY gives the number of pixels scrolled from the top.
   When > 60px → add .scrolled → CSS applies backdrop-filter blur.
   When = 0    → remove .scrolled → navbar goes transparent again.
*/
function handleNavScroll() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

/* Listen for every scroll event */
window.addEventListener('scroll', handleNavScroll);

/* Run once immediately — page might load at a scrolled position */
handleNavScroll();


/* ══════════════════════════════════════════════════════════════
   FEATURE 2: Active link highlighting
   ══════════════════════════════════════════════════════════════

   window.location.pathname = the URL path of the current page.
   Examples:
     "/"                 → home (index.html)
     "/pages/about.html" → about page
     "/pages/contact.html" → contact page

   We compare the end part of each nav link's href to the path.
*/
function markActiveLink() {
  const path = window.location.pathname;

  /* Helper: get just the filename from a full path.
     "/pages/about.html" → "about.html"
     "/"                 → "" (treated as home)             */
  const filename = str => str.split('/').pop();

  /* Mark active on desktop + mobile links together */
  [...navLinks, ...mobileLinks].forEach(link => {
    link.classList.remove('active');

    const linkFile = filename(link.getAttribute('href') || '');
    const pageFile = filename(path);

    /* Home page match */
    const isHome = (pageFile === '' || pageFile === 'index.html')
                && (linkFile === '' || linkFile === 'index.html');

    /* Regular page match */
    const isMatch = linkFile !== '' && linkFile === pageFile;

    if (isHome || isMatch) {
      link.classList.add('active');
    }
  });
}

markActiveLink();


/* ══════════════════════════════════════════════════════════════
   FEATURE 3: Mobile hamburger menu
   ══════════════════════════════════════════════════════════════

   Clicking the hamburger button:
   — Toggles .open on the button   → CSS animates ☰ to ✕
   — Toggles .open on the panel    → CSS shows the dropdown
   — Sets aria-expanded for screen readers
*/
if (navToggle && mobilePanel) {

  navToggle.addEventListener('click', function () {
    const isOpen = mobilePanel.classList.toggle('open');
    navToggle.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  /* Clicking a link inside the mobile menu closes it */
  mobileLinks.forEach(link => {
    link.addEventListener('click', function () {
      mobilePanel.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* Clicking OUTSIDE the navbar also closes the mobile menu */
  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target)) {
      mobilePanel.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
