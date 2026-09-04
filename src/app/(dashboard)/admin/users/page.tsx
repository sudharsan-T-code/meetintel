'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Shield,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { ALL_ROLES, UserRole } from '@/lib/auth/rbac';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED';
  department: string;
  title: string;
  createdAt: string;
}

interface InvitationRecord {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  invitedByName?: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  expiresAt: string;
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals & Actions
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('EMPLOYEE');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

  const [roleModalUser, setRoleModalUser] = useState<UserRecord | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState<UserRole>('EMPLOYEE');

  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserRecord | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: '10',
      });
      if (search) q.set('search', search);
      if (roleFilter !== 'ALL') q.set('role', roleFilter);
      if (statusFilter !== 'ALL') q.set('status', statusFilter);

      const res = await fetch(`/api/admin/users?${q.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch users.');
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/admin/invitations');
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations || []);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionInProgress(true);
    setInviteSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invitation.');

      setInviteSuccessMsg(data.delivery?.message || 'Demo invitation created successfully.');
      if (data.delivery?.invitationUrl) {
        setLastInviteUrl(data.delivery.invitationUrl);
      }
      setInviteEmail('');
      fetchInvitations();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRoleChange = async () => {
    if (!roleModalUser) return;
    setActionInProgress(true);
    try {
      const res = await fetch(`/api/admin/users/${roleModalUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newSelectedRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role.');
      setRoleModalUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleToggleStatus = async (user: UserRecord) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user status.');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDeleteUser) return;
    setActionInProgress(true);
    try {
      const res = await fetch(`/api/admin/users/${confirmDeleteUser.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user.');
      setConfirmDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRevokeInvite = async (invId: string) => {
    if (!confirm('Are you sure you want to revoke this pending invitation?')) return;
    try {
      const res = await fetch(`/api/admin/invitations/${invId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to revoke invitation.');
      fetchInvitations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1280, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={26} style={{ color: 'var(--color-primary-light)' }} /> User Directory & Invitations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Manage organization members, assign role permissions, and issue expiring invites.
          </p>
        </div>

        <button
          onClick={() => {
            setInviteModalOpen(true);
            setInviteSuccessMsg(null);
            setLastInviteUrl(null);
          }}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <UserPlus size={16} /> Invite Member
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: 16, marginBottom: 24 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: 13,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Filter size={15} style={{ color: 'var(--text-tertiary)' }} />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: 13,
              }}
            >
              <option value="ALL">All Roles</option>
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontSize: 13,
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="DEACTIVATED">DEACTIVATED</option>
            </select>

            <button type="submit" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Active Members ({users.length})</h2>
          <button onClick={fetchUsers} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>User</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Department</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge badge-${u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' ? 'primary' : u.role === 'MANAGER' ? 'info' : 'neutral'}`} style={{ fontSize: 11 }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    <div>{u.department}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{u.title}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge badge-${u.status === 'ACTIVE' ? 'success' : 'danger'}`} style={{ fontSize: 11 }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button
                        onClick={() => {
                          setRoleModalUser(u);
                          setNewSelectedRole(u.role);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        title="Change Role"
                      >
                        Role
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        title={u.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                      >
                        {u.status === 'ACTIVE' ? <UserX size={13} /> : <UserCheck size={13} />}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteUser(u)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-danger)' }}
                        title="Remove User"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--border-subtle)' }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>
              Previous
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', alignSelf: 'center' }}>
              Page {page} of {totalPages}
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>
              Next
            </button>
          </div>
        )}
      </div>

      {/* Pending Invitations Section */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mail size={18} style={{ color: 'var(--color-primary-light)' }} /> Organization Invitations ({invitations.length})
        </h2>

        {invitations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
            No pending or active invitations. Click &ldquo;Invite Member&rdquo; above to issue one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {invitations.map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{inv.email}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    Invited as <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.role}</span> • Expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`badge badge-${inv.status === 'PENDING' ? 'warning' : inv.status === 'ACCEPTED' ? 'success' : 'neutral'}`} style={{ fontSize: 10 }}>
                    {inv.status}
                  </span>
                  {inv.status === 'PENDING' && (
                    <button
                      onClick={() => handleRevokeInvite(inv.id)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: 11, color: 'var(--color-danger)' }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setInviteModalOpen(false)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: 480, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Invite Workspace Member</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Generates an expiring, single-use invitation token. External email dispatches run in verified Demo Mode.
            </p>

            <form onSubmit={handleCreateInvite}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="colleague@cognizant.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    color: 'var(--text-primary)',
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Assigned RBAC Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    color: 'var(--text-primary)',
                    fontSize: 14,
                  }}
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {inviteSuccessMsg && (
                <div style={{ padding: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ color: '#10b981', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <CheckCircle2 size={16} /> {inviteSuccessMsg}
                  </div>
                  {lastInviteUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <code style={{ fontSize: 11, background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 4, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lastInviteUrl}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin + lastInviteUrl);
                          setCopiedToken(true);
                          setTimeout(() => setCopiedToken(false), 2000);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                      >
                        {copiedToken ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setInviteModalOpen(false)} className="btn btn-secondary">
                  Close
                </button>
                <button type="submit" disabled={actionInProgress} className="btn btn-primary">
                  {actionInProgress ? 'Issuing...' : 'Create Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleModalUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setRoleModalUser(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: 440, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Change Member Role</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Update permissions for <strong style={{ color: 'var(--text-primary)' }}>{roleModalUser.name}</strong> ({roleModalUser.email}).
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                New Role
              </label>
              <select
                value={newSelectedRole}
                onChange={(e) => setNewSelectedRole(e.target.value as UserRole)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setRoleModalUser(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleRoleChange} disabled={actionInProgress} className="btn btn-primary">
                {actionInProgress ? 'Updating...' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      {confirmDeleteUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setConfirmDeleteUser(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: 440, padding: 24, border: '1px solid rgba(239, 68, 68, 0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <AlertTriangle size={24} style={{ color: 'var(--color-danger, #ef4444)' }} />
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Confirm Member Removal</h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Are you sure you want to permanently remove <strong style={{ color: 'var(--text-primary)' }}>{confirmDeleteUser.name}</strong> from the organization? This will revoke all meeting access and active sessions.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setConfirmDeleteUser(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={actionInProgress}
                className="btn btn-danger"
                style={{ backgroundColor: 'var(--color-danger, #ef4444)', color: 'white' }}
              >
                {actionInProgress ? 'Removing...' : 'Permanently Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
