const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {if(message.type() === 'error') errors.push(message.text());});
  const results = [];
  const passed = message => {results.push(message); console.log('PASS', message);};
  const settle = () => page.waitForTimeout(400);
  const values = () => page.locator('.kpi-value').allTextContents();
  await page.goto('http://localhost:4173');
  await page.evaluate(() => document.fonts.ready);
  assert.deepEqual(await values(), ['$38,000','24 days','28%','$21,600']);
  assert.match(await page.locator('#risk-assessment').innerText(), /No combined risk alert/);
  assert.equal(await page.locator('dialog[open]').count(),0);
  passed('Initial baseline values and calm assessment');
  for(const name of ['pipeline','payments','concentration','costs']) {
    await page.locator(`[data-metric="${name}"]`).click();
    assert.equal(await page.locator('#metric-dialog').evaluate(e=>e.open),true);
    assert.match(await page.locator('#metric-dialog').innerText(),/Simulated source/);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.metric),name);
  }
  passed('All four KPI dialogs, Escape and focus restoration');
  await page.locator('#scenario-button').click(); await settle();
  assert.deepEqual(await values(),['$21,000','41 days','46%','$24,000']);
  assert.equal(await page.locator('#analyst-dialog').evaluate(e=>e.open),true);
  assert.match(await page.locator('#analyst-content').innerText(),/Payment time increased by 17 days/);
  assert.match(await page.locator('#risk-assessment').innerText(),/not a prediction of business failure/);
  await page.screenshot({path:'/tmp/pulse-qa-desktop-analyst.png'});
  await page.locator('.analyst-priorities input').first().check();
  assert.match(await page.locator('.analyst-priorities li').first().innerText(),/Under Review/);
  for(let i=0;i<15;i++) {
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.closest('dialog')?.id),'analyst-dialog');
  }
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'scenario-button');
  passed('Risk values, disclaimer, automatic analyst drawer, checklist and focus containment');
  assert.equal(await page.locator('#recommendation-list details').count(),4);
  for(const detail of await page.locator('#recommendation-list details').all()) {
    await detail.locator('summary').click();
    assert.equal(await detail.evaluate(e=>e.open),true);
    assert.match(await detail.locator('.recommendation-detail').innerText(),/Supporting source/);
  }
  await page.locator('#analyst-button').click();
  assert.equal(await page.locator('.analyst-priorities input').first().isChecked(),true);
  await page.locator('#analyst-dialog .dialog-close').click();
  passed('All four action disclosures and analyst reopen preserves local review state');
  await page.locator('#coverage-details summary').click();
  await page.locator('#accounting-toggle').uncheck();
  assert.deepEqual(await values(),['$21,000','Unavailable','Unavailable','Unavailable']);
  assert.match(await page.locator('#risk-assessment').innerText(),/combined warning is withheld/);
  assert.equal(await page.locator('#recommendation-list details').count(),2);
  assert.equal(await page.locator('.case-signal strong').allTextContents().then(a=>a.filter(x=>x==='N/A').length),3);
  await page.locator('[data-metric="payments"]').click();
  assert.match(await page.locator('#metric-dialog-content').innerText(),/No replacement value is estimated/);
  await page.keyboard.press('Escape');
  await page.locator('#analyst-button').click();
  assert.doesNotMatch(await page.locator('.analyst-insight').innerText(),/significant customer concentration warrant/);
  assert.match(await page.locator('.analyst-insight').innerText(),/Accounting data is unavailable/);
  await page.keyboard.press('Escape');
  await page.locator('#accounting-toggle').check();
  assert.deepEqual(await values(),['$21,000','41 days','46%','$24,000']);
  passed('Missing-data suppression across KPIs, alert, recommendations, case study, details and analyst');
  for(const plan of ['monitor','explorer','advisory']) {
    await page.locator(`[data-select-plan="${plan}"]`).click();
    assert.equal(await page.locator(`[data-select-plan="${plan}"]`).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('.price-card.chosen').count(),1);
  }
  passed('All three proposed pricing interactions');
  await page.locator('.final-cta .jump-demo').click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'scenario-button');
  await settle();
  await page.locator('.scenario-buttons .reset-demo').click();
  assert.deepEqual(await values(),['$38,000','24 days','28%','$21,600']);
  assert.equal(await page.locator('#recommendation-list details[open]').count(),0);
  assert.equal(await page.locator('#coverage-details').evaluate(e=>e.open),false);
  await page.locator('.case-simulate').click(); await settle();
  assert.deepEqual(await values(),['$21,000','41 days','46%','$24,000']);
  await page.locator('#analyst-dialog .reset-demo').click();
  assert.equal(await page.locator('dialog[open]').count(),0);
  assert.deepEqual(await values(),['$38,000','24 days','28%','$21,600']);
  passed('Final CTA focus, full reset, case-study trigger and drawer reset');
  for(const [width,height] of [[1440,900],[1280,800],[768,1024],[390,844],[320,844]]) {
    await page.setViewportSize({width,height});await page.reload();await settle();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Normal overflow at ${width}`);
    if(width<640) {
      await page.locator('.menu-toggle').click();
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
      await page.locator('#site-nav a[href="#pricing"]').click();
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
      await page.locator('.jump-demo').last().click();await settle();
    }
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await settle();
    await page.screenshot({path:`/tmp/pulse-qa-${width}-normal.png`,fullPage:true});
    await page.locator('#scenario-button').click();await settle();
    assert.equal(await page.locator('#analyst-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth),true,`Drawer overflow at ${width}`);
    await page.screenshot({path:`/tmp/pulse-qa-${width}-drawer.png`});
    await page.keyboard.press('Escape');await settle();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Risk overflow at ${width}`);
    await page.screenshot({path:`/tmp/pulse-qa-${width}-risk.png`,fullPage:true});
    passed(`${width}×${height}: normal, risk, drawer, no horizontal overflow${width<640?', mobile navigation':''}`);
  }
  await page.setViewportSize({width:1440,height:900});await page.reload();
  for(const anchor of ['#demo','#how-it-works','#pricing','#why-pulse']) {
    const link=page.locator(`#site-nav a[href="${anchor}"]`).first();
    await link.click();await page.waitForTimeout(800);
    const top=await page.locator(anchor).evaluate(e=>e.getBoundingClientRect().top);
    assert(top>=60 && top<220,`${anchor} target top ${top}`);
  }
  passed('All main navigation destinations scroll beneath sticky header');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
  passed('Reduced-motion preference');
  const filePage = await browser.newPage();
  await filePage.goto('file:///Users/davorn/pulse/index.html');
  await filePage.locator('#scenario-button').click();
  assert.equal(await filePage.locator('#analyst-dialog').evaluate(e=>e.open),true);
  passed('Direct file:// launch with working scenario');
  assert.deepEqual(errors,[]);
  passed('No page or browser console errors');
  fs.writeFileSync('/tmp/pulse-qa-results.json',JSON.stringify({results,errors},null,2));
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
