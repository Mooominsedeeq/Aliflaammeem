/**
 * =============================================================================
 * ALIF LAM MEEM OFFICIAL — app.js
 * SPA Router, Navigation, Mobile Menu, Scroll Effects
 * =============================================================================
 */

'use strict';

/* ============================= STATE ============================= */
const state = {
  currentSection: 'home',
  mobileMenuOpen: false,
  isScrolled: false,
};

/* ============================= ROUTER ============================ */

/**
 * Navigates to a section by ID, hides all others, triggers animations.
 * @param {string} sectionId - The ID of the target section (without '#')
 * @param {boolean} [updateHistory=true] - Whether to push to browser history
 */
function navigateTo(sectionId, updateHistory = true) {
  const validSections = ['home', 'history', 'mission', 'app'];

  // Normalise
  const target = validSections.includes(sectionId) ? sectionId : 'home';

  if (target === state.currentSection) {
    closeMobileMenu();
    return;
  }

  // --- Hide all sections ---
  document.querySelectorAll('.spa-section').forEach((section) => {
    section.classList.add('hidden');
    section.classList.remove('view-enter');
  });

  // --- Show target section ---
  const targetEl = document.getElementById(target);
  if (targetEl) {
    targetEl.classList.remove('hidden');

    // Trigger animation on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        targetEl.classList.add('view-enter');

        // Reset child animations so they replay
        const animatedChildren = targetEl.querySelectorAll('.fade-in-up');
        animatedChildren.forEach((child, idx) => {
          child.style.animationDelay = child.style.animationDelay || `${idx * 0.08}s`;
          // Force reflow to restart animation
          child.style.animation = 'none';
          void child.offsetHeight; // reflow
          child.style.animation = '';
        });
      });
    });
  }

  // --- Update active nav states ---
  updateNavActiveState(target);

  // --- Update state ---
  state.currentSection = target;

  // --- Scroll to top ---
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // --- Update URL hash without page jump ---
  if (updateHistory) {
    history.pushState({ section: target }, '', `#${target}`);
  }

  // --- Close mobile menu ---
  closeMobileMenu();
}

/**
 * Updates active classes on all nav links for a given section.
 * @param {string} sectionId
 */
function updateNavActiveState(sectionId) {
  document.querySelectorAll('.nav-item').forEach((link) => {
    link.classList.remove('active');
  });
  document.querySelectorAll('.mobile-nav-item').forEach((link) => {
    link.classList.remove('active');
  });

  // Activate matching links
  document.querySelectorAll(`.nav-link[data-section="${sectionId}"]`).forEach((link) => {
    if (link.classList.contains('nav-item') || link.classList.contains('mobile-nav-item')) {
      link.classList.add('active');
    }
  });
}

/* ============================= MOBILE MENU ======================= */

/**
 * Toggles the mobile navigation menu open/closed.
 */
function toggleMobileMenu() {
  state.mobileMenuOpen = !state.mobileMenuOpen;
  const mobileMenu      = document.getElementById('mobile-menu');
  const hamburgerIcon   = document.getElementById('hamburger-icon');
  const closeIcon       = document.getElementById('close-icon');

  if (state.mobileMenuOpen) {
    // Show: remove 'hidden', add 'open' for CSS transition
    mobileMenu.classList.remove('hidden');
    // Use rAF to allow display change before transition
    requestAnimationFrame(() => {
      mobileMenu.classList.add('open');
    });
    hamburgerIcon.classList.add('hidden');
    closeIcon.classList.remove('hidden');
  } else {
    closeMobileMenu();
  }
}

/**
 * Closes the mobile menu (and resets icon).
 */
function closeMobileMenu() {
  if (!state.mobileMenuOpen) return;
  state.mobileMenuOpen = false;

  const mobileMenu    = document.getElementById('mobile-menu');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon     = document.getElementById('close-icon');

  mobileMenu.classList.remove('open');
  hamburgerIcon.classList.remove('hidden');
  closeIcon.classList.add('hidden');

  // Hide after transition ends
  mobileMenu.addEventListener(
    'transitionend',
    () => {
      if (!state.mobileMenuOpen) {
        mobileMenu.classList.add('hidden');
      }
    },
    { once: true }
  );
}

/* ============================= NAVBAR SCROLL ===================== */

