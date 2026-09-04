'use client';

import { useState, useEffect } from 'react';
import {
  KeyRound,
  Shield,
  Check,
  Minus,
  Info,
  Lock,
  RefreshCw,
  Building2,
  Users,
  Calendar,
  FileText,
  Brain,
  ListChecks,
  GitBranch,
  BarChart3,
  Link2,
  Bell,
  Sliders,
} from 'lucide-react';
import { ALL_ROLES, UserRole } from '@/lib/auth/rbac';

interface PermissionItem {
  key: string;
  label: string;
  description: string;
  roles: Record<UserRole, boolean>;
}

interface PermissionCategory {
  id: string;
  name: string;
  description: string;
  permissions: PermissionItem[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  organization: <Building2 size={16} />,
  users: <Users size={16} />,
  meetings: <Calendar size={16} />,
  transcripts: <FileText size={16} />,
  intelligence: <Brain size={16} />,
  action_items: <ListChecks size={16} />,
  commitments: <GitBranch size={16} />,
  analytics: <BarChart3 size={16} />,
  integrations: <Link2 size={16} />,
  notifications: <Bell size={16} />,
  audit_logs: <FileText size={16} />,
  security: <Lock size={16} />,
  settings: <Sliders size={16} />,
};

export default function RolesAndPermissionsPage() {
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const filteredCategories =
    activeTab === 'ALL'
      ? categories
      : categories.filter((c) => c.id === activeTab);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1320, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
            Role-Based Access Control (RBAC) Matrix
          </h1>
          <span className="badge badge-primary" style={{ fontSize: 11, fontWeight: 700 }}>
            13 Categories
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Comprehensive view of enterprise permissions mapped across the 6 standard organizational roles. Server-side authorization enforced on all operations.
        </p>
      </div>

      {/* Role Summary Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {ALL_ROLES.map((role) => (
          <div key={role} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Role
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2, color: role === 'ADMIN' || role === 'SUPER_ADMIN' ? 'var(--color-primary-light)' : 'var(--text-primary)' }}>
              {role}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
              {role === 'SUPER_ADMIN' && 'Full Tenant Authority'}
              {role === 'ADMIN' && 'Enterprise Governance'}
              {role === 'HR' && 'People & Culture Analytics'}
              {role === 'MANAGER' && 'Team & Department Scoped'}
              {role === 'MEETING_ORGANIZER' && 'Meeting Creation & Media'}
              {role === 'EMPLOYEE' && 'Standard Workspace Member'}
            </div>
          </div>
        ))}
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`btn ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 14px', fontSize: 12, borderRadius: 20, whiteSpace: 'nowrap' }}
        >
          All Categories ({categories.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveTab(c.id)}
            className={`btn ${activeTab === c.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: 12, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
          >
            {CATEGORY_ICONS[c.id]}
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Permissions Matrix */}
      {loading ? (
        <div style={{ height: 300, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }} className="skeleton" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ color: 'var(--color-primary-light)' }}>{CATEGORY_ICONS[cat.id]}</div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700 }}>{cat.name}</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{cat.description}</p>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11, width: '35%' }}>
                        PERMISSION & SCOPE
                      </th>
                      {ALL_ROLES.map((r) => (
                        <th
                          key={r}
                          style={{
                            textAlign: 'center',
                            padding: '10px 8px',
                            color: 'var(--text-tertiary)',
                            fontWeight: 600,
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {r}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cat.permissions.map((perm) => (
                      <tr key={perm.key} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{perm.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{perm.description}</div>
                          <code style={{ fontSize: 10, color: 'var(--color-primary-light)', background: 'rgba(99,102,241,0.08)', padding: '1px 5px', borderRadius: 4, marginTop: 4, display: 'inline-block' }}>
                            {perm.key}
                          </code>
                        </td>
                        {ALL_ROLES.map((r) => {
                          const allowed = perm.roles[r];
                          return (
                            <td key={r} style={{ textAlign: 'center', padding: '12px 8px' }}>
                              {allowed ? (
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    color: '#10b981',
                                  }}
                                >
                                  <Check size={14} strokeWidth={3} />
                                </div>
                              ) : (
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    color: 'var(--text-muted, #475569)',
                                  }}
                                >
                                  <Minus size={14} />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
