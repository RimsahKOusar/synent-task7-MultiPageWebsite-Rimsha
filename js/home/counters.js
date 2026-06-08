/*
╔═══════════════════════════════════════════════════════════════╗
║  js/home/counters.js  –  ANIMATED STAT NUMBERS               ║
║                                                               ║
║  What this file does:                                         ║
║  Animates the three hero stat numbers (e.g. "120+") counting ║
║  up from 0 to their target value when they scroll into view. ║
║                                                               ║
║  Runs on: index.html only                                     ║
║  Corresponding HTML: elements with [data-count] attribute    ║
╚═══════════════════════════════════════════════════════════════╝
*/


/**
 * animateCount(el, target, duration, suffix)
 * ──────────────────────────────────────────
 * Counts a number from 0 up to target over duration milliseconds.
 *
 * The easing maths explained:
 *   progress  → goes from 0 to 1 linearly over time.
 *   easeOut() → transforms that into a curve that decelerates:
 *               fast at first, slows down near the end.
 *   1 - (1-t)³ is the "ease-out-cubic" formula.
 *
 * @param {HTMLElement} el        element to update
 * @param {number}      target    final number to reach
 * @param {number}      duration  animation length in milliseconds
 * @param {string}      suffix    text after the number ("+" or "%")
 */
function animateCount(el, target, duration, suffix) {
  const startTime = performance.now();  /* high-resolution timestamp */

  /* Cubic ease-out: decelerates as it approaches the target */
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  /*
   * requestAnimationFrame calls our function just before each
   * screen repaint (~60 times per second on most displays).
   * This gives us smooth 60fps animation without timers.
   */
  function step(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);  /* clamp 0–1 */

    /* Apply easing and round to a whole number */
    const value = Math.round(target * easeOut(progress));
    el.textContent = value + suffix;

    /* Keep animating until progress reaches 1.0 (100%) */
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}


/**
 * initCounters()
 * ──────────────
 * Finds every element with a [data-count] attribute and starts
 * its animation when the element enters the viewport.
 *
 * HTML convention used:
 *   <span class="hero-stat-num"
 *         data-count="120"
 *         data-suffix="+">
 *     120+
 *   </span>
 *
 *   data-count  = the target number to count to
 *   data-suffix = text appended after (e.g. "+" or "%")
 */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;   /* page has no counters — exit early */

  /*
   * IntersectionObserver fires when an element enters the viewport.
   * threshold: 0.5 = wait until 50% of the element is visible
   * before starting the count.
   */
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.count,  10);
        const suffix = el.dataset.suffix || '';

        animateCount(el, target, 1800, suffix);

        /* Each counter only animates once */
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}


/* Start when the DOM is fully parsed */
document.addEventListener('DOMContentLoaded', initCounters);
