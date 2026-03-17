---
layout: about
body_class: professional-home
title: About
permalink: /
subtitle: Machine Learning Researcher / Data Scientist / Educator

profile: false

news: false # includes a list of news items
selected_papers: true # includes a list of papers marked as "selected={true}"
social: true # includes social icons at the bottom of the page
---

<section class="hero-grid reveal-stagger">
  <div class="hero-copy">
    <span class="eyebrow">Adelaide, Australia</span>
    <p class="hero-overline">Machine Learning Research / Data Science / Teaching</p>
    <h2 class="hero-heading">Machine learning research with clarity, rigor, and product-level discipline.</h2>
    <p class="hero-lead">
      I am Ignacio Meza, a computer scientist from the University of Chile working across machine learning, computer vision,
      and neural networks.
    </p>
    <p class="hero-lead hero-lead-secondary">
      My work spans academic research, industry data science, and university teaching, with an emphasis on reproducible
      experiments, careful evaluation, readable systems, and communication that stays clear from idea to delivery.
    </p>
    <div class="hero-actions">
      <a class="hero-button hero-button-primary" href="{{ '/publications/' | relative_url }}">View publications</a>
      <a class="hero-button hero-button-secondary" href="{{ '/cv/' | relative_url }}">Open CV</a>
    </div>
    <div class="hero-metrics">
      <article class="hero-metric">
        <span class="hero-metric-value">NeurIPS 2025</span>
        <span class="hero-metric-label">Mysteries of the Deep</span>
      </article>
      <article class="hero-metric">
        <span class="hero-metric-value">ACL Findings 2026</span>
        <span class="hero-metric-label">Truth as a Trajectory</span>
      </article>
      <article class="hero-metric">
        <span class="hero-metric-value">Research + Industry</span>
        <span class="hero-metric-label">From experiments to practical systems</span>
      </article>
    </div>
  </div>

  <aside class="hero-panel" aria-label="Professional summary">
    <figure class="portrait-card">
      <div class="portrait-frame">
        <img
          class="portrait-image"
          src="{{ '/assets/img/ignacio-meza-portrait.jpg' | relative_url }}"
          alt="Portrait of Ignacio Meza"
        >
      </div>
      <figcaption class="portrait-meta">
        <span class="portrait-name">Ignacio Meza</span>
        <span class="portrait-role">Machine Learning Research / Computer Vision / Teaching</span>
      </figcaption>
    </figure>

    <div class="signal-stack">
      <article class="signal-card signal-card-strong">
        <span class="signal-label">Current focus</span>
        <p>Computer vision, temporal video grounding, and interpretable machine learning systems built with strong evaluation.</p>
      </article>

      <article class="signal-card">
        <span class="signal-label">Work style</span>
        <p>Reproducible workflows, careful validation, maintainable code, and decisions that stay documented and traceable.</p>
      </article>

      <article class="signal-card">
        <span class="signal-label">Teaching and industry</span>
        <p>
          Part-time professor for <a href="https://github.com/MDS7202/MDS7202">MDS7202</a> at the University of Chile, with
          applied data science experience at <a href="https://www.bci.cl/">BCI</a>.
        </p>
      </article>
    </div>

  </aside>
</section>

<section class="feature-banner reveal-on-scroll" aria-label="Core strengths">
  <div class="feature-banner-track">
    <span>Research depth</span>
    <span>Reliable systems</span>
    <span>Clear communication</span>
    <span>Practical teaching</span>
  </div>
</section>

