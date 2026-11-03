/**
 * WIG WHAM — $10K 3D SCROLLYTELLING & BUTTER-SMOOTH INTERACTION ENGINE
 * - 5-Card Hero & 5-Chapter Split-Screen Engine (Amazon, Walmart, Etsy, TikTok Shop, Virtual Assistance)
 * - Dynamic Sticky Background Reel Crossfade in #marketplaces-split
 * - Butter-Smooth Hover Animation on [data-smooth-card] (zero conflict with scroll loop!)
 * - Connected 3D Travelling & Side-Docking Cube (Hero -> Section 02 Right Side)
 */

(function () {
  "use strict";

  /* ========================================================================
     1. LENIS SMOOTH SCROLL
     ======================================================================== */
  let lenis = null;

  if (typeof window.Lenis !== "undefined") {
    try {
      lenis = new window.Lenis({
        duration: 1.08,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    } catch (e) {
      lenis = null;
    }
  }

  function smoothScrollTo(target) {
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.25 });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    } else if (target && target.scrollIntoView) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  /* ========================================================================
     2. TOP-LEFT MORPHING MENU & SMOOTH ANCHORS
     ======================================================================== */
  const navMorph = document.getElementById("nav-morph");
  const navMorphBtn = document.getElementById("nav-morph-btn");
  const navMorphCard = document.getElementById("nav-morph-card");
  const navLabel = navMorphBtn ? navMorphBtn.querySelector(".nav-morph__label") : null;

  function closeMenu() {
    if (!navMorph || !navMorph.classList.contains("is-open")) return;
    navMorph.classList.remove("is-open");
    if (navMorphBtn) navMorphBtn.setAttribute("aria-expanded", "false");
    if (navMorphCard) navMorphCard.setAttribute("aria-hidden", "true");
    if (navLabel) navLabel.textContent = navLabel.getAttribute("data-open") || "Navigate";
  }

  if (navMorphBtn && navMorph && navMorphCard) {
    navMorphBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = navMorph.classList.toggle("is-open");
      navMorphBtn.setAttribute("aria-expanded", String(open));
      navMorphCard.setAttribute("aria-hidden", String(!open));
      if (navLabel) {
        navLabel.textContent = open
          ? navLabel.getAttribute("data-close") || "Close"
          : navLabel.getAttribute("data-open") || "Navigate";
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (navMorph && !navMorph.contains(e.target)) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      closeMenu();

      if (href === "#hero-reveal") {
        e.preventDefault();
        const portalTrack = document.getElementById("portal-track");
        if (portalTrack) {
          smoothScrollTo(portalTrack.offsetTop + (portalTrack.offsetHeight - window.innerHeight));
        }
        return;
      }

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        smoothScrollTo(target);
      }
    });
  });

  /* ========================================================================
     3. CURSOR DOT, HOVER FOLLOWER & 3D MOUSE PARALLAX
     ======================================================================== */
  const cursorDot = document.getElementById("cursor-dot");
  const hoverFollower = document.getElementById("hover-follower");
  const hoverFollowerImg = document.getElementById("hover-follower-img");
  const hoverFollowerTag = document.getElementById("hover-follower-tag");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let normMouseX = 0;
  let normMouseY = 0;
  let dotX = mouseX;
  let dotY = mouseY;
  let folX = mouseX;
  let folY = mouseY;

  if (window.matchMedia("(hover: hover)").matches) {
    window.addEventListener(
      "mousemove",
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        normMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        normMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        document.body.classList.add("has-mouse-moved");
      },
      { passive: true }
    );

    function animateCursor() {
      dotX += (mouseX - dotX) * 0.25;
      dotY += (mouseY - dotY) * 0.25;
      folX += (mouseX - folX) * 0.14;
      folY += (mouseY - folY) * 0.14;

      if (cursorDot) {
        cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }
      if (hoverFollower) {
        hoverFollower.style.left = `${folX}px`;
        hoverFollower.style.top = `${folY}px`;
      }
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);
  }

  /* ========================================================================
     4. BUTTER-SMOOTH CARD HOVER ([data-smooth-card] & [data-tilt-3d])
     ======================================================================== */
  document.querySelectorAll("[data-tilt-3d]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rotY = (px - 0.5) * 10;
      const rotX = (0.5 - py) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-6px)`;
      card.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  // Ultra-smooth hover for Horizontal Showcase & Road/Bento cards (never fights scroll!)
  document.querySelectorAll("[data-smooth-card]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rotY = (px - 0.5) * 8;
      const rotX = (0.5 - py) * 7;

      card.style.transform = `translate3d(0, -10px, 0) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      card.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)";
    });
  });

  /* ========================================================================
     5. DOM REFERENCES & MANIFESTO WORD PREPARATION
     ======================================================================== */
  const siteHeader = document.getElementById("site-header");
  const scrollProgress = document.getElementById("scroll-progress");
  const portalTrack = document.getElementById("portal-track");
  const portalOverlay = document.getElementById("portal-overlay");
  const portalZoomRig = document.getElementById("portal-zoom-rig");
  const portalGateBtn = document.getElementById("portal-gate-btn");
  const portalScrollCue = document.getElementById("portal-scroll-cue");
  const portalHud = document.getElementById("portal-hud");
  const heroStage = document.getElementById("hero-reveal");
  const portalFlanks = Array.from(document.querySelectorAll(".portal-flank"));

  // Interactive Section 03 Dual-Engine Command Arena
  const arenaPanes = Array.from(document.querySelectorAll("[data-arena-pane]"));
  const arenaBtns = Array.from(document.querySelectorAll("[data-arena-btn]"));

  function setActiveArena(idx) {
    arenaPanes.forEach((pane, i) => pane.classList.toggle("is-expanded", i === idx));
    arenaBtns.forEach((btn, i) => btn.classList.toggle("is-active", i === idx));
  }

  arenaPanes.forEach((pane, idx) => {
    pane.addEventListener("mouseenter", () => setActiveArena(idx));
    pane.addEventListener("click", () => setActiveArena(idx));
    pane.addEventListener("focus", () => setActiveArena(idx));
  });

  arenaBtns.forEach((btn, idx) => {
    btn.addEventListener("click", () => setActiveArena(idx));
  });

  const travellingLayer = document.getElementById("travelling-3d-layer");
  const travellingRig = document.getElementById("travelling-3d-rig");
  const cube3d = document.getElementById("cube-3d");

  const manifestoTrack = document.getElementById("manifesto-track");
  const manifestoCopy = document.getElementById("manifesto-copy");
  const weWindow = document.getElementById("we-window");
  let manifestoWords = [];
  let prevLitCount = -1;

  if (manifestoCopy) {
    const words = manifestoCopy.textContent.trim().split(/\s+/);
    manifestoCopy.innerHTML = words.map((w) => `<span class="m-word">${w}</span>`).join(" ");
    manifestoWords = Array.from(manifestoCopy.querySelectorAll(".m-word"));
  }

  const stackCards = Array.from(document.querySelectorAll(".stack-card"));
  const mpChapters = Array.from(document.querySelectorAll(".mp-chapter"));
  const mpWipeCards = Array.from(document.querySelectorAll(".mp-wipe-card"));
  const mpQuickBtns = Array.from(document.querySelectorAll(".mp-q-btn"));
  const mpBgReels = Array.from(document.querySelectorAll(".mp-bg-reel"));
  let prevMpIdx = -1;

  const hscrollTrack = document.getElementById("horizontal-showcase");
  const hscrollStrip = document.getElementById("hscroll-strip");
  const hscrollBgWords = document.getElementById("hscroll-bg-words");
  const hscrollBarFill = document.getElementById("hscroll-bar-fill");

  const roadStage = document.getElementById("road-stage");
  const roadTrace = document.getElementById("road-trace");

  function enterThroughGate() {
    if (!portalTrack) return;
    smoothScrollTo(portalTrack.offsetTop + (portalTrack.offsetHeight - window.innerHeight));
  }

  if (portalGateBtn) {
    portalGateBtn.addEventListener("click", enterThroughGate);
    portalGateBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enterThroughGate();
      }
    });
  }
  if (portalScrollCue) portalScrollCue.addEventListener("click", enterThroughGate);

  /* ========================================================================
     6. CACHED LAYOUT METRICS (ZERO LAYOUT THRASHING)
     ======================================================================== */
  const metrics = {
    viewH: window.innerHeight,
    docScrollable: 1,
    portalTop: 0,
    portalScrollable: 1,
    manifestoTop: 0,
    manifestoHeight: 1,
    manifestoScrollable: 1,
    stackTops: [],
    mpChapterTops: [],
    hscrollTop: 0,
    hscrollScrollable: 1,
    hscrollMaxX: 0,
    roadTop: 0,
    roadHeight: 1,
    roadLen: 0,
  };

  function getPageTop(el) {
    let top = 0;
    let node = el;
    while (node) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }
    return top;
  }

  function measureLayout() {
    metrics.viewH = window.innerHeight;
    metrics.docScrollable = Math.max(1, document.documentElement.scrollHeight - metrics.viewH);

    if (portalTrack) {
      metrics.portalTop = getPageTop(portalTrack);
      metrics.portalScrollable = Math.max(1, portalTrack.offsetHeight - metrics.viewH);
    }

    if (manifestoTrack) {
      metrics.manifestoTop = getPageTop(manifestoTrack);
      metrics.manifestoHeight = manifestoTrack.offsetHeight;
      metrics.manifestoScrollable = Math.max(1, manifestoTrack.offsetHeight - metrics.viewH);
    }

    metrics.stackTops = stackCards.map((c) => getPageTop(c));
    metrics.mpChapterTops = mpChapters.map((c) => getPageTop(c));

    if (hscrollTrack && hscrollStrip) {
      metrics.hscrollTop = getPageTop(hscrollTrack);
      metrics.hscrollScrollable = Math.max(1, hscrollTrack.offsetHeight - metrics.viewH);
      metrics.hscrollMaxX = Math.max(0, hscrollStrip.scrollWidth - window.innerWidth + 64);
    }

    if (roadStage) {
      metrics.roadTop = getPageTop(roadStage);
      metrics.roadHeight = Math.max(1, roadStage.offsetHeight);
    }

    if (roadTrace && typeof roadTrace.getTotalLength === "function" && metrics.roadLen === 0) {
      try {
        metrics.roadLen = roadTrace.getTotalLength();
        roadTrace.style.strokeDasharray = `${metrics.roadLen}`;
        roadTrace.style.strokeDashoffset = `${metrics.roadLen}`;
      } catch (e) {
        metrics.roadLen = 0;
      }
    }
  }

  /* ========================================================================
     7. 120FPS 3D SCROLL CHOREOGRAPHY + CONTINUOUS 3D ORBITAL PORTAL & FAQ CUBE
     ======================================================================== */
  let ticking = false;
  let currentPortalP = 0;

  // FAQ 3D Cube references & smooth rotation state
  const faqCube3d = document.getElementById("faq-cube-3d");
  const faqSection = document.getElementById("faq");
  let faqBaseRotY = -28;
  let faqBaseRotX = -16;
  let faqCurRotY = -28;
  let faqCurRotX = -16;

  // Continuous 3D Elliptical Orbit for the 5 Cards around the Home Tent Gate + FAQ 3D Cube!
  function updatePortalOrbit(timeMs) {
    const now = timeMs || performance.now();

    // A) 5 Orbiting Flank Cards on Home Tent Portal (only active while Portal is visible!)
    if (currentPortalP < 0.88 && portalFlanks.length > 0 && window.innerWidth > 1024) {
      const t = now * 0.00052;
      const baseRx = Math.min(window.innerWidth * 0.37, 470);
      const baseRy = Math.min(window.innerHeight * 0.25, 205);
      const expand = 1 + currentPortalP * 0.95;
      const rx = baseRx * expand;
      const ry = baseRy * expand;
      const count = portalFlanks.length;

      for (let i = 0; i < count; i++) {
        const angle = t + (i * Math.PI * 2) / count;
        const x = Math.cos(angle) * rx;
        const y = Math.sin(angle) * ry + Math.sin(t * 2.2 + i) * 7;
        const depth = Math.sin(angle);
        const z = depth * 85 + currentPortalP * 180;
        const scale = 0.88 + (depth + 1) * 0.09;
        const tiltY = (-Math.cos(angle) * 12).toFixed(1);

        const flank = portalFlanks[i];
        flank.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), ${z.toFixed(1)}px) rotateY(${tiltY}deg) scale(${scale.toFixed(3)})`;
        flank.style.zIndex = depth > 0.15 ? "6" : "2";
        flank.style.opacity = String(Math.max(0, (0.8 + (depth + 1) * 0.1) * (1 - currentPortalP * 1.45)).toFixed(2));
      }
    }

    // B) Smooth Continuous 3D Rotation for the FAQ Section Cube (#faq-cube-3d)
    if (faqCube3d) {
      const slowSpin = now * 0.018;
      const targetY = faqBaseRotY + slowSpin + normMouseX * 22;
      const targetX = faqBaseRotX + Math.sin(now * 0.0012) * 12 - normMouseY * 16;
      faqCurRotY += (targetY - faqCurRotY) * 0.08;
      faqCurRotX += (targetX - faqCurRotX) * 0.08;
      faqCube3d.style.transform = `rotateX(${faqCurRotX.toFixed(2)}deg) rotateY(${faqCurRotY.toFixed(2)}deg)`;
    }

    requestAnimationFrame(updatePortalOrbit);
  }
  requestAnimationFrame(updatePortalOrbit);

  function renderScrollFrame() {
    ticking = false;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const viewH = metrics.viewH;

    // 1. Global Top Progress Bar
    if (scrollProgress) {
      const prog = Math.min(1, Math.max(0, scrollY / metrics.docScrollable));
      scrollProgress.style.transform = `scaleX(${prog.toFixed(4)})`;
    }

    // 2. Pinned Section 01: 120FPS GPU-Smooth Tent Gate Zoom-In & Zoom-Out (Zero clip-path lag!)
    let portalP = 0;
    if (portalTrack && portalZoomRig && portalOverlay && heroStage) {
      const rawP = (scrollY - metrics.portalTop) / metrics.portalScrollable;
      portalP = Math.min(1, Math.max(0, rawP));
      currentPortalP = portalP;

      // Keep Top Header hidden at start; show ONLY after scrolling into the Tent Gate!
      if (siteHeader) {
        const showHeader = portalP >= 0.62;
        siteHeader.classList.toggle("is-visible", showHeader);
        if (!showHeader) closeMenu();
      }

      if (portalP < 1) {
        // Smooth GPU-composited scale (capped at 7.2x so GPU never stalls during zoom-out!)
        const scale = 1 + Math.pow(portalP, 1.65) * 6.2;
        portalZoomRig.style.transform = `translate3d(0, 0, 0) scale(${scale.toFixed(3)})`;

        // Pure GPU-composited Hero reveal (scale + opacity, zero clip-path rasterization!)
        const heroAlpha = portalP < 0.14 ? 0 : Math.min(1, (portalP - 0.14) / 0.42);
        const heroScale = 0.88 + Math.min(1, portalP / 0.78) * 0.12;
        heroStage.style.opacity = String(heroAlpha.toFixed(3));
        heroStage.style.transform = `translate3d(0, 0, 0) scale(${heroScale.toFixed(3)})`;

        const overlayAlpha = portalP > 0.42 ? 1 - (portalP - 0.42) / 0.44 : 1;
        portalOverlay.style.opacity = String(Math.max(0, overlayAlpha).toFixed(3));
        portalOverlay.classList.toggle("is-done", overlayAlpha <= 0.01);

        if (portalHud) {
          portalHud.style.opacity = String(Math.max(0, 1 - portalP * 3.8).toFixed(2));
        }
      } else {
        heroStage.style.opacity = "1";
        heroStage.style.transform = "translate3d(0, 0, 0) scale(1)";
        portalOverlay.style.opacity = "0";
        portalOverlay.classList.add("is-done");
      }
    }

    // 3. SIGNATURE 3D TRAVELLING & SIDE-DOCKING CUBE (Hero -> Section 02 Right Side)
    if (travellingLayer && travellingRig && cube3d && manifestoTrack) {
      const enterStart = metrics.portalTop + metrics.portalScrollable * 0.72;
      const dockPoint = metrics.manifestoTop;
      const exitStart = metrics.manifestoTop + metrics.manifestoScrollable * 0.88;
      const exitEnd = metrics.manifestoTop + metrics.manifestoHeight;

      if (scrollY >= enterStart && scrollY <= exitEnd) {
        const glideP = Math.min(1, Math.max(0, (scrollY - enterStart) / Math.max(1, dockPoint - enterStart)));
        const spinP = Math.min(1, Math.max(0, (scrollY - dockPoint) / metrics.manifestoScrollable));
        const exitP = scrollY > exitStart ? Math.min(1, (scrollY - exitStart) / Math.max(1, exitEnd - exitStart)) : 0;

        const alpha = Math.min(1, glideP * 1.6) * (1 - exitP);
        travellingLayer.style.opacity = String(Math.max(0, alpha).toFixed(3));

        const easeGlide = 1 - Math.pow(1 - glideP, 3);
        const posX = easeGlide * 24;
        const posY = (1 - easeGlide) * -12 - exitP * 18;
        const rigScale = 0.55 + easeGlide * 0.45 - exitP * 0.25;

        travellingRig.style.transform = `translate3d(${posX.toFixed(2)}vw, ${posY.toFixed(2)}vh, 0) scale(${rigScale.toFixed(3)})`;

        const rotY = -28 + glideP * 90 + spinP * 270 + normMouseX * 14;
        const rotX = -16 + Math.sin(spinP * Math.PI * 2) * 18 - normMouseY * 12;
        cube3d.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      } else {
        travellingLayer.style.opacity = "0";
      }
    }

    // 4. Pinned Section 02: Expanding Live Image Window + Word Illumination
    if (manifestoTrack && manifestoWords.length > 0) {
      const rawP = (scrollY - metrics.manifestoTop) / metrics.manifestoScrollable;
      const p = Math.min(1, Math.max(0, rawP));

      const litCount = Math.round(p * manifestoWords.length);
      if (litCount !== prevLitCount) {
        prevLitCount = litCount;
        for (let i = 0; i < manifestoWords.length; i++) {
          manifestoWords[i].classList.toggle("is-lit", i <= litCount);
        }
      }

      if (weWindow) {
        const scaleX = 0.76 + p * 0.24;
        weWindow.style.transform = `scaleX(${scaleX.toFixed(3)})`;
      }
    }

    // 5. Pinned Section 03: Sticky Stacking Pillar Cards
    if (stackCards.length > 1) {
      const nextViewportTop = metrics.stackTops[1] - scrollY;
      if (nextViewportTop < viewH && nextViewportTop > 120) {
        const overlap = 1 - (nextViewportTop - 120) / (viewH - 120);
        const s = 1 - Math.min(1, Math.max(0, overlap)) * 0.035;
        stackCards[0].style.transform = `scale(${s.toFixed(3)})`;
      } else if (nextViewportTop <= 120) {
        stackCards[0].style.transform = "scale(0.965)";
      } else {
        stackCards[0].style.transform = "scale(1)";
      }
    }

    // 6. Pinned Section 04: Split-Screen 5 Engines Wipe + Dynamic Background Reel Crossfade
    if (mpChapters.length > 0) {
      let activeIdx = 0;
      const triggerY = scrollY + viewH * 0.52;
      for (let i = 0; i < metrics.mpChapterTops.length; i++) {
        if (metrics.mpChapterTops[i] <= triggerY) {
          activeIdx = i;
        }
      }

      if (activeIdx !== prevMpIdx) {
        prevMpIdx = activeIdx;
        mpChapters.forEach((c, idx) => c.classList.toggle("is-active", idx === activeIdx));
        mpWipeCards.forEach((card, idx) => card.classList.toggle("is-active", idx <= activeIdx));
        mpQuickBtns.forEach((btn, idx) => btn.classList.toggle("is-active", idx === activeIdx));
        mpBgReels.forEach((reel, idx) => reel.classList.toggle("is-active", idx === activeIdx));
      }
    }

    // 7. Pinned Section 05: Butter-Smooth Horizontal-Scroll Showcase (Zero conflict with card hover!)
    if (hscrollTrack && hscrollStrip) {
      const rawP = (scrollY - metrics.hscrollTop) / metrics.hscrollScrollable;
      const p = Math.min(1, Math.max(0, rawP));
      const moveX = -p * metrics.hscrollMaxX;
      hscrollStrip.style.transform = `translate3d(${moveX.toFixed(1)}px, 0, 0)`;

      if (hscrollBgWords) {
        hscrollBgWords.style.transform = `translate3d(${(moveX * 0.45).toFixed(1)}px, -50%, 0)`;
      }

      if (hscrollBarFill) {
        hscrollBarFill.style.transform = `scaleX(${p.toFixed(3)})`;
      }
    }

    // 8. Section 07: Winding S-Curve Road Trace
    if (roadStage && roadTrace && metrics.roadLen > 0) {
      const rawP = (scrollY + viewH * 0.7 - metrics.roadTop) / metrics.roadHeight;
      const p = Math.min(1, Math.max(0.04, rawP));
      const draw = metrics.roadLen * p;
      roadTrace.style.strokeDashoffset = `${(metrics.roadLen - draw).toFixed(1)}`;
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(renderScrollFrame);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    measureLayout();
    onScroll();
  });
  window.addEventListener("load", () => {
    measureLayout();
    renderScrollFrame();
  });

  measureLayout();
  renderScrollFrame();

  /* ========================================================================
     8. VIRTUAL ASSISTANCE [07 ROWS + FLOATING HOVER FOLLOWER]
     ======================================================================== */
  const vaItems = document.querySelectorAll(".va-item");

  vaItems.forEach((item) => {
    item.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      vaItems.forEach((other) => {
        other.classList.remove("is-open");
        const t = other.querySelector(".va-item__toggle");
        if (t) t.textContent = "+";
      });
      if (!isOpen) {
        item.classList.add("is-open");
        const t = item.querySelector(".va-item__toggle");
        if (t) t.textContent = "–";
      }
      setTimeout(measureLayout, 60);
    });

    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        item.click();
      }
    });

    item.addEventListener("mouseenter", () => {
      const img = item.getAttribute("data-img");
      const tag = item.getAttribute("data-tag");
      if (hoverFollowerImg && img) hoverFollowerImg.src = img;
      if (hoverFollowerTag && tag) hoverFollowerTag.textContent = tag;
      if (hoverFollower) hoverFollower.classList.add("is-visible");
    });

    item.addEventListener("mouseleave", () => {
      if (hoverFollower) hoverFollower.classList.remove("is-visible");
    });
  });

  /* ========================================================================
     9. FAQ ACCORDION
     ======================================================================== */
  const faqRows = document.querySelectorAll(".faq-row");

  faqRows.forEach((row) => {
    const btn = row.querySelector(".faq-btn");
    const ans = row.querySelector(".faq-ans");
    const sign = row.querySelector(".faq-sign");
    if (!btn || !ans) return;

    btn.addEventListener("click", () => {
      const isOpen = row.classList.contains("is-open");
      faqRows.forEach((r) => {
        r.classList.remove("is-open");
        r.querySelector(".faq-btn")?.setAttribute("aria-expanded", "false");
        const a = r.querySelector(".faq-ans");
        if (a) a.hidden = true;
        const s = r.querySelector(".faq-sign");
        if (s) s.textContent = "+";
      });

      if (!isOpen) {
        row.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        ans.hidden = false;
        if (sign) sign.textContent = "–";

        // Rotate the FAQ 3D Cube to showcase a new face when an FAQ question is opened!
        const faqIdx = Number(row.getAttribute("data-faq-idx") || 0);
        faqBaseRotY = -28 + faqIdx * 95;
        faqBaseRotX = faqIdx === 2 ? -68 : -16 + faqIdx * 14;
      }
      setTimeout(measureLayout, 60);
    });
  });

  /* ========================================================================
     10. 3D INTERACTIVE SCOPE CONFIGURATOR & LIVE HOLOGRAPHIC BLUEPRINT
     ======================================================================== */
  const capPills = document.querySelectorAll(".cap-pill");
  const focusPills = document.querySelectorAll(".focus-pill");
  const serviceInput = document.getElementById("cf-service");
  const nameInput = document.getElementById("cf-name");
  const companyInput = document.getElementById("cf-company");

  const bpClientName = document.getElementById("bp-client-name");
  const bpCountBadge = document.getElementById("bp-count-badge");
  const bpActiveTags = document.getElementById("bp-active-tags");
  const bpModeText = document.getElementById("bp-mode-text");
  const submitBtnText = document.getElementById("submit-btn-text");

  const contactForm = document.getElementById("contact-form");
  const formErr = document.getElementById("form-err");
  const briefDone = document.getElementById("brief-done");
  const briefOutput = document.getElementById("brief-output");
  const copyBrief = document.getElementById("copy-brief");
  const editBrief = document.getElementById("edit-brief");

  function syncLiveBlueprint() {
    const selected = Array.from(capPills)
      .filter((p) => p.classList.contains("is-selected"))
      .map((p) => p.getAttribute("data-cap") || "");

    if (bpCountBadge) {
      bpCountBadge.textContent = `${selected.length} Active Engine${selected.length === 1 ? "" : "s"}`;
    }

    if (bpActiveTags) {
      bpActiveTags.innerHTML =
        selected.length > 0
          ? selected.map((c) => `<span>${c}</span>`).join("")
          : `<span>Custom Scope</span>`;
    }

    if (submitBtnText) {
      submitBtnText.textContent = "Send Project Inquiry";
    }

    if (bpClientName) {
      const brandVal = (companyInput?.value || "").trim() || (nameInput?.value || "").trim();
      bpClientName.textContent = brandVal || "Your Brand Atelier";
    }
  }

  capPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pill.classList.toggle("is-selected");
      syncLiveBlueprint();
    });
  });

  focusPills.forEach((fp) => {
    fp.addEventListener("click", () => {
      focusPills.forEach((other) => other.classList.remove("is-active"));
      fp.classList.add("is-active");
      const val = fp.getAttribute("data-focus-val") || "";
      if (serviceInput) serviceInput.value = val;
      if (bpModeText) bpModeText.textContent = fp.textContent || val;
    });
  });

  if (companyInput) companyInput.addEventListener("input", syncLiveBlueprint);
  if (nameInput) nameInput.addEventListener("input", syncLiveBlueprint);

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (formErr) formErr.hidden = true;

      const name = (nameInput?.value || "").trim();
      const company = (companyInput?.value || "").trim();
      const email = (document.getElementById("cf-email")?.value || "").trim();
      const service = serviceInput?.value || "";
      const message = (document.getElementById("cf-message")?.value || "").trim();

      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
        if (formErr) {
          formErr.textContent = "Please enter your name, a valid email address, and your project goals.";
          formErr.hidden = false;
        }
        return;
      }

      const selected = Array.from(capPills)
        .filter((p) => p.classList.contains("is-selected"))
        .map((p) => p.getAttribute("data-cap"));

      const summary = [
        "WIG WHAM — 3D SCOPE BLUEPRINT",
        "-----------------------------",
        `Name          : ${name}`,
        `Brand / Store : ${company || "Not specified"}`,
        `Email         : ${email}`,
        `Primary Track : ${service}`,
        `Active Engines: ${selected.join(", ") || "Custom Scope"}`,
        "",
        "Project Goals & Workflows:",
        message,
      ].join("\n");

      if (briefOutput) briefOutput.textContent = summary;
      contactForm.hidden = true;
      if (briefDone) briefDone.hidden = false;
    });
  }

  if (copyBrief && briefOutput) {
    copyBrief.addEventListener("click", () => {
      navigator.clipboard?.writeText(briefOutput.textContent || "");
    });
  }

  if (editBrief && contactForm && briefDone) {
    editBrief.addEventListener("click", () => {
      briefDone.hidden = true;
      contactForm.hidden = false;
    });
  }

  /* ========================================================================
     11. FOOTER INTERACTIVE 3D PARTICLE CONSTELLATION & RISING EMBER ENGINE
     ======================================================================== */
  const footerCanvas = document.getElementById("footer-particles");
  const siteFooter = document.getElementById("site-footer");

  if (footerCanvas && siteFooter && typeof footerCanvas.getContext === "function") {
    const ctx = footerCanvas.getContext("2d");
    let fWidth = 0;
    let fHeight = 0;
    let footerVisible = true;
    let fMouseX = -9999;
    let fMouseY = -9999;

    const palette = [
      { r: 229, g: 9, b: 20 },     // Wig Wham Crimson
      { r: 255, g: 85, b: 0 },     // Sunset Ember
      { r: 232, g: 223, b: 202 },  // Champagne Gold
    ];

    const PARTICLE_COUNT = 78;
    const particles = [];

    function resizeFooterCanvas() {
      const rect = siteFooter.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      fWidth = Math.max(300, rect.width);
      fHeight = Math.max(260, rect.height);
      footerCanvas.width = fWidth * dpr;
      footerCanvas.height = fHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticle() {
      const col = palette[Math.floor(Math.random() * palette.length)];
      return {
        x: Math.random() * (fWidth || window.innerWidth),
        y: Math.random() * (fHeight || 420),
        vx: (Math.random() - 0.5) * 0.48,
        vy: -0.22 - Math.random() * 0.55, // Rising ember drift + floating motion
        radius: 1.4 + Math.random() * 2.8,
        alpha: 0.35 + Math.random() * 0.55,
        pulseSpeed: 0.015 + Math.random() * 0.025,
        phase: Math.random() * Math.PI * 2,
        col,
      };
    }

    resizeFooterCanvas();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }

    window.addEventListener("resize", resizeFooterCanvas);

    siteFooter.addEventListener(
      "mousemove",
      (e) => {
        const r = siteFooter.getBoundingClientRect();
        fMouseX = e.clientX - r.left;
        fMouseY = e.clientY - r.top;
      },
      { passive: true }
    );

    siteFooter.addEventListener("mouseleave", () => {
      fMouseX = -9999;
      fMouseY = -9999;
    });

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            footerVisible = entry.isIntersecting;
          });
        },
        { threshold: 0.02 }
      );
      io.observe(siteFooter);
    }

    function renderFooterParticles() {
      if (footerVisible && fWidth > 0 && fHeight > 0) {
        ctx.clearRect(0, 0, fWidth, fHeight);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.phase += p.pulseSpeed;
          p.x += p.vx + Math.sin(p.phase) * 0.18;
          p.y += p.vy;

          // Interactive cursor repulsion / swirl
          const dxm = p.x - fMouseX;
          const dym = p.y - fMouseY;
          const distSq = dxm * dxm + dym * dym;
          if (distSq < 19600 && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const force = (140 - dist) / 140;
            p.x += (dxm / dist) * force * 2.1;
            p.y += (dym / dist) * force * 2.1;
          }

          // Wrap around boundaries smoothly
          if (p.y < -12) {
            p.y = fHeight + 12;
            p.x = Math.random() * fWidth;
          }
          if (p.x < -12) p.x = fWidth + 12;
          if (p.x > fWidth + 12) p.x = -12;

          // Subtle constellation filaments between nearby particles
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 12500) {
              const lineAlpha = (1 - d2 / 12500) * 0.22;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(232, 223, 202, ${lineAlpha.toFixed(3)})`;
              ctx.lineWidth = 0.85;
              ctx.stroke();
            }
          }

          // Draw glowing particle core + soft halo
          const curAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.phase));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.col.r}, ${p.col.g}, ${p.col.b}, ${(curAlpha * 0.24).toFixed(3)})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.col.r}, ${p.col.g}, ${p.col.b}, ${curAlpha.toFixed(3)})`;
          ctx.fill();
        }
      }
      requestAnimationFrame(renderFooterParticles);
    }
    requestAnimationFrame(renderFooterParticles);
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // =========================================================================
  // 15. INTERACTIVE BOOK A MEETING SCHEDULER (book-a-meeting.html)
  // =========================================================================
  const bookingForm = document.getElementById("booking-form");
  const bookingDateGrid = document.getElementById("booking-date-grid");
  const bookingTimeGrid = document.getElementById("booking-time-grid");
  const bookingLiveSummary = document.getElementById("booking-live-summary");
  const bookingTzEl = document.getElementById("booking-tz");

  if (bookingForm && bookingDateGrid && bookingTimeGrid) {
    let selectedDuration = "30";
    let selectedDateLabel = "";
    let selectedDateISO = "";
    let selectedTime = "10:30 AM";

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && bookingTzEl) {
        bookingTzEl.textContent = tz.replace(/_/g, " ");
      }
    } catch (_) {}

    // Generate next 8 upcoming business days dynamically
    const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const cursorDate = new Date();
    cursorDate.setDate(cursorDate.getDate() + 1);

    let added = 0;
    bookingDateGrid.innerHTML = "";

    while (added < 8) {
      const dayOfWeek = cursorDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dName = daysShort[dayOfWeek];
        const dNum = cursorDate.getDate();
        const mName = monthsShort[cursorDate.getMonth()];
        const yNum = cursorDate.getFullYear();
        const iso = `${yNum}-${String(cursorDate.getMonth() + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
        const label = `${dName}, ${mName} ${dNum}, ${yNum}`;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "date-card" + (added === 0 ? " is-selected" : "");
        btn.dataset.dateIso = iso;
        btn.dataset.dateLabel = label;
        btn.innerHTML = `
          <span class="date-card__day">${dName}</span>
          <strong class="date-card__num">${dNum}</strong>
          <span class="date-card__month">${mName}</span>
        `;

        if (added === 0) {
          selectedDateISO = iso;
          selectedDateLabel = label;
        }

        btn.addEventListener("click", () => {
          bookingDateGrid.querySelectorAll(".date-card").forEach((c) => c.classList.remove("is-selected"));
          btn.classList.add("is-selected");
          selectedDateISO = iso;
          selectedDateLabel = label;
          updateBookingLiveSummary();
        });

        bookingDateGrid.appendChild(btn);
        added++;
      }
      cursorDate.setDate(cursorDate.getDate() + 1);
    }

    const durationPills = Array.from(document.querySelectorAll(".booking-duration-pill"));
    durationPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        durationPills.forEach((p) => {
          p.classList.remove("is-selected");
          p.setAttribute("aria-pressed", "false");
        });
        pill.classList.add("is-selected");
        pill.setAttribute("aria-pressed", "true");
        selectedDuration = pill.dataset.duration || "30";
        updateBookingLiveSummary();
      });
    });

    const timePills = Array.from(bookingTimeGrid.querySelectorAll(".time-pill"));
    timePills.forEach((pill) => {
      pill.addEventListener("click", () => {
        timePills.forEach((p) => p.classList.remove("is-selected"));
        pill.classList.add("is-selected");
        selectedTime = pill.dataset.time || "10:30 AM";
        updateBookingLiveSummary();
      });
    });

    const topicPills = Array.from(document.querySelectorAll(".booking-topic-pill"));
    topicPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const next = !pill.classList.contains("is-selected");
        const count = topicPills.filter((p) => p.classList.contains("is-selected")).length;
        if (!next && count <= 1) return;
        pill.classList.toggle("is-selected", next);
        pill.setAttribute("aria-pressed", String(next));
      });
    });

    function updateBookingLiveSummary() {
      if (!bookingLiveSummary) return;
      bookingLiveSummary.textContent = `${selectedDateLabel} · ${selectedTime} (${selectedDuration} Min)`;
    }

    updateBookingLiveSummary();

    const bookingErr = document.getElementById("booking-err");
    const bookingDone = document.getElementById("booking-done");
    const bookingSummaryText = document.getElementById("booking-summary-text");
    const gcalLink = document.getElementById("gcal-link");
    const resetBookingBtn = document.getElementById("reset-booking");

    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (document.getElementById("b-name")?.value || "").trim();
      const brand = (document.getElementById("b-brand")?.value || "").trim() || "Brand Partner";
      const email = (document.getElementById("b-email")?.value || "").trim();
      const notes = (document.getElementById("b-notes")?.value || "").trim() || "Walk through marketplace execution & daily virtual assistance workflows.";

      if (!name || !email || !email.includes("@")) {
        if (bookingErr) bookingErr.hidden = false;
        return;
      }
      if (bookingErr) bookingErr.hidden = true;

      const chosenTopics = topicPills
        .filter((p) => p.classList.contains("is-selected"))
        .map((p) => p.dataset.topic);

      const summary = [
        "WIG WHAM — CONFIRMED DISCOVERY SESSION",
        "============================================",
        `Date & Time   : ${selectedDateLabel} at ${selectedTime}`,
        `Duration      : ${selectedDuration} Minutes`,
        `Guest         : ${name} (${brand})`,
        `Email         : ${email}`,
        `Focus Channels: ${chosenTopics.join(", ")}`,
        "--------------------------------------------",
        `Agenda Notes  : ${notes}`,
      ].join("\n");

      if (bookingSummaryText) bookingSummaryText.textContent = summary;

      if (gcalLink && selectedDateISO) {
        const cleanDate = selectedDateISO.replace(/-/g, "");
        const title = encodeURIComponent(`Wig Wham × ${brand} — 3D Strategy & Operations Call`);
        const details = encodeURIComponent(summary);
        gcalLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${cleanDate}T150000Z/${cleanDate}T153000Z&details=${details}`;
      }

      bookingForm.hidden = true;
      if (bookingDone) bookingDone.hidden = false;
    });

    resetBookingBtn?.addEventListener("click", () => {
      bookingForm.reset();
      if (bookingDone) bookingDone.hidden = true;
      bookingForm.hidden = false;
    });
  }
})();
