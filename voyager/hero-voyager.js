/* Recorded image examples replace the looping rocket. No inference runs here. */
(function () {
  "use strict";
  var root = document.querySelector(".hero-recorded");
  if (!root) return;
  var cases = JSON.parse(root.querySelector("#hero-example-data").textContent);
  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var index = 0,
    request = 0,
    timer,
    interacted = false;
  var buttons = root.querySelectorAll("[data-hero-example]");
  var image = root.querySelector("#hero-image");
  var under = root.querySelector("#hero-image-under");
  function $(selector) {
    return root.querySelector(selector);
  }
  function stopAutomatic() {
    interacted = true;
    clearInterval(timer);
  }
  function select(next, manual) {
    var token = ++request;
    var example = cases[next];
    if (manual) stopAutomatic();
    var preload = new Image();
    preload.onload = function () {
      if (token !== request) return;
      index = next;
      under.setAttribute("href", image.getAttribute("href"));
      image.getAnimations().forEach(function (animation) {
        animation.cancel();
      });
      image.setAttribute("href", example.image);
      if (!motion.matches)
        image.animate(
          [
            { opacity: 0, transform: "scale(1.025)" },
            { opacity: 1, transform: "scale(1)" },
          ],
          { duration: 420, easing: "ease-out" }
        );
      $("#hero-image-name").textContent = example.label + " · " + example.source;
      $("#hero-case-title").textContent = example.title;
      $("#hero-reference").textContent = "Reference: " + example.reference;
      $("#hero-route-readout").innerHTML =
        "Router 1 of 5 selects " + (example.layers.length === 1 ? "layer " : "layers ") + "<b>" + example.layers.join(", ") + "</b>.";
      $("#hero-ensemble").innerHTML = "Ensemble decision: <b>" + example.decision + "</b>";
      $("#hero-visual-title").textContent = example.alt + " and selected CLIP layers";
      $("#hero-visual-description").textContent =
        "Router 1 of 5 selects layers " + example.layers.join(", ") + ". Positions follow layer order; all CLIP layers are computed.";
      root.querySelectorAll("[data-hero-layer]").forEach(function (node) {
        var selected = example.layers.indexOf(Number(node.dataset.heroLayer)) !== -1;
        node.classList.toggle("is-selected", selected);
        node.querySelector("circle").setAttribute("r", selected ? "10" : "6");
        if (selected && !motion.matches) node.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 500, easing: "ease-out" });
      });
      buttons.forEach(function (button) {
        button.setAttribute("aria-pressed", String(button.dataset.heroExample === example.id));
      });
      if (manual)
        $("#hero-example-announcement").textContent =
          example.alt +
          ". Router 1 selects layers " +
          example.layers.join(", ") +
          ". Ensemble decision " +
          example.decision +
          ". Reference " +
          example.reference +
          ".";
    };
    preload.onerror = function () {
      if (token === request) clearInterval(timer);
    };
    preload.src = example.image;
  }
  buttons.forEach(function (button, i) {
    button.disabled = false;
    button.addEventListener("click", function () {
      select(i, true);
    });
    button.addEventListener("focus", stopAutomatic);
  });
  $(".hero-example-picker").disabled = false;
  function automatic() {
    clearInterval(timer);
    if (motion.matches || interacted) return;
    timer = setInterval(function () {
      if (!document.hidden) select((index + 1) % cases.length, false);
    }, 7500);
  }
  motion.addEventListener("change", function () {
    if (motion.matches)
      root.querySelectorAll("svg *").forEach(function (node) {
        node.getAnimations().forEach(function (animation) {
          animation.cancel();
        });
      });
    automatic();
  });
  cases.forEach(function (example) {
    var preload = new Image();
    preload.src = example.image;
  });
  automatic();
})();
