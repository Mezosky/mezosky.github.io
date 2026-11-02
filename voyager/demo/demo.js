(function () {
  "use strict";
  var data = null,
    currentLayer = 12,
    cropImage = new Image(),
    generation = 0;
  var exampleNames = {
    "routing-win": "iNaturalist · flowers",
    "id-rescue": "ImageNet · folding chair",
    "texture-win": "DTD · honeycomb texture",
    failure: "Places · lionfish scene",
  };
  var $ = function (s) {
    return document.querySelector(s);
  };
  var fmt = function (v, digits) {
    return Number(v).toFixed(digits === undefined ? 4 : digits);
  };
  var signed = function (v, digits) {
    if (v === 0) return fmt(0, digits);
    if (Number(fmt(Math.abs(v), digits)) === 0) return "≈0";
    return (v >= 0 ? "+" : "−") + fmt(Math.abs(v), digits);
  };
  var escape = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var showError = function (message) {
    $("#error").textContent = message;
    $("#error").hidden = !message;
  };
  function setSource(text) {
    $("#result-origin").textContent = text;
  }
  function loadExample(name) {
    var request = ++generation;
    showError("");
    $("#result").hidden = true;
    setSource("Loading a recorded model run…");
    $("#busy").hidden = false;
    $("#analysis").setAttribute("aria-busy", "true");
    document.querySelectorAll("[data-example]").forEach(function (b) {
      b.classList.toggle("selected", b.dataset.example === name);
      b.setAttribute("aria-pressed", String(b.dataset.example === name));
    });
    $("#input-preview").src = "examples/example-" + name + ".webp";
    $("#input-preview").alt = exampleNames[name] + " — selected benchmark example";
    $("#image-name").textContent = exampleNames[name];
    return fetch("examples/" + name + ".json")
      .then(function (r) {
        if (!r.ok) throw new Error("Could not load this recorded model run. Please try another example.");
        return r.json();
      })
      .then(function (result) {
        if (request !== generation) return;
        currentLayer = result.default_layer || 12;
        $("#case-title").textContent = result.case_title;
        $("#case-context").textContent = result.case_explanation;
        render(result);
        setSource("Recorded " + result.recorded_at + " · " + result.source_dataset + " · reference: " + result.reference_label);
      })
      .catch(function (e) {
        if (request === generation) showError(e.message);
      })
      .finally(function () {
        if (request !== generation) return;
        $("#busy").hidden = true;
        $("#analysis").setAttribute("aria-busy", "false");
      });
  }
  function render(result) {
    data = result;
    $("#result").hidden = false;
    $("#decision").textContent = result.decision;
    $("#decision").className = "decision " + (result.decision === "ID-like" ? "id" : "ood");
    $("#decision-description").textContent = "ID reference rank: " + fmt(result.id_reference_percentile, 1) + "%";
    $("#score").textContent = fmt(result.score * 1000);
    $("#threshold").textContent = fmt(result.threshold * 1000);
    $("#margin").textContent = signed(result.margin * 1000);
    $("#baseline-decision").textContent = result.baseline.decision;
    $("#baseline-detail").textContent =
      "Score " +
      fmt(result.baseline.score * 1000) +
      " · its own threshold " +
      fmt(result.baseline.threshold * 1000) +
      " · margin " +
      signed(result.baseline.margin * 1000);
    $("#router-rows").innerHTML = result.routers
      .map(function (r) {
        return (
          "<tr><td>" +
          r.router +
          '</td><td class="route-layers">' +
          r.layers.join(", ") +
          '</td><td class="number">' +
          fmt(r.score * 1000) +
          "</td></tr>"
        );
      })
      .join("");
    $("#layer-select").innerHTML = result.layers
      .map(function (r) {
        return '<option value="' + r.layer + '">' + r.layer + (r.layer === 12 ? " · final" : "") + "</option>";
      })
      .join("");
    $("#model-details").textContent =
      "Model " +
      result.model.model_id +
      ". " +
      result.model.calibration_count.toLocaleString() +
      " ID reference images; observed retention " +
      fmt(result.model.reference_id_retention * 100, 1) +
      "%. Recorded inference time " +
      fmt(result.inference_ms, 0) +
      " ms. No training or threshold fitting uses this input.";
    cropImage = new Image();
    cropImage.onload = drawMap;
    cropImage.src = result.crop;
    selectLayer(currentLayer);
  }
  function drawChart() {
    if (!data) return;
    var mode = $("#chart-mode").value,
      key = mode === "margin" ? "margin_contribution" : "score_contribution";
    var largest = Math.max.apply(
      null,
      data.layers.map(function (r) {
        return Math.abs(r[key]);
      })
    );
    largest = largest || 1;
    $("#chart-explanation").textContent =
      mode === "margin"
        ? "Each contribution = ensemble layer weight × (layer score − fixed ensemble threshold)."
        : "Each contribution = ensemble layer weight × layer score. Global + 0.5 × local supplies each layer’s score.";
    $("#chart-key").innerHTML =
      mode === "margin"
        ? "<span>← OOD-like contribution</span><span>ID-like contribution →</span>"
        : "<span>0</span><span>Largest layer contribution →</span>";
    $("#layer-chart").innerHTML = data.layers
      .map(function (r) {
        var value = r[key],
          width = (Math.abs(value) / largest) * (mode === "margin" ? 49 : 98),
          left = mode === "margin" ? (value < 0 ? 50 - width : 50) : 0;
        var label = "Layer " + r.layer + ", selected by " + r.selected_by + " of 5 routers, contribution " + signed(value * 1000);
        return (
          '<button type="button" class="layer-row' +
          (r.layer === currentLayer ? " selected" : "") +
          (r.selected_by === 0 ? " unused" : "") +
          '" data-layer="' +
          r.layer +
          '" aria-pressed="' +
          (r.layer === currentLayer) +
          '" aria-label="' +
          label +
          '"><span class="layer-name">' +
          r.layer +
          (r.layer === 12 ? '<span class="anchor">final</span>' : "") +
          '</span><span class="bar-lane ' +
          (mode === "score" ? "score" : "") +
          '" aria-hidden="true"><i class="bar ' +
          (value < 0 ? "negative" : "") +
          '" style="width:' +
          width +
          "%;left:" +
          left +
          '%"></i></span><span class="num">' +
          r.selected_by +
          '/5</span><span class="num">' +
          (mode === "margin" ? signed(value * 1000) : fmt(value * 1000)) +
          "</span></button>"
        );
      })
      .join("");
    $("#sum-check").textContent =
      mode === "margin"
        ? "Sum of layer margin contributions = " + signed(data.margin * 1000) + " (the decision margin)."
        : "Sum of weighted layer scores = " + fmt(data.score * 1000) + " (the routed score).";
    var sum = data.layers.reduce(function (total, r) {
        return total + r[key];
      }, 0),
      expected = mode === "margin" ? data.margin : data.score;
    console.assert(Math.abs(sum - expected) < 1e-8, "Score decomposition must reconcile");
    document.querySelectorAll(".layer-row").forEach(function (button) {
      button.addEventListener("click", function () {
        selectLayer(Number(button.dataset.layer));
      });
    });
  }
  function selectLayer(layer) {
    if (!data) return;
    currentLayer = layer;
    $("#layer-select").value = String(layer);
    var r = data.layers[layer - 1];
    $("#concept-layer").textContent = "Layer " + layer + " global CLS representation · cosine similarity";
    $("#concepts").innerHTML = r.closest_concepts
      .map(function (c) {
        return "<li><span>" + escape(c.label) + "</span><span>" + fmt(c.cosine_similarity, 3) + "</span></li>";
      })
      .join("");
    $("#global-value").textContent = fmt(r.global_score * 1000);
    $("#local-value").textContent = fmt(r.local_score * 1000);
    $("#layer-value").textContent = fmt(r.score * 1000);
    $("#weight-value").textContent = fmt(r.weight * 100, 2) + "%";
    $("#layer-percentile").textContent = fmt(r.id_reference_percentile, 1) + "%";
    drawChart();
    drawMap();
  }
  function drawMap() {
    if (!data || !cropImage.complete || !cropImage.naturalWidth) return;
    var r = data.layers[currentLayer - 1],
      canvas = $("#patch-canvas"),
      ctx = canvas.getContext("2d"),
      size = canvas.width,
      grid = data.patch_grid;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(cropImage, 0, 0, size, size);
    var low = Math.min.apply(null, r.patch_scores),
      high = Math.max.apply(null, r.patch_scores),
      span = high - low || 1,
      opacity = Number($("#overlay").value) / 100;
    r.patch_scores.forEach(function (score, index) {
      var level = (score - low) / span;
      ctx.fillStyle = "rgba(0,115,96," + level * opacity + ")";
      ctx.fillRect(((index % grid) * size) / grid, (Math.floor(index / grid) * size) / grid, size / grid, size / grid);
    });
    $("#patch-min").textContent = fmt(low * 1000);
    $("#patch-max").textContent = fmt(high * 1000);
    $("#overlay-value").textContent = $("#overlay").value + "%";
    var best = r.patch_scores.indexOf(high);
    $("#patch-detail").textContent =
      "Layer " + currentLayer + " · strongest patch matches “" + r.patch_classes[best] + "” · local score range ×1,000.";
    canvas.setAttribute(
      "aria-label",
      "Layer " + currentLayer + " local ID-match map on the actual model crop. Strongest patch matches " + r.patch_classes[best] + "."
    );
  }
  $("#chart-mode").addEventListener("change", drawChart);
  $("#layer-select").addEventListener("change", function () {
    selectLayer(Number(this.value));
  });
  $("#overlay").addEventListener("input", drawMap);
  document.querySelectorAll("[data-example]").forEach(function (button) {
    button.addEventListener("click", function () {
      loadExample(button.dataset.example);
    });
  });
  $("#download").addEventListener("click", function () {
    if (!data) return;
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "voyager-image-trace.json";
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  });
  loadExample("routing-win");
})();
