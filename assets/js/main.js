// Main JS for portfolio

/* ==========================================================================
   MOBILE MENU LOGIC
   ========================================================================== */
const burgerMenu = document.getElementById('burger-menu');
const mobileNav = document.getElementById('mobile-nav');
const closeMenu = document.getElementById('close-menu');
const mobileLinks = document.querySelectorAll('.mobile-link'); // Grab all mobile links

if (burgerMenu && mobileNav && closeMenu) {
  // Open Menu
  burgerMenu.addEventListener('click', () => {
    mobileNav.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  // Close Menu via 'X'
  closeMenu.addEventListener('click', () => {
    mobileNav.classList.remove('active');
    document.body.style.overflow = 'auto';
  });

  // Close Menu when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  });
}

/* ========================
   TESTIMONIAL CAROUSEL
========================== */
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel-track');
  if (!track) return; // Guard clause in case the section isn't on the page

  const slides = Array.from(track.children);
  const nextButton = document.querySelector('.next-btn');
  const prevButton = document.querySelector('.prev-btn');
  const dotsNav = document.querySelector('.carousel-dots');

  // Create navigation dots dynamically based on the number of slides
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot', 'carousel-dot');
    if (index === 0) dot.classList.add('active');
    dot.dataset.slide = index;
    dotsNav.appendChild(dot);
  });

  const dots = Array.from(dotsNav.children);
  dots.forEach(dot => {
    dot.addEventListener('pointerenter', () => AudioEngine.playHover());
  });
  let currentIndex = 0;
  let autoPlayInterval;

  // Function to move the slide
  const updateCarousel = (index) => {
    track.style.transform = `translateX(-${index * 100}%)`;

    // Update active dot
    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');
  };

  const moveToNextSlide = () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel(currentIndex);
  };

  const moveToPrevSlide = () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel(currentIndex);
  };

  // Event Listeners for arrow buttons
  nextButton.addEventListener('click', () => {
    moveToNextSlide();
    resetAutoPlay(); // Pause timer if user clicks manually
  });

  prevButton.addEventListener('click', () => {
    moveToPrevSlide();
    resetAutoPlay();
  });

  // Event Listeners for dot navigation
  dotsNav.addEventListener('click', e => {
    const targetDot = e.target.closest('.dot');
    if (!targetDot) return;

    AudioEngine.playSound('click');
    currentIndex = parseInt(targetDot.dataset.slide);
    updateCarousel(currentIndex);
    resetAutoPlay();
  });

  // Auto-play functionality
  const startAutoPlay = () => {
    autoPlayInterval = setInterval(moveToNextSlide, 6000); // Slides every 6 seconds
  };

  const resetAutoPlay = () => {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  };

  // Initialize Autoplay
  startAutoPlay();
});

document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     PROJECT STACKING — built first so pin heights are locked in before
     anything else on the page measures its scroll position against them.
     ========================================================================== */
  let mm = gsap.matchMedia();

  mm.add("(min-width: 769px)", () => {
    if (prefersReducedMotion) return; // skip the scroll-jacking effect entirely

    const projects = gsap.utils.toArray('.project');

    projects.forEach((project, i) => {
      const isLast = i === projects.length - 1;

      ScrollTrigger.create({
        trigger: project,
        start: "top top",
        // Each project gets a full 150% of viewport height of scroll room
        // before the next one takes over — enough space to actually read
        // the content instead of it snapping away mid-scroll.
        end: "+=150%",
        pin: !isLast,
        pinSpacing: false,
        anticipatePin: 1,
        animation: gsap.to(project, {
          opacity: 0.4,
          scale: 0.92,
          yPercent: -5,
          ease: "none"
        }),
        scrub: 1
        // No `snap` here on purpose: snapping between projects was what
        // caused the page to auto-scroll out from under the reader. The
        // pin + scrub alone still gives the stacking transition, but the
        // user stays in full control of when it happens.
      });
    });
  });

  // Recalculate now that pin heights exist, BEFORE setting up the fade-ins
  // below, so their trigger points are measured against real layout.
  ScrollTrigger.refresh();

  /* ==========================================================================
     DECORATIVE FADE-UPS (hero, philosophy, service cards, contact heading)
     ========================================================================== */
  if (!prefersReducedMotion) {
    const fadeElements = gsap.utils.toArray('.hero-content > *, .philosophy-grid > div, .service-card, .contact-section h1, .contact-section p');

    fadeElements.forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          once: true // plays once, never reverses — can't get stuck invisible
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1
      });
    });
  }

  /* ==========================================================================
     CRITICAL CTAs (contact buttons, pricing cards): a ScrollTrigger-
     independent reveal so they can never end up permanently invisible,
     regardless of what the pinning/scrubbing above does to page layout.
     ========================================================================== */
  const revealTargets = document.querySelectorAll('.contact-grid a, .investment-card');
  if (revealTargets.length) {
    if (prefersReducedMotion) {
      revealTargets.forEach(el => el.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

      revealTargets.forEach(el => revealObserver.observe(el));

      // Failsafe: force-reveal everything after 1.5s no matter what.
      setTimeout(() => {
        revealTargets.forEach(el => el.classList.add('is-visible'));
      }, 1500);
    }
  }

  /* ==========================================================================
     ACTIVE NAV LINK on scroll
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-link');

  if (sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px' });

    sections.forEach(section => navObserver.observe(section));
  }

  /* ==========================================================================
     BACK TO TOP BUTTON
     ========================================================================== */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 800);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ==========================================================================
     COPY EMAIL FALLBACK
     ========================================================================== */
  const copyEmailBtn = document.getElementById('copy-email');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'ianmadekufamba@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        const original = copyEmailBtn.textContent;
        copyEmailBtn.textContent = 'Copied!';
        setTimeout(() => { copyEmailBtn.textContent = original; }, 2000);
      }).catch(() => {
        window.location.href = `mailto:${email}`;
      });
    });
  }

  /* ==========================================================================
     THE IFRAME FIX: Recalculate ScrollTrigger without delaying initialization
     ========================================================================== */
  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });

  setTimeout(() => ScrollTrigger.refresh(), 1000);
  setTimeout(() => ScrollTrigger.refresh(), 3000);
});

