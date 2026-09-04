const BASE_URL = 'http://localhost:3000';

async function testEndpoint(name, url, options = {}) {
  const start = Date.now();
  const res = await fetch(`${BASE_URL}${url}`, options);
  const elapsed = Date.now() - start;
  const status = res.status;
  let body = null;
  try {
    body = await res.json();
  } catch (e) {
    body = await res.text();
  }
  return { name, url, status, body, elapsed };
}

async function runApiVerification() {
  console.log('============================================================');
  console.log('MEETINTEL — PHASE 4 HTTP API END-TO-END VERIFICATION');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Overview API (all range)
  const r1 = await testEndpoint('Executive Overview (all)', '/api/analytics/overview?timeRange=all');
  if (r1.status === 200 && r1.body?.overview?.totalMeetings?.value >= 1) {
    console.log(`[PASS] ${r1.name} in ${r1.elapsed}ms`);
    console.log(`       Meetings: ${r1.body.overview.totalMeetings.value} | Hours: ${r1.body.overview.totalHours.value} | Score: ${r1.body.overview.productivityScore.value}% | Efficiency: ${r1.body.overview.meetingEfficiency}%`);
    passed++;
  } else {
    console.error(`[FAIL] ${r1.name}:`, r1.status, r1.body);
    failed++;
  }

  // 2. Overview API (30d range with trend calculation)
  const r2 = await testEndpoint('Executive Overview (30d filter)', '/api/analytics/overview?timeRange=30d');
  if (r2.status === 200 && r2.body?.overview?.totalMeetings?.trend) {
    console.log(`[PASS] ${r2.name} in ${r2.elapsed}ms`);
    console.log(`       Trend: ${r2.body.overview.totalMeetings.trend.changePercent}% (${r2.body.overview.totalMeetings.trend.direction})`);
    passed++;
  } else {
    console.error(`[FAIL] ${r2.name}:`, r2.status, r2.body);
    failed++;
  }

  // 3. Meeting Volume Time-series API
  const r3 = await testEndpoint('Meeting Volume Time-series', '/api/analytics/volume?timeRange=30d');
  if (r3.status === 200 && Array.isArray(r3.body?.volume?.series) && r3.body.volume.series.length > 0) {
    console.log(`[PASS] ${r3.name} in ${r3.elapsed}ms`);
    console.log(`       Time-series Buckets: ${r3.body.volume.series.length} buckets returned.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r3.name}:`, r3.status, r3.body);
    failed++;
  }

  // 4. Productivity Trend API
  const r4 = await testEndpoint('Productivity Trend & Distribution', '/api/analytics/productivity?timeRange=30d');
  if (r4.status === 200 && Array.isArray(r4.body?.productivity?.distribution)) {
    console.log(`[PASS] ${r4.name} in ${r4.elapsed}ms`);
    console.log(`       Trend points: ${r4.body.productivity.trend.length}, Distribution tiers: ${r4.body.productivity.distribution.length}`);
    passed++;
  } else {
    console.error(`[FAIL] ${r4.name}:`, r4.status, r4.body);
    failed++;
  }

  // 5. Decision Analytics API
  const r5 = await testEndpoint('Decision Analytics', '/api/analytics/decisions?timeRange=30d');
  if (r5.status === 200 && typeof r5.body?.decisions?.total === 'number') {
    console.log(`[PASS] ${r5.name} in ${r5.elapsed}ms`);
    console.log(`       Total Decisions: ${r5.body.decisions.total} (Approved: ${r5.body.decisions.byStatus.approved}, Pending: ${r5.body.decisions.byStatus.pending})`);
    passed++;
  } else {
    console.error(`[FAIL] ${r5.name}:`, r5.status, r5.body);
    failed++;
  }

  // 6. Action Items Analytics API
  const r6 = await testEndpoint('Action Items Analytics', '/api/analytics/actions?timeRange=30d');
  if (r6.status === 200 && typeof r6.body?.actions?.completionRate === 'number') {
    console.log(`[PASS] ${r6.name} in ${r6.elapsed}ms`);
    console.log(`       Total Actions: ${r6.body.actions.total}, Completion Rate: ${r6.body.actions.completionRate}%, Critical: ${r6.body.actions.byPriority.critical}`);
    passed++;
  } else {
    console.error(`[FAIL] ${r6.name}:`, r6.status, r6.body);
    failed++;
  }

  // 7. Risk Analytics API
  const r7 = await testEndpoint('Risk Intelligence Analytics', '/api/analytics/risks?timeRange=30d');
  if (r7.status === 200 && typeof r7.body?.risks?.total === 'number') {
    console.log(`[PASS] ${r7.name} in ${r7.elapsed}ms`);
    console.log(`       Total Risks: ${r7.body.risks.total} (Critical: ${r7.body.risks.critical}, High: ${r7.body.risks.high}, Blockers: ${r7.body.risks.unresolvedBlockers.length})`);
    passed++;
  } else {
    console.error(`[FAIL] ${r7.name}:`, r7.status, r7.body);
    failed++;
  }

  // 8. Meeting Load Analytics API
  const r8 = await testEndpoint('Meeting Load & Department Allocation', '/api/analytics/meeting-load?timeRange=30d');
  if (r8.status === 200 && Array.isArray(r8.body?.meetingLoad?.byDepartment)) {
    console.log(`[PASS] ${r8.name} in ${r8.elapsed}ms`);
    console.log(`       Departments: ${r8.body.meetingLoad.byDepartment.length}, Peak Hour Slots: ${r8.body.meetingLoad.peakHours.length}, Top Participants: ${r8.body.meetingLoad.topParticipants.length}`);
    passed++;
  } else {
    console.error(`[FAIL] ${r8.name}:`, r8.status, r8.body);
    failed++;
  }

  // 9. Participation Analytics API
  const r9 = await testEndpoint('Speaker Participation Analytics', '/api/analytics/participation?timeRange=30d');
  if (r9.status === 200 && typeof r9.body?.participation?.overallBalanceScore === 'number') {
    console.log(`[PASS] ${r9.name} in ${r9.elapsed}ms`);
    console.log(`       Balance Score: ${r9.body.participation.overallBalanceScore}/100, Avg Speakers: ${r9.body.participation.averageSpeakersPerMeeting}`);
    passed++;
  } else {
    console.error(`[FAIL] ${r9.name}:`, r9.status, r9.body);
    failed++;
  }

  // 10. Meeting Waste Insights API
  const r10 = await testEndpoint('Meeting Waste & Pattern Detection', '/api/analytics/waste?timeRange=30d');
  if (r10.status === 200 && typeof r10.body?.waste?.totalEstimatedHoursSavedMonthly === 'number') {
    console.log(`[PASS] ${r10.name} in ${r10.elapsed}ms`);
    console.log(`       Waste Opportunities: ${r10.body.waste.wasteOpportunities.length}, Monthly Recoverable: ${r10.body.waste.totalEstimatedHoursSavedMonthly} hrs (INR ₹${r10.body.waste.estimatedMonthlyCostSavingsINR.toLocaleString()})`);
    passed++;
  } else {
    console.error(`[FAIL] ${r10.name}:`, r10.status, r10.body);
    failed++;
  }

  // 11. AI Executive Insights Generation API (POST)
  const r11 = await testEndpoint('AI Grounded Executive Insights (POST)', '/api/analytics/ai-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeRange: '30d' }),
  });
  if (r11.status === 200 && r11.body?.insights?.summary && Array.isArray(r11.body?.insights?.recommendations)) {
    console.log(`[PASS] ${r11.name} in ${r11.elapsed}ms`);
    console.log(`       AI Summary: ${r11.body.insights.summary.split('\n')[0]}`);
    console.log(`       Recommendations: ${r11.body.insights.recommendations.length} action plans grounded in real metrics.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r11.name}:`, r11.status, r11.body);
    failed++;
  }

  console.log('\n============================================================');
  console.log(`E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runApiVerification().catch(e => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
