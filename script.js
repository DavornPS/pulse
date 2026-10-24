'use strict';

// All business figures, comparisons and explanations come from this local model.
// Changes are rounded to whole percentages, as in the presentation.
const DEMO = Object.freeze({
  metrics: [
    { id: 'pipeline', category: 'SALES', name: 'Sales pipeline', icon: 'trend', source: 'crm', sourceLabel: 'CRM / Sales', colour: '#3154f4', background: '#e9efff', baseline: 38000, risk: 21000, format: 'money', change: '−45%', explanation: 'The value of qualified sales opportunities has fallen from $38,000 to $21,000. That is a 45% decrease, rounded. Pipeline value is potential work, not guaranteed revenue.', relation: 'Fewer qualified opportunities could reduce future revenue.' },
    { id: 'payments', category: 'FINANCE', name: 'Average payment time', icon: 'clock', source: 'accounting', sourceLabel: 'Accounting', colour: '#149c93', background: '#e4f7f2', baseline: 24, risk: 41, format: 'days', change: '+17 days', explanation: 'Average customer payment time has increased from 24 to 41 days in the fictional accounting records. Longer collection times can delay cash becoming available.', relation: 'Slower collections may delay incoming cash.' },
    { id: 'concentration', category: 'CUSTOMER', name: 'Largest client share', icon: 'users', source: 'accounting', sourceLabel: 'Accounting / customer records', colour: '#8060d2', background: '#f0ebff', baseline: 28, risk: 46, format: 'percent', change: '+18 percentage points', explanation: 'The largest customer accounts for 46% of recorded revenue, compared with 28% in the comparison period. This is an 18 percentage point increase, not an 18% relative increase.', relation: 'More revenue depends on one customer.' },
    { id: 'costs', category: 'OPERATIONS', name: 'Monthly operating costs', icon: 'wallet', source: 'accounting', sourceLabel: 'Accounting', colour: '#d58a43', background: '#fff1e3', baseline: 21600, risk: 24000, format: 'money', change: '+11%', explanation: 'Monthly operating costs have increased from approximately $21,600 to $24,000. The 11% increase is rounded. Higher outgoings may add pressure when incoming cash is slower.', relation: 'Higher outgoings may increase cash commitments.' }
  ],
  sources: [
    {id: 'accounting', name: 'Accounting', icon: 'wallet', description: 'Payments, revenue & costs', colour: '#3154f4', background: '#e8f0ff'},
    {id: 'crm', name: 'CRM / Sales', icon: 'users', description: 'Qualified sales pipeline', colour: '#8051d1', background: '#f0eaff'},
    {id: 'projects', name: 'Project Management', icon: 'doc', description: 'Not used in this assessment', colour: '#15967f', background: '#e2f7ee'}
  ],
  recommendations: [
    {title: 'Review outstanding invoices and follow up where payments are overdue.', source: 'Accounting', detail: 'Average payment time has risen to 41 days. Check invoice due dates and contact customers where payment is overdue. The demo does not establish which individual invoices are late.'},
    {title: 'Review non-essential spending while costs are increasing.', source: 'Accounting', detail: 'Monthly costs are $24,000, up 11% (rounded). Review discretionary commitments against near-term needs before deciding whether spending should change.'},
    {title: 'Prioritise qualified sales opportunities in the pipeline.', source: 'CRM / Sales', detail: 'Pipeline value is $21,000, down 45% (rounded). Review the most qualified opportunities and their next steps. Potential sales are not guaranteed cash inflows.'},
    {title: 'Assess dependence on the largest customer.', source: 'Accounting / customer records', detail: 'One customer represents 46% of revenue, up 18 percentage points. Review exposure and customer relationships before deciding whether to diversify.'}
  ],
  warning: 'Emerging cash-flow and client concentration risk',
  warningDescription: 'Slower customer payments, a weaker sales pipeline, greater dependence on one client and rising operating costs may be creating financial pressure.',
  disclaimer: 'This warning is based on the fictional connected signals shown. It is not a prediction of business failure.'
});

