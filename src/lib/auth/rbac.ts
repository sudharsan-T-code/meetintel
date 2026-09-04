export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'HR'
  | 'MANAGER'
  | 'MEETING_ORGANIZER'
  | 'EMPLOYEE';

export type Permission =
  // 1. Organization Permissions
  | 'org:manage_settings'
  | 'org:manage_users'
  | 'org:manage_integrations'
  | 'org:view_audit_logs'
  | 'org:manage_billing'
  // 2. User Management Permissions
  | 'user:view'
  | 'user:invite'
  | 'user:edit_role'
  | 'user:deactivate'
  // 3. Meeting Permissions
  | 'meeting:view'
  | 'meeting:create'
  | 'meeting:edit'
  | 'meeting:delete'
  | 'meeting:upload_recording'
  // 4. Transcripts Permissions
  | 'transcript:view'
  | 'transcript:download'
  // 5. AI Intelligence Permissions
  | 'intelligence:view_summary'
  | 'intelligence:view_decisions'
  | 'intelligence:edit_decision'
  | 'intelligence:view_actions'
  | 'intelligence:create_action'
  | 'intelligence:edit_action'
  | 'intelligence:view_risks'
  | 'intelligence:chat'
  // 6. Action Items Permissions
  | 'action:view'
  | 'action:create'
  | 'action:update'
  | 'action:delete'
  // 7. Commitments Permissions
  | 'commitment:view'
  | 'commitment:manage'
  // 8. Analytics Permissions
  | 'analytics:view_self'
  | 'analytics:view_team'
  | 'analytics:view_department'
  | 'analytics:view_organization'
  | 'analytics:view_cost'
  // 9. Integration Permissions
  | 'integration:view'
  | 'integration:manage'
  // 10. Notification Permissions
  | 'notification:manage_preferences'
  | 'notification:broadcast'
  // 11. Audit Log Permissions
  | 'audit:view_logs'
  | 'audit:export_logs'
  // 12. Security Permissions
  | 'security:view_center'
  | 'security:manage_policies'
  // 13. Settings Permissions
  | 'settings:view_profile'
  | 'settings:manage_org'
  // Export Legacy Permissions
  | 'export:pdf'
  | 'export:markdown'
  | 'export:csv'
  | 'export:json';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  HR: 60,
  MANAGER: 50,
  MEETING_ORGANIZER: 30,
  EMPLOYEE: 10,
};

