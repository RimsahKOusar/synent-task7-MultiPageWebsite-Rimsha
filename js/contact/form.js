/*
╔═══════════════════════════════════════════════════════════════╗
║  js/contact/form.js  –  CONTACT FORM VALIDATION              ║
║                                                               ║
║  What this file does:                                         ║
║  1. Validates each field when the user leaves it (blur)      ║
║  2. Shows/hides error messages below invalid fields          ║
║  3. Validates all fields on submit — stops if any invalid    ║
║  4. Simulates a 1.5s form send + shows a success message     ║
║                                                               ║
║  Runs on: pages/contact.html only                            ║
║  Corresponding CSS: css/contact/contact.css                  ║
╚═══════════════════════════════════════════════════════════════╝
*/


/* ── DOM REFERENCES ───────────────────────────────────────────────  */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');


/* ══════════════════════════════════════════════════════════════
   VALIDATION RULES
   ══════════════════════════════════════════════════════════════

   An object where each key = field id,
   each value = function that returns:
     null   if valid
     string if invalid (the error message to show)

   Adding a new field: just add one entry here.
*/
const validators = {

  firstName: value => {
    if (!value.trim())          return 'First name is required.';
    if (value.trim().length < 2) return 'Must be at least 2 characters.';
    return null;
  },

  lastName: value => {
    if (!value.trim()) return 'Last name is required.';
    return null;
  },

  email: value => {
    if (!value.trim()) return 'Email address is required.';
    /*
     * Regex pattern for email:  something @ something . something
     * /^  — start of string
     * [^\s@]+  — one or more chars that aren't spaces or @
     * @  — literal at sign
     * [^\s@]+  — domain part
     * \.  — literal dot (backslash escapes the dot)
     * [^\s@]+  — TLD (.com, .net etc.)
     * $/  — end of string
     */
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) return 'Please enter a valid email address.';
    return null;
  },

  subject: value => {
    if (!value.trim())          return 'Subject is required.';
    if (value.trim().length < 4) return 'Subject is too short.';
    return null;
  },

  message: value => {
    if (!value.trim())           return 'Please write a message.';
    if (value.trim().length < 20) return 'Message must be at least 20 characters.';
    return null;
  },

};


/* ══════════════════════════════════════════════════════════════
   HELPER: setFieldState(fieldId, errorMsg)
   ══════════════════════════════════════════════════════════════

   Updates the visual state of a field:
     errorMsg = null   → green .success border
     errorMsg = string → red .error border + error text shown

   Convention: the error <span> for field "email" has id "emailError".
*/
function setFieldState(fieldId, errorMsg) {
  const input   = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + 'Error');

  if (!input) return;

  if (errorMsg) {
    /* Invalid */
    input.classList.add('error');
    input.classList.remove('success');
    if (errorEl) {
      errorEl.textContent = errorMsg;
      errorEl.classList.add('visible');
    }
  } else {
    /* Valid */
    input.classList.remove('error');
    input.classList.add('success');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }
}


/**
 * validateField(fieldId)
 * ──────────────────────
 * Runs the validator for one field, updates its visual state,
 * and returns true (valid) or false (invalid).
 */
function validateField(fieldId) {
  const input     = document.getElementById(fieldId);
  const validator = validators[fieldId];

  if (!input || !validator) return true;   /* no rule = skip */

  const error = validator(input.value);
  setFieldState(fieldId, error);
  return error === null;
}


/* ══════════════════════════════════════════════════════════════
   REAL-TIME VALIDATION  –  on blur (when user leaves a field)
   ══════════════════════════════════════════════════════════════

   'blur' event fires when an element LOSES focus.
   This is friendlier than validating while typing —
   users aren't penalised mid-sentence.
*/
Object.keys(validators).forEach(fieldId => {
  const input = document.getElementById(fieldId);
  if (!input) return;

  /* Validate when user leaves the field */
  input.addEventListener('blur', () => validateField(fieldId));

  /* If already showing an error, re-validate as user types */
  input.addEventListener('input', function () {
    if (input.classList.contains('error')) {
      validateField(fieldId);
    }
  });
});


/* ══════════════════════════════════════════════════════════════
   FORM SUBMISSION
   ══════════════════════════════════════════════════════════════ */
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {

    /*
     * e.preventDefault() stops the default browser behaviour,
     * which would reload the page or navigate away.
     * We handle the submission ourselves with JavaScript.
     */
    e.preventDefault();

    /* Validate every field and collect results */
    const allValid = Object.keys(validators)
      .map(id => validateField(id))
      .every(Boolean);   /* true only if ALL results are true */

    if (!allValid) {
      /* Scroll to the first error field */
      const firstErr = contactForm.querySelector('.form-input.error, .form-textarea.error');
      if (firstErr) {
        firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErr.focus();
      }
      return;
    }

    /* ── Simulate network request ─────────────────────────────
       In a real project you'd use fetch() to POST to a server.
       Here we fake a 1.5-second delay then show success.
       ────────────────────────────────────────────────────────── */
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Sending…';

    setTimeout(function () {
      contactForm.classList.add('hidden');
      if (formSuccess) formSuccess.classList.remove('hidden');
    }, 1500);

  });
}
