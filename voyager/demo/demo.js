(function () {
  "use strict";
  var data = null,
    imageData = null,
    apiBase = "",
    online = false,
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
  function refreshButton() {
    $("#analyze").disabled = !online || !imageData;
  }
  function checkService() {
    $("#connection-status").textContent = "Checking availability…";
    var controller = new AbortController(),
      timer = setTimeout(function () {
        controller.abort();
      }, 8000);
    return fetch(apiBase + "/api/health", { signal: controller.signal, cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("offline");
        return r.json();
      })
      .then(function (info) {
        if (!info.ready || info.routers !== 5) throw new Error("unavailable");
        online = true;
        $("#connection-status").textContent = "Online · GPU inference · temporary service";
      })
      .catch(function () {
        online = false;
        $("#connection-status").textContent = "Live service offline · recorded examples available";
      })
      .finally(function () {
        clearTimeout(timer);
        refreshButton();
      });
  }
  function loadExample(name) {
    var request = ++generation;
    showError("");
    imageData = null;
    refreshButton();
    $("#busy").hidden = true;
    $("#analysis").setAttribute("aria-busy", "false");
    document.querySelectorAll("[data-example]").forEach(function (b) {
      b.classList.toggle("selected", b.dataset.example === name);
      b.setAttribute("aria-pressed", String(b.dataset.example === name));
    });
    var imagePath = "examples/example-" + name + ".webp";
    $("#input-preview").src = imagePath;
    $("#input-preview").alt = exampleNames[name] + " — selected benchmark example";
    $("#image-name").textContent = exampleNames[name];
    return Promise.all([
      fetch("examples/" + name + ".json").then(function (r) {
        if (!r.ok) throw new Error("Could not load this recorded model run.");
        return r.json();
      }),
      fetch(imagePath)
        .then(function (r) {
          return r.blob();
        })
        .then(readImage),
    ])
      .then(function (results) {
        if (request !== generation) return;
        imageData = results[1];
        currentLayer = results[0].default_layer || 12;
        $("#case-title").textContent = results[0].case_title;
        $("#case-context").textContent = results[0].case_explanation;
        $("#case-context").hidden = false;
        $("#analyze").textContent = "Run live";
        render(results[0]);
        setSource("Recorded " + results[0].recorded_at + " · " + results[0].source_dataset + " · reference: " + results[0].reference_label);
        refreshButton();
      })
      .catch(function (e) {
        if (request === generation) showError(e.message);
      });
  }
  function readImage(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  function render(result) {
    data = result;
    $("#result").hidden = false;
    $("#empty").hidden = true;
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
      "%. Server inference time " +
      fmt(result.inference_ms, 0) +
      " ms, excluding network transfer. No training or threshold fitting uses this input.";
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
  $("#image-file").addEventListener("change", function (event) {
    var file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showError("Choose an image smaller than 5 MB.");
      return;
    }
    if (["image/jpeg", "image/png", "image/webp"].indexOf(file.type) < 0) {
      showError("Choose a JPEG, PNG or WebP image.");
      return;
    }
    var request = ++generation;
    imageData = null;
    refreshButton();
    $("#busy").hidden = true;
    $("#analysis").setAttribute("aria-busy", "false");
    showError("");
    data = null;
    $("#case-title").textContent = "Analyze your image";
    $("#case-context").hidden = true;
    $("#analyze").textContent = "Analyze upload";
    $("#result").hidden = true;
    $("#empty").hidden = false;
    $("#image-name").textContent = file.name;
    setSource("New upload · awaiting analysis");
    document.querySelectorAll("[data-example]").forEach(function (b) {
      b.classList.remove("selected");
      b.setAttribute("aria-pressed", "false");
    });
    readImage(file).then(function (value) {
      if (request !== generation) return;
      imageData = value;
      $("#input-preview").src = value;
      $("#input-preview").alt = "Your selected image";
      refreshButton();
    });
  });
  $("#analyze").addEventListener("click", function () {
    if (!online || !imageData) return;
    showError("");
    $("#busy").hidden = false;
    $("#analyze").disabled = true;
    $("#analysis").setAttribute("aria-busy", "true");
    var request = ++generation,
      controller = new AbortController(),
      timer = setTimeout(function () {
        controller.abort();
      }, 45000);
    fetch(apiBase + "/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageData }),
      signal: controller.signal,
    })
      .then(function (r) {
        return r.json().then(function (body) {
          if (!r.ok) throw new Error(body.detail || "Inference failed. Please try again.");
          return body;
        });
      })
      .then(function (result) {
        if (request !== generation) return;
        render(result);
        setSource("Live inference · " + new Date().toLocaleTimeString() + " · " + fmt(result.inference_ms, 0) + " ms on server");
      })
      .catch(function (error) {
        if (request !== generation) return;
        showError(error.name === "AbortError" ? "The inference request timed out. Please try again." : error.message);
      })
      .finally(function () {
        clearTimeout(timer);
        if (request !== generation) return;
        $("#busy").hidden = true;
        $("#analysis").setAttribute("aria-busy", "false");
        refreshButton();
      });
  });
  $("#chart-mode").addEventListener("change", drawChart);
  $("#layer-select").addEventListener("change", function () {
    selectLayer(Number(this.value));
  });
  $("#overlay").addEventListener("input", drawMap);
  $("#retry-service").addEventListener("click", checkService);
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
  fetch("config.json", { cache: "no-store" })
    .then(function (r) {
      return r.json();
    })
    .then(function (config) {
      apiBase = config.api_base || "";
      return checkService();
    })
    .catch(function () {
      $("#connection-status").textContent = "Live service unavailable · recorded examples available";
    });
  loadExample("routing-win");
})();