export const ALL_ROLES: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'HR',
  'MANAGER',
  'MEETING_ORGANIZER',
  'EMPLOYEE',
];

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'org:manage_settings', 'org:manage_users', 'org:manage_integrations', 'org:view_audit_logs', 'org:manage_billing',
    'user:view', 'user:invite', 'user:edit_role', 'user:deactivate',
    'meeting:view', 'meeting:create', 'meeting:edit', 'meeting:delete', 'meeting:upload_recording',
    'transcript:view', 'transcript:download',
    'intelligence:view_summary', 'intelligence:view_decisions', 'intelligence:edit_decision',
    'intelligence:view_actions', 'intelligence:create_action', 'intelligence:edit_action',
    'intelligence:view_risks', 'intelligence:chat',
    'action:view', 'action:create', 'action:update', 'action:delete',
    'commitment:view', 'commitment:manage',
    'analytics:view_self', 'analytics:view_team', 'analytics:view_department', 'analytics:view_organization', 'analytics:view_cost',
    'integration:view', 'integration:manage',
    'notification:manage_preferences', 'notification:broadcast',
    'audit:view_logs', 'audit:export_logs',
    'security:view_center', 'security:manage_policies',
    'settings:view_profile', 'settings:manage_org',
    'export:pdf', 'export:markdown', 'export:csv', 'export:json',
  ],
  ADMIN: [
    'org:manage_settings', 'org:manage_users', 'org:manage_integrations', 'org:view_audit_logs',
    'user:view', 'user:invite', 'user:edit_role', 'user:deactivate',
    'meeting:view', 'meeting:create', 'meeting:edit', 'meeting:delete', 'meeting:upload_recording',
    'transcript:view', 'transcript:download',
    'intelligence:view_summary', 'intelligence:view_decisions', 'intelligence:edit_decision',
    'intelligence:view_actions', 'intelligence:create_action', 'intelligence:edit_action',
    'intelligence:view_risks', 'intelligence:chat',
    'action:view', 'action:create', 'action:update', 'action:delete',
    'commitment:view', 'commitment:manage',
    'analytics:view_self', 'analytics:view_team', 'analytics:view_department', 'analytics:view_organization', 'analytics:view_cost',
    'integration:view', 'integration:manage',
    'notification:manage_preferences',
    'audit:view_logs',
    'security:view_center', 'security:manage_policies',
    'settings:view_profile', 'settings:manage_org',
    'export:pdf', 'export:markdown', 'export:csv', 'export:json',
  ],
  HR: [
    'user:view',
    'meeting:view', 'meeting:create',
    'transcript:view',
    'intelligence:view_summary', 'intelligence:view_decisions',
    'intelligence:view_actions', 'intelligence:create_action', 'intelligence:edit_action',
    'intelligence:view_risks', 'intelligence:chat',
    'action:view', 'action:create', 'action:update',
    'commitment:view',
    'analytics:view_self', 'analytics:view_team', 'analytics:view_department', 'analytics:view_organization', 'analytics:view_cost',
    'notification:manage_preferences',
    'settings:view_profile',
    'export:pdf', 'export:markdown', 'export:csv',
  ],
  MANAGER: [
    'user:view',
    'meeting:view', 'meeting:create', 'meeting:edit', 'meeting:upload_recording',
    'transcript:view', 'transcript:download',
    'intelligence:view_summary', 'intelligence:view_decisions', 'intelligence:edit_decision',
    'intelligence:view_actions', 'intelligence:create_action', 'intelligence:edit_action',
    'intelligence:view_risks', 'intelligence:chat',
    'action:view', 'action:create', 'action:update',
    'commitment:view', 'commitment:manage',
    'analytics:view_self', 'analytics:view_team', 'analytics:view_department', 'analytics:view_cost',
    'integration:view',
    'notification:manage_preferences',
    'settings:view_profile',
    'export:pdf', 'export:markdown', 'export:csv', 'export:json',
  ],
  MEETING_ORGANIZER: [
    'meeting:view', 'meeting:create', 'meeting:edit', 'meeting:upload_recording',
    'transcript:view', 'transcript:download',
    'intelligence:view_summary', 'intelligence:view_decisions', 'intelligence:edit_decision',
    'intelligence:view_actions', 'intelligence:create_action', 'intelligence:edit_action',
    'intelligence:view_risks', 'intelligence:chat',
    'action:view', 'action:create', 'action:update',
    'commitment:view',
    'analytics:view_self',
    'notification:manage_preferences',
    'settings:view_profile',
    'export:pdf', 'export:markdown',
  ],
  EMPLOYEE: [
    'meeting:view', 'meeting:create',
    'transcript:view',
    'intelligence:view_summary', 'intelligence:view_decisions',
    'intelligence:view_actions', 'intelligence:create_action', 'intelligence:edit_action',
    'intelligence:view_risks', 'intelligence:chat',
    'action:view', 'action:create', 'action:update',
    'commitment:view',
    'analytics:view_self',
    'notification:manage_preferences',
    'settings:view_profile',
    'export:pdf', 'export:markdown',
  ],
};

