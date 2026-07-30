/**
 * Soft navigation.
 *
 * Internal links swap the page in place instead of reloading the document. The
 * reason is the audio player: a full load destroys the <audio> element, so music
 * would stop on every click no matter how quickly the next page restored it. The
 * player, the invitation and the header live outside the swapped region, so they
 * simply keep running.
 *
 * Everything degrades honestly. Links are real hrefs, so without JavaScript — or
 * if a fetch fails, or the response is not a page of this site — the browser does
 * an ordinary navigation.
 *
 * After each swap `atelier:navigated` is dispatched; the backdrop and the text
 * effects listen for it and rebind to the new markup.
 */
(function () {
  "use strict";

  var SHELL = "[data-page-shell]";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var parser = new DOMParser();
  var token = 0;

  if (!window.fetch || !window.history || !window.history.pushState) {
    return;
  }

  function internal(link) {
    if (!link) {
      return false;
    }
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") {
      return false;
    }
    if (
      link.hasAttribute("download") ||
      link.getAttribute("target") === "_blank" ||
      link.getAttribute("data-toggle") === "dropdown" ||
      link.hasAttribute("data-no-page-transition")
    ) {
      return false;
    }
    if (/^(mailto:|tel:|javascript:)/i.test(href)) {
      return false;
    }

    var url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return false;
    }
    if (url.origin !== window.location.origin) {
      return false;
    }
    // Files served alongside the site (PDFs, the standalone paper page) are not
    // pages of this layout; let the browser fetch them normally.
    if (!/\/$|\.html?$/.test(url.pathname)) {
      return false;
    }
    // Same page, different anchor: that is the browser's job.
    if (url.pathname === window.location.pathname && url.search === window.location.search) {
      return false;
    }
    return url;
  }

  function fields() {
    return document.querySelectorAll(".ascii-field");
  }

  function swap(doc) {
    var incomingShell = doc.querySelector(SHELL);
    var currentShell = document.querySelector(SHELL);
    if (!incomingShell || !currentShell) {
      return false;
    }

    document.title = doc.title;
    document.body.className = doc.body.className;

    // The backdrop differs per page and sits outside the shell, so replace it too.
    var incomingFields = doc.querySelectorAll(".ascii-field");
    var existing = fields();
    for (var i = 0; i < existing.length; i += 1) {
      existing[i].parentNode.removeChild(existing[i]);
    }
    for (var f = 0; f < incomingFields.length; f += 1) {
      currentShell.parentNode.insertBefore(document.importNode(incomingFields[f], true), currentShell);
    }

    // Navigation carries the current-page marker.
    var incomingNav = doc.querySelector(".atelier-nav");
    var currentNav = document.querySelector(".atelier-nav");
    if (incomingNav && currentNav) {
      currentNav.parentNode.replaceChild(document.importNode(incomingNav, true), currentNav);
    }

    currentShell.innerHTML = incomingShell.innerHTML;
    return true;
  }

  // The collapsed navigation lives in the header, which is never swapped, so on a
  // phone it would stay open on top of the page just arrived at. A full load used
  // to close it for us. Go through Bootstrap so its own state stays in step; fall
  // back to the classes it toggles if the plugin is not there.
  function closeMenu() {
    var menu = document.getElementById("navbarNav");
    if (!menu || menu.className.indexOf("show") === -1) {
      return;
    }
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.collapse) {
      window.jQuery(menu).collapse("hide");
      return;
    }
    menu.classList.remove("show");
    var toggler = document.querySelector('[data-target="#navbarNav"]');
    if (toggler) {
      toggler.classList.add("collapsed");
      toggler.setAttribute("aria-expanded", "false");
    }
  }

  function settle(hash) {
    if (hash) {
      var target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }

  function announce() {
    document.body.classList.remove("is-page-leaving");
    document.dispatchEvent(new CustomEvent("atelier:navigated"));
  }

  function go(url, push) {
    var mine = ++token;
    var delay = reducedMotion.matches ? 0 : 220;

    document.body.classList.add("is-page-leaving");

    var fetched = fetch(url.href, { credentials: "same-origin" }).then(function (response) {
      if (!response.ok) {
        throw new Error("status " + response.status);
      }
      return response.text();
    });

    var waited = new Promise(function (resolve) {
      window.setTimeout(resolve, delay);
    });

    Promise.all([fetched, waited])
      .then(function (results) {
        if (mine !== token) {
          return;
        }
        var doc = parser.parseFromString(results[0], "text/html");
        if (!swap(doc)) {
          throw new Error("no page shell");
        }
        if (push) {
          window.history.pushState({ atelier: true }, "", url.href);
        }
        closeMenu();
        settle(url.hash);
        announce();
      })
      .catch(function () {
        // Anything unexpected: hand it back to the browser.
        window.location.assign(url.href);
      });
  }

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    var url = internal(event.target.closest("a[href]"));
    if (!url) {
      return;
    }
    event.preventDefault();
    go(url, true);
  });

  window.addEventListener("popstate", function () {
    go(new URL(window.location.href), false);
  });
})();
