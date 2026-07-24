---
layout: default
title: Experimental Methods
description: Explore spin-dependent fifth-force experiments through their physical source, spin sensor, interaction, and connected constraint data.
---

<section class="methods-hero">
  <span class="eyebrow">Experimental landscape</span>
  <h1>How spin-dependent fifth forces are searched for</h1>
  <p>Enter the field through the experimental architecture: what produces the possible exotic interaction, what senses it, and which interaction channels the measurement constrains.</p>
  <div class="methods-path" aria-label="How experiments map to database constraints">
    <div><small>01</small><strong>Source</strong><span>Generate or modulate the interaction</span></div>
    <b aria-hidden="true">→</b>
    <div><small>02</small><strong>Sensor</strong><span>Measure a spin-dependent response</span></div>
    <b aria-hidden="true">→</b>
    <div><small>03</small><strong>Constraint</strong><span>Limit a potential and coupling</span></div>
  </div>
</section>

<section class="methods-intro">
  <div>
    <span class="eyebrow">Method directory</span>
    <h2>Browse by experimental role</h2>
  </div>
  <p>The scientific taxonomy follows the methods framework of the <a href="https://doi.org/10.1103/RevModPhys.97.025005">RMP review</a>. Source and sensor tags are drawn from the same metadata used by the Limits Explorer, so the directory can grow with the database.</p>
</section>

<div class="method-directory" aria-label="Experimental method categories">
  <a href="#moving-mass-vapor"><span>Controlled source</span><strong>Moving masses</strong><small>BGO, rotating masses, nearby test bodies</small></a>
  <a href="#moving-mass-vapor"><span>Atomic sensor</span><strong>Optically polarized vapor</strong><small>Atomic magnetometers and arrays</small></a>
  <a href="#next-methods"><span>Solid-state sensor</span><strong>NV centers</strong><small>Single-spin and ensemble diamond sensors</small></a>
  <a href="#next-methods"><span>Precision comparison</span><strong>Comagnetometers</strong><small>Co-located spin species and common-mode rejection</small></a>
  <a href="#next-methods"><span>Mechanical sensor</span><strong>Torsion pendula</strong><small>Spin-polarized and composition-dependent tests</small></a>
  <a href="#next-methods"><span>Complementary probe</span><strong>Spectroscopy &amp; APV</strong><small>Atomic, molecular, and trapped-ion observables</small></a>
</div>

<section class="method-spotlight" id="moving-mass-vapor">
  <div class="spotlight-heading">
    <div>
      <span class="eyebrow">Worked method profile · 01</span>
      <h2>Moving-mass source with an optically polarized vapor</h2>
    </div>
    <div class="method-status"><span></span>Linked to live dataset metadata</div>
  </div>

  <div class="method-profile-grid">
    <article class="method-principle">
      <span class="card-index">PHYSICAL IDEA</span>
      <h3>Turn an exotic interaction into a measurable effective field</h3>
      <p>A nearby unpolarized mass supplies nucleons. Translating or rotating that mass modulates its relative position or velocity with respect to optically polarized electron spins in an alkali-vapor magnetometer.</p>
      <p>For the parity-odd, spin- and velocity-dependent potential \(V_{12+13}\), the sensor searches for the corresponding effective magnetic field. Modulation moves a possible signal away from slow drift, while an array of magnetometers can improve statistics and reject common-mode noise.</p>
      <aside>
        <strong>What is actually compared?</strong>
        <span>The observed modulated spin response is compared with the spatial integral of the assumed potential over the source and sensor geometry. A null result becomes an upper limit as a function of interaction range \(\lambda\).</span>
      </aside>
    </article>

    <aside class="method-metadata">
      <span class="card-index">DATABASE PROFILE</span>
      <dl>
        <div><dt>Category</dt><dd>Dedicated source–sensor experiment</dd></div>
        <div><dt>Source</dt><dd>Moving unpolarized mass</dd></div>
        <div><dt>Sensor</dt><dd>Optically polarized vapor</dd></div>
        <div><dt>Signal</dt><dd>Effective magnetic field / spin response</dd></div>
        <div><dt>Interaction</dt><dd>\(V_{12+13}\)</dd></div>
        <div><dt>Fermion pair</dt><dd>electron–nucleon (\(e\)-\(N\))</dd></div>
        <div><dt>Coupling plot</dt><dd>\(g_A^e g_V^N\)</dd></div>
        <div><dt>Typical range</dt><dd>Laboratory scale; strongest near \(\lambda\sim0.1\,\mathrm{m}\)</dd></div>
      </dl>
      <div class="method-live-count"><strong id="method-record-count">…</strong><span>linked constraint records found in the current metadata</span></div>
    </aside>
  </div>

  <div class="method-workflow">
    <div><span>Source modulation</span><strong>Translate or rotate a dense mass</strong></div>
    <i aria-hidden="true"></i>
    <div><span>Exotic response</span><strong>An effective field acts on electron spins</strong></div>
    <i aria-hidden="true"></i>
    <div><span>Spin readout</span><strong>Optical polarimetry measures the vapor response</strong></div>
    <i aria-hidden="true"></i>
    <div><span>Limit</span><strong>Fit the modulated channel versus \(\lambda\)</strong></div>
  </div>

  <div class="method-actions">
    <a class="button button-primary" href="{{ '/explorer-beta.html' | relative_url }}">Explore the constraint data →</a>
    <a class="button button-secondary" href="https://doi.org/10.1103/RevModPhys.97.025005">Read the methods review ↗</a>
    <span>In the explorer, select \(g_Ag_V\) and the \(e\)-\(N\) panel.</span>
  </div>
