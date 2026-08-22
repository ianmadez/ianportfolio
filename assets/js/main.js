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
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.dataset.slide = index;
    dotsNav.appendChild(dot);
  });

  const dots = Array.from(dotsNav.children);
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
    }, { rootMargin: '-40% 0px -55% 0px' });

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