/* ==========================================================================
   THEME TOGGLE ENGINE (Default Light)
   ========================================================================== */
const themeToggleBtn = document.getElementById('theme-toggle');

const updateThemeIcon = (theme) => {
  if (!themeToggleBtn) return;
  const icon = themeToggleBtn.querySelector('i');
  if (theme === 'dark') {
    icon.className = 'fas fa-sun';
  } else {
    icon.className = 'fas fa-moon';
  }
};

// Sync icon on startup
const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
updateThemeIcon(currentTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const targetTheme = activeTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('portfolio-theme', targetTheme);
    updateThemeIcon(targetTheme);
  });
}

/* ==========================================================================
   PHASE 2: SYNTHESIZED WEB AUDIO FEEDBACK (Tactile UI Clicks)
   ========================================================================== */
const AudioEngine = (() => {
  let ctx = null;
  let lastHoverAt = 0;

  const sounds = {
    buttonHover: { freq: 760, duration: 0.022, volume: 0.016 },
    cardHover: { freq: 320, duration: 0.038, volume: 0.02 },
    controlHover: { freq: 980, duration: 0.02, volume: 0.016 },
    click: { freq: 900, duration: 0.025, volume: 0.04 },
    special: { freq: 1200, duration: 0.04, volume: 0.04 }
  };

  const init = () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const play = ({ freq, duration, volume }) => {
    try {
      init();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // AudioContext policy fallback
    }
  };

  const playSound = (type, overrides = {}) => {
    play({ ...sounds[type], ...overrides });
  };

  const playHover = (type = 'buttonHover') => {
    const now = performance.now();
    if (now - lastHoverAt < 70) return;
    lastHoverAt = now;
    playSound(type);
  };

  return { playSound, playHover };
})();

const hoverGroups = [
  {
    type: 'buttonHover',
    selectors: [
      '.nav-links a', '.mobile-link', '#burger-menu', '#close-menu', '.btn-live',
      '.btn-listen', '.btn-email', '.btn-github', '.btn-whatsapp', '#copy-email',
      '.viewport-toggle-btn', '.carousel-btn', '.carousel-dot', '.tag',
      '.interactive-display', '#code-cipher .cipher-char', '#design-butterflies'
    ]
  },
  {
    type: 'controlHover',
    selectors: ['.theme-toggle', '#back-to-top']
  },
  {
    type: 'cardHover',
    selectors: ['.service-card', '.investment-card', '.browser-window']
  }
];

hoverGroups.forEach(({ type, selectors }) => {
  document.querySelectorAll(selectors.join(', ')).forEach(element => {
    element.addEventListener('pointerenter', () => AudioEngine.playHover(type));
  });
});

document.querySelectorAll('a, button:not(.viewport-toggle-btn), #burger-menu, #close-menu, .tag').forEach(element => {
  element.addEventListener('click', () => AudioEngine.playSound('click'));
});

/* ==========================================================================
   PHASE 2: FLUID CURSOR DISPLACEMENT ON HERO GLOW BLOB
   ========================================================================== */
const heroBlob = document.getElementById('interactive-blob');
if (heroBlob) {
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  window.addEventListener('mousemove', (e) => {
    const x = e.clientX - window.innerWidth / 2;
    const y = e.clientY - window.innerHeight / 2;
    targetX = x * 0.25;
    targetY = y * 0.25;
  }, { passive: true });

  const renderBlob = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    heroBlob.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
    requestAnimationFrame(renderBlob);
  };
  renderBlob();
}

