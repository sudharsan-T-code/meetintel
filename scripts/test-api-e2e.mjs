async function runTests() {
  console.log('=== MEETINTEL PHASE 3 LIVE API E2E TESTS ===\n');
  const baseUrl = 'http://localhost:3000';
  const meetingId = 'mtg-demo-001';

  // 1. Test GET /api/meetings/[id]/intelligence
  console.log('1. GET /api/meetings/' + meetingId + '/intelligence');
  const res1 = await fetch(`${baseUrl}/api/meetings/${meetingId}/intelligence`);
  const data1 = await res1.json();
  console.log('Status:', res1.status, '| Success:', data1.success);
  console.log('Decisions count:', data1.intelligence?.decisions?.length);
  console.log('Action items count:', data1.intelligence?.actionItems?.length);
  console.log('Risks count:', data1.intelligence?.risks?.length);
  console.log('Productivity score:', data1.intelligence?.productivityScore?.overall);
  if (!res1.ok || !data1.success) throw new Error('Test 1 Failed');

  // 2. Test POST /api/meetings/[id]/analyze
  console.log('\n2. POST /api/meetings/' + meetingId + '/analyze');
  const res2 = await fetch(`${baseUrl}/api/meetings/${meetingId}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ forceRegenerate: true }),
  });
  const data2 = await res2.json();
  console.log('Status:', res2.status, '| Message:', data2.message);
  console.log('Summaries extracted:', data2.intelligence?.summaries?.length);
  console.log('Decisions extracted:', data2.intelligence?.decisions?.length);
  if (!res2.ok || !data2.success) throw new Error('Test 2 Failed');

  // 3. Test POST /api/meetings/[id]/summary for a specific level
  console.log('\n3. POST /api/meetings/' + meetingId + '/summary (Level: executive_30s)');
  const res3 = await fetch(`${baseUrl}/api/meetings/${meetingId}/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level: 'executive_30s' }),
  });
  const data3 = await res3.json();
  console.log('Status:', res3.status, '| Summary level:', data3.summary?.level);
  console.log('Key points count:', data3.summary?.keyPoints?.length);
  if (!res3.ok || !data3.success) throw new Error('Test 3 Failed');

  // 4. Test POST /api/meetings/[id]/chat (Grounded query)
  console.log('\n4. POST /api/meetings/' + meetingId + '/chat');
  const res4 = await fetch(`${baseUrl}/api/meetings/${meetingId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'What were the key decisions?',
    }),
  });
  const data4 = await res4.json();
  console.log('Status:', res4.status, '| AI Role:', data4.message?.role);
  console.log('Response content preview:', data4.message?.content?.substring(0, 80) + '...');
  console.log('Grounded citations count:', data4.message?.sources?.length);
  if (!res4.ok || !data4.success || !data4.message?.sources?.length) {
    throw new Error('Test 4 Failed: Expected grounded citations');
  }

  // 5. Test GET /api/meetings/[id]/chat
  console.log('\n5. GET /api/meetings/' + meetingId + '/chat');
  const res5 = await fetch(`${baseUrl}/api/meetings/${meetingId}/chat`);
  const data5 = await res5.json();
  console.log('Status:', res5.status, '| Messages in conversation:', data5.messages?.length);
  if (!res5.ok || !data5.success || data5.messages.length < 2) throw new Error('Test 5 Failed');

  // 6. Test PATCH Decision
  console.log('\n6. PATCH /api/meetings/' + meetingId + '/decisions/dec-001');
  const res6 = await fetch(`${baseUrl}/api/meetings/${meetingId}/decisions/dec-001`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'APPROVED' }),
  });
  const data6 = await res6.json();
  console.log('Status:', res6.status, '| Updated decision status:', data6.decision?.status);
  if (!res6.ok || !data6.success) throw new Error('Test 6 Failed');

  // 7. Test PATCH Action Item
  console.log('\n7. PATCH /api/meetings/' + meetingId + '/actions/act-001');
  const res7 = await fetch(`${baseUrl}/api/meetings/${meetingId}/actions/act-001`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'IN_PROGRESS', priority: 'CRITICAL' }),
  });
  const data7 = await res7.json();
  console.log('Status:', res7.status, '| Updated action status:', data7.actionItem?.status, '| Priority:', data7.actionItem?.priority);
  if (!res7.ok || !data7.success) throw new Error('Test 7 Failed');

  // 8. Test Deduplication
  console.log('\n8. Verifying Deduplication by calling /analyze again...');
  const res8 = await fetch(`${baseUrl}/api/meetings/${meetingId}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ forceRegenerate: true }),
  });
  const data8 = await res8.json();
  console.log('Decisions count after second run:', data8.intelligence?.decisions?.length, '(Expected 7)');
  console.log('Action items count after second run:', data8.intelligence?.actionItems?.length, '(Expected 14)');
  if (data8.intelligence?.decisions?.length !== 7 || data8.intelligence?.actionItems?.length !== 14) {
    throw new Error('Test 8 Failed: Deduplication check violated');
  }

  console.log('\n========================================');
  console.log('✅ ALL 8 API & PIPELINE TESTS PASSED 100%');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('E2E Test Execution Error:', err);
  process.exit(1);
});