</section>

<section class="method-literature">
  <div class="methods-intro">
    <div><span class="eyebrow">Connected literature</span><h2>Representative experiments</h2></div>
    <p>Each reference is attached to a physical role in the method, rather than presented as an undifferentiated bibliography.</p>
  </div>

  <div class="method-paper-list">
    <article>
      <div class="paper-year">2019</div>
      <div>
        <span class="paper-role">Baseline architecture · translated source mass</span>
        <h3>Kim et al. — Experimental Limit on an Exotic Parity-Odd Spin- and Velocity-Dependent Interaction Using an Optically Polarized Vapor</h3>
        <p><em>Nature Communications</em> <strong>10</strong>, 2245 (2019). A translated unpolarized BGO mass and an optically pumped alkali-vapor magnetometer constrain \(V_{12+13}\).</p>
        <a href="https://doi.org/10.1038/s41467-019-10169-1">Open publication ↗</a>
        <code>kim_experimental_2019</code>
      </div>
    </article>
    <article>
      <div class="paper-year">2022</div>
      <div>
        <span class="paper-role">Method development · rotation + sensor array</span>
        <h3>Wu et al. — Experimental Limits Using Rotationally Modulated Source Masses and an Atomic-Magnetometer Array</h3>
        <p><em>Physical Review Letters</em> <strong>129</strong>, 051802 (2022). Rotational modulation suppresses slow drift, while a sensor array increases statistics and rejects common-mode noise.</p>
        <a href="https://doi.org/10.1103/PhysRevLett.129.051802">Open publication ↗</a>
        <code>wu_experimental_2022</code>
      </div>
    </article>
    <article>
      <div class="paper-year">2020</div>
      <div>
        <span class="paper-role">Related polarized source · spin–spin–velocity channel</span>
        <h3>Chu et al. — Optically Polarized Vapor with a Rare-Earth Iron Garnet</h3>
        <p>arXiv:2009.12292 (2020). A DyIG source extends the same sensor family to a polarized solid-state source and a related spin–spin–velocity interaction.</p>
        <a href="https://arxiv.org/abs/2009.12292">Open preprint ↗</a>
        <code>chu_experimental_2020</code>
      </div>
    </article>
    <article>
      <div class="paper-year">2023</div>
      <div>
        <span class="paper-role">Related long-range architecture · polarized electron source</span>
        <h3>Ji et al. — Constraints on Spin-Spin Velocity-Dependent Interactions</h3>
        <p><em>Physical Review Letters</em> <strong>130</strong>, 133202 (2023). Atomic magnetometry is paired with electron-spin sources for longer-range tests.</p>
        <a href="https://doi.org/10.1103/PhysRevLett.130.133202">Open publication ↗</a>
        <code>ji_constraints_2023</code>
      </div>
    </article>
  </div>
</section>

<section class="methods-next" id="next-methods">
  <span class="eyebrow">Proposed expansion</span>
  <h2>One profile now; a connected atlas next</h2>
  <p>This page is a working example. The same structure can be generated for NV centers, comagnetometers, torsion pendula, neutron spin rotation, atom interferometers, trapped ions, spectroscopy, and complementary observations. Their paper lists and record counts can be refreshed from the curated metadata instead of being maintained independently.</p>
  <div class="methods-next-grid">
    <div><strong>Stable taxonomy</strong><span>Review-based scientific categories</span></div>
    <div><strong>Live inventory</strong><span>Source and sensor tags from dataset records</span></div>
    <div><strong>Two-way navigation</strong><span>Method → paper → constraint curve</span></div>
  </div>
</section>

<script>
(() => {
  const files = [
    "{{ '/metadata/generated/gAgV-constraints.json' | relative_url }}",
    "{{ '/metadata/generated/gAgA-constraints.json' | relative_url }}",
    "{{ '/metadata/generated/gVgV-constraints.json' | relative_url }}",
    "{{ '/metadata/gpgs_records.json' | relative_url }}",
    "{{ '/metadata/gpgp_records.json' | relative_url }}",
    "{{ '/metadata/gsgs_records.json' | relative_url }}",
    "{{ '/metadata/V1_records.json' | relative_url }}"
  ];
  Promise.all(files.map(path =>
    fetch(path)
      .then(response => response.ok ? response.json() : null)
      .catch(() => null)
  )).then(payloads => {
    const records = payloads.flatMap(data => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      return data.constraints || data.records || [];
    });
    const matches = records.filter(record => {
      const method = record.method || {};
      return method.sensor === "optically_polarized_vapor" ||
        method.technique === "optically_polarized_vapor";
    });
    const target = document.getElementById("method-record-count");
    if (target) target.textContent = String(matches.length);
  });
})();
</script>
