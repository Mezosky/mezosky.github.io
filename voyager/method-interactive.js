(function () {
  "use strict";
  var root = document.querySelector("#architecture");
  if (!root) return;
  var parts = [
    {
      key: "inputs",
      scope: "Inference",
      title: "An image enters a fixed detector",
      copy: "Penguin and puffin illustrate ID and OOD inputs in the figure. At inference, Voyager receives an image without an ID/OOD label. Its route is predicted from frozen visual features.",
      equation: "Input image → frozen CLIP features",
      note: "The birds and flows are a schematic, not an inference result.",
    },
    {
      key: "text",
      scope: "Frozen evidence",
      title: "ID labels supply fixed text prototypes",
      copy: "Prompts built from the in-distribution class names pass through CLIP’s frozen text encoder. These prototypes give each image representation the same ID reference vocabulary at every depth.",
      equation: "ID class prompts → frozen text encoder → text prototypes",
      note: "Voyager does not train CLIP or its prompts in the standalone recipe.",
    },
    {
      key: "visual",
      scope: "Frozen evidence",
      title: "Every depth contributes a representation",
      copy: "One frozen visual-encoder pass produces features at multiple depths. Earlier representations can retain cues that differ from the final semantic representation. Their mean-pooled features also supply the router’s input.",
      equation: "ϕ(x) = mean of frozen layer features",
      note: "The drawing abbreviates the layers. The ViT-B/16 demo exposes all twelve.",
    },
    {
      key: "scores",
      scope: "Frozen evidence",
      title: "Turn each layer into an ID-match score",
      copy: "Frozen image features are compared with the fixed ID text prototypes. For the ViT-B/16 recipe, each layer combines a global MCM score with a local patch-based MCM score. Higher scores are more ID-like.",
      equation: "Sℓ(x) = global MCMℓ(x) + 0.5 × local MCMℓ(x)",
      note: "The router never receives these scores as its input. It chooses from image features.",
    },
    {
      key: "experts",
      scope: "Expert construction",
      title: "Build sparse, final-layer-anchored experts",
      copy: "Each expert is a fixed subset of layers, including the final layer. Its score is the uniform average of that subset’s scores. Different subsets combine different depths; their score weights are not learned.",
      equation: "Eᵢ(x) = sum of selected layer scores / number of selected layers",
      note: "The deployed ViT-B/16 bank has 1,981 experts with at most nine layers. All averaging coefficients stay fixed; the router learns the subset choice.",
    },
    {
      key: "router",
      scope: "Inference",
      title: "Learn which expert to trust for this image",
      copy: "A lightweight MLP takes the mean-pooled frozen visual features and predicts a distribution over the expert bank. At inference, its largest output selects one hard expert. The flame identifies this trainable router; the encoder stays frozen.",
      equation: "Selected expert = arg maxᵢ Gθ(ϕ(x))ᵢ",
      note: "The deployed model uses five independently seeded routers sharing one CLIP forward pass.",
    },
    {
      key: "output",
      scope: "Inference",
      title: "The selected layer subset supplies the score",
      copy: "A router selects a subset, and that subset’s mean score becomes its output. In the deployed five-router ensemble, the five selected expert scores are averaged. A fixed ID-calibrated threshold then yields an ID-like or OOD-like decision.",
      equation: "Ensemble score = mean of the five selected expert scores",
      note: "The green and red boxes illustrate different routes. They are not guaranteed outcomes for every penguin or puffin.",
    },
    {
      key: "training",
      scope: "Training only",
      title: "Teach routing with ID images and weak web context",
      copy: "Few-shot ID images and WebContEX proxy-OOD images provide routing supervision. WebContEX is constructed from the ID label set using semantically filtered web retrieval. It supplies weak context without using target-OOD test images or labels.",
      equation: "Few-shot ID + WebContEX → router supervision",
      note: "Only the router learns. No context image or ID/OOD label is needed at inference; semantic filtering does not guarantee complete image-level disjointness.",
    },
    {
      key: "objective",
      scope: "Training only",
      title: "Use soft expert targets to train the router",
      copy: "Experts are ranked by ID-boundary-normalized margins, with the preferred sign reversed for proxy-OOD examples. A soft target over the top 32 experts avoids forcing a brittle choice between near-tied subsets. Cross-entropy fits this target; a weak batch-level term discourages route collapse.",
      equation: "L = CE(q(x), Gθ(ϕ(x))) + 0.01 Lbal",
      note: "This is the deployed objective in the camera-ready text. The animated curves are conceptual, not measured training dynamics. The deployed target is soft, followed by hard routing at inference.",
    },
  ];
  var current = 0,
    playing = false,
    inView = false;
  var preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  var motion = !preference.matches;
  function $(selector) {
    return root.querySelector(selector);
  }
  function updateMotion() {
    root.setAttribute("data-motion", motion ? "on" : "off");
    $("#method-motion").textContent = motion ? "Pause motion" : "Turn motion on";
    $("#method-motion").setAttribute("aria-pressed", String(motion));
  }
  function setPlaying(value) {
    playing = value;
    $("#method-play").textContent = value ? "Pause walkthrough" : "Play walkthrough";
    $("#method-play").setAttribute("aria-pressed", String(value));
  }
  function selectPart(index, pan) {
    current = (index + parts.length) % parts.length;
    var part = parts[current];
    root.querySelectorAll("[data-method-part]").forEach(function (button) {
      var selected = button.getAttribute("data-method-part") === part.key;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    root.querySelectorAll(".method-flow").forEach(function (flow) {
      flow.classList.toggle("is-active", flow.getAttribute("data-for").split(" ").indexOf(part.key) !== -1);
    });
    $("#method-part").value = part.key;
    $("#method-part-count").textContent = "Part " + (current + 1) + " of " + parts.length + " · " + part.scope;
    $("#method-part-title").textContent = part.title;
    $("#method-part-copy").textContent = part.copy;
    $("#method-part-equation").textContent = part.equation;
    $("#method-part-note").textContent = part.note;
    if (pan) {
      var hotspot = $(".method-svg-part[data-method-part='" + part.key + "']");
      var frame = $(".method-diagram-scroll");
      frame.scrollTo({
        left: ((hotspot.getBBox().x + hotspot.getBBox().width / 2) * $(".method-diagram").clientWidth) / 1440 - frame.clientWidth / 2,
        behavior: motion ? "smooth" : "auto",
      });
    }
  }
  root.querySelectorAll(".method-playback,.method-part-buttons,.method-part-select,.method-step-controls").forEach(function (el) {
    el.hidden = false;
  });
  root.querySelectorAll("[data-method-part]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      setPlaying(false);
      var key = button.getAttribute("data-method-part");
      selectPart(
        parts
          .map(function (part) {
            return part.key;
          })
          .indexOf(key),
        !button.classList.contains("method-svg-part") && !button.classList.contains("method-svg-icon")
      );
    });
  });
  root.querySelectorAll(".method-svg-part,.method-svg-icon").forEach(function (node) {
    node.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        setPlaying(false);
        var key = node.getAttribute("data-method-part");
        selectPart(
          parts
            .map(function (part) {
              return part.key;
            })
            .indexOf(key),
          false
        );
      }
    });
  });
  $("#method-part").addEventListener("change", function () {
    setPlaying(false);
    var key = this.value;
    selectPart(
      parts
        .map(function (part) {
          return part.key;
        })
        .indexOf(key),
      true
    );
  });
  $("#method-previous").addEventListener("click", function () {
    setPlaying(false);
    selectPart(current - 1, true);
  });
  $("#method-next").addEventListener("click", function () {
    setPlaying(false);
    selectPart(current + 1, true);
  });
  $("#method-play").addEventListener("click", function () {
    setPlaying(!playing);
    if (playing) {
      motion = true;
      updateMotion();
    }
  });
  $("#method-motion").addEventListener("click", function () {
    motion = !motion;
    if (!motion) setPlaying(false);
    updateMotion();
  });
  setInterval(function () {
    if (playing && inView && !document.hidden) selectPart(current + 1, true);
  }, 6000);
  function visible(value) {
    inView = value;
    root.classList.toggle("is-inview", value && !document.hidden);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) {
        visible(entries[0].isIntersecting);
      },
      { threshold: 0.05 }
    ).observe(root);
  } else visible(true);
  document.addEventListener("visibilitychange", function () {
    visible(inView);
  });
  if (preference.addEventListener)
    preference.addEventListener("change", function (event) {
      motion = !event.matches;
      if (!motion) setPlaying(false);
      updateMotion();
    });
  selectPart(0, false);
  updateMotion();
})();
