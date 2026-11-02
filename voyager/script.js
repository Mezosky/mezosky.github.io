(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const illustration = { a: [3,5,6,9,12], b: [2,7,10,12], c: [4,8,11,12] };
  function updateRoute() {
    const mode = $('input[name="mode"]:checked').value;
    const input = $('#example').value;
    const selected = mode === 'final' ? [12] : mode === 'fixed' ? [3,4,6,8,12] : illustration[input];
    const labels = { final: 'Only the final-layer score', fixed: 'One fixed expert for every image', dynamic: 'A sparse, input-conditioned expert' };
    $('#route-title').textContent = labels[mode];
    $('#example').disabled = mode !== 'dynamic';
    const list = selected.join(', ');
    const summary = mode === 'final' ? 'Only layer 12 supplies the score. Earlier evidence is not used.' : mode === 'fixed' ? 'Layers 3, 4, 6, 8 and 12 supply the score for every input. This is an illustrative fixed subset.' : `Input ${input.toUpperCase()} uses layers ${list}. Changing the input can change the route.`;
    $('#route-summary').textContent = summary;
    $('#layer-grid').setAttribute('aria-label', summary);
    document.querySelectorAll('[data-layer]').forEach(el => el.classList.toggle('active', selected.includes(Number(el.dataset.layer))));
  }
  document.querySelectorAll('input[name="mode"]').forEach(el => el.addEventListener('change', updateRoute));
  $('#example').addEventListener('change', updateRoute);
  const names = ['MCM','GL-MCM','MoD','CoOp','LoCoOp','ID-Like','Local-Prompt','Voyager'];
  const data = {
    4: [[30.91,37.59,44.69,57.77,42.74],[17.42,30.75,37.62,55.20,35.25],[15.98,45.58,35.71,25.51,30.70],[14.60,28.48,36.49,43.13,30.67],[16.05,23.44,32.87,42.28,28.66],[8.98,42.03,44,25.27,30.07],[9.65,20.40,29.39,51.20,27.66],[3.93,21.65,21.88,27.96,18.86]],
    1: [[30.91,37.59,44.69,57.77,42.74],[17.42,30.75,37.62,55.20,35.25],[15.98,45.58,35.71,25.51,30.70],[18.95,29.58,38.72,48.03,33.82],[21.67,22.98,31.41,49.79,31.46],[14.57,44.02,41.74,26.77,31.78],[18.52,34.79,41.11,54.45,37.22],[4.38,25.64,24.64,32.85,21.88]]
  };
  function updateColumns() {
    const column = Number($('#dataset').value);
    document.querySelectorAll('.results table tr').forEach(row => [...row.children].forEach((cell,i) => cell.classList.toggle('hide-on-phone', i !== 0 && i !== column)));
  }
  $('#dataset').addEventListener('change', updateColumns);
  updateColumns();
  $('#shots').addEventListener('change', () => {
    const shots = $('#shots').value, values = data[shots];
    const best = Array.from({length:5}, (_,col) => Math.min(...values.slice(3).map(row => row[col])));
    $('#results-body').innerHTML = values.map((row, i) => `<tr${i === 7 ? ' class="ours"' : ''}><th scope="row">${names[i]}${i === 0 || i === 1 ? ' <span>zero-shot</span>' : i === 2 ? ' <span>fixed fusion</span>' : i === 6 && shots === '1' ? ' <span>authors’ rerun</span>' : ''}</th>${row.map((v,col) => `<td>${i >= 3 && v === best[col] ? '<strong>' : ''}${v.toFixed(2)}${i >= 3 && v === best[col] ? '</strong>' : ''}</td>`).join('')}</tr>`).join('');
    $('#results-caption').textContent = `${shots === '4' ? 'Four' : 'One'}-shot results; MCM, GL-MCM and MoD are training-free references.`;
    $('#table-note').textContent = `Bold marks the lowest FPR@95 among methods with the selected shot count. Training-free references are shown for context. Baselines follow the manuscript’s reported comparisons; one-shot Local-Prompt is the authors’ rerun. Voyager additionally uses WebContEX, while Local-Prompt uses ID-derived local context. Voyager has the lowest average here; ${shots === '4' ? 'Local-Prompt' : 'LoCoOp'} is lower on SUN and ID-Like on DTD.${shots === '1' ? ' One-shot Local-Prompt is the authors’ rerun.' : ''}`;
    updateColumns();
  });
  const figures = {
    routes: { alt: 'Manuscript figure showing Voyager’s distribution of selected layers.', caption: 'Layer-selection distributions from the manuscript. These summarize routed behavior; the schematic above uses illustrative selections.' },
    sparsity: { alt: 'Random-selection diagnostic plotting AUROC and FPR95 against sparsity level, compared with the last-layer baseline.', caption: 'Random-selection diagnostic from the manuscript, compared with the final-layer baseline (dashed). This plot is not Voyager’s headline result.' },
    evidence: { alt: 'Recorded input images, routes, and supporting diagnostics from the manuscript.', caption: 'Recorded routing examples from the manuscript. These are research diagnostics, not live browser predictions.' }
  };
  document.querySelectorAll('[data-figure]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.figure;
      document.querySelectorAll('[data-figure]').forEach(other => { const chosen = other === button; other.classList.toggle('chosen', chosen); other.setAttribute('aria-pressed', String(chosen)); });
      $('#evidence-image').src = `assets/${key}.webp`;
      $('#evidence-image').alt = figures[key].alt;
      $('#figure-link').href = `assets/${key}.webp`;
      $('#evidence-caption').textContent = figures[key].caption;
    });
  });
  $('#copy-citation').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('#citation-text').textContent);
      $('#copy-status').textContent = 'BibTeX copied.';
    } catch {
      const range = document.createRange(); range.selectNodeContents($('#citation-text'));
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      $('#copy-status').textContent = 'Citation selected. Press Ctrl+C or Command+C to copy.';
    }
  });
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealing'); observer.unobserve(entry.target); }
    }), {threshold:.12});
    document.querySelectorAll('.section h2,.section-intro>p,.motivation .reading,.result-band p,.method-details details,.paper-figure,.results-toolbar,.results-reading>*,.evidence-index button,.evidence-frame,.scope>*,.resource-links a,.citation').forEach((el,i) => { el.style.setProperty('--delay', `${i%3*70}ms`); observer.observe(el); });
  }
})();
