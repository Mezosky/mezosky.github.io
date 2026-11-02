(function () {
  "use strict";
  var root = document.querySelector("#bird-finale");
  if (!root) return;
  var button = root.querySelector("button"),
    status = root.querySelector(".finale-status"),
    penguin = root.querySelector(".finale-penguin-travel"),
    puffin = root.querySelector(".finale-puffin-travel"),
    walk = root.querySelector("#finale-walk-path"),
    flight = root.querySelector("#finale-flight-path"),
    air = root.querySelector(".finale-puffin-air"),
    perched = root.querySelector(".finale-puffin-perched"),
    wingNear = root.querySelector(".finale-wing-near"),
    wingFar = root.querySelector(".finale-wing-far"),
    landing = root.querySelector(".finale-puffin-landing"),
    perchMark = root.querySelector(".finale-puffin-shadow"),
    idTag = root.querySelector(".finale-id-swing"),
    oodTag = root.querySelector(".finale-ood-swing"),
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)"),
    phase = "idle",
    reason = "",
    elapsed = 0,
    last = null,
    frame = null,
    inView = false,
    duration = 5800;
  function state(next) {
    phase = next;
    root.setAttribute("data-state", next);
  }
  function place(bird, path, progress) {
    var p = path.getPointAtLength(path.getTotalLength() * progress);
    bird.setAttribute("transform", "translate(" + p.x + " " + p.y + ")");
  }
  function smooth(t) {
    t = Math.max(0, Math.min(t, 1));
    return t * t * (3 - 2 * t);
  }
  function render(t) {
    place(penguin, walk, smooth(t));
    place(puffin, flight, smooth(t / 0.91));
    var airborne = 1 - smooth((t - 0.78) / 0.17);
    air.style.opacity = String(airborne);
    perched.style.opacity = String(1 - airborne);
    perchMark.style.opacity = String(0.18 * (1 - airborne));
    var beat = (elapsed * 2 * Math.PI) / 260;
    wingNear.setAttribute("transform", "translate(60 48) scale(1 " + (0.12 + 0.88 * Math.cos(beat)) + ") translate(-60 -48)");
    wingFar.setAttribute("transform", "translate(60 48) scale(1 " + (0.12 + 0.88 * Math.cos(beat + 0.6)) + ") translate(-60 -48)");
    air.setAttribute("transform", "rotate(" + -15 * smooth((t - 0.72) / 0.18) + " 70 68)");
    var contact = Math.sin(Math.PI * Math.max(0, Math.min((t - 0.9) / 0.1, 1)));
    landing.setAttribute("transform", "translate(0 42) scale(" + (1 + 0.05 * contact) + " " + (1 - 0.08 * contact) + ") translate(0 -42)");
    var tail = Math.sin(Math.PI * t);
    idTag.setAttribute("transform", "rotate(" + 2 * Math.sin((elapsed / 560) * Math.PI - 0.5) * tail + " 0 -71)");
    oodTag.setAttribute("transform", "rotate(" + 4 * Math.sin((elapsed / 800) * 2 * Math.PI) * tail + " -1 -28)");
  }
  function finish() {
    cancelAnimationFrame(frame);
    frame = null;
    render(1);
    state("finished");
    button.textContent = "Replay the send-off";
    status.textContent = "Penguin at ID. Puffin at OOD.";
  }
  function tick(now) {
    if (phase !== "playing") return;
    if (last !== null) elapsed += Math.min(now - last, 100);
    last = now;
    var t = Math.min(elapsed / duration, 1);
    // Translation, flapping and landing share one pausable timeline.
    render(t);
    if (t === 1) {
      finish();
      return;
    }
    frame = requestAnimationFrame(tick);
  }
  function play() {
    if (reduced.matches) {
      finish();
      return;
    }
    if (phase !== "paused") elapsed = 0;
    last = null;
    reason = "";
    state("playing");
    button.textContent = "Pause animation";
    status.textContent = "The puffin flies to OOD; the penguin walks to ID.";
    render(elapsed / duration);
    frame = requestAnimationFrame(tick);
  }
  function pause(why) {
    if (phase !== "playing") return;
    cancelAnimationFrame(frame);
    frame = null;
    reason = why;
    state("paused");
    button.textContent = "Continue animation";
    status.textContent = "Animation paused.";
  }
  button.hidden = reduced.matches;
  button.addEventListener("click", function () {
    if (phase === "playing") pause("manual");
    else play();
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) {
        inView = entries[0].isIntersecting;
        if (!inView) pause("offscreen");
        else if (!document.hidden && !reduced.matches && (phase === "idle" || (phase === "paused" && reason !== "manual"))) play();
      },
      { threshold: 0.3 }
    ).observe(root);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) pause("hidden");
    else if (inView && phase === "paused" && reason === "hidden") play();
  });
  reduced.addEventListener("change", function () {
    button.hidden = reduced.matches;
    if (reduced.matches) finish();
  });
})();
