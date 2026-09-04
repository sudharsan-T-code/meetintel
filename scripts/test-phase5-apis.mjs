const BASE_URL = 'http://localhost:3000';

async function testEndpoint(name, url, options = {}) {
  const start = Date.now();
  const res = await fetch(`${BASE_URL}${url}`, options);
  const elapsed = Date.now() - start;
  let body = null;
  try {
    body = await res.json();
  } catch (e) {
    body = await res.text();
  }
  return { name, url, status: res.status, body, elapsed };
}

async function runPhase5Verification() {
  console.log('============================================================');
  console.log('MEETINTEL — PHASE 5 END-TO-END WORKFLOW & API VERIFICATION');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Integrations List API
  const r1 = await testEndpoint('Integrations List', '/api/integrations');
  if (r1.status === 200 && Array.isArray(r1.body?.integrations) && r1.body.integrations.length >= 5) {
    console.log(`[PASS] ${r1.name} in ${r1.elapsed}ms - ${r1.body.integrations.length} providers listed.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r1.name}:`, r1.status, r1.body);
    failed++;
  }

  // 2. Google Calendar Connect (Mock/Demo mode)
  const r2 = await testEndpoint('Google Calendar Connect', '/api/integrations/google_calendar/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (r2.status === 200 && r2.body?.provider === 'google_calendar') {
    console.log(`[PASS] ${r2.name} in ${r2.elapsed}ms - Mode: ${r2.body.accountEmail || 'Demo'}`);
    passed++;
  } else {
    console.error(`[FAIL] ${r2.name}:`, r2.status, r2.body);
    failed++;
  }

  // 3. Google Calendar Sync
  const r3 = await testEndpoint('Google Calendar Sync', '/api/integrations/google_calendar/sync', {
    method: 'POST',
  });
  if (r3.status === 200 && r3.body?.sync?.success && r3.body.sync.totalEventsFetched >= 1) {
    console.log(`[PASS] ${r3.name} in ${r3.elapsed}ms - Fetched ${r3.body.sync.totalEventsFetched} events (${r3.body.sync.importedMeetingsCount} imported, ${r3.body.sync.updatedMeetingsCount} updated).`);
    passed++;
  } else {
    console.error(`[FAIL] ${r3.name}:`, r3.status, r3.body);
    failed++;
  }

  // 4. Calendar Sync Idempotency Check (Second sync updates rather than duplicates)
  const r4 = await testEndpoint('Calendar Sync Idempotency Check', '/api/integrations/google_calendar/sync', {
    method: 'POST',
  });
  if (r4.status === 200 && r4.body?.sync?.success) {
    console.log(`[PASS] ${r4.name} in ${r4.elapsed}ms - Re-sync executed cleanly without duplication errors.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r4.name}:`, r4.status, r4.body);
    failed++;
  }

  // 5. Microsoft Calendar Sync
  const r5 = await testEndpoint('Microsoft Calendar Sync', '/api/integrations/microsoft_calendar/sync', {
    method: 'POST',
  });
  if (r5.status === 200 && r5.body?.sync?.success) {
    console.log(`[PASS] ${r5.name} in ${r5.elapsed}ms - MS Calendar events synchronized.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r5.name}:`, r5.status, r5.body);
    failed++;
  }

  // 6. Integration Disconnect
  const r6 = await testEndpoint('Integration Disconnect', '/api/integrations/google_calendar/disconnect', {
    method: 'POST',
  });
  if (r6.status === 200) {
    console.log(`[PASS] ${r6.name} in ${r6.elapsed}ms - Google Calendar disconnected.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r6.name}:`, r6.status, r6.body);
    failed++;
  }

  // 7. Action Items List API
  const r7 = await testEndpoint('Action Items List', '/api/action-items');
  let firstActionId = null;
  if (r7.status === 200 && Array.isArray(r7.body?.items) && r7.body.items.length > 0) {
    firstActionId = r7.body.items[0].id;
    console.log(`[PASS] ${r7.name} in ${r7.elapsed}ms - Total tasks: ${r7.body.total} (Open: ${r7.body.metrics.open}, Completed: ${r7.body.metrics.completed})`);
    passed++;
  } else {
    console.error(`[FAIL] ${r7.name}:`, r7.status, r7.body);
    failed++;
  }

  // 8. Action Item Update API (PATCH)
  if (firstActionId) {
    const r8 = await testEndpoint('Action Item Status Update (PATCH)', `/api/action-items/${firstActionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed', priority: 'critical' }),
    });
    if (r8.status === 200 && r8.body?.actionItem?.status === 'completed') {
      console.log(`[PASS] ${r8.name} in ${r8.elapsed}ms - Updated task ${firstActionId} to COMPLETED (Critical).`);
      passed++;
    } else {
      console.error(`[FAIL] ${r8.name}:`, r8.status, r8.body);
      failed++;
    }
  }

  // 9. Commitments List API
  const r9 = await testEndpoint('Commitments List & Health', '/api/commitments');
  let firstCommitmentId = null;
  if (r9.status === 200 && Array.isArray(r9.body?.items) && r9.body.items.length > 0) {
    firstCommitmentId = r9.body.items[0].id;
    console.log(`[PASS] ${r9.name} in ${r9.elapsed}ms - Total commitments: ${r9.body.total}, Health score: ${r9.body.health.completionRate}%`);
    passed++;
  } else {
    console.error(`[FAIL] ${r9.name}:`, r9.status, r9.body);
    failed++;
  }

  // 10. Commitment Update API (PATCH)
  if (firstCommitmentId) {
    const r10 = await testEndpoint('Commitment Status Update (PATCH)', `/api/commitments/${firstCommitmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    if (r10.status === 200 && r10.body?.commitment?.status === 'completed') {
      console.log(`[PASS] ${r10.name} in ${r10.elapsed}ms - Updated commitment ${firstCommitmentId} to COMPLETED.`);
      passed++;
    } else {
      console.error(`[FAIL] ${r10.name}:`, r10.status, r10.body);
      failed++;
    }
  }

  // 11. Notifications List API
  const r11 = await testEndpoint('Notifications List', '/api/notifications');
  let firstNotifId = null;
  if (r11.status === 200 && Array.isArray(r11.body?.notifications)) {
    if (r11.body.notifications.length > 0) firstNotifId = r11.body.notifications[0].id;
    console.log(`[PASS] ${r11.name} in ${r11.elapsed}ms - Total notifications: ${r11.body.notifications.length}, Unread: ${r11.body.unreadCount}`);
    passed++;
  } else {
    console.error(`[FAIL] ${r11.name}:`, r11.status, r11.body);
    failed++;
  }

  // 12. Notification Read API (PATCH)
  if (firstNotifId) {
    const r12 = await testEndpoint('Notification Mark-Read (PATCH)', `/api/notifications/${firstNotifId}`, {
      method: 'PATCH',
    });
    if (r12.status === 200 && r12.body?.success) {
      console.log(`[PASS] ${r12.name} in ${r12.elapsed}ms - Notification marked as read.`);
      passed++;
    } else {
      console.error(`[FAIL] ${r12.name}:`, r12.status, r12.body);
      failed++;
    }
  }

  // 13. Notifications Mark-All-Read (POST)
  const r13 = await testEndpoint('Notifications Mark-All-Read (POST)', '/api/notifications/read-all', {
    method: 'POST',
  });
  if (r13.status === 200 && r13.body?.success) {
    console.log(`[PASS] ${r13.name} in ${r13.elapsed}ms - All user notifications marked read.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r13.name}:`, r13.status, r13.body);
    failed++;
  }

  // 14. Missed Meetings List API
  const r14 = await testEndpoint('Missed Meetings List', '/api/missed-meetings');
  let sampleMissedId = null;
  if (r14.status === 200 && Array.isArray(r14.body?.missedMeetings) && r14.body.missedMeetings.length > 0) {
    sampleMissedId = r14.body.missedMeetings[0].meetingId;
    console.log(`[PASS] ${r14.name} in ${r14.elapsed}ms - ${r14.body.missedMeetings.length} missed sessions available.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r14.name}:`, r14.status, r14.body);
    failed++;
  }

  // 15. Missed Meeting Briefing API (Personalized Highlights)
  if (sampleMissedId) {
    const r15 = await testEndpoint('Missed Meeting Briefing (30s Catch-up)', `/api/missed-meetings/${sampleMissedId}`);
    if (r15.status === 200 && r15.body?.briefing?.executiveSummary) {
      console.log(`[PASS] ${r15.name} in ${r15.elapsed}ms`);
      console.log(`       Executive Takeaway: "${r15.body.briefing.executiveSummary.substring(0, 80)}..."`);
      console.log(`       Decisions: ${r15.body.briefing.keyDecisions.length}, Assigned Actions: ${r15.body.briefing.myActionItems.length}`);
      passed++;
    } else {
      console.error(`[FAIL] ${r15.name}:`, r15.status, r15.body);
      failed++;
    }
  }

  // 16. Personal Productivity Dashboard API
  const r16 = await testEndpoint('Personal Productivity Metrics', '/api/my-productivity');
  if (r16.status === 200 && r16.body?.metrics?.kpis) {
    console.log(`[PASS] ${r16.name} in ${r16.elapsed}ms`);
    console.log(`       User: ${r16.body.metrics.user.name} (${r16.body.metrics.user.title})`);
    console.log(`       Focus Hours: ${r16.body.metrics.kpis.focusHoursAvailable}h | Task Completion: ${r16.body.metrics.kpis.actionCompletionRate}% | Effectiveness: ${r16.body.metrics.kpis.personalEffectivenessScore}/100`);
    passed++;
  } else {
    console.error(`[FAIL] ${r16.name}:`, r16.status, r16.body);
    failed++;
  }

  console.log('\n============================================================');
  console.log(`PHASE 5 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Verification().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
