(function () {
  "use strict";
  var root = document.querySelector("#bird-finale");
  if (!root) return;
  var penguin = root.querySelector(".finale-penguin-travel"),
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
    penguinFacing = root.querySelector(".finale-penguin-facing"),
    puffinFacing = root.querySelector(".finale-puffin-facing"),
    reduced = window.matchMedia("(prefers-reduced-motion: reduce)"),
    running = false,
    elapsed = 0,
    last = null,
    frame = null,
    duration = 5800;
  function place(bird, path, progress) {
    var p = path.getPointAtLength(path.getTotalLength() * progress);
    bird.setAttribute("transform", "translate(" + p.x + " " + p.y + ")");
  }
  function smooth(t) {
    t = Math.max(0, Math.min(t, 1));
    return t * t * (3 - 2 * t);
  }
  function render(t, returning) {
    place(penguin, walk, returning ? 1 - smooth(t) : smooth(t));
    place(puffin, flight, returning ? 1 - smooth(t) : smooth(t / 0.91));
    penguinFacing.setAttribute("transform", returning ? "scale(-1 1)" : "scale(1 1)");
    puffinFacing.setAttribute("transform", returning ? "scale(-1 1)" : "scale(1 1)");
    var airborne = returning ? 1 : 1 - smooth((t - 0.78) / 0.17);
    air.style.opacity = String(airborne);
    perched.style.opacity = String(1 - airborne);
    perchMark.style.opacity = String(0.18 * (1 - airborne));
    var beat = (elapsed * 2 * Math.PI) / 260;
    wingNear.setAttribute("transform", "translate(60 48) scale(1 " + (0.12 + 0.88 * Math.cos(beat)) + ") translate(-60 -48)");
    wingFar.setAttribute("transform", "translate(60 48) scale(1 " + (0.12 + 0.88 * Math.cos(beat + 0.6)) + ") translate(-60 -48)");
    air.setAttribute("transform", "rotate(" + (returning ? 0 : -15 * smooth((t - 0.72) / 0.18)) + " 70 68)");
    var contact = returning ? 0 : Math.sin(Math.PI * Math.max(0, Math.min((t - 0.9) / 0.1, 1)));
    landing.setAttribute("transform", "translate(0 42) scale(" + (1 + 0.05 * contact) + " " + (1 - 0.08 * contact) + ") translate(0 -42)");
    var tail = Math.sin(Math.PI * t);
    idTag.setAttribute("transform", "rotate(" + 2 * Math.sin((elapsed / 560) * Math.PI - 0.5) * tail + " 0 -71)");
    oodTag.setAttribute("transform", "rotate(" + 4 * Math.sin((elapsed / 800) * 2 * Math.PI) * tail + " -1 -28)");
  }
  function tick(now) {
    if (!running) return;
    if (last !== null) elapsed = (elapsed + Math.min(now - last, 100)) % (duration * 2);
    last = now;
    // A visible out-and-back loop keeps both birds on stage without teleporting.
    render((elapsed % duration) / duration, elapsed >= duration);
    frame = requestAnimationFrame(tick);
  }
  function updatePlayback() {
    var visible = !reduced.matches;
    if (visible && !running) {
      running = true;
      last = null;
      root.setAttribute("data-state", "playing");
      frame = requestAnimationFrame(tick);
    } else if (!visible) {
      running = false;
      cancelAnimationFrame(frame);
      frame = null;
      root.setAttribute("data-state", "finished");
      if (reduced.matches) render(1, false);
    }
  }
  reduced.addEventListener("change", updatePlayback);
  updatePlayback();
})();
