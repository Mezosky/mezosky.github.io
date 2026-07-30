/**
 * Motion for the ASCII backdrop.
 *
 * Three effects, all enhancement — the artwork renders without this file:
 *
 *   pan     a field taller than the viewport travels down as the page scrolls,
 *           so later sections sit against later parts of the painting
 *   depth   layers drift against each other with the pointer
 *   ripple  rows near the pointer are pushed aside, so the characters visibly
 *           move as the cursor passes through them
 *   fade    the field thins out as the reader leaves the hero
 *
 * The plate takes the pan but not the pointer drift: it sits furthest back, so it
 * should be the most stationary thing on screen, and holding it still keeps it in
 * register with the text.
 *
 * Nothing runs when the reader prefers reduced motion, or on pointer-less and
 * small screens, where the cost is real and the effect is not.
 */
(function () {
  "use strict";

  // Peak displacement in px.
  var POINTER_RANGE = 9; // whole-layer drift with the pointer
  var SCROLL_RANGE = 26; // vertical drift for a field that has no room to pan
  var RIPPLE_AMPLITUDE = 14; // sideways push of the rows nearest the pointer
  var RIPPLE_RADIUS = 96; // px above/below the pointer that the push reaches
  var RIPPLE_SPAN = 2.6; // how many radii out still get touched

  var field = document.querySelector("[data-ascii-field]");
  if (!field) {
    return;
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var coarsePointer = window.matchMedia("(hover: none), (max-width: 47.9em)");

  var plate = field.querySelector("[data-ascii-plate]");
  var layers = Array.prototype.map.call(field.querySelectorAll("[data-ascii-layer]"), function (element) {
    return {
      element: element,
      depth: parseFloat(element.getAttribute("data-depth")) || 1,
      rows: element.children,
      touched: [],
    };
  });
  if (!layers.length) {
    return;
  }

  var pointerX = 0;
  var pointerY = 0;
  var pointerClientY = -1e6;
  var scrollShift = 0;
  var pan = 0;
  var frame = null;
  var listening = false;

  // Derivative-of-Gaussian, normalised to a peak of 1 at t = ±1. Zero directly
  // under the pointer and falling away past it, so rows part around the cursor
  // instead of jumping sides as it crosses them.
  var PEAK = Math.sqrt(Math.E);
  function rippleAt(t) {
    return t * Math.exp((-t * t) / 2) * PEAK;
  }

  function metrics() {
    var first = layers[0].element;
    var height = first.offsetHeight;
    var rows = first.children.length || 1;
    return {
      rowHeight: height / rows,
      rowCount: rows,
      height: height,
      // getBoundingClientRect already includes the pan, so back it out to get
      // the element's resting offset.
      top: first.getBoundingClientRect().top - pan,
      // How far the grid can travel before its last row reaches the viewport.
      travel: Math.max(0, height + (first.offsetTop || 0) - window.innerHeight),
    };
  }

  function clearRipple(layer) {
    for (var i = 0; i < layer.touched.length; i += 1) {
      layer.touched[i].style.transform = "";
    }
    layer.touched.length = 0;
  }

  function apply() {
    frame = null;

    var m = metrics();
    var reach = RIPPLE_RADIUS * RIPPLE_SPAN;
    // Row index under the pointer, in the layer's own coordinates.
    var focus = (pointerClientY - m.top - pan) / m.rowHeight;

    for (var i = 0; i < layers.length; i += 1) {
      var layer = layers[i];
      var lead = layer.depth / layers.length;
      var x = pointerX * POINTER_RANGE * lead;
      // Pan when the grid is tall enough to have somewhere to go; otherwise fall
      // back to a few pixels of depth drift so scrolling still registers.
      var travelY = m.travel > 0 ? pan : scrollShift * SCROLL_RANGE * lead;
      var y = pointerY * POINTER_RANGE * lead + travelY;
      layer.element.style.transform = "translate3d(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px, 0)";

      clearRipple(layer);
      if (pointerClientY < -1e5) {
        continue;
      }

      var from = Math.max(0, Math.floor(focus - reach / m.rowHeight));
      var to = Math.min(m.rowCount - 1, Math.ceil(focus + reach / m.rowHeight));
      for (var r = from; r <= to; r += 1) {
        var row = layer.rows[r];
        if (!row) {
          continue;
        }
        var dy = (r + 0.5 - focus) * m.rowHeight;
        var shift = rippleAt(dy / RIPPLE_RADIUS) * RIPPLE_AMPLITUDE * (0.6 + 0.4 * lead);
        if (Math.abs(shift) < 0.15) {
          continue;
        }
        row.style.transform = "translate3d(" + shift.toFixed(2) + "px, 0, 0)";
        layer.touched.push(row);
      }
    }

    if (plate) {
      var plateY = m.travel > 0 ? pan : scrollShift * SCROLL_RANGE * 0.35;
      plate.style.transform = "translate3d(0, " + plateY.toFixed(2) + "px, 0)";
    }
  }

  function schedule() {
    if (frame === null) {
      frame = window.requestAnimationFrame(apply);
    }
  }

  function reset() {
    pointerX = 0;
    pointerY = 0;
    pointerClientY = -1e6;
    scrollShift = 0;
    pan = 0;
    for (var i = 0; i < layers.length; i += 1) {
      clearRipple(layers[i]);
      layers[i].element.style.transform = "";
    }
    if (plate) {
      plate.style.transform = "";
    }
    field.style.removeProperty("--ascii-scrolled");
  }

  function onPointerMove(event) {
    // -1..1 from the centre of the viewport, plus the raw position for the ripple.
    pointerX = (event.clientX / window.innerWidth) * 2 - 1;
    pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    pointerClientY = event.clientY;
    schedule();
  }

  function onPointerLeave() {
    pointerClientY = -1e6;
    schedule();
  }

  function onScroll() {
    // Panning is spread over the whole document; the density fade happens over
    // the first viewport, while the reader is still leaving the hero.
    var scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    pan = -Math.min(Math.max(window.scrollY / scrollable, 0), 1) * metrics().travel;

    scrollShift = Math.min(window.scrollY / Math.max(1, window.innerHeight), 1);
    field.style.setProperty("--ascii-scrolled", scrollShift.toFixed(3));
    schedule();
  }

  function start() {
    if (listening) {
      return;
    }
    listening = true;
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  }

  function stop() {
    if (!listening) {
      return;
    }
    listening = false;
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerleave", onPointerLeave);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (frame !== null) {
      window.cancelAnimationFrame(frame);
      frame = null;
    }
    reset();
  }

  function sync() {
    if (reducedMotion.matches || coarsePointer.matches) {
      stop();
    } else {
      start();
    }
  }

  // Both older (addListener) and current (addEventListener) MediaQueryList APIs.
  function watch(query, handler) {
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handler);
    } else if (typeof query.addListener === "function") {
      query.addListener(handler);
    }
  }

  watch(reducedMotion, sync);
  watch(coarsePointer, sync);
  sync();
})();