<section class="paper-feature-section reveal-stagger" aria-label="Featured papers">
  <div class="section-heading">
    <span class="section-kicker">Featured Papers</span>
    <h2>Latest papers, fast to open and easy to cite</h2>
    <p>These papers are linked directly here with hosted PDFs, arXiv versions, and one-click BibTeX downloads.</p>
  </div>

  <div class="paper-feature-grid">
    <article class="paper-feature-card">
      <div class="paper-feature-media">
        <img
          src="{{ '/assets/img/publication_preview/2025_NeurIPS_Mysteries_of_the_Deep.png' | relative_url }}"
          alt="Preview image for Mysteries of the Deep"
        >
      </div>

      <div class="paper-feature-copy">
        <span class="paper-pill">NeurIPS 2025</span>
        <h3>Mysteries of the Deep</h3>
        <p>Intermediate representations can carry complementary signals for out-of-distribution detection, and careful layer selection improves performance without requiring OOD data.</p>
        <div class="paper-feature-actions">
          <a class="paper-action paper-action-primary" href="{{ '/assets/pdf/2025_NeurIPS_Mysteries_of_the_Deep.pdf' | relative_url }}">PDF</a>
          <a class="paper-action" href="https://arxiv.org/abs/2510.05782">arXiv</a>
          <a class="paper-action" href="{{ '/assets/bibliography/2025_NeurIPS_Mysteries_of_the_Deep.bib' | relative_url }}" download>Cite</a>
          <a class="paper-action" href="https://mezosky.github.io/mysteries-of-the-deep/">Project page</a>
        </div>
      </div>
    </article>

    <article class="paper-feature-card">
      <div class="paper-feature-media">
        <img
          src="{{ '/assets/img/publication_preview/2026_ACL_Truth_as_a_Trajectory.png' | relative_url }}"
          alt="Preview image for Truth as a Trajectory"
        >
      </div>

      <div class="paper-feature-copy">
        <span class="paper-pill">Findings of ACL 2026</span>
        <h3>Truth as a Trajectory</h3>
        <p>Reasoning quality becomes easier to read when the model is treated as a trajectory across layers rather than a single static hidden state.</p>
        <div class="paper-feature-actions">
          <a class="paper-action paper-action-primary" href="{{ '/assets/pdf/2026_ACL_Truth_as_a_Trajectory.pdf' | relative_url }}">PDF</a>
          <a class="paper-action" href="https://arxiv.org/abs/2603.01326">arXiv</a>
          <a class="paper-action" href="{{ '/assets/bibliography/2026_ACL_Truth_as_a_Trajectory.bib' | relative_url }}" download>Cite</a>
          <a class="paper-action" href="{{ '/publications/#De_la_Jara_2026_ACL_Findings' | relative_url }}">Details</a>
        </div>
      </div>
    </article>

    <article class="paper-feature-card">
      <div class="paper-feature-media">
        <img
          src="{{ '/assets/img/publication_preview/2023_ICCV_De_la_Jara.png' | relative_url }}"
          alt="Preview image for the ICCV Workshop paper on video encoders and temporal video grounding"
        >
      </div>

      <div class="paper-feature-copy">
        <span class="paper-pill">ICCV Workshop 2023</span>
        <h3>An Empirical Study of Video Encoders</h3>
        <p>Empirical analysis of how different video encoders affect temporal video grounding performance across major benchmarks, with attention to representation quality and feature complementarity.</p>
        <div class="paper-feature-actions">
          <a class="paper-action paper-action-primary" href="{{ '/assets/pdf/2023_ICCVW_Video_Encoders_on_Temporal_Video_Grounding.pdf' | relative_url }}">PDF</a>
          <a class="paper-action" href="https://arxiv.org/abs/2510.17007">arXiv</a>
          <a class="paper-action" href="{{ '/assets/bibliography/2023_ICCVW_Video_Encoders_on_Temporal_Video_Grounding.bib' | relative_url }}" download>Cite</a>
          <a class="paper-action" href="{{ '/publications/#De_la_Jara_2023_ICCV' | relative_url }}">Details</a>
        </div>
      </div>
    </article>

  </div>
</section>

<section class="capability-grid reveal-stagger">
  <article class="capability-card">
    <div class="capability-icon">
      <i class="fa-solid fa-microscope"></i>
    </div>
    <h3>Research</h3>
    <p>I explore machine learning and computer vision problems with an emphasis on useful baselines, solid evidence, and honest reporting.</p>
  </article>

  <article class="capability-card">
    <div class="capability-icon">
      <i class="fa-solid fa-laptop-code"></i>
    </div>
    <h3>Engineering</h3>
    <p>I build workflows that are reproducible, readable, and maintainable, with clean implementation choices and traceable experiments.</p>
  </article>

  <article class="capability-card">
    <div class="capability-icon">
      <i class="fa-solid fa-chalkboard-user"></i>
    </div>
    <h3>Teaching</h3>
    <p>I enjoy turning difficult ideas into practical explanations through courses, notes, examples, and research communication.</p>
  </article>
</section>

<section class="practice-band reveal-on-scroll">
  <div class="practice-copy">
    <span class="section-kicker">Good Practices</span>
    <h3>Professional habits that shape how I work</h3>
    <p>Strong outcomes usually come from strong process. I try to keep both research and engineering grounded in careful practice.</p>
  </div>

  <ul class="practice-list">
    <li>Reproducible experiments and traceable decisions</li>
    <li>Clear documentation and readable project structure</li>
    <li>Thoughtful validation before claiming results</li>
    <li>Maintainable code and direct communication</li>
  </ul>
</section>

<section class="experience-grid reveal-stagger">
  <article class="experience-card">
    <span class="experience-label">Research direction</span>
    <h3>Computer vision</h3>
    <p>Representation learning, temporal video grounding, and empirical study around model behavior.</p>
  </article>

  <article class="experience-card">
    <span class="experience-label">Industry background</span>
    <h3>Data science</h3>
    <p>Applied machine learning work connected to practical needs, measurable outcomes, and production constraints.</p>
  </article>

  <article class="experience-card">
    <span class="experience-label">Academic work</span>
    <h3>Teaching and mentoring</h3>
    <p>Course support, technical explanations, and learning materials that help others move faster with confidence.</p>
  </article>
</section>
