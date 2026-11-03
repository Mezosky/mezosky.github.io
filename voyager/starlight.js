(() => {
  const scenes = [...document.querySelectorAll(".voyager-page .hero, .voyager-page .bird-finale, .voyager-page .footer")];
  if (!scenes.length) return;

  // Fixed seeds make the composition stable; brightness alone changes over time.
  function randomSequence(seed) {
    return () => {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  const visibility = new Map();
  function updateVisibility() {
    scenes.forEach((scene) => scene.classList.toggle("is-starlight-visible", visibility.get(scene) && !document.hidden));
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => visibility.set(entry.target, entry.isIntersecting));
    updateVisibility();
  });
  document.addEventListener("visibilitychange", updateVisibility);

  scenes.forEach((scene, sceneIndex) => {
    const field = document.createElement("div");
    field.className = "starlight-field";
    field.setAttribute("aria-hidden", "true");
    scene.prepend(field);
    scene.classList.add("has-starlight");
    observer.observe(scene);
    let previousSize = "";

    function compose() {
      const bounds = scene.getBoundingClientRect();
      const width = Math.round(bounds.width);
      const height = Math.round(bounds.height);
      const size = `${width}:${height}`;
      if (!width || !height || size === previousSize) return;
      previousSize = size;
      const random = randomSequence(1931247166 + sceneIndex * 137);
      const mobile = width < 600;
      const hero = scene.classList.contains("hero");
      const finale = scene.classList.contains("bird-finale");
      const footer = scene.classList.contains("footer");
      const skyHeight = finale ? height * 0.67 : height;
      const count = Math.min(mobile ? 30 : 64, Math.round((width * skyHeight) / (mobile ? 16000 : 18000)));
      const glints = footer ? 1 : finale || mobile ? 2 : 4;
      const diagramElement = hero && scene.querySelector(".orbital-layers");
      const diagram = diagramElement ? diagramElement.getBoundingClientRect() : null;
      const clearDisc = diagram
        ? {
            x: diagram.left - bounds.left + diagram.width / 2,
            y: diagram.top - bounds.top + (diagram.height * 250) / 480,
            radius: (diagram.width * 218) / 600 + 36,
          }
        : null;
      // Reserve real rendered rectangles, so stars never compete with words or image controls.
      const protectedAreas = [...scene.querySelectorAll("h1, h2, p, a, button, figcaption, svg text, svg image, .orbital-layer circle")]
        .flatMap((element) => [...element.getClientRects()])
        .filter((rect) => rect.width && rect.height)
        .map((rect) => ({
          left: rect.left - bounds.left,
          right: rect.right - bounds.left,
          top: rect.top - bounds.top,
          bottom: rect.bottom - bounds.top,
        }));
      const points = [];
      const fragment = document.createDocumentFragment();
      for (let attempt = 0; points.length < count && attempt < count * 80; attempt++) {
        const glint = points.length < glints;
        const x = 14 + random() * Math.max(0, width - 28);
        const y = 14 + random() * (hero && glint && width >= 1000 ? 100 : Math.max(0, skyHeight - 28));
        // The whole layer disc stays empty: a decorative dot must never read as a model layer.
        if (clearDisc && Math.hypot(x - clearDisc.x, y - clearDisc.y) < clearDisc.radius) continue;
        const padding = glint ? 40 : 10;
        if (protectedAreas.some((rect) => x > rect.left - padding && x < rect.right + padding && y > rect.top - padding && y < rect.bottom + padding))
          continue;
        if (points.some((point) => Math.hypot(x - point.x, y - point.y) < (glint ? 90 : 30))) continue;
        const star = document.createElement("span");
        star.className = `starlight-star${glint ? " is-glint" : ""}${random() < 0.3 ? " is-blue" : ""}`;
        const weight = random();
        const upperSky = hero && y < height * 0.35;
        const rest = upperSky ? 0.35 + random() * 0.25 : 0.22 + random() * 0.25;
        star.style.left = `${x.toFixed(1)}px`;
        star.style.top = `${y.toFixed(1)}px`;
        star.style.setProperty("--star-size", `${upperSky && weight > 0.7 ? 2 : weight < 0.7 ? 1 : weight < 0.95 ? 1.5 : 2}px`);
        star.style.setProperty("--star-rest", rest.toFixed(2));
        star.style.setProperty("--star-peak", Math.min(0.8, rest * 1.8).toFixed(2));
        star.style.setProperty("--star-period", `${(5 + random() * 6).toFixed(2)}s`);
        star.style.setProperty("--star-delay", `${glint ? -(points.length * 3.5 + 1) : -(random() * 11).toFixed(2)}s`);
        fragment.append(star);
        points.push({ x, y });
      }
      field.replaceChildren(fragment);
    }
    new ResizeObserver(compose).observe(scene);
    compose();
    document.fonts.ready.then(() => {
      previousSize = "";
      compose();
    });
  });
})();