export interface PermissionCategory {
  id: string;
  name: string;
  description: string;
  permissions: {
    key: Permission;
    label: string;
    description: string;
  }[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'organization',
    name: 'Organization',
    description: 'Manage tenant policies, billing, and organizational structure',
    permissions: [
      { key: 'org:manage_settings', label: 'Manage Settings', description: 'Configure organization defaults and security policies' },
      { key: 'org:manage_users', label: 'Manage Users', description: 'Invite, edit, or deactivate workspace members' },
      { key: 'org:manage_billing', label: 'Manage Billing', description: 'Access plan tier and compensation band configuration' },
    ],
  },
  {
    id: 'users',
    name: 'Users',
    description: 'User directory and identity administration',
    permissions: [
      { key: 'user:view', label: 'View Users', description: 'Browse and search members of the organization' },
      { key: 'user:invite', label: 'Invite Users', description: 'Issue secure single-use organization invitations' },
      { key: 'user:edit_role', label: 'Change Roles', description: 'Promote or demote user privilege levels' },
      { key: 'user:deactivate', label: 'Deactivate Users', description: 'Suspend or remove member access' },
    ],
  },
  {
    id: 'meetings',
    name: 'Meetings',
    description: 'Meeting scheduling, capture, and lifecycle management',
    permissions: [
      { key: 'meeting:view', label: 'View Meetings', description: 'Access organization meeting workspaces' },
      { key: 'meeting:create', label: 'Create Meetings', description: 'Ingest or schedule new meeting sessions' },
      { key: 'meeting:edit', label: 'Edit Meetings', description: 'Modify meeting metadata, titles, and participants' },
      { key: 'meeting:delete', label: 'Delete Meetings', description: 'Permanently remove meetings and recorded artifacts' },
      { key: 'meeting:upload_recording', label: 'Upload Media', description: 'Upload audio/video recordings for processing' },
    ],
  },
  {
    id: 'transcripts',
    name: 'Transcripts',
    description: 'Speech recognition, speaker attribution, and transcript export',
    permissions: [
      { key: 'transcript:view', label: 'View Transcripts', description: 'Read timestamped diarized transcripts' },
      { key: 'transcript:download', label: 'Download Transcripts', description: 'Export full transcripts in raw or formatted text' },
    ],
  },
  {
    id: 'intelligence',
    name: 'AI Intelligence',
    description: 'AI-generated summaries, executive briefs, decisions, and chat',
    permissions: [
      { key: 'intelligence:view_summary', label: 'View Summaries', description: 'Access executive summaries and topic breakdowns' },
      { key: 'intelligence:view_decisions', label: 'View Decisions', description: 'Inspect extracted organizational decisions' },
      { key: 'intelligence:edit_decision', label: 'Edit Decisions', description: 'Refine, accept, or reassign detected decisions' },
      { key: 'intelligence:view_actions', label: 'View Actions', description: 'Review AI-extracted action items' },
      { key: 'intelligence:create_action', label: 'Create Actions', description: 'Manually register action items from meetings' },
      { key: 'intelligence:edit_action', label: 'Edit Actions', description: 'Update status, priority, and assignees' },
      { key: 'intelligence:view_risks', label: 'View Risks', description: 'Examine identified project and technical risks' },
      { key: 'intelligence:chat', label: 'AI Meeting Chat', description: 'Converse with grounded AI meeting assistant' },
    ],
  },
  {
    id: 'action_items',
    name: 'Action Items',
    description: 'Tracking, assignment, and completion workflow for tasks',
    permissions: [
      { key: 'action:view', label: 'View Action Items', description: 'Access personal and team action boards' },
      { key: 'action:create', label: 'Create Action Items', description: 'Create and assign standalone action items' },
      { key: 'action:update', label: 'Update Action Items', description: 'Modify progress, due dates, and completion status' },
      { key: 'action:delete', label: 'Delete Action Items', description: 'Remove invalid or duplicate action items' },
    ],
  },
  {
    id: 'commitments',
    name: 'Commitments',
    description: 'Tracking verbal promises and deliverable agreements',
    permissions: [
      { key: 'commitment:view', label: 'View Commitments', description: 'Inspect commitments extracted from meetings' },
      { key: 'commitment:manage', label: 'Manage Commitments', description: 'Confirm, reassign, or fulfill commitments' },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Productivity trends, meeting load, participation, and cost metrics',
    permissions: [
      { key: 'analytics:view_self', label: 'Personal Analytics', description: 'View own productivity and meeting load' },
      { key: 'analytics:view_team', label: 'Team Analytics', description: 'Analyze team meeting distribution and participation' },
      { key: 'analytics:view_department', label: 'Department Analytics', description: 'View department-level productivity scores' },
      { key: 'analytics:view_organization', label: 'Organization Analytics', description: 'Executive level dashboard across the tenant' },
      { key: 'analytics:view_cost', label: 'Cost Analysis', description: 'Estimate financial cost of meetings' },
    ],
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Calendar and video conferencing sync (Google, Microsoft, Zoom, Teams)',
    permissions: [
      { key: 'integration:view', label: 'View Integrations', description: 'Inspect connected enterprise services' },
      { key: 'integration:manage', label: 'Manage Integrations', description: 'Connect, synchronize, or disconnect calendar providers' },
    ],
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'In-app notification triggers and personal delivery preferences',
    permissions: [
      { key: 'notification:manage_preferences', label: 'Manage Preferences', description: 'Configure notification trigger preferences' },
      { key: 'notification:broadcast', label: 'Broadcast Notifications', description: 'Send tenant-wide security and system updates' },
    ],
  },
  {
    id: 'audit_logs',
    name: 'Audit Logs',
    description: 'Immutable compliance logging for security and governance',
    permissions: [
      { key: 'audit:view_logs', label: 'View Audit Logs', description: 'Inspect chronological compliance log stream' },
      { key: 'audit:export_logs', label: 'Export Audit Logs', description: 'Export tamper-evident audit records' },
    ],
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Authentication monitoring, encryption checks, and posture',
    permissions: [
      { key: 'security:view_center', label: 'View Security Center', description: 'Inspect token protection and security posture' },
      { key: 'security:manage_policies', label: 'Manage Security Policies', description: 'Configure MFA, session expiry, and IP rules' },
    ],
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'User profile, personalization, and workspace preferences',
    permissions: [
      { key: 'settings:view_profile', label: 'Profile Settings', description: 'Update user display name, timezone, and avatar' },
      { key: 'settings:manage_org', label: 'Organization Settings', description: 'Configure global workspace policies and defaults' },
    ],
  },
];

/**
 * Checks if a specific role possesses a particular permission.
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const normalizedRole = role.toUpperCase().replace('-', '_') as UserRole;
  const permissions = ROLE_PERMISSIONS[normalizedRole];
  return Boolean(permissions && permissions.includes(permission));
}

/**
 * Checks if a role satisfies a minimum hierarchy rank.
 */
export function hasMinimumRole(userRole: string, minimumRole: UserRole): boolean {
  const normalizedUserRole = userRole.toUpperCase().replace('-', '_') as UserRole;
  const userRank = ROLE_HIERARCHY[normalizedUserRole] ?? 0;
  const targetRank = ROLE_HIERARCHY[minimumRole] ?? 0;
  return userRank >= targetRank;
}

/**
 * Validates meeting access based on user role and organization.
 */
export function canAccessMeeting(
  user: { id: string; organizationId: string; role: string },
  meeting: { organizationId: string; organizerId?: string | null }
): boolean {
  if (user.organizationId !== meeting.organizationId) {
    return false;
  }
  // Admins & Managers have org-wide access
  if (hasMinimumRole(user.role, 'MANAGER')) {
    return true;
  }
  // Organizers have access to their own meetings
  if (meeting.organizerId === user.id) {
    return true;
  }
  // Employees can view standard meetings within their org
  return hasPermission(user.role, 'meeting:view');
}

/**
 * Generates the complete role-permission matrix data for visualization.
 */
export function getRolePermissionMatrix() {
  return PERMISSION_CATEGORIES.map(category => ({
    ...category,
    permissions: category.permissions.map(perm => ({
      ...perm,
      roles: ALL_ROLES.reduce((acc, role) => {
        acc[role] = (ROLE_PERMISSIONS[role] || []).includes(perm.key);
        return acc;
      }, {} as Record<UserRole, boolean>),
    })),
  }));
}