/**
 * Adds/removes the 'scrolled' class on the navbar based on scroll position.
 */
function handleNavbarScroll() {
  const navbar = document.getElementById('navbar');
  const scrolled = window.scrollY > 20;

  if (scrolled !== state.isScrolled) {
    state.isScrolled = scrolled;
    if (scrolled) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
}

/* ============================= EVENT BINDING ===================== */

/**
 * Binds all navigation link clicks to the SPA router.
 */
function bindNavLinks() {
  document.querySelectorAll('.nav-link[data-section]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      if (section) {
        navigateTo(section);
      }
    });
  });
}

/**
 * Binds the hamburger button to the mobile menu toggle.
 */
function bindHamburger() {
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }
}

/**
 * Closes mobile menu when clicking outside of it.
 */
function bindOutsideClick() {
  document.addEventListener('click', (e) => {
    const navbar = document.getElementById('navbar');
    if (state.mobileMenuOpen && navbar && !navbar.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

/**
 * Handles browser back/forward navigation (popstate).
 */
function bindPopState() {
  window.addEventListener('popstate', (e) => {
    const section = e.state?.section || getSectionFromHash() || 'home';
    navigateTo(section, false);
  });
}

/**
 * Binds scroll event to navbar scroll effect.
 */
function bindScrollEffect() {
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
}

/**
 * Binds keyboard ESC key to close the mobile menu.
 */
function bindKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.mobileMenuOpen) {
      closeMobileMenu();
    }
  });
}

/* ============================= UTILITIES ========================= */

/**
 * Extracts section ID from the current URL hash.
 * @returns {string|null}
 */
function getSectionFromHash() {
  const hash = window.location.hash.replace('#', '').trim();
  const validSections = ['home', 'history', 'mission', 'app'];
  return validSections.includes(hash) ? hash : null;
}

/**
 * Adds intersection observer for scroll-reveal on timeline cards.
 * (Enhancement: reveals cards as they enter viewport when sections are visible)
 */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  // Observe timeline items and value chips
  document.querySelectorAll('.timeline-card, .value-chip').forEach((el) => {
    observer.observe(el);
  });
}

/**
 * Adds smooth hover ripple effect to CTA buttons.
 */
function initButtonRipples() {
  document.querySelectorAll('.cta-primary, .google-play-btn').forEach((btn) => {
    btn.addEventListener('mouseenter', function () {
      this.style.transition = 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
    });
  });
}

/**
 * Applies staggered animation delays to cards inside a section.
 * @param {string} sectionId
 */
function staggerSectionCards(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  section.querySelectorAll('.timeline-card, .mission-card, .value-chip').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.1 + 0.2}s`;
  });
}

/* ============================= INIT ============================== */

/**
 * Main initialization function — called on DOMContentLoaded.
 */
function init() {
  // 1. Determine initial section from URL hash
  const initialSection = getSectionFromHash() || 'home';

  // 2. Hide all sections first
  document.querySelectorAll('.spa-section').forEach((section) => {
    section.classList.add('hidden');
  });

  // 3. Show and animate the initial section
  const initialEl = document.getElementById(initialSection);
  if (initialEl) {
    initialEl.classList.remove('hidden');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initialEl.classList.add('view-enter');
      });
    });
  }

  // 4. Set initial state
  state.currentSection = initialSection;
  updateNavActiveState(initialSection);

  // 5. Replace current history state
  history.replaceState({ section: initialSection }, '', `#${initialSection}`);

  // 6. Bind all event listeners
  bindNavLinks();
  bindHamburger();
  bindOutsideClick();
  bindPopState();
  bindScrollEffect();
  bindKeyboard();

  // 7. Apply stagger delays
  ['home', 'history', 'mission', 'app'].forEach(staggerSectionCards);

  // 8. Init enhancements
  initScrollReveal();
  initButtonRipples();

  // 9. Initial navbar scroll check
  handleNavbarScroll();

  console.log('%c🕌 Alif Lam Meem Official', 'color: #059669; font-size: 16px; font-weight: bold;');
  console.log('%cInitialized successfully — Section: ' + initialSection, 'color: #0d9488; font-size: 12px;');
}

/* ============================= BOOT ============================== */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM already ready (e.g., script deferred or at bottom of body)
  init();
}
