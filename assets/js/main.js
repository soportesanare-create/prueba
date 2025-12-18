document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // Año dinámico
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Navegación móvil
  const navToggle = document.getElementById("navToggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      body.classList.toggle("nav-open");
    });
  }

  // Scroll suave para links internos
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const rect = targetEl.getBoundingClientRect();
        const offsetTop = rect.top + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
        body.classList.remove("nav-open");
      }
    });
  });

  // Contadores animados
  const counters = document.querySelectorAll(".counter");
  const animateCounters = () => {
    counters.forEach((counter) => {
      const updateCount = () => {
        const target = parseInt(counter.getAttribute("data-count") || "0", 10);
        const current = parseInt(counter.textContent || "0", 10);
        const increment = Math.ceil(target / 80);
        if (current < target) {
          counter.textContent = String(current + increment);
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = String(target);
        }
      };
      updateCount();
    });
  };

  let countersStarted = false;
  const heroSection = document.querySelector(".hero");
  if ("IntersectionObserver" in window && heroSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countersStarted) {
            countersStarted = true;
            animateCounters();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(heroSection);
  } else {
    animateCounters();
  }

  // Reveal on scroll
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("reveal-visible"));
  }

  // Filtro de tratamientos
  const filterChips = document.querySelectorAll(".chip-filter");
  const treatmentCards = document.querySelectorAll(".treatment-card");

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.getAttribute("data-filter");
      filterChips.forEach((c) => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");

      treatmentCards.forEach((card) => {
        const category = card.getAttribute("data-category");
        if (filter === "all" || category === filter) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Testimonios slider
  const testimonialsSlider = document.getElementById("testimonialsSlider");
  const testimonials = document.querySelectorAll(".testimonial");
  const dots = document.querySelectorAll(".dot");
  let currentIndex = 0;
  let sliderInterval;

  const updateTestimonialsHeight = () => {
    if (!testimonialsSlider) return;
    const active = testimonialsSlider.querySelector(".testimonial.active");
    const dotsWrap = testimonialsSlider.querySelector(".slider-dots");

    const activeH = active ? active.offsetHeight : 0;
    const dotsH = dotsWrap ? dotsWrap.offsetHeight : 0;
    const extra = 24; // aire visual
    const min = Math.max(activeH + dotsH + extra, 220);
    testimonialsSlider.style.minHeight = `${min}px`;
  };

  const setActiveSlide = (index) => {
    testimonials.forEach((t, i) => {
      t.classList.toggle("active", i === index);
    });
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === index);
    });
    currentIndex = index;
    updateTestimonialsHeight();
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.getAttribute("data-index") || "0", 10);
      setActiveSlide(index);
      restartSlider();
    });
  });

  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % testimonials.length;
    setActiveSlide(nextIndex);
  };

  const startSlider = () => {
    sliderInterval = setInterval(nextSlide, 7000);
  };

  const restartSlider = () => {
    clearInterval(sliderInterval);
    startSlider();
  };

  if (testimonials.length > 0) {
    // Altura inicial para evitar que la sección siguiente se encime
    updateTestimonialsHeight();

    // Recalcular al cambiar el tamaño (móvil / rotación)
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateTestimonialsHeight, 120);
    });

    startSlider();
  }

  // Filtro de sedes
  const sedeFilter = document.getElementById("sedeFilter");
  const sedesCards = document.querySelectorAll(".sede-card");

  if (sedeFilter) {
    sedeFilter.addEventListener("change", () => {
      const value = sedeFilter.value;
      sedesCards.forEach((card) => {
        const city = card.getAttribute("data-city");
        if (value === "all" || city === value) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });

  // Mapa modal sedes
  const mapModal = document.getElementById("mapModal");
  const mapFrame = document.getElementById("mapModalFrame");
  const mapTitle = document.getElementById("mapModalTitle");
  const mapOpenLink = document.getElementById("mapModalOpen");
  const mapCloseBtn = document.getElementById("mapModalClose");

  let lastFocusedEl = null;

  const openMapModal = ({ title, address, href }) => {
    if (!mapModal || !mapFrame || !mapTitle || !mapOpenLink) return;

    const safeHref = typeof href === "string" && href.startsWith("http") ? href : "#";
    const safeTitle = title || "Ubicación";
    const safeAddress = address || "";

    mapTitle.textContent = safeTitle;
    mapOpenLink.href = safeHref;

    // Embed sin API key (Google Maps)
    const embedSrc =
      "https://www.google.com/maps?q=" + encodeURIComponent(safeAddress) + "&output=embed";

    mapFrame.src = embedSrc;

    lastFocusedEl = document.activeElement;
    document.body.classList.add("modal-open");
    mapModal.classList.add("is-open");
    mapModal.setAttribute("aria-hidden", "false");

    if (mapCloseBtn) mapCloseBtn.focus();
  };

  const closeMapModal = () => {
    if (!mapModal || !mapFrame) return;
    mapModal.classList.remove("is-open");
    mapModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    // Detener carga del iframe
    mapFrame.src = "about:blank";

    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
    lastFocusedEl = null;
  };

  // Click en "Ver detalles" -> abre modal con mapa
  document.querySelectorAll(".sede-details").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (!mapModal) return;
      const address = link.getAttribute("data-address") || "";
      if (!address) return;

      e.preventDefault();
      openMapModal({
        title: link.getAttribute("data-title") || "Ubicación",
        address,
        href: link.getAttribute("href") || "#",
      });
    });
  });

  
  // Pins del mapa (abre el modal de mapa al hacer click)
  const sedePins = document.querySelectorAll(".sede-pin");
  if (sedePins.length > 0) {
    sedePins.forEach((pin) => {
      pin.addEventListener("click", (e) => {
        // Evita que el click afecte otros handlers
        e.preventDefault();
        e.stopPropagation();

        const title = pin.getAttribute("data-title") || pin.getAttribute("aria-label") || "Ubicación";
        const address = pin.getAttribute("data-address") || "";
        const href = pin.getAttribute("data-href") || "#";

        if (address) {
          openMapModal({ title, address, href });
        }
      });
    });
  }