/* ==========================================================================
   PHASE 2: VIEWPORT CHASSIS SWITCHER (CHIC EMPORIUM)
   ========================================================================== */
const chicToggleBtn = document.getElementById('toggle-chic-viewport');
const chicBrowser = document.getElementById('chic-browser');

if (chicToggleBtn && chicBrowser) {
  chicToggleBtn.addEventListener('click', () => {
    AudioEngine.playSound('special');
    chicBrowser.classList.toggle('is-phone-mode');
    const isPhone = chicBrowser.classList.contains('is-phone-mode');
    chicToggleBtn.querySelector('span').textContent = isPhone ? 'Desktop Mode' : 'Phone Mode';
    chicToggleBtn.querySelector('i').className = isPhone ? 'fas fa-desktop' : 'fas fa-mobile-screen';
  });
}

/* ==========================================================================
   GLIDING NAV UNDERLINE
   ========================================================================== */
const navLinksContainer = document.querySelector('.nav-links');
const navIndicator = document.querySelector('.nav-indicator');
const desktopNavAnchors = document.querySelectorAll('.nav-links a');

if (navLinksContainer && navIndicator && desktopNavAnchors.length) {
  const moveIndicatorTo = (el) => {
    if (!el) {
      navIndicator.style.opacity = '0';
      return;
    }
    const linkRect = el.getBoundingClientRect();
    const containerRect = navLinksContainer.getBoundingClientRect();

    const left = linkRect.left - containerRect.left;
    const width = linkRect.width;

    navIndicator.style.width = `${width}px`;
    navIndicator.style.transform = `translateX(${left}px)`;
    navIndicator.style.opacity = '1';
  };

  const syncActivePosition = () => {
    const activeLink = navLinksContainer.querySelector('a.active') || desktopNavAnchors[0];
    moveIndicatorTo(activeLink);
  };

  desktopNavAnchors.forEach(link => {
    link.addEventListener('mouseenter', () => {
      moveIndicatorTo(link);
    });
  });

  navLinksContainer.addEventListener('mouseleave', () => {
    syncActivePosition();
  });

  // Track scroll-spy updates triggered by the page IntersectionObserver
  const linkObserver = new MutationObserver(() => {
    if (!navLinksContainer.matches(':hover')) {
      syncActivePosition();
    }
  });

  desktopNavAnchors.forEach(link => {
    linkObserver.observe(link, { attributes: true, attributeFilter: ['class'] });
  });

  window.addEventListener('resize', syncActivePosition, { passive: true });
  window.addEventListener('load', syncActivePosition);
  setTimeout(syncActivePosition, 150);
}

/* ==========================================================================
   FEATURE 1: SLOW PER-LETTER ASCII CIPHER SCRAMBLER
   ========================================================================== */
const cipherChars = document.querySelectorAll('#code-cipher .cipher-char');

if (cipherChars.length) {
  const glyphs = '01#%&<>*~?/+=[]X$!';

  cipherChars.forEach(charEl => {
    const orig = charEl.getAttribute('data-orig');
    let timer = null;

    charEl.addEventListener('mouseenter', () => {
      charEl.classList.add('is-active');
      clearInterval(timer);

      // Slower, deliberate scramble pace (~85ms)
      timer = setInterval(() => {
        const randomGlyph = glyphs[Math.floor(Math.random() * glyphs.length)];
        charEl.textContent = randomGlyph;

        if (typeof AudioEngine !== 'undefined') {
          AudioEngine.playSound('special', {
            freq: 1100 + Math.random() * 300,
            duration: 0.015,
            volume: 0.04
          });
        }
      }, 85);
    });

    charEl.addEventListener('mouseleave', () => {
      clearInterval(timer);
      charEl.textContent = orig;
      charEl.classList.remove('is-active');
    });
  });
}

/* ==========================================================================
   FEATURE 2: BORDERLESS FROSTED BUTTERFLY HOVER TRACKER
   ========================================================================== */
const designWrap = document.getElementById('design-butterflies');
const butterflyBackdrop = document.getElementById('butterfly-backdrop');

if (designWrap && butterflyBackdrop) {
  designWrap.addEventListener('mousemove', (e) => {
    const bRect = butterflyBackdrop.getBoundingClientRect();
    const x = e.clientX - bRect.left;
    const y = e.clientY - bRect.top;

    butterflyBackdrop.style.setProperty('--mouse-x', `${x}px`);
    butterflyBackdrop.style.setProperty('--mouse-y', `${y}px`);
  });

  designWrap.addEventListener('mouseleave', () => {
    butterflyBackdrop.style.setProperty('--mouse-x', '50%');
    butterflyBackdrop.style.setProperty('--mouse-y', '50%');
  });
}