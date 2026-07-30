/**
 * Text that resolves out of noise.
 *
 * Anything marked `data-scramble` starts as random characters and settles into its
 * real text when it scrolls into view, and again each time it is re-entered. The
 * alphabet is the same punctuation the backdrop artwork is drawn from, so the copy
 * appears to condense out of the same material.
 *
 * The real text is always what is in the HTML: this only rewrites text nodes at
 * runtime and restores them exactly. Nothing is hidden, so a reader without
 * JavaScript, and any crawler, gets the finished copy.
 *
 * Nothing runs when the reader prefers reduced motion.
 */
(function () {
  "use strict";

  var GLYPHS = ".,:;_-=+<>()/\\|[]{}*%&#@";
  var DURATION = 620; // ms from noise to settled
  var JITTER = 0.18; // share of the run each character may lag by, so the
  //                    settling edge is ragged rather than a clean wipe
  var SWAP_EVERY = 2; // frames a random character is held, to avoid flicker
  var LIMIT = 900; // characters per element; longer text settles instantly

  if (!("IntersectionObserver" in window)) {
    return;
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) {
    return;
  }

  var targets = [];
  var observer = null;

  var active = [];
  var frame = null;
  var tick = 0;

  function glyph() {
    return GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
  }

  // One virtual string across every text node, so inline links and emphasis keep
  // their markup while the whole block resolves together.
  function collect(element) {
    var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    var pieces = [];
    var length = 0;
    var node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue.replace(/\s/g, "")) {
        continue;
      }
      pieces.push({ node: node, text: node.nodeValue, start: length });
      length += node.nodeValue.length;
    }
    return { pieces: pieces, length: length };
  }

  function restore(entry) {
    for (var i = 0; i < entry.pieces.length; i += 1) {
      entry.pieces[i].node.nodeValue = entry.pieces[i].text;
    }
    entry.element.removeAttribute("aria-busy");
  }

  // A character settles once progress passes its own threshold, which runs from 0
  // at the start of the text to 1 at the end, plus that character's jitter.
  function paint(entry, progress) {
    for (var p = 0; p < entry.pieces.length; p += 1) {
      var piece = entry.pieces[p];
      var out = "";
      for (var i = 0; i < piece.text.length; i += 1) {
        var character = piece.text.charAt(i);
        var index = piece.start + i;
        // Whitespace is never scrambled: word shapes hold, so nothing reflows.
        if (character === " " || character === "\n" || character === "\t") {
          out += character;
        } else if (progress >= entry.thresholds[index]) {
          out += character;
        } else {
          out += entry.held[index];
        }
      }
      piece.node.nodeValue = out;
    }
  }

  function step(now) {
    frame = null;
    tick += 1;
    var reroll = tick % SWAP_EVERY === 0;

    for (var i = active.length - 1; i >= 0; i -= 1) {
      var entry = active[i];
      var progress = Math.min((now - entry.started) / DURATION, 1);

      if (reroll) {
        for (var h = 0; h < entry.held.length; h += 1) {
          entry.held[h] = glyph();
        }
      }

      if (progress >= 1) {
        restore(entry);
        active.splice(i, 1);
      } else {
        paint(entry, progress);
      }
    }

    if (active.length) {
      frame = window.requestAnimationFrame(step);
    }
  }

  function gateOpen() {
    return document.documentElement.classList.contains("has-entry-open");
  }

  function start(element) {
    // The invitation covers the page: scrambling behind it would be spent unseen,
    // so leave the element eligible and let the entry event below run it.
    if (gateOpen()) {
      element.dataset.scrambleSeen = "0";
      return;
    }

    var collected = collect(element);
    if (!collected.length || collected.length > LIMIT) {
      return;
    }

    // Already running on this element: let the current pass finish.
    for (var i = 0; i < active.length; i += 1) {
      if (active[i].element === element) {
        return;
      }
    }

    var thresholds = new Array(collected.length);
    var held = new Array(collected.length);
    for (var c = 0; c < collected.length; c += 1) {
      // Scaled by (1 - JITTER) so even the last character settles before the end.
      thresholds[c] = (c / collected.length) * (1 - JITTER) + Math.random() * JITTER;
      held[c] = glyph();
    }

    // Tells assistive tech the text is mid-change; the DOM ends up correct either way.
    element.setAttribute("aria-busy", "true");

    active.push({
      element: element,
      pieces: collected.pieces,
      length: collected.length,
      thresholds: thresholds,
      held: held,
      started: performance.now(),
    });

    if (frame === null) {
      frame = window.requestAnimationFrame(step);
    }
  }

  observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var element = entry.target;
        if (entry.isIntersecting) {
          // Only fire on a fresh entry, so scrolling within a section is quiet.
          if (element.dataset.scrambleSeen !== "1") {
            element.dataset.scrambleSeen = "1";
            start(element);
          }
        } else {
          element.dataset.scrambleSeen = "0";
        }
      });
    },
    { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
  );

  // Re-read the DOM on load and after every soft navigation.
  function bind() {
    while (active.length) {
      restore(active.pop());
    }
    targets = document.querySelectorAll("[data-scramble]");
    Array.prototype.forEach.call(targets, function (element) {
      element.dataset.scrambleSeen = "0";
      observer.observe(element);
    });
  }

  bind();
  document.addEventListener("atelier:navigated", bind);

  // Dispatched when the invitation closes: whatever is on screen resolves then,
  // which is what makes the name settle as the reader arrives.
  document.addEventListener("atelier:entered", function () {
    Array.prototype.forEach.call(targets, function (element) {
      var box = element.getBoundingClientRect();
      if (box.bottom > 0 && box.top < window.innerHeight) {
        element.dataset.scrambleSeen = "1";
        start(element);
      }
    });
  });

  // Turning reduced motion on mid-session should stop it and leave clean text.
  function watch(query, handler) {
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handler);
    } else if (typeof query.addListener === "function") {
      query.addListener(handler);
    }
  }

  watch(reducedMotion, function () {
    if (!reducedMotion.matches) {
      return;
    }
    observer.disconnect();
    while (active.length) {
      restore(active.pop());
    }
    if (frame !== null) {
      window.cancelAnimationFrame(frame);
      frame = null;
    }
  });
})();
