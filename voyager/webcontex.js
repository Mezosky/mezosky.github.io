(function () {
  "use strict";
  var root = document.querySelector("#webcontex");
  if (!root) return;
  function $(s) {
    return root.querySelector(s);
  }
  var stages = [
    [
      "Start from the ID class names",
      "The ID label set defines which concepts belong to the task. WebContEX uses those names to establish a semantic exclusion set, without needing target-OOD examples.",
      "Few-shot ID examples have domain label y = 0; retrieved context images later receive y = 1.",
    ],
    [
      "Keep semantically separated candidate concepts",
      "Map ID names and candidate web concepts into WordNet. Reject direct overlaps, ID ancestors and ID descendants. Remaining candidates must be at least two hops from the nearest ID synset.",
      "The deployed builder also filters WordNet depth, allowed lexical categories and simple, mid-frequency lemmas. Try the relationship example below.",
    ],
    [
      "Retrieve diverse images, then clean the pool",
      "Form search variants from retained concepts and retrieve images from Wikimedia Commons. Per-label, per-query and aspect-ratio caps limit domination by a few concepts. Invalid, small and duplicate images are removed.",
      "The deployed recipe targets 20 images per synset. Duplicate checks operate within each independently retrieved shard; they are not a cross-dataset disjointness guarantee.",
    ],
    [
      "Cache frozen visual evidence",
      "Accepted images receive a binary proxy-OOD label. Frozen CLIP features and per-layer OOD scores are cached for router fitting, just as fixed evidence is extracted for the few-shot ID images.",
      "The deployed pool contains 5,078 entries. Retrieved concept names form search queries, not classification targets.",
    ],
    [
      "Train the router to choose experts",
      "ID images and retrieved context favor experts with opposite signs of ID-boundary-normalized margins. Soft top-32 expert targets train the router, while a small balancing term discourages route collapse.",
      "Only the router learns. CLIP, prompts and expert score weights stay fixed. No WebContEX image is needed at inference.",
    ],
  ];
  function select(i, pan) {
    var part = stages[i];
    root.querySelectorAll("[data-context-step]").forEach(function (g) {
      g.classList.toggle("is-selected", Number(g.getAttribute("data-context-step")) === i);
      g.setAttribute("aria-pressed", String(Number(g.getAttribute("data-context-step")) === i));
    });
    $("#ctx-step-select").value = String(i);
    $("#ctx-stage").textContent = "Step " + (i + 1) + " of 5";
    $("#ctx-part-title").textContent = part[0];
    $("#ctx-part-copy").textContent = part[1];
    $("#ctx-part-note").textContent = part[2];
    if (pan) {
      var frame = $(".ctx-pipeline-scroll");
      frame.scrollTo({ left: ((i * 220 + 95) * $(".ctx-pipeline").clientWidth) / 1080 - frame.clientWidth / 2, behavior: "auto" });
    }
  }
  root.querySelectorAll("[data-context-step]").forEach(function (g) {
    g.addEventListener("click", function () {
      select(Number(g.getAttribute("data-context-step")), false);
    });
    g.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(Number(g.getAttribute("data-context-step")), false);
      }
    });
  });
  $("#ctx-step-select").addEventListener("change", function () {
    select(Number(this.value), true);
  });
  var cases = {
    penguin: { name: "penguin", hops: 0, relation: "Same synset", pass: false, detail: "Exact ID overlap is discarded before retrieval." },
    king: {
      name: "king penguin",
      hops: 1,
      relation: "ID descendant",
      pass: false,
      detail: "An ID descendant is excluded, and this example is also closer than the two-hop threshold.",
    },
    bird: {
      name: "bird",
      hops: 4,
      relation: "ID ancestor",
      pass: false,
      detail: "Four hops does not make an ID ancestor eligible. Ancestor/descendant exclusions apply before the distance threshold.",
    },
    puffin: {
      name: "puffin",
      hops: 3,
      relation: "Separate branch",
      pass: true,
      detail:
        "This candidate passes the overlap/relationship/distance check for the toy vocabulary. The full deployed vocabulary and additional builder filters can change eligibility.",
    },
  };
  function filter() {
    var d = cases[$("#ctx-candidate").value],
      dots = "";
    for (var i = 1; i < d.hops; i++) dots += '<circle cx="' + (140 + (i * 120) / d.hops) + '" cy="45" r="5" fill="#80988b"/>';
    $("#ctx-relation").innerHTML =
      '<svg viewBox="0 0 400 110" role="img" aria-label="Penguin to ' +
      d.name +
      ": " +
      d.hops +
      " WordNet hops, " +
      d.relation +
      '"><path d="M140 45H260" stroke="#80988b"/>' +
      dots +
      '<rect x="5" y="22" width="135" height="46" rx="5" fill="#e0ece3" stroke="#7a9f88"/><rect x="260" y="22" width="135" height="46" rx="5" fill="#f4f7f3" stroke="#8ca392"/><text x="72" y="50">penguin · ID</text><text x="327" y="50">' +
      d.name +
      '</text><text x="200" y="95">' +
      d.relation +
      " · " +
      d.hops +
      " hops</text></svg>";
    $("#ctx-filter-result").textContent = d.pass ? "Passes the relationship check." : "Excluded from retrieval.";
    $("#ctx-filter-result").classList.toggle("passes", d.pass);
    $("#ctx-filter-detail").textContent = d.detail;
  }
  $("#ctx-candidate").addEventListener("change", filter);
  $("#ctx-candidate").disabled = false;
  $("#ctx-step-select").disabled = false;
  select(0, false);
  filter();
})();
