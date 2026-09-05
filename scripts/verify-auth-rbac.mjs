/**
 * MEETINTEL — AUTH & RBAC VERIFICATION SUITE
 * Tests enterprise authentication, persona switching, session cookies, and RBAC enforcement.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

let passed = 0;
let failed = 0;

function pass(name, detail = '') {
  passed++;
  console.log(`[PASS] ${name}${detail ? ` - ${detail}` : ''}`);
}

function fail(name, err) {
  failed++;
  console.error(`[FAIL] ${name}:`, err);
}

async function testFetch(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, options);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  return { status: res.status, body, headers: res.headers };
}

async function runAuthRbacVerification() {
  console.log('============================================================');
  console.log('MEETINTEL — AUTHENTICATION & RBAC GOVERNANCE TEST SUITE');
  console.log('============================================================\n');

  // Test 1: Default session retrieval (Manager / Priya Sharma)
  const defaultSession = await testFetch('/api/auth/session');
  if (defaultSession.status === 200 && defaultSession.body?.authenticated && defaultSession.body?.user?.name === 'Priya Sharma') {
    pass('Default Session Retrieval', `User: ${defaultSession.body.user.name} (${defaultSession.body.user.role})`);
  } else {
    fail('Default Session Retrieval', defaultSession);
  }

  // Test 2: Unauthenticated access to /api/admin/overview -> 401
  const unauthAdmin = await testFetch('/api/admin/overview', {
    headers: { 'x-user-role': 'UNAUTHENTICATED' },
  });
  if (unauthAdmin.status === 401) {
    pass('Unauthenticated Admin Access Blocked', `Status: 401 (${unauthAdmin.body?.error})`);
  } else {
    fail('Unauthenticated Admin Access Blocked', `Expected 401, got ${unauthAdmin.status}`);
  }

  // Test 3: Non-admin access with default session -> 403 Forbidden
  const defaultAdmin = await testFetch('/api/admin/overview');
  if (defaultAdmin.status === 403) {
    pass('Default Manager Role Blocked from /admin', `Status: 403 (${defaultAdmin.body?.error})`);
  } else {
    fail('Default Manager Role Blocked from /admin', `Expected 403, got ${defaultAdmin.status}`);
  }

  // Test 4: Header-based ADMIN access -> 200 OK
  const headerAdmin = await testFetch('/api/admin/overview', {
    headers: { 'x-user-role': 'ADMIN' },
  });
  if (headerAdmin.status === 200 && (headerAdmin.body?.metrics || headerAdmin.body?.summary)) {
    const userCount = headerAdmin.body.metrics?.totalUsers ?? headerAdmin.body.summary?.totalUsers;
    pass('Header-Based Admin Access Allowed', `Status: 200 (Total users: ${userCount})`);
  } else {
    fail('Header-Based Admin Access Allowed', headerAdmin);
  }

  // Test 5: Login as Enterprise Admin via POST /api/auth/login
  const loginAdmin = await testFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@cognizant.com' }),
  });
  const setCookie = loginAdmin.headers.get('set-cookie');
  if (loginAdmin.status === 200 && loginAdmin.body?.user?.role === 'ADMIN' && setCookie) {
    pass('Login as Enterprise Admin (Rajesh Kumar)', `Role: ${loginAdmin.body.user.role} | Cookie: present`);
  } else {
    fail('Login as Enterprise Admin (Rajesh Kumar)', loginAdmin);
  }

  // Extract session cookie
  const sessionCookie = setCookie ? setCookie.split(';')[0] : '';

  // Test 6: Authenticated Session with Admin Cookie
  const cookieSession = await testFetch('/api/auth/session', {
    headers: { Cookie: sessionCookie },
  });
  if (cookieSession.status === 200 && cookieSession.body?.user?.id === 'user-admin-001' && cookieSession.body?.user?.role === 'ADMIN') {
    pass('Session Verification via Cookie', `User: ${cookieSession.body.user.name} (${cookieSession.body.user.role})`);
  } else {
    fail('Session Verification via Cookie', cookieSession);
  }

  // Test 7: Admin Overview API with Cookie -> 200 OK
  const cookieAdminOverview = await testFetch('/api/admin/overview', {
    headers: { Cookie: sessionCookie },
  });
  if (cookieAdminOverview.status === 200 && (cookieAdminOverview.body?.metrics || cookieAdminOverview.body?.summary)) {
    const count = cookieAdminOverview.body.metrics?.totalUsers ?? cookieAdminOverview.body.summary?.totalUsers;
    pass('Cookie-Based Admin Access to /api/admin/overview', `Status: 200 | Users: ${count}`);
  } else {
    fail('Cookie-Based Admin Access to /api/admin/overview', cookieAdminOverview);
  }

  // Test 8: Admin Users API with Cookie -> 200 OK
  const cookieAdminUsers = await testFetch('/api/admin/users', {
    headers: { Cookie: sessionCookie },
  });
  if (cookieAdminUsers.status === 200 && Array.isArray(cookieAdminUsers.body?.users)) {
    pass('Cookie-Based Admin Access to /api/admin/users', `Users count: ${cookieAdminUsers.body.users.length}`);
  } else {
    fail('Cookie-Based Admin Access to /api/admin/users', cookieAdminUsers);
  }

  // Test 9: Admin Roles API with Cookie -> 200 OK
  const cookieAdminRoles = await testFetch('/api/admin/roles', {
    headers: { Cookie: sessionCookie },
  });
  if (cookieAdminRoles.status === 200 && Array.isArray(cookieAdminRoles.body?.roles)) {
    pass('Cookie-Based Admin Access to /api/admin/roles', `Roles count: ${cookieAdminRoles.body.roles.length}`);
  } else {
    fail('Cookie-Based Admin Access to /api/admin/roles', cookieAdminRoles);
  }

  // Test 10: Switch persona to Employee (Ananya Patel)
  const loginEmployee = await testFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ananya.patel@meetintel.ai' }),
  });
  const employeeCookie = loginEmployee.headers.get('set-cookie')?.split(';')[0] || '';
  if (loginEmployee.status === 200 && loginEmployee.body?.user?.role === 'EMPLOYEE') {
    pass('Login as Employee Persona (Ananya Patel)', `Role: ${loginEmployee.body.user.role}`);
  } else {
    fail('Login as Employee Persona (Ananya Patel)', loginEmployee);
  }

  // Test 11: Employee Cookie accessing Admin API -> 403 Forbidden
  const employeeAdminBlocked = await testFetch('/api/admin/overview', {
    headers: { Cookie: employeeCookie },
  });
  if (employeeAdminBlocked.status === 403) {
    pass('Employee Persona Blocked from Admin API', `Status: 403 (${employeeAdminBlocked.body?.error})`);
  } else {
    fail('Employee Persona Blocked from Admin API', `Expected 403, got ${employeeAdminBlocked.status}`);
  }

  // Test 12: Logout -> Clears Cookie
  const logoutRes = await testFetch('/api/auth/logout', {
    method: 'POST',
    headers: { Cookie: sessionCookie },
  });
  const logoutCookie = logoutRes.headers.get('set-cookie');
  if (logoutRes.status === 200 && logoutCookie && logoutCookie.includes('Max-Age=0')) {
    pass('Logout Endpoint Clears Session Cookie', 'Max-Age=0 returned');
  } else {
    fail('Logout Endpoint Clears Session Cookie', logoutRes);
  }

  console.log('\n============================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthRbacVerification().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
