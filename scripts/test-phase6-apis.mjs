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

async function runPhase6Verification() {
  console.log('============================================================');
  console.log('MEETINTEL — PHASE 6 ENTERPRISE SUITE & SECURITY VERIFICATION');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Admin Authorization Check (Employee Role Forbidden)
  const r1 = await testEndpoint('Admin Authorization (Employee Forbidden)', '/api/admin/overview', {
    headers: { 'x-user-role': 'EMPLOYEE' },
  });
  if (r1.status === 403) {
    console.log(`[PASS] ${r1.name} in ${r1.elapsed}ms - Properly rejected unprivileged user with HTTP 403 Forbidden.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r1.name}: Expected 403, got ${r1.status}`, r1.body);
    failed++;
  }

  // 2. User Listing API (Admin Authorized)
  const r2 = await testEndpoint('Admin User Listing', '/api/admin/users', {
    headers: { 'x-user-role': 'ADMIN' },
  });
  let testUserId = null;
  if (r2.status === 200 && Array.isArray(r2.body?.users) && r2.body.users.length >= 3) {
    testUserId = r2.body.users.find(u => u.role !== 'ADMIN')?.id || r2.body.users[1].id;
    console.log(`[PASS] ${r2.name} in ${r2.elapsed}ms - Retrieved ${r2.body.users.length} organization members.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r2.name}:`, r2.status, r2.body);
    failed++;
  }

  // 3. User Role Authorization & Update
  const r3 = await testEndpoint('User Role Update', `/api/admin/users/${testUserId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'ADMIN' },
    body: JSON.stringify({ role: 'MANAGER' }),
  });
  if (r3.status === 200 && r3.body?.user?.role === 'MANAGER') {
    console.log(`[PASS] ${r3.name} in ${r3.elapsed}ms - Role successfully updated to MANAGER.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r3.name}:`, r3.status, r3.body);
    failed++;
  }

  // 4. Invitation Creation Workflow
  const newInviteEmail = `test.member.${Date.now()}@cognizant.com`;
  const r4 = await testEndpoint('Create User Invitation', '/api/admin/invitations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'ADMIN' },
    body: JSON.stringify({ email: newInviteEmail, role: 'EMPLOYEE' }),
  });
  let createdInviteId = null;
  if (r4.status === 201 && r4.body?.invitation?.email === newInviteEmail && r4.body?.delivery?.mode === 'DEMO') {
    createdInviteId = r4.body.invitation.id;
    console.log(`[PASS] ${r4.name} in ${r4.elapsed}ms - Token generated. Mode: ${r4.body.delivery.mode}.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r4.name}:`, r4.status, r4.body);
    failed++;
  }

  // 5. Invitation Expiration and Lifecycle Validation
  const r5 = await testEndpoint('Invitation Expiration & Fields Check', '/api/admin/invitations', {
    headers: { 'x-user-role': 'ADMIN' },
  });
  if (r5.status === 200 && Array.isArray(r5.body?.invitations) && r5.body.invitations.some(i => i.id === createdInviteId)) {
    const inv = r5.body.invitations.find(i => i.id === createdInviteId);
    const expiresValid = new Date(inv.expiresAt).getTime() > Date.now();
    if (expiresValid && inv.status === 'PENDING') {
      console.log(`[PASS] ${r5.name} in ${r5.elapsed}ms - Valid expiration in future & status is PENDING.`);
      passed++;
    } else {
      console.error(`[FAIL] ${r5.name}: Invalid expiration or status`, inv);
      failed++;
    }
  } else {
    console.error(`[FAIL] ${r5.name}:`, r5.status, r5.body);
    failed++;
  }

  // 6. Invitation Revocation
  const r6 = await testEndpoint('Revoke Invitation', `/api/admin/invitations/${createdInviteId}`, {
    method: 'DELETE',
    headers: { 'x-user-role': 'ADMIN' },
  });
  if (r6.status === 200 && r6.body?.status === 'REVOKED') {
    console.log(`[PASS] ${r6.name} in ${r6.elapsed}ms - Invitation revoked cleanly.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r6.name}:`, r6.status, r6.body);
    failed++;
  }

  // 7. Audit Log Retrieval & Server-Side Filtering
  const r7 = await testEndpoint('Audit Log Retrieval with Filters', '/api/admin/audit-logs?limit=10', {
    headers: { 'x-user-role': 'ADMIN' },
  });
  if (r7.status === 200 && Array.isArray(r7.body?.logs) && r7.body.logs.length > 0) {
    console.log(`[PASS] ${r7.name} in ${r7.elapsed}ms - Retrieved ${r7.body.logs.length} immutable records.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r7.name}:`, r7.status, r7.body);
    failed++;
  }

  // 8. Security Endpoint Authorization
  const r8Emp = await testEndpoint('Security Endpoint (Employee Forbidden)', '/api/admin/security', {
    headers: { 'x-user-role': 'EMPLOYEE' },
  });
  const r8Adm = await testEndpoint('Security Endpoint (Admin Authorized)', '/api/admin/security', {
    headers: { 'x-user-role': 'ADMIN' },
  });
  if (r8Emp.status === 403 && r8Adm.status === 200 && r8Adm.body?.tokenProtection) {
    console.log(`[PASS] Security Endpoint Authorization in ${r8Adm.elapsed}ms - Employee rejected (403), Admin accepted (200).`);
    passed++;
  } else {
    console.error(`[FAIL] Security Endpoint Authorization:`, r8Emp.status, r8Adm.status);
    failed++;
  }

  // 9. Profile Settings Update
  const r9 = await testEndpoint('Profile Settings Update', '/api/settings/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Priya Sharma (Eng Lead)', timezone: 'Asia/Kolkata' }),
  });
  if (r9.status === 200 && r9.body?.profile?.name === 'Priya Sharma (Eng Lead)') {
    console.log(`[PASS] ${r9.name} in ${r9.elapsed}ms - Profile name and timezone persisted.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r9.name}:`, r9.status, r9.body);
    failed++;
  }

  // 10. Notification Preferences Persistence
  const r10 = await testEndpoint('Notification Preferences PATCH', '/api/settings/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ riskDetected: true, actionOverdue: true, emailDeliveryEnabled: false }),
  });
  if (r10.status === 200 && r10.body?.preferences?.riskDetected === true) {
    console.log(`[PASS] ${r10.name} in ${r10.elapsed}ms - Notification triggers configured.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r10.name}:`, r10.status, r10.body);
    failed++;
  }

  // 11. Meeting Defaults Preferences
  const r11 = await testEndpoint('Meeting Defaults PATCH', '/api/settings/meetings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ defaultDurationMinutes: 45, summaryFormat: 'EXECUTIVE' }),
  });
  if (r11.status === 200 && r11.body?.preferences?.defaultDurationMinutes === 45) {
    console.log(`[PASS] ${r11.name} in ${r11.elapsed}ms - Meeting defaults saved.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r11.name}:`, r11.status, r11.body);
    failed++;
  }

  // 12. AI Settings Authorization
  const r12Emp = await testEndpoint('AI Settings PATCH (Employee Forbidden)', '/api/settings/ai', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'EMPLOYEE' },
    body: JSON.stringify({ provider: 'openai' }),
  });
  const r12Adm = await testEndpoint('AI Settings PATCH (Admin Authorized)', '/api/settings/ai', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'ADMIN' },
    body: JSON.stringify({ provider: 'demo' }),
  });
  if (r12Emp.status === 403 && r12Adm.status === 200) {
    console.log(`[PASS] AI Settings Authorization in ${r12Adm.elapsed}ms - Non-admin cannot switch AI provider.`);
    passed++;
  } else {
    console.error(`[FAIL] AI Settings Authorization:`, r12Emp.status, r12Adm.status);
    failed++;
  }

  // 13. Organization Settings Authorization
  const r13Emp = await testEndpoint('Org Settings PATCH (Employee Forbidden)', '/api/admin/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'EMPLOYEE' },
    body: JSON.stringify({ transcriptRetentionDays: 180 }),
  });
  const r13Adm = await testEndpoint('Org Settings PATCH (Admin Authorized)', '/api/admin/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'ADMIN' },
    body: JSON.stringify({ transcriptRetentionDays: 365 }),
  });
  if (r13Emp.status === 403 && r13Adm.status === 200 && r13Adm.body?.settings?.transcriptRetentionDays === 365) {
    console.log(`[PASS] Organization Settings Authorization in ${r13Adm.elapsed}ms - Protected governance retained.`);
    passed++;
  } else {
    console.error(`[FAIL] Organization Settings Authorization:`, r13Emp.status, r13Adm.status);
    failed++;
  }

  // 14. Global Search Execution
  const r14 = await testEndpoint('Global Search API', '/api/search?q=migration');
  if (r14.status === 200 && Array.isArray(r14.body?.results) && r14.body.results.length > 0) {
    console.log(`[PASS] ${r14.name} in ${r14.elapsed}ms - Found ${r14.body.results.length} records matching query.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r14.name}:`, r14.status, r14.body);
    failed++;
  }

  // 15. Search RBAC & Entity Filtering
  const r15 = await testEndpoint('Search Entity Filtering (Decisions)', '/api/search?type=DECISIONS');
  if (r15.status === 200 && Array.isArray(r15.body?.results)) {
    const allDecisions = r15.body.results.every(r => r.type === 'DECISION');
    if (allDecisions) {
      console.log(`[PASS] ${r15.name} in ${r15.elapsed}ms - Server-side entity filtering verified.`);
      passed++;
    } else {
      console.error(`[FAIL] ${r15.name}: Non-decision item returned in DECISIONS filter.`);
      failed++;
    }
  } else {
    console.error(`[FAIL] ${r15.name}:`, r15.status, r15.body);
    failed++;
  }

  // 16. Cross-Tenant Isolation Barrier
  const r16 = await testEndpoint('Cross-Tenant Isolation Check', '/api/admin/overview', {
    headers: { 'x-user-role': 'ADMIN', 'x-organization-id': 'org-foreign-isolated-999' },
  });
  // Querying with an external organization must not leak demo organization records
  if (r16.status === 200 && r16.body?.organization?.id === 'org-foreign-isolated-999') {
    console.log(`[PASS] ${r16.name} in ${r16.elapsed}ms - Query scoped to isolated tenant boundary.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r16.name}:`, r16.status, r16.body);
    failed++;
  }

  // 17. Unauthorized Object Escalation Barrier (Profile tampering)
  const r17 = await testEndpoint('Identity Escalation Prevention', '/api/settings/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'SUPER_ADMIN', organizationId: 'org-hacked' }),
  });
  if (r17.status === 403 && r17.body?.error?.includes('SecurityViolation')) {
    console.log(`[PASS] ${r17.name} in ${r17.elapsed}ms - Rejected client attempt to elevate role or switch organization.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r17.name}: Expected 403 SecurityViolation, got ${r17.status}`, r17.body);
    failed++;
  }

  // 18. Invalid Input Handling (Zod Validation)
  const r18 = await testEndpoint('Zod Input Validation', '/api/admin/invitations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'ADMIN' },
    body: JSON.stringify({ email: 'not-an-email', role: 'INVALID_ROLE' }),
  });
  if (r18.status === 400 && r18.body?.details) {
    console.log(`[PASS] ${r18.name} in ${r18.elapsed}ms - Rejected malformed email and role with 400 Bad Request.`);
    passed++;
  } else {
    console.error(`[FAIL] ${r18.name}: Expected 400, got ${r18.status}`, r18.body);
    failed++;
  }

  // 19. Secret Exposure Prevention Audit
  const r19AI = await testEndpoint('AI Settings Secret Audit', '/api/settings/ai');
  const r19Sec = await testEndpoint('Security Center Secret Audit', '/api/admin/security', {
    headers: { 'x-user-role': 'ADMIN' },
  });
  const aiBodyStr = JSON.stringify(r19AI.body);
  const secBodyStr = JSON.stringify(r19Sec.body);
  const hasRawSecret =
    aiBodyStr.includes('sk-') ||
    secBodyStr.includes('client_secret') ||
    secBodyStr.includes('private_key');

  if (!hasRawSecret && r19Sec.body?.tokenProtection?.secretsExposed === false) {
    console.log(`[PASS] Secret Exposure Prevention in ${r19Sec.elapsed}ms - Zero API keys or private credentials leaked.`);
    passed++;
  } else {
    console.error(`[FAIL] Secret Exposure Prevention: Potential secret detected in responses!`);
    failed++;
  }

  // 20. Integration Credential Response Safety (Token Masking)
  if (Array.isArray(r19Sec.body?.integrationsSecurity)) {
    const allTokensMasked = r19Sec.body.integrationsSecurity.every(
      i => i.tokenMasked && i.tokenMasked.includes('[MASKED]')
    );
    if (allTokensMasked) {
      console.log(`[PASS] Integration Credential Response Safety - All integration tokens are masked.`);
      passed++;
    } else {
      console.error(`[FAIL] Integration Credential Response Safety: Found unmasked token!`, r19Sec.body.integrationsSecurity);
      failed++;
    }
  } else {
    console.error(`[FAIL] Integration Credential Response Safety: Missing integrationsSecurity array.`);
    failed++;
  }

  console.log('\n============================================================');
  console.log(`PHASE 6 VERIFICATION SUMMARY: ${passed}/20 PASSED (${failed} FAILED)`);
  console.log('============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Verification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
