$(document).ready(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pageTransitionDelay = 280;
  const body = document.body;

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

  // add toggle functionality to abstract, award and bibtex buttons
  const panels = [".abstract", ".award", ".bibtex"];
  panels.forEach((panel) => {
    $(document).on("click", "a" + panel, function () {
      const row = $(this).parent().parent();
      panels.forEach((other) => {
        if (other === panel) {
          row.find(other + ".hidden").toggleClass("open");
        } else {
          row.find(other + ".hidden.open").toggleClass("open");
        }
      });
    });
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
