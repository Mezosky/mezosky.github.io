// Initialize medium zoom.
$(document).ready(function () {
  // medium-zoom needs a real colour for its overlay. Reading a custom property
  // returns the declared token rather than a resolved value, and --global-bg-color
  // is itself a var() reference, so appending an alpha to it yields an invalid
  // colour and the overlay ends up fully transparent. Resolve the page background
  // instead: computed styles always report it as rgb()/rgba().
  var resolved = getComputedStyle(document.body).backgroundColor;
  if (!resolved || resolved === "transparent" || resolved === "rgba(0, 0, 0, 0)") {
    resolved = getComputedStyle(document.documentElement).backgroundColor;
  }

  var overlay = /^rgb\(/.test(resolved) ? resolved.replace(/^rgb\(/, "rgba(").replace(/\)$/, ", 0.94)") : resolved;

  // Re-attached after a soft navigation: medium-zoom binds to the elements it
  // found at the time, so images that arrive with a swapped page are otherwise
  // never zoomable.
  // Read via window: `medium_zoom` is an implicit global that only exists once
  // assigned, so testing the bare name throws a ReferenceError on first run.
  var attach = function () {
    var previous = window.medium_zoom;
    if (previous && typeof previous.detach === "function") {
      previous.detach();
    }
    window.medium_zoom = mediumZoom("[data-zoomable]", {
      background: overlay,
    });
  };

  attach();
  document.addEventListener("atelier:navigated", attach);
});
