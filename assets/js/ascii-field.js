/**
 * Parallax for the ASCII backdrop.
 *
 * The artwork is plain text and renders without this file; everything here is
 * enhancement. Layers are nudged by a few pixels against each other, which is
 * enough to give the field depth without becoming an animation.
 *
 * Nothing runs when the reader prefers reduced motion, or on pointer-less and
 * small screens, where the cost is real and the effect is not.
 */
(function () {
  "use strict";

  // Peak displacement in px for the nearest layer; further layers move less.
  var POINTER_RANGE = 9;
  var SCROLL_RANGE = 26;

  var field = document.querySelector("[data-ascii-field]");
  if (!field) {
    return;
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var coarsePointer = window.matchMedia("(hover: none), (max-width: 47.9em)");

  var layers = Array.prototype.map.call(field.querySelectorAll("[data-ascii-layer]"), function (element) {
    var depth = parseFloat(element.getAttribute("data-depth")) || 1;
    return { element: element, depth: depth };
  });
  if (!layers.length) {
    return;
  }

  var pointerX = 0;
  var pointerY = 0;
  var scrollShift = 0;
  var frame = null;
  var listening = false;

  function apply() {
    frame = null;
    for (var i = 0; i < layers.length; i += 1) {
      var layer = layers[i];
      // Nearer layers (higher depth) travel further, as in a diorama.
      var reach = layer.depth / layers.length;
      var x = pointerX * POINTER_RANGE * reach;
      var y = pointerY * POINTER_RANGE * reach + scrollShift * SCROLL_RANGE * reach;
      layer.element.style.transform = "translate3d(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px, 0)";
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
    scrollShift = 0;
    for (var i = 0; i < layers.length; i += 1) {
      layers[i].element.style.transform = "";
    }
    field.style.removeProperty("--ascii-scrolled");
  }

  function onPointerMove(event) {
    // -1..1 from the centre of the viewport.
    pointerX = (event.clientX / window.innerWidth) * 2 - 1;
    pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    schedule();
  }

  function onScroll() {
    var travel = window.innerHeight || 1;
    var progress = Math.min(window.scrollY / travel, 1);
    scrollShift = progress;
    // Drives the density fade in CSS as the reader leaves the hero.
    field.style.setProperty("--ascii-scrolled", progress.toFixed(3));
    schedule();
  }

  function start() {
    if (listening) {
      return;
    }
    listening = true;
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function stop() {
    if (!listening) {
      return;
    }
    listening = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", onScroll);
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
