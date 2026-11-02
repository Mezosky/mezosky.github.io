(function () {
  "use strict";
  var routes = { penguin: [3, 5, 6, 9, 12], puffin: [2, 7, 10, 12] };
  var fixed = [3, 4, 6, 8, 12];
  function photo(bird, x, y, size) {
    return (
      '<svg x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      size +
      '" height="' +
      size +
      '" viewBox="' +
      (bird === "penguin" ? "16 51 95 94" : "123 51 94 94") +
      '"><image href="assets/method.webp" width="1137" height="385"/></svg>'
    );
  }
  function text(x, y, label, size, anchor, extra) {
    return (
      '<text x="' +
      x +
      '" y="' +
      y +
      '" font-size="' +
      (size || 15) +
      '" text-anchor="' +
      (anchor || "middle") +
      '"' +
      (extra || "") +
      ">" +
      label +
      "</text>"
    );
  }
  function box(x, y, w, h, label, cls, size) {
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="4" class="' +
      cls +
      '"/>' +
      text(x + w / 2, y + h / 2 + 5, label, size || 15)
    );
  }
  function diagram(mode, bird) {
    var active = mode === "final" ? [12] : mode === "fixed" ? fixed : routes[bird];
    var prefix = "lesson-" + mode + "-",
      paths = [],
      nodes = "",
      wires = "";
    function wire(name, d, type, replay) {
      paths.push('<path id="' + prefix + name + '" d="' + d + '"/>');
      wires += '<use href="#' + prefix + name + '" class="lesson-wire ' + type + '" marker-end="url(#' + prefix + 'arrow)"/>';
      if (replay) wires += '<use href="#' + prefix + name + '" class="lesson-pulse"/>';
    }
    wire("image", "M62 65V78H114V102H62V106", "", true);
    for (var i = 1; i <= 12; i++) {
      var y = 108 + (i - 1) * 21;
      var on = active.indexOf(i) !== -1;
      if (i < 12) wire("depth-" + i, "M62 " + (y + 17) + "V" + (y + 21), "depth", false);
      wire("score-" + i, "M104 " + (y + 8.5) + "H128", on ? "selected" : "unused", on);
      if (on) wire("fuse-" + i, "M164 " + (y + 8.5) + "C187 " + (y + 8.5) + " 188 261 214 261", "selected", true);
      nodes += box(20, y, 84, 17, "Layer " + i, on ? "lesson-node chosen" : "lesson-node", 13);
      nodes += box(129, y, 35, 17, "S" + i, on ? "lesson-score chosen" : "lesson-score", 13);
      if (mode === "dynamic") {
        // Mean-pooling is a feature path, separate from the score bank to its right.
        wire("pool-tap-" + i, "M20 " + (y + 8.5) + "H10", "feature", false);
      }
    }
    if (mode === "dynamic") {
      wire("pool", "M10 347.5V2H275V106", "feature", true);
      nodes += box(214, 107, 122, 34, "Mean features", "lesson-box", 15);
      wire("gate", "M275 141V157", "feature", true);
      nodes += box(214, 158, 122, 35, "Router Gθ", "lesson-box router", 16);
      wire("choice", "M275 193V232", "choice", true);
      nodes += text(284, 218, "Choose", 13, "start");
    } else {
      nodes += text(275, 158, mode === "final" ? "No fusion" : "One fixed subset", 15);
      nodes += text(275, 180, mode === "final" ? "One score is read" : "Same for both birds", 13);
    }
    nodes += box(214, 233, 122, 56, mode === "final" ? "Read S12" : mode === "fixed" ? "Fixed mean" : "Expert mean", "lesson-box fusion", 17);
    wire("out", "M275 289V325", "selected", true);
    nodes += box(214, 326, 122, 31, "OOD score", "lesson-box", 16);
    var label = mode === "final" ? "Layer 12 only" : mode === "fixed" ? "The same five layers" : "A route for this image";
    nodes += text(180, 396, label, 16);
    var defs =
      '<defs><marker id="' +
      prefix +
      'arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#5d8070"/></marker>' +
      paths.join("") +
      "</defs>";
    // Every animated pulse and its static arrow use the identical path.
    return (
      '<svg class="lesson-wiring" viewBox="0 0 360 414" role="img" aria-label="' +
      mode +
      " structure for the " +
      bird +
      ". Selected layers " +
      active.join(", ") +
      '.">' +
      defs +
      photo(bird, 35, 10, 54) +
      text(146, 33, bird === "penguin" ? "Penguin input" : "Puffin input", 15, "start") +
      text(146, 55, "Same frozen CLIP", 13, "start") +
      text(62, 98, "Backbone", 14) +
      text(146, 98, "Scores", 14) +
      wires +
      nodes +
      "</svg>"
    );
  }
  function cue(kind, bird) {
    var puffin = bird === "puffin",
      body = "";
    if (kind === "detail") {
      body =
        '<rect x="23" y="20" width="64" height="64" rx="3" fill="#fff" stroke="#cbd7d0"/><path d="M23 30L87 76V84H65L23 54Z" fill="#243b38"/><rect x="112" y="20" width="64" height="64" rx="3" fill="#fff" stroke="#cbd7d0"/><path d="M112 50L176 30V70Z" fill="#ce893f"/><path d="M27 103H83M116 103H172" stroke="#788e82"/>';
    } else if (kind === "parts") {
      body =
        '<path d="M48 101C32 76 42 36 73 24C104 15 129 37 124 63L139 91L108 113Z" fill="#243b38"/><ellipse cx="92" cy="58" rx="22" ry="28" fill="#fff"/><path d="' +
        (puffin ? "M108 47L169 62L112 78Z" : "M108 47L151 58L113 66Z") +
        '" fill="#ce893f"/><circle cx="100" cy="46" r="3" fill="#203832"/><path d="M50 84L31 99M137 63H179" stroke="#789184" stroke-width="1.5" stroke-dasharray="4 4"/>';
    } else {
      body =
        '<path d="M12 112H194" stroke="#afc3b9"/><path d="M74 109C48 75 59 34 87 24C115 17 137 33 132 57C151 78 145 104 124 112Z" fill="#243b38"/><ellipse cx="105" cy="82" rx="24" ry="31" fill="#fff"/><ellipse cx="113" cy="45" rx="16" ry="20" fill="#fff"/><path d="' +
        (puffin ? "M126 35L168 51L128 64Z" : "M126 37L150 44L128 50Z") +
        '" fill="#ce893f"/><circle cx="117" cy="35" r="2.5" fill="#203832"/><path d="M83 112L69 117H94M119 112L112 117H139" fill="none" stroke="#ce893f" stroke-width="4"/>';
    }
    return (
      '<svg viewBox="0 0 210 128" class="lesson-cue" role="img" aria-label="Conceptual ' +
      kind +
      " view of a " +
      bird +
      ', not a model activation">' +
      body +
      "</svg>"
    );
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { diagram: diagram, cue: cue, photo: photo };
    return;
  }
  var root = document.querySelector("#layer-lesson");
  if (!root) return;
  root.classList.add("has-lesson-js");
  var $ = function (s) {
      return root.querySelector(s);
    },
    timer;
  var names = { penguin: "Penguin", puffin: "Puffin" };
  function update() {
    var bird = $('input[name="lesson-input"]:checked').value;
    ["final", "fixed", "dynamic"].forEach(function (mode) {
      $("#lesson-" + mode).innerHTML = diagram(mode, bird);
    });
    ["detail", "parts", "whole"].forEach(function (kind) {
      $("#lesson-cue-" + kind).innerHTML = cue(kind, bird);
    });
    $("#lesson-dynamic-layers").textContent = "Layers " + routes[bird].join(", ") + ".";
    $("#lesson-finding").textContent =
      names[bird] +
      ": final-layer scoring still reads layer 12, fixed fusion still combines 3, 4, 6, 8 and 12, and the illustrative Voyager route uses " +
      routes[bird].join(", ") +
      ".";
    $("#lesson-context").textContent =
      bird === "penguin"
        ? "The penguin is the ID example in the manuscript illustration."
        : "The puffin is the OOD example in the manuscript illustration. A similar bird can share local cues while differing in its whole-object identity.";
    root.classList.remove("is-tracing");
    clearTimeout(timer);
    $("#lesson-replay").textContent = "Trace the paths";
  }
  root.querySelectorAll('input[name="lesson-input"]').forEach(function (input) {
    input.addEventListener("change", update);
  });
  root.querySelectorAll("[data-lesson-view]").forEach(function (button) {
    button.addEventListener("click", function () {
      root.setAttribute("data-view", button.getAttribute("data-lesson-view"));
      root.querySelectorAll("[data-lesson-view]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === button));
      });
    });
  });
  $("#lesson-replay").hidden = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  $("#lesson-replay").addEventListener("click", function () {
    var tracing = root.classList.toggle("is-tracing");
    clearTimeout(timer);
    this.textContent = tracing ? "Stop tracing" : "Trace the paths";
    if (tracing)
      timer = setTimeout(function () {
        root.classList.remove("is-tracing");
        $("#lesson-replay").textContent = "Trace the paths";
      }, 3500);
  });
  $("#lesson-inputs").disabled = false;
  update();
})();
