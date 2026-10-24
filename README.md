# PULSE interactive presentation demo

A single-page website built with HTML5, CSS3 and vanilla JavaScript. No build step, framework, backend, account, API or internet connection is required.

## Launch

Open `index.html` directly in a modern browser. Alternatively, from this folder run:

```sh
python3 -m http.server 4173
```

Then open http://localhost:4173. Keep the `assets` folder beside the three website files; both Poppins fonts are local.

## Present the demo

1. Start with Apex Creative Studio under normal monitoring.
2. Click **Simulate Emerging Risk**. The four metrics update and the illustrative **Analyst Review & Actions** drawer opens automatically.
3. Close the drawer (close button, Escape or backdrop) to explore the evidence and recommended actions. Select any KPI for its value, comparison, source and explanation. Expand an action to read its rationale.
4. **Reopen Analyst Review** opens the drawer again. Its optional checkboxes mark priorities **Under Review** locally; no real action occurs.
5. Click **Reset Demo** to restore baseline values, included sources, collapsed details, routine recommendations and starting activity.

The same scenario controls the business example further down the page. Pricing buttons select a proposed plan and explain its support level; they do not initiate a purchase.

### Missing-data example

In **Connections**, expand **Inspect data coverage** and switch off **Accounting data**. Payment time, largest client share and operating costs become unavailable, their dependent recommendations are removed, and the combined warning is withheld. Only the CRM pipeline remains assessable. The case study and analyst example respect the same missing-source state. Restore the switch or reset to return to full coverage. Project-management input is clearly labelled as unused in this assessment.

## Fictional information and scope

All company information, business figures, period comparisons, activity and analyst insight are fictional. There are no live connections, actual customer records, real analysts, automated management decisions or financial forecasts. Values are deterministic and reset on reload. Analyst checklist selections are local to this page session.

| Signal | Baseline | Emerging risk | Change |
|---|---:|---:|---:|
| Sales pipeline | $38,000 | $21,000 | −45%, rounded |
| Average payment time | 24 days | 41 days | +17 days |
| Largest client share | 28% | 46% | +18 percentage points |
| Monthly operating costs | approximately $21,600 | $24,000 | +11%, rounded |

The charts connect two supplied period observations only. They do not imply intermediate measurements or predictions. Baseline comparison values equal baseline current values to establish the calm demonstration state.

Pricing is proposed launch pricing, subject to pilot validation: Monitor $249/month, Explorer $599/month and Advisory from $1,499/month. No checkout or real subscription service exists here.

## Visual reference and accessibility

The supplied `PULSE (1).pdf`, `PULSE Analyst Review Dashboard.png` and `Apex Creative Studio Analytics Dashboard.png` were inspected visually. The page retains the deck's Poppins typeface, deep blue, turquoise, sky-blue gradient and light dashboard treatment. Full Poppins Regular and SemiBold fonts are self-hosted with their SIL Open Font License in `assets/OFL.txt`; no substitute typeface was needed. The wordmark uses a simple CSS bar motif inspired by the supplied dashboards. The interface is rebuilt with semantic HTML, CSS and SVG, not screenshots.

Native modal dialogs provide keyboard focus containment, Escape dismissal and focus restoration. Navigation, details disclosures, checkboxes and switches support the keyboard. Reduced motion is respected. Charts have text alternatives and all missing data has explicit labels.

Supported target: modern Chrome, Safari, Edge and Firefox with native `dialog` support. This is a presentation of a proposed product, not an operational risk-monitoring or financial-advice service.

## Verification completed

- Chromium functional checks: initial values, all four KPI dialogs, risk scenario, warning disclaimer, four recommendation disclosures, analyst close/reopen, local review checklist and full reset.
- Missing-source checks across the dashboard, metric details, case study, recommendations and analyst example.
- All main navigation links, mobile menu, all three plan interactions and final CTA focus.
- Normal, risk and analyst-drawer layouts at 1440×900, 1280×800, 768×1024, 390×844 and 320×844, with screenshots and horizontal-overflow checks.
- Keyboard focus containment and restoration, Escape dismissal and reduced-motion behaviour.
- Direct `file://` opening and no browser console or script errors.
- Axe WCAG 2 A/AA and 2.1 AA automated scans: no violations reported in normal, risk, analyst, missing-data, metric-dialog and 320px missing-data states after contrast fixes. Automated scanning does not replace a full manual accessibility audit.

`qa.cjs` is the optional developer regression script, using Playwright available in the development environment. It expects the static server on port 4173 and writes screenshots/results to `/tmp`; it is not required to run or present the website. Safari and Firefox were not separately tested.