const demoState = {
  scenario: 'normal', analystPanelOpen: false, selectedMetric: null,
  sourcesAvailable: {accounting: true, crm: true, projects: true},
  priorities: new Set(), selectedPlan: null
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const icon = (name, extra = '') => `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const isRisk = () => demoState.scenario === 'risk';
const completeCoverage = () => demoState.sourcesAvailable.accounting && demoState.sourcesAvailable.crm;
const available = metric => demoState.sourcesAvailable[metric.source];
const valueFor = metric => isRisk() ? metric.risk : metric.baseline;
const money = value => '$' + value.toLocaleString('en-US');
function formatValue(metric, value = valueFor(metric), compact = false) {
  if (metric.format === 'money') return compact ? `$${value / 1000}K` : money(value);
  if (metric.format === 'days') return `${value} days`;
  return `${value}%`;
}
function changeFor(metric, full = false) {
  if (!available(metric)) return 'Source unavailable';
  if (!isRisk()) return 'No change in this demo';
  return full && metric.id === 'concentration' ? '+18 percentage points' : metric.change;
}
function metricStyle(metric) { return `--metric-colour:${metric.colour};--metric-bg:${metric.background}`; }

// These show only two supplied values, not an invented time series or forecast.
function sparkline(metric, large = false) {
  const current = valueFor(metric);
  const previous = metric.baseline;
  const max = Math.max(previous, current) * 1.2;
  const y1 = 33 - (previous / max) * 24;
  const y2 = 33 - (current / max) * 24;
  const colour = available(metric) ? metric.colour : '#b7c3d4';
  const label = available(metric) ? `Two-period comparison. Previous: ${formatValue(metric, previous)}. Current: ${formatValue(metric)}. Straight line connects the two observations; no intermediate data or forecast.` : `${metric.name}: unavailable because its source is missing.`;
  if (!available(metric)) return `<svg class="sparkline" viewBox="0 0 150 38" role="img" aria-label="${label}"><path d="M2 24h146" fill="none" stroke="${colour}" stroke-dasharray="4 5"/></svg>`;
  return `<svg class="sparkline" viewBox="0 0 150 38" preserveAspectRatio="none" role="img" aria-label="${label}"><path d="M3 ${y1} L147 ${y2} L147 37 L3 37Z" fill="${colour}" opacity=".07"/><path d="M3 ${y1} L147 ${y2}" fill="none" stroke="${colour}" stroke-width="${large ? '1.8' : '2'}" vector-effect="non-scaling-stroke"/><circle cx="3" cy="${y1}" r="2.4" fill="white" stroke="${colour}" stroke-width="1.5"/><circle cx="147" cy="${y2}" r="2.4" fill="${colour}"/></svg>`;
}

function renderKPIs() {
  $('#kpi-grid').innerHTML = DEMO.metrics.map(metric => `<button class="kpi-card ${available(metric) ? '' : 'missing'}" style="${metricStyle(metric)}" data-metric="${metric.id}" aria-label="Explore ${metric.name}: ${available(metric) ? formatValue(metric) : 'unavailable'}"><span class="kpi-category">${metric.category}${icon(metric.icon)}</span><span class="kpi-name">${metric.name}</span><span class="kpi-value">${available(metric) ? formatValue(metric) : 'Unavailable'}</span><span class="kpi-change ${isRisk() && available(metric) ? 'changed' : ''} ${available(metric) ? '' : 'unavailable'}">${changeFor(metric)}</span>${sparkline(metric)}<span class="kpi-source">${metric.source === 'crm' ? 'CRM / Sales' : 'Accounting'} · simulated${icon('chevron')}</span></button>`).join('');
}

function renderSources() {
  $('#source-list').innerHTML = DEMO.sources.map(source => {
    const on = demoState.sourcesAvailable[source.id];
    return `<div class="source-row" style="${metricStyle(source)}"><span class="source-icon">${icon(source.icon)}</span><div class="source-info"><strong>${source.name}</strong><small>${on ? source.description : 'Required input unavailable'}</small></div><span class="source-status ${on ? '' : 'off'}">${icon(on ? 'check' : 'close')}${on ? 'Included' : 'Missing'}</span></div>`;
  }).join('');
  $('#accounting-toggle').checked = demoState.sourcesAvailable.accounting;
  $('#coverage-message').textContent = completeCoverage() ? 'Four signals available. Project-management data does not contribute to this assessment.' : 'Only the sales pipeline can be assessed. Payment time, customer share and costs are unavailable. The combined warning is withheld.';
}

function renderAssessment() {
  const panel = $('#risk-assessment');
  let status, title, description, name;
  if (!completeCoverage()) {
    panel.className = 'assessment partial';
    status = 'Incomplete data coverage'; title = 'A connected risk assessment needs more information.';
    description = isRisk() ? 'The sales pipeline is down 45%, but accounting data is unavailable. PULSE cannot assess payment time, client concentration or operating costs, so the combined warning is withheld.' : 'The sales pipeline is available. Accounting data is missing, so payment time, client concentration and operating costs cannot be assessed.';
    name = 'link';
  } else if (isRisk()) {
    panel.className = 'assessment risk'; status = 'Emerging Risk'; title = DEMO.warning; description = DEMO.warningDescription; name = 'alert';
  } else {
    panel.className = 'assessment normal'; status = 'Monitoring your available inputs'; title = 'No combined risk alert identified from the current demo inputs.'; description = 'The four supplied signals do not show a linked warning pattern in this scenario. Continue to review changes as new information becomes available.'; name = 'shield';
  }
  panel.innerHTML = `<span class="assessment-icon">${icon(name)}</span><div class="assessment-copy"><span class="alert-meta">${status}</span><h3>${title}</h3><p>${description}</p>${isRisk() && completeCoverage() ? `<p class="alert-disclaimer">${DEMO.disclaimer}</p>` : ''}</div>`;
  $('#scenario-label').innerHTML = `<span class="status-dot"></span>${isRisk() ? 'Emerging-risk scenario' : 'Normal monitoring'}`;
  $('.scenario-strip').classList.toggle('risk', isRisk());
  $('#scenario-button span').textContent = isRisk() ? 'Reopen Analyst Review' : 'Simulate Emerging Risk';
  $('#scenario-button .icon use').setAttribute('href', isRisk() ? '#i-users' : '#i-play');
  $('#analyst-button-label').textContent = isRisk() ? 'Reopen Analyst Review' : 'Explore Analyst Review';
}

function renderEvidence() {
  const count = DEMO.metrics.filter(available).length;
  $('#evidence-count').textContent = `${count} available signal${count === 1 ? '' : 's'}`;
  $('#evidence-intro').textContent = !completeCoverage() ? 'Missing sources are shown explicitly. Unsupported findings are not inferred.' : isRisk() ? 'Together, these changes may put pressure on future cash flow. Each has a visible source.' : 'Current inputs compared with the previous period. No connected warning identified.';
  $('#evidence-list').innerHTML = DEMO.metrics.map(metric => `<div class="evidence-row ${available(metric) ? '' : 'missing'}" style="${metricStyle(metric)}"><span class="evidence-icon">${icon(metric.icon)}</span><div class="evidence-info"><strong>${metric.name}</strong><small>${available(metric) && isRisk() ? metric.relation : metric.sourceLabel + ' · simulated'}</small></div><div class="evidence-values">${available(metric) ? `<span class="before">${formatValue(metric, metric.baseline, true)}</span>${icon('arrow')}<span>${formatValue(metric, valueFor(metric), true)}</span>` : 'Source unavailable'}</div></div>`).join('');
}

function recommendationMarkup(recommendation, index) {
  return `<details><summary><span class="recommendation-number">${index + 1}</span><span>${recommendation.title}</span>${icon('chevron')}</summary><div class="recommendation-detail">${recommendation.detail}<span class="recommendation-source">Supporting source: ${recommendation.source} (simulated)</span></div></details>`;
}
function renderRecommendations() {
  let recommendations;
  if (isRisk()) {
    recommendations = completeCoverage() ? DEMO.recommendations : [DEMO.recommendations[2], {title: 'Restore accounting data to complete the assessment.', source: 'Data coverage', detail: 'Without supplied accounting records, PULSE cannot assess collections, customer concentration or operating costs. Restore this source before drawing a combined cash-flow conclusion.'}];
  } else {
    recommendations = [{title: 'Keep your business inputs up to date.', source: 'Connected demo sources', detail: 'Review the coverage of the information you supply. A missing or incomplete source can limit what PULSE is able to assess.'}, {title: completeCoverage() ? 'Continue reviewing changes across the business.' : 'Restore accounting data for a fuller view.', source: completeCoverage() ? 'Accounting and CRM / Sales' : 'Data coverage', detail: completeCoverage() ? 'There is no combined warning from these demo inputs. Review future changes in their business context; a calm dashboard is not a guarantee that every risk has been captured.' : 'Payment time, customer concentration and costs cannot be assessed while accounting data is unavailable.'}];
  }
  $('#action-count').textContent = isRisk() ? `${recommendations.length} suggested` : 'Routine';
  $('#recommendation-list').innerHTML = recommendations.map(recommendationMarkup).join('');
}

function renderActivity() {
  const activity = !completeCoverage() ? [
    ['Current demo state', 'Accounting source removed from the assessment.', 'risk-event'],
    ['Assessment updated', 'Three signals marked unavailable; combined warning withheld.', ''],
    ['Available observation', isRisk() ? 'CRM pipeline: $21,000, down 45% (rounded).' : 'CRM pipeline remains at $38,000.', '']
  ] : isRisk() ? [
    ['Scenario activated', 'Four supplied business indicators changed.', 'risk-event'],
    ['Connected assessment', 'Emerging cash-flow and concentration warning identified.', 'risk-event'],
    ['Suggested response', 'Four initial actions and an illustrative analyst review available.', '']
  ] : [
    ['Demo inputs loaded', 'Accounting and CRM comparison values available.', ''],
    ['Assessment complete', 'No combined warning identified from current inputs.', ''],
    ['Ready to explore', 'Simulate an emerging risk to see what changes.', '']
  ];
  $('#activity-list').innerHTML = activity.map(([time, content, className]) => `<li class="${className}"><time>${time}</time>${content}</li>`).join('');
}

function renderCaseStudy() {
  $('#case-signals').innerHTML = DEMO.metrics.map(metric => `<div class="case-signal"><span>${metric.category}</span><strong>${available(metric) ? formatValue(metric, valueFor(metric), true) : 'N/A'}</strong><small>${available(metric) ? (isRisk() ? metric.id === 'concentration' ? '+18 pp' : metric.change : 'Baseline') : 'Source missing'}</small></div>`).join('');
  $('#case-warning').innerHTML = `${icon(!completeCoverage() ? 'link' : isRisk() ? 'alert' : 'shield')}<div><h3>${!completeCoverage() ? 'Combined warning withheld' : isRisk() ? DEMO.warning : 'No combined warning in the baseline scenario'}</h3><p>${!completeCoverage() ? 'Restore accounting data to assess the linked changes.' : isRisk() ? 'Four observed changes may be creating pressure. This is not a prediction of business failure.' : 'Simulate the risk to see how these four observations change together.'}</p></div>`;
  $('.case-response').innerHTML = `${icon('check')}<p><strong>${!completeCoverage() ? 'Work with the available evidence' : isRisk() ? 'A practical first response' : 'See the next response'}</strong>${!completeCoverage() ? 'Review the sales pipeline and restore accounting data before drawing further conclusions.' : isRisk() ? 'Review collections, spending, qualified opportunities and customer dependence.' : 'The risk scenario reveals linked evidence, relevant actions and optional human review.'}</p>`;
  $('.case-simulate').innerHTML = `${isRisk() ? 'View Risk in Dashboard' : 'Simulate Emerging Risk'} ${icon('arrow')}`;
}

function renderAll(animate = false) {
  renderKPIs(); renderSources(); renderAssessment(); renderEvidence(); renderRecommendations(); renderActivity(); renderCaseStudy();
  if (animate) {
    ['#risk-assessment', '#kpi-grid', '#evidence-list'].forEach(selector => {
      const element = $(selector); element.classList.remove('state-updated');
      void element.offsetWidth; element.classList.add('state-updated');
    });
  }
}

let dialogReturnFocus = null;
function showDialog(dialog, opener) {
  dialogReturnFocus = opener || document.activeElement;
  if (!dialog.open) dialog.showModal();
  $('.dialog-close', dialog).focus({preventScroll: true});
}
function closeDialog(dialog) { dialog.close(); }
function renderMetricDetail(id) {
  const metric = DEMO.metrics.find(item => item.id === id);
  const on = available(metric);
  $('#metric-dialog-content').innerHTML = `<span class="feature-icon" style="background:${metric.background};color:${metric.colour}">${icon(metric.icon)}</span><p class="eyebrow">${metric.category} · ${isRisk() ? 'Risk scenario' : 'Normal monitoring'}</p><h2 id="metric-dialog-title">${metric.name}</h2><p class="detail-value">${on ? formatValue(metric) : 'Unavailable'}</p><p class="detail-change">${on ? changeFor(metric, true) + ' vs previous period' : 'The required data source is missing.'}</p><div class="detail-chart">${sparkline(metric, true)}</div><p class="detail-explanation">${!on ? 'PULSE cannot assess this metric without its supplied accounting source. No replacement value is estimated. Restore Accounting Data under Connections to include it again.' : isRisk() ? metric.explanation : `The current and comparison values are both ${formatValue(metric, metric.baseline)}. This fictional baseline establishes a calm starting point before the emerging-risk scenario.`}</p><div class="detail-source">${icon('link')} Simulated source: ${metric.sourceLabel}</div><p class="detail-note">${on ? 'The chart connects two period observations only. No intermediate data or forecast is implied. ' : ''}All figures are fictional.</p>`;
}
function openMetric(id, opener) { demoState.selectedMetric = id; renderMetricDetail(id); showDialog($('#metric-dialog'), opener); }

function renderAnalyst() {
  const full = isRisk() && completeCoverage();
  const partial = !completeCoverage();
  let insight;
  if (full) insight = 'Several available indicators suggest potential pressure on future cash flow. Slower collections, reduced pipeline value, rising costs and significant customer concentration warrant management attention.';
  else if (partial) insight = isRisk() ? 'The supplied CRM data shows a weaker sales pipeline. Accounting data is unavailable, so payment times, costs and customer dependence cannot be assessed. A combined cash-flow conclusion would require those records.' : 'Accounting data is unavailable. The supplied sales pipeline can be reviewed, but it does not provide a complete view of cash flow or customer concentration.';
  else insight = 'The current fictional inputs do not support a combined risk warning. Simulate an emerging risk to explore the illustrative human-review response.';
  const factors = full ? ['Payment time increased by 17 days.', 'Sales pipeline decreased by 45% (rounded).', 'Largest customer represents 46% of revenue.', 'Operating costs increased by 11% (rounded).'] : partial ? [isRisk() ? 'Sales pipeline decreased by 45% (rounded).' : 'Sales pipeline is $38,000.', 'Accounting data is missing; three signals unavailable.', 'Combined warning withheld until supporting data is supplied.'] : ['Four baseline signals available.', 'No combined warning identified in this demo state.'];
  const priorities = full ? ['Review invoice collection.', 'Assess near-term cash commitments.', 'Review priority sales opportunities.', 'Discuss customer concentration exposure.'] : partial ? ['Review the available sales pipeline.', 'Restore accounting data before further assessment.'] : [];
  $('#analyst-content').innerHTML = `<h2 id="analyst-title">Analyst Review<br>& Actions</h2><p class="drawer-subtitle">Illustrative human-review example</p><div class="analyst-notice">${icon('shield')}<p>Fictional insight to demonstrate the intended premium service. No actual analyst has reviewed real business information.</p></div><div class="analyst-insight"><h3>${icon('pulse')} Analyst Insight</h3><p>“${insight}”</p></div><section class="analyst-section"><h3>Key Factors</h3><ul class="analyst-factors">${factors.map(factor => `<li>${icon('check')}<span>${factor}</span></li>`).join('')}</ul></section>${priorities.length ? `<section class="analyst-section"><h3>Recommended Priorities</h3><ul class="analyst-priorities">${priorities.map((priority, index) => {const checked = demoState.priorities.has(priority); return `<li><label><input type="checkbox" data-priority="${index}" ${checked ? 'checked' : ''}><span>${priority}</span><small>${checked ? 'Under Review' : 'Suggested'}</small></label></li>`;}).join('')}</ul><p class="drawer-note">Select a priority to mark it Under Review in this local demo. Nothing is sent or acted on.</p></section>` : `<button class="button primary drawer-simulate">Simulate Emerging Risk ${icon('arrow')}</button>`}<div class="drawer-bottom"><strong>Software insight. Human judgement.</strong>Monthly analyst review is proposed with Explorer; more hands-on support is proposed with Advisory. The owner remains responsible for decisions.</div><button class="button quiet drawer-reset reset-demo">${icon('reset')} Reset Demo</button>`;
  $$('.analyst-priorities input').forEach((input, index) => input.addEventListener('change', () => {
    if (input.checked) demoState.priorities.add(priorities[index]); else demoState.priorities.delete(priorities[index]);
    $('small', input.parentElement).textContent = input.checked ? 'Under Review' : 'Suggested';
  }));
}
function openAnalyst(opener) { demoState.analystPanelOpen = true; renderAnalyst(); showDialog($('#analyst-dialog'), opener); }
function simulateRisk(opener) {
  if (!isRisk()) { demoState.scenario = 'risk'; demoState.priorities.clear(); renderAll(true); announce('Emerging-risk scenario activated. Four signals updated. Illustrative Analyst Review opened.'); }
  openAnalyst(opener);
}
function announce(message) { $('#announcer').textContent = message; }
function resetDemo() {
  $$('dialog[open]').forEach(closeDialog);
  demoState.scenario = 'normal'; demoState.analystPanelOpen = false; demoState.selectedMetric = null;
  demoState.sourcesAvailable = {accounting: true, crm: true, projects: true}; demoState.priorities.clear();
  $$('.sidebar nav a').forEach((link, index) => link.classList.toggle('selected', index === 0));
  $('#coverage-details').open = false; renderAll(true);
  announce('Demo reset. Normal monitoring restored. All simulated sources included.');
}
function jumpToDemo(focusControl = true) {
  $('#demo').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
  if (focusControl) $('#scenario-button').focus({preventScroll: true});
}

const PLANS = {
  monitor: '<strong>PULSE Monitor:</strong> continuous monitoring and suggested initial actions. Regular human analyst review is not included in this proposed tier.',
  explorer: '<strong>PULSE Explorer:</strong> adds a monthly analyst review and priority risk support. The Analyst Review in this demo illustrates the intended service.',
  advisory: '<strong>PULSE Advisory:</strong> adds proactive analyst involvement and management reviews for more complex cases. Proposed pricing starts at $1,499/month.'
};
function selectPlan(plan) {
  demoState.selectedPlan = plan;
  $$('.price-card').forEach(card => card.classList.toggle('chosen', card.dataset.plan === plan));
  $$('[data-select-plan]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.selectPlan === plan)));
  $('#plan-detail').innerHTML = `${icon('users')}<p>${PLANS[plan]}</p>`;
}

function initialiseInterface() {
  renderAll();
  $('#scenario-button').addEventListener('click', event => simulateRisk(event.currentTarget));
  $('#analyst-button').addEventListener('click', event => openAnalyst(event.currentTarget));
  $('#kpi-grid').addEventListener('click', event => { const button = event.target.closest('[data-metric]'); if (button) openMetric(button.dataset.metric, button); });
  document.addEventListener('click', event => {
    const reset = event.target.closest('.reset-demo'); if (reset) resetDemo();
    const drawerSimulate = event.target.closest('.drawer-simulate');
    if (drawerSimulate) { demoState.scenario = 'risk'; renderAll(true); renderAnalyst(); $('.dialog-close', $('#analyst-dialog')).focus(); announce('Risk scenario activated. Analyst review updated.'); }
  });
  $('.case-simulate').addEventListener('click', event => { jumpToDemo(false); simulateRisk(event.currentTarget); });
  $('#accounting-toggle').addEventListener('change', event => {
    demoState.sourcesAvailable.accounting = event.target.checked; demoState.priorities.clear(); renderAll(true);
    announce(event.target.checked ? 'Accounting data restored. All four signals can be assessed.' : 'Accounting data hidden. Three signals unavailable. Combined warning withheld.');
  });
  $$('dialog').forEach(dialog => {
    $('.dialog-close', dialog).addEventListener('click', () => closeDialog(dialog));
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = $$('button:not([disabled]), a[href], input:not([disabled]), summary, [tabindex="0"]', dialog).filter(element => element.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    dialog.addEventListener('click', event => { const bounds = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeDialog(dialog); });
    dialog.addEventListener('close', () => {
      if (dialog.id === 'analyst-dialog') demoState.analystPanelOpen = false; else demoState.selectedMetric = null;
      if (dialogReturnFocus?.isConnected) dialogReturnFocus.focus({preventScroll: true}); else $('#scenario-button').focus({preventScroll: true});
    });
  });
  const menu = $('.menu-toggle');
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); $('#site-nav').classList.toggle('open', open); });
  $('#site-nav').addEventListener('click', event => { if (event.target.closest('a')) { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); $('#site-nav').classList.remove('open'); } });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { menu.click(); menu.focus(); } });
  $$('.jump-demo').forEach(link => link.addEventListener('click', event => { event.preventDefault(); jumpToDemo(); }));
  $$('.sidebar nav a').forEach(link => link.addEventListener('click', () => { $$('.sidebar nav a').forEach(item => item.classList.remove('selected')); link.classList.add('selected'); }));
  $$('[data-select-plan]').forEach(button => button.addEventListener('click', () => selectPlan(button.dataset.selectPlan)));
}

initialiseInterface();
