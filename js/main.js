document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Logo scroll-to-top ---------- */
const navMark = document.querySelector('.nav__mark[href="#top"]');
if (navMark) {
  navMark.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------- Mobile nav ---------- */
const navToggle = document.getElementById("navToggle");
const navMobile = document.getElementById("navMobile");

navToggle.addEventListener("click", () => {
  const isOpen = navMobile.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navMobile.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMobile.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* ---------- Nav indicator (sliding pill) ---------- */
(function () {
  const navLinksEl = document.querySelector(".nav__links");
  const indicator = navLinksEl && navLinksEl.querySelector(".nav__indicator");
  if (!navLinksEl || !indicator) return;

  const links = [...navLinksEl.querySelectorAll("a")];
  let activeLink = null;

  function moveIndicatorTo(link) {
    if (!link) return;
    const containerRect = navLinksEl.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const padX = 14;
    const x = linkRect.left - containerRect.left - padX;
    const width = linkRect.width + padX * 2;
    indicator.style.transform = `translateY(-50%) translateX(${x}px)`;
    indicator.style.width = `${width}px`;
    indicator.style.opacity = "1";
  }

  function setActive(link) {
    if (activeLink) activeLink.classList.remove("is-active");
    activeLink = link;
    if (activeLink) {
      activeLink.classList.add("is-active");
      moveIndicatorTo(activeLink);
    } else {
      indicator.style.opacity = "0";
    }
  }

  const staticCurrent = links.find((a) => a.getAttribute("aria-current") === "page");

  if (staticCurrent) {
    // Secondary page (e.g. Photography) — pin the indicator, no scroll-spy needed.
    // Deferred a frame so layout/fonts have settled before measuring.
    requestAnimationFrame(() => setActive(staticCurrent));
  } else {
    // Home page — scroll-spy hash links against their sections.
    const hashLinks = links.filter((a) => (a.getAttribute("href") || "").startsWith("#"));
    const sectionMap = new Map();
    hashLinks.forEach((a) => {
      const section = document.getElementById(a.getAttribute("href").slice(1));
      if (section) sectionMap.set(section, a);
    });

    if (sectionMap.size) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(sectionMap.get(entry.target));
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      sectionMap.forEach((_, section) => spy.observe(section));

      const heroEl = document.querySelector(".hero");
      if (heroEl) {
        const heroSpy = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.6) setActive(null);
            });
          },
          { threshold: [0, 0.6] }
        );
        heroSpy.observe(heroEl);
      }
    }
  }

  window.addEventListener("resize", () => {
    if (activeLink) moveIndicatorTo(activeLink);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (activeLink) moveIndicatorTo(activeLink);
    });
  }
})();

/* ---------- Hero video fallback ---------- */
const heroVideo = document.querySelector(".hero__video");
const heroLabel = document.querySelector(".hero__placeholder-label");
if (heroVideo) {
  const source = heroVideo.querySelector("source");
  heroVideo.addEventListener(
    "error",
    () => {
      heroVideo.style.display = "none";
    },
    true
  );
  source.addEventListener("error", () => {
    heroVideo.style.display = "none";
  });
  // If nothing plays shortly after load, assume there's no real asset yet.
  setTimeout(() => {
    if (heroVideo.readyState === 0) {
      heroVideo.style.display = "none";
    } else if (heroLabel) {
      heroLabel.style.display = "none";
    }
  }, 1200);
}

/* ---------- Case study modals ---------- */
document.querySelectorAll("[data-modal]").forEach((card) => {
  card.addEventListener("click", () => {
    const modal = document.getElementById(card.dataset.modal);
    if (modal) modal.showModal();
  });
});

document.querySelectorAll(".case-modal").forEach((modal) => {
  modal.querySelector("[data-close]").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => {
    const rect = modal.getBoundingClientRect();
    const inBounds =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!inBounds) modal.close();
  });
});

/* ---------- Lightbox (gallery images) ---------- */
(function () {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  const stage = lightbox.querySelector(".lightbox__stage");
  const img = document.getElementById("lightboxImg");
  const counter = document.getElementById("lightboxCounter");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");

  let items = [];
  let index = 0;

  function show() {
    const source = items[index];
    img.src = source.currentSrc || source.src;
    img.alt = source.alt || "";
    counter.textContent = items.length > 1 ? `${index + 1} / ${items.length}` : "";
    const multi = items.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;
  }

  function openAt(gallery, startIndex) {
    items = gallery;
    index = startIndex;
    show();
    lightbox.showModal();
  }

  function next() {
    index = (index + 1) % items.length;
    show();
  }
  function prev() {
    index = (index - 1 + items.length) % items.length;
    show();
  }

  document.querySelectorAll(".gallery").forEach((gallery) => {
    const imgs = [...gallery.querySelectorAll("img.media-placeholder__img")];
    imgs.forEach((image, i) => {
      const tile = image.closest(".media-placeholder");
      if (!tile) return;
      tile.addEventListener("click", (e) => {
        e.stopPropagation();
        openAt(imgs, i);
      });
    });
  });

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    lightbox.close();
  });
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    next();
  });
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    prev();
  });

  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  lightbox.addEventListener("click", (e) => {
    if (!stage.contains(e.target) || e.target === stage) lightbox.close();
  });
})();

/* ---------- Back to top ---------- */
const toTop = document.getElementById("toTop");
window.addEventListener("scroll", () => {
  toTop.classList.toggle("is-visible", window.scrollY > 600);
});
toTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------- Scroll reveal ---------- */
const revealTargets = document.querySelectorAll(
  ".section-head, .about__copy, .about__tags, .work-card, .side-grid, .contact__grid, .photo-grid"
);
revealTargets.forEach((el) => el.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealTargets.forEach((el) => observer.observe(el));

/* ---------- Contact form (mailto fallback) ---------- */
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const name = data.get("name");
    const email = data.get("email");
    const message = data.get("message");
    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:gage.tristan@googlemail.com?subject=${subject}&body=${body}`;
  });
}
