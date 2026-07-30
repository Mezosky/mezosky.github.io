$(document).ready(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pageTransitionDelay = 280;
  const body = document.body;

  const isInternalNavigationLink = (link) => {
    if (!link) {
      return false;
    }

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) {
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

    let targetUrl;
    try {
      targetUrl = new URL(link.href, window.location.href);
    } catch (error) {
      return false;
    }

    if (targetUrl.origin !== window.location.origin) {
      return false;
    }

    const isSameDocumentAnchor =
      targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search && Boolean(targetUrl.hash);

    if (isSameDocumentAnchor) {
      return false;
    }

    return targetUrl.href !== window.location.href;
  };

  const showPageContent = () => {
    body.classList.add("page-ready");
    body.classList.remove("page-preload");
    body.classList.remove("is-page-leaving");
  };

  window.requestAnimationFrame(showPageContent);
  window.addEventListener("pageshow", showPageContent);

  const navbar = document.getElementById("navbar");
  const condensedNavbarThreshold = 72;

  const syncNavbarCondensedState = () => {
    if (!navbar) {
      return;
    }

    navbar.classList.toggle("navbar-condensed", window.scrollY > condensedNavbarThreshold);
  };

  let navbarScrollTicking = false;

  const handleNavbarScroll = () => {
    if (navbarScrollTicking) {
      return;
    }

    navbarScrollTicking = true;
    window.requestAnimationFrame(() => {
      syncNavbarCondensedState();
      navbarScrollTicking = false;
    });
  };

  syncNavbarCondensedState();

  if (navbar) {
    window.addEventListener("scroll", handleNavbarScroll, { passive: true });
  }

  document.addEventListener("click", (event) => {
    if (prefersReducedMotion || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    const link = event.target.closest("a[href]");
    if (!isInternalNavigationLink(link)) {
      return;
    }

    event.preventDefault();
    body.classList.add("is-page-leaving");

    window.setTimeout(() => {
      window.location.assign(link.href);
    }, pageTransitionDelay);
  });

  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let theme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (theme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  const revealGroups = document.querySelectorAll(".reveal-stagger");
  revealGroups.forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      child.style.setProperty("--reveal-delay", `${index * 110}ms`);
    });
  });

  const revealTargets = document.querySelectorAll(".reveal-on-scroll, .reveal-stagger > *");

  const makeVisible = (element) => {
    element.classList.add("is-visible");
  };

  if (!revealTargets.length) {
    return;
  }

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach(makeVisible);
    return;
  }

  document.documentElement.classList.add("motion-ready");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        makeVisible(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -12% 0px",
    }
  );

  revealTargets.forEach((target) => {
    revealObserver.observe(target);
  });
});
