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
    capabilities: "hero",
    process: "hero",
    work: "work",
    ecommerce: "work",
    corporate: "work",
    hospitality: "work",
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
   Concept previews — cursor tilt (site preview cards + mockup panels),
   with a scroll-triggered reveal fallback on touch devices.
   ========================================================================== */

(() => {
  const previews = document.querySelectorAll("[data-site-preview]");
  const tiltOnly = document.querySelectorAll("[data-tilt]");
  if (!previews.length && !tiltOnly.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const attachTilt = (el) => {
    let raf = null;

    const onMove = (event) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        el.style.transform =
          `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) ` +
          `rotateY(${(px * 6).toFixed(2)}deg) scale(1.015)`;
        el.style.setProperty("--px", px.toFixed(3));
        el.style.setProperty("--py", py.toFixed(3));
      });
    };

    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      el.style.transform = "";
      el.style.removeProperty("--px");
      el.style.removeProperty("--py");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
  };

  if (canHover) {
    previews.forEach((preview) => {
      const card = preview.closest(".product-card");
      if (card) attachTilt(card);
    });
    tiltOnly.forEach(attachTilt);
  } else if (previews.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    previews.forEach((preview) => observer.observe(preview));
  }
})();

/* ==========================================================================
   Design Showcase — click a concept card to open a full-size preview
   ========================================================================== */

(() => {
  const modal = document.getElementById("previewModal");
  const stage = modal && modal.querySelector("[data-preview-stage]");
  const triggers = document.querySelectorAll("[data-preview-trigger]");
  if (!modal || !stage || !triggers.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastTrigger = null;

  const open = (card) => {
    const page = card.querySelector(".site-preview__page");
    if (!page) return;

    stage.innerHTML = "";
    page.querySelectorAll(".mock").forEach((mock) => {
      stage.appendChild(mock.cloneNode(true));
    });

    lastTrigger = card;
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      modal.classList.add("is-open");
    });

    modal.querySelector(".preview-modal__close").focus();
  };

  const close = () => {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";

    const finish = () => {
      modal.hidden = true;
      stage.innerHTML = "";
      if (lastTrigger) lastTrigger.focus();
    };

    if (reduceMotion) {
      finish();
    } else {
      modal.querySelector(".preview-modal__panel").addEventListener("transitionend", finish, { once: true });
    }
  };

  triggers.forEach((card) => {
    card.addEventListener("click", () => open(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open(card);
      }
    });
  });

  modal.querySelectorAll("[data-preview-close]").forEach((el) => {
    el.addEventListener("click", close);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) close();
  });
})();

/* ==========================================================================
   Tech/SaaS — stat count-up on scroll into view
   ========================================================================== */

(() => {
  const stats = document.querySelectorAll("[data-count-to]");
  if (!stats.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const format = (el, value) => {
    const decimals = Number(el.dataset.decimals || 0);
    const suffix = el.dataset.suffix || "";
    return `${value.toFixed(decimals)}${suffix}`;
  };

  if (reduceMotion || !("IntersectionObserver" in window)) {
    stats.forEach((el) => {
      el.textContent = format(el, parseFloat(el.dataset.countTo));
    });
    return;
  }

  const animate = (el) => {
    const target = parseFloat(el.dataset.countTo);
    const duration = 1100;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(el, target * eased);
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  stats.forEach((stat) => observer.observe(stat));
})();

/* ==========================================================================
   Book a Call — smooth scroll to booking section
   ========================================================================== */

(() => {
  const bookingSection = document.getElementById("booking");
  if (!bookingSection) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll('a[href="#booking"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      bookingSection.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });
})();

/* ==========================================================================
   Booking form
   ========================================================================== */

(() => {
  const form = document.getElementById("bookingForm");
  if (!form) return;

  const fieldset = document.getElementById("bookingFieldset");
  const dateInput = document.getElementById("bookingDate");
  const slotsWrap = document.getElementById("bookingSlots");
  const nameInput = document.getElementById("bookingName");
  const emailInput = document.getElementById("bookingEmail");
  const messageInput = document.getElementById("bookingMessage");
  const submitBtn = document.getElementById("bookingSubmit");
  const submitLabel = submitBtn.querySelector(".cta__label");
  const statusEl = document.getElementById("bookingStatus");

  const BOOKING_WINDOW_DAYS = 30;
  let selectedSlot = null;

  const toISODate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + BOOKING_WINDOW_DAYS);
  dateInput.min = toISODate(today);
  dateInput.max = toISODate(maxDate);

  const setStatus = (message, kind) => {
    statusEl.textContent = message;
    statusEl.className = "booking__status";
    if (kind) statusEl.classList.add(`is-${kind}`);
  };

  const renderSlots = (slots) => {
    selectedSlot = null;
    slotsWrap.innerHTML = "";

    if (!slots.length) {
      slotsWrap.innerHTML = '<p class="booking__slots-hint">No times left on this date — try another day.</p>';
      return;
    }

    slots.forEach((time) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "booking__slot";
      btn.textContent = time;
      btn.addEventListener("click", () => {
        slotsWrap.querySelectorAll(".booking__slot").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        selectedSlot = time;
      });
      slotsWrap.appendChild(btn);
    });
  };

  const loadAvailability = async (date) => {
    slotsWrap.innerHTML = '<p class="booking__slots-hint">Loading times…</p>';
    selectedSlot = null;

    try {
      const res = await fetch(`api/availability.php?date=${encodeURIComponent(date)}`);
      if (!res.ok) throw new Error("request_failed");
      const data = await res.json();
      renderSlots(Array.isArray(data.slots) ? data.slots : []);
    } catch (err) {
      slotsWrap.innerHTML = '<p class="booking__slots-hint">Could not load times. Please try again.</p>';
    }
  };

  dateInput.addEventListener("change", () => {
    setStatus("");
    if (dateInput.value) loadAvailability(dateInput.value);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    if (!dateInput.value || !selectedSlot) {
      setStatus("Please choose a date and a time.", "error");
      return;
    }

    const payload = {
      date: dateInput.value,
      time: selectedSlot,
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim(),
    };

    fieldset.disabled = true;
    submitLabel.textContent = "Booking…";

    try {
      const res = await fetch("api/book.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.error === "slot_taken") {
          setStatus("That time was just booked by someone else — pick another.", "error");
          loadAvailability(payload.date);
        } else {
          setStatus("Something went wrong. Please try again.", "error");
        }
        fieldset.disabled = false;
        submitLabel.textContent = "Confirm Booking";
        return;
      }

      setStatus(
        `You're booked for ${payload.date} at ${payload.time} (Europe/Stockholm). I'll be in touch at ${payload.email} to confirm the details.`,
        "success"
      );
      submitLabel.textContent = "Booked ✓";
    } catch (err) {
      setStatus("Something went wrong. Please try again.", "error");
      fieldset.disabled = false;
      submitLabel.textContent = "Confirm Booking";
    }
  });
})();
