(() => {
  const hero = document.getElementById("hero");
  const glows = document.getElementById("heroGlows");

  if (!hero || !glows) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  let pointerX = 0.5;
  let pointerY = 0.5;
  let currentX = 0.5;
  let currentY = 0.5;
  let raf = null;

  const lerp = (a, b, t) => a + (b - a) * t;

  const render = () => {
    currentX = lerp(currentX, pointerX, 0.06);
    currentY = lerp(currentY, pointerY, 0.06);

    const offsetX = (currentX - 0.5) * 32;
    const offsetY = (currentY - 0.5) * 32;

    glows.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;

    raf = requestAnimationFrame(render);
  };

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width;
    pointerY = (event.clientY - rect.top) / rect.height;
  });

  hero.addEventListener("pointerleave", () => {
    pointerX = 0.5;
    pointerY = 0.5;
  });

  raf = requestAnimationFrame(render);

  reduceMotion.addEventListener("change", (event) => {
    if (event.matches && raf) {
      cancelAnimationFrame(raf);
      glows.style.transform = "";
    }
  });
})();

/* ==========================================================================
   Navigation — scrolled state, mobile menu, scroll-spy
   ========================================================================== */

(() => {
  const nav = document.getElementById("siteNav");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-menu-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const navLinks = document.querySelectorAll("[data-nav-link]");
  const sectionTargets = {
    hero: "hero",
    work: "work",
    ecommerce: "work",
    corporate: "work",
    hospitality: "work",
    "real-estate": "work",
    agency: "work",
    "personal-brand": "work",
    tech: "work",
    contact: "contact",
  };

  const setActive = (target) => {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.target === target);
    });
  };

  const observedSections = Object.keys(sectionTargets)
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(sectionTargets[entry.target.id]);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    observedSections.forEach((section) => spy.observe(section));
  }
})();

/* ==========================================================================
   Scroll reveal animations
   ========================================================================== */

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = document.querySelectorAll(".reveal");

  if (!revealEls.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  document.querySelectorAll(".reveal-group").forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      child.style.setProperty("--i", index);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
})();

/* ==========================================================================
   E-Commerce — add to bag micro-interaction
   ========================================================================== */

(() => {
  document.querySelectorAll("[data-add-to-bag]").forEach((btn) => {
    let resetTimer = null;

    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-added")) return;

      const original = btn.textContent;
      btn.classList.add("is-added");
      btn.textContent = "Added ✓";

      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        btn.classList.remove("is-added");
        btn.textContent = original;
      }, 1800);
    });
  });
})();

/* ==========================================================================
   Real Estate — filters and detail toggles
   ========================================================================== */

(() => {
  const filterBtns = document.querySelectorAll(".property-filters__btn");
  const cards = document.querySelectorAll(".property-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });

  document.querySelectorAll(".property-card__toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".property-card");
      const isOpen = card.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(isOpen));
      btn.textContent = isOpen ? "Hide Details" : "View Details";
    });
  });
})();
