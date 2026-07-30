/**
 * Audio player for the top panel, plus the one-time invitation that can start it.
 *
 * Self-hosted files through a native <audio> element: no third-party embed, so no
 * ads, no tracking, and nothing that can paint outside its container.
 *
 * Playback never starts on its own. Browsers block autoplay with sound, and a
 * research site should not ambush a visitor with music either — the invitation is
 * offered once per session and can be declined, and the control in the panel works
 * whichever way that went.
 *
 * A page load destroys the element, so the track and position are stashed and
 * restored, which makes navigation close to seamless. If the browser refuses to
 * resume without a fresh gesture, the control is right there.
 */
(function () {
  "use strict";

  var CHOICE = "atelier:audio";
  var TRACK = "atelier:audio-track";
  var TIME = "atelier:audio-time";

  var player = document.querySelector("[data-player]");
  if (!player) {
    return;
  }

  var tracks;
  try {
    tracks = JSON.parse(player.getAttribute("data-player-tracks"));
  } catch (error) {
    return;
  }
  if (!tracks || !tracks.length) {
    return;
  }

  var audio = player.querySelector("[data-player-audio]");
  var toggle = player.querySelector("[data-player-toggle]");
  var stateLabel = player.querySelector("[data-player-state]");
  var entry = document.querySelector("[data-entry]");
  var index = 0;
  var lastFocus = null;

  function store(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      /* private mode: nothing is remembered, which is fine */
    }
  }

  function read(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function render() {
    // Purely `paused`: the play event fires while currentTime is still 0, so
    // testing the clock as well would leave the label a state behind.
    var on = !audio.paused;
    stateLabel.textContent = on ? "[ " + tracks[index].title + " ]" : "[ play ]";
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    toggle.setAttribute("aria-label", (on ? "Pause" : "Play") + " " + tracks[index].title);
  }

  function load(at, time) {
    index = ((at % tracks.length) + tracks.length) % tracks.length;
    audio.src = tracks[index].src;
    if (time) {
      audio.currentTime = time;
    }
    store(TRACK, String(index));
  }

  function play() {
    if (!audio.src) {
      load(index, parseFloat(read(TIME)) || 0);
    }
    var attempt = audio.play();
    if (attempt && typeof attempt.catch === "function") {
      // Autoplay refused: leave the control showing paused so it can be pressed.
      attempt.catch(function () {
        render();
      });
    }
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
    // Lets the scramble script resolve whatever is now visible.
    document.dispatchEvent(new CustomEvent("atelier:entered"));
  }

  function openEntry() {
    if (!entry) {
      return;
    }
    lastFocus = document.activeElement;
    entry.hidden = false;
    document.documentElement.classList.add("has-entry-open");
    var accept = entry.querySelector("[data-entry-accept]");
    if (accept) {
      accept.focus();
    }
  }

  // Two controls in the dialog, so keeping focus inside is a matter of wrapping.
  function trapFocus(event) {
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

  audio.addEventListener("play", render);
  audio.addEventListener("pause", render);
  // Throttled: timeupdate fires several times a second and the position only
  // needs to survive a navigation.
  var stamped = 0;
  audio.addEventListener("timeupdate", function () {
    if (audio.currentTime - stamped > 1 || audio.currentTime < stamped) {
      stamped = audio.currentTime;
      store(TIME, String(audio.currentTime));
    }
  });
  audio.addEventListener("ended", function () {
    load(index + 1, 0);
    play();
  });

  toggle.addEventListener("click", function () {
    if (audio.paused) {
      store(CHOICE, "on");
      play();
    } else {
      store(CHOICE, "off");
      audio.pause();
    }
  });

  if (entry) {
    entry.querySelector("[data-entry-accept]").addEventListener("click", function () {
      store(CHOICE, "on");
      closeEntry();
      play();
    });
    entry.querySelector("[data-entry-decline]").addEventListener("click", function () {
      store(CHOICE, "off");
      closeEntry();
    });
    entry.addEventListener("click", function (event) {
      if (event.target === entry) {
        store(CHOICE, "off");
        closeEntry();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (entry.hidden) {
        return;
      }
      if (event.key === "Escape") {
        store(CHOICE, "off");
        closeEntry();
      } else if (event.key === "Tab") {
        trapFocus(event);
      }
    });
  }

  var choice = read(CHOICE);
  load(parseInt(read(TRACK), 10) || 0, parseFloat(read(TIME)) || 0);
  render();

  if (choice === "on") {
    // Already accepted this session: pick up where the last page left off.
    play();
  } else if (choice !== "off") {
    openEntry();
  }
})();