// Cerrar modal
  if (mapCloseBtn) {
    mapCloseBtn.addEventListener("click", closeMapModal);
  }

  if (mapModal) {
    mapModal.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.getAttribute && target.getAttribute("data-map-close") === "true") {
        closeMapModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mapModal && mapModal.classList.contains("is-open")) {
      closeMapModal();
    }
  });


  }

  // Toast helper
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const showToast = (message) => {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add("toast-visible");
    setTimeout(() => {
      toast.classList.remove("toast-visible");
    }, 3500);
  };

  // "Enviar" del formulario (simulado)
  const btnEnviar = document.getElementById("btnEnviar");
  const form = document.querySelector(".contact-form");

  if (btnEnviar && form) {
    btnEnviar.addEventListener("click", () => {
      const nombre = document.getElementById("nombre");
      const telefono = document.getElementById("telefono");
      const correo = document.getElementById("correo");

      if (!nombre.value || !telefono.value || !correo.value) {
        showToast("Por favor completa los campos obligatorios.");
        return;
      }

      form.reset();
      showToast("¡Gracias! Un coordinador Sanaré se pondrá en contacto contigo.");
    });
  }


  // Carrusel (Contacto - columna derecha)
  const galleryRoot = document.getElementById("contactGallery");
  if (galleryRoot) {
    const track = galleryRoot.querySelector(".sgc-track");
    const slides = Array.from(galleryRoot.querySelectorAll(".sgc-slide"));
    const prevBtn = galleryRoot.querySelector(".sgc-prev");
    const nextBtn = galleryRoot.querySelector(".sgc-next");
    const dotsWrap = galleryRoot.querySelector(".sgc-dots");

    let idx = 0;
    let timer = null;
    const intervalMs = 5200;

    const dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sgc-dot";
      b.setAttribute("aria-label", `Ir a la imagen ${i + 1}`);
      b.addEventListener("click", () => goTo(i, true));
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });

    const render = () => {
      if (track) track.style.transform = `translateX(${-idx * 100}%)`;
      dots.forEach((d, i) => d.setAttribute("aria-selected", i === idx ? "true" : "false"));
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      timer = setInterval(() => goTo(idx + 1, false), intervalMs);
    };

    const goTo = (i, userAction) => {
      idx = (i + slides.length) % slides.length;
      render();
      if (userAction) start();
    };

    const next = () => goTo(idx + 1, true);
    const prev = () => goTo(idx - 1, true);

    if (nextBtn) nextBtn.addEventListener("click", next);
    if (prevBtn) prevBtn.addEventListener("click", prev);

    // Swipe (móvil)
    let startX = 0;
    let dx = 0;
    let dragging = false;

    galleryRoot.addEventListener("touchstart", (e) => {
      dragging = true;
      startX = e.touches[0].clientX;
      dx = 0;
    }, { passive: true });

    galleryRoot.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      dx = e.touches[0].clientX - startX;
    }, { passive: true });

    galleryRoot.addEventListener("touchend", () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(dx) > 40) {
        dx < 0 ? next() : prev();
      }
    });

    // Pausa al pasar mouse
    galleryRoot.addEventListener("mouseenter", stop);
    galleryRoot.addEventListener("mouseleave", start);

    render();
    start();
  }

});
