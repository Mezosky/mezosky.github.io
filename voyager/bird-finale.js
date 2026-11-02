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
  function finish() {
    cancelAnimationFrame(frame);
    frame = null;
    place(penguin, walk, 1);
    place(puffin, flight, 1);
    state("finished");
    button.textContent = "Replay the send-off";
    status.textContent = "Penguin at ID. Puffin at OOD.";
  }
  function tick(now) {
    if (phase !== "playing") return;
    if (last !== null) elapsed += Math.min(now - last, 100);
    last = now;
    var t = Math.min(elapsed / duration, 1);
    // Ease both travellers along the very paths drawn in the SVG.
    var eased = t * t * (3 - 2 * t);
    place(penguin, walk, eased);
    place(puffin, flight, eased);
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
    var progress = elapsed / duration;
    progress = progress * progress * (3 - 2 * progress);
    place(penguin, walk, progress);
    place(puffin, flight, progress);
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
