/* The craft, trail and static route share one SVG path in viewBox coordinates. */
(function () {
  "use strict";
  var path = document.querySelector("#orbital-expert-route");
  var craft = document.querySelector(".orbital-craft");
  var trail = document.querySelector(".orbital-trail");
  if (!path || !craft || !trail) return;
  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var length = path.getTotalLength();
  var frame, start;
  var travel = 8500,
    turn = 1100,
    cycle = 2 * (travel + turn);
  var previousAngle;
  trail.style.strokeDasharray = length + " " + length;
  function place(distance, heading, elapsed) {
    var point = path.getPointAtLength(distance);
    var delta = 3;
    var before = path.getPointAtLength(Math.max(0, distance - delta));
    var after = path.getPointAtLength(Math.min(length, distance + delta));
    var angle = (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI + heading;
    if (previousAngle !== undefined) {
      while (angle - previousAngle > 180) angle -= 360;
      while (angle - previousAngle < -180) angle += 360;
      angle = previousAngle + (angle - previousAngle) * 0.12;
    }
    previousAngle = angle;
    craft.setAttribute("transform", "translate(" + point.x + " " + point.y + ") rotate(" + angle + ")");
    trail.style.strokeDashoffset = length - distance;
    craft.querySelector(".craft-exhaust").setAttribute("transform", "scale(" + (1 + Math.sin(elapsed / 90) * 0.12) + " 1)");
  }
  function tick(now) {
    if (start === undefined) start = now;
    var elapsed = (now - start) % cycle;
    var distance, heading;
    if (elapsed < travel) {
      distance = (elapsed / travel) * length;
      heading = 0;
    } else if (elapsed < travel + turn) {
      distance = length;
      heading = ((elapsed - travel) / turn) * 180;
    } else if (elapsed < 2 * travel + turn) {
      distance = (1 - (elapsed - travel - turn) / travel) * length;
      heading = 180;
    } else {
      distance = 0;
      heading = 180 + ((elapsed - 2 * travel - turn) / turn) * 180;
    }
    place(distance, heading, now);
    frame = requestAnimationFrame(tick);
  }
  function preference() {
    cancelAnimationFrame(frame);
    previousAngle = undefined;
    start = undefined;
    if (motion.matches) place(length, 0, 0);
    else frame = requestAnimationFrame(tick);
  }
  motion.addEventListener("change", preference);
  preference();
})();
