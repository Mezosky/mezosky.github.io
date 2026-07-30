/**
 * Entry sound.
 *
 * Offers the reader a choice once per session, then plays a YouTube embed if they
 * accept. Playback is never started without a click: browsers block autoplay with
 * sound, and starting music unannounced on a research site is rude even where it
 * would work.
 *
 * The embed goes through youtube-nocookie.com, and no YouTube script is loaded —
 * play and pause are driven with postMessage against `enablejsapi=1`.
 *
 * Choice is remembered in sessionStorage, so moving between pages does not ask
 * again. A full page load tears the player down, so on later pages we try to
 * resume; if the browser refuses, the control is there to start it by hand.
 */
(function () {
  "use strict";

  var STORE_KEY = "atelier:entry-audio";
  var sound = document.querySelector("[data-sound]");
  if (!sound) {
    return;
  }

  var entry = document.querySelector("[data-entry]");
  var toggle = sound.querySelector("[data-sound-toggle]");
  var state = sound.querySelector("[data-sound-state]");
  var host = sound.querySelector("[data-sound-player]");
  var videoId = sound.getAttribute("data-sound-video");
  var label = sound.getAttribute("data-sound-label") || "sound";
  var frame = null;
  var playing = false;
  var lastFocus = null;

  function remember(value) {
    try {
      window.sessionStorage.setItem(STORE_KEY, value);
    } catch (error) {
      /* private mode: the choice simply is not remembered */
    }
  }

  function recall() {
    try {
      return window.sessionStorage.getItem(STORE_KEY);
    } catch (error) {
      return null;
    }
  }

  function setState(on) {
    playing = on;
    state.textContent = on ? "[ " + label + " ]" : "[ sound off ]";
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    toggle.setAttribute("aria-label", (on ? "Pause" : "Play") + " " + label);
  }

  function command(func) {
    if (!frame || !frame.contentWindow) {
      return;
    }
    frame.contentWindow.postMessage(JSON.stringify({ event: "command", func: func, args: "" }), "*");
  }

  function mount() {
    if (frame) {
      command("playVideo");
      setState(true);
      return;
    }
    frame = document.createElement("iframe");
    frame.setAttribute("title", label);
    frame.setAttribute("tabindex", "-1");
    frame.setAttribute("aria-hidden", "true");
    frame.setAttribute("allow", "autoplay; encrypted-media");
    frame.setAttribute("frameborder", "0");
    frame.src =
      "https://www.youtube-nocookie.com/embed/" +
      encodeURIComponent(videoId) +
      "?autoplay=1&loop=1&playlist=" +
      encodeURIComponent(videoId) +
      "&controls=0&disablekb=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin=" +
      encodeURIComponent(window.location.origin);
    host.appendChild(frame);
    setState(true);
  }

  function closeEntry() {
    if (!entry) {
      return;
    }
    entry.hidden = true;
    document.documentElement.classList.remove("has-entry-open");
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  function accept() {
    remember("on");
    closeEntry();
    mount();
  }

  function decline() {
    remember("off");
    closeEntry();
    setState(false);
  }

  function openEntry() {
    if (!entry) {
      return;
    }
    lastFocus = document.activeElement;
    entry.hidden = false;
    document.documentElement.classList.add("has-entry-open");
    var accepted = entry.querySelector("[data-entry-accept]");
    if (accepted) {
      accepted.focus();
    }
  }

  // Only two controls, so keeping focus inside is a matter of wrapping between them.
  function trapFocus(event) {
    if (entry.hidden || event.key !== "Tab") {
      return;
    }
    var focusable = entry.querySelectorAll("button");
    if (!focusable.length) {
      return;
    }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  sound.hidden = false;
  setState(false);

  toggle.addEventListener("click", function () {
    if (playing) {
      command("pauseVideo");
      setState(false);
      remember("off");
    } else {
      mount();
      remember("on");
    }
  });

  if (entry) {
    entry.querySelector("[data-entry-accept]").addEventListener("click", accept);
    entry.querySelector("[data-entry-decline]").addEventListener("click", decline);
    entry.addEventListener("click", function (event) {
      if (event.target === entry) {
        decline();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (entry.hidden) {
        return;
      }
      if (event.key === "Escape") {
        decline();
      } else if (event.key === "Enter" && document.activeElement === document.body) {
        accept();
      } else {
        trapFocus(event);
      }
    });
  }

  var choice = recall();
  if (choice === "on") {
    // Already accepted this session: try to pick up where the last page left off.
    mount();
  } else if (choice !== "off") {
    openEntry();
  }
})();
