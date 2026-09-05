'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Shield,
  Lock,
  ArrowRight,
  CheckCircle2,
  Users,
  Briefcase,
  Code,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

const DEMO_ACCOUNTS = [
  {
    key: 'admin',
    name: 'Rajesh Kumar',
    role: 'Enterprise Admin',
    title: 'Chief Technology Officer',
    email: 'admin@cognizant.com',
    badge: 'ADMIN',
    icon: <Shield size={18} color="#818cf8" />,
    target: '/admin',
  },
  {
    key: 'manager',
    name: 'Priya Sharma',
    role: 'Engineering Manager',
    title: 'Senior Engineering Manager',
    email: 'priya.sharma@cognizant.com',
    badge: 'MANAGER',
    icon: <Briefcase size={18} color="#38bdf8" />,
    target: '/dashboard',
  },
  {
    key: 'product',
    name: 'Sarah Chen',
    role: 'Product Lead',
    title: 'Principal Product Manager',
    email: 'sarah.chen@cognizant.com',
    badge: 'MANAGER',
    icon: <Users size={18} color="#34d399" />,
    target: '/dashboard',
  },
  {
    key: 'employee',
    name: 'Ananya Patel',
    role: 'Staff Engineer',
    title: 'Staff Frontend Engineer',
    email: 'ananya.patel@cognizant.com',
    badge: 'EMPLOYEE',
    icon: <Code size={18} color="#fbbf24" />,
    target: '/dashboard',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { switchPersona, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your enterprise email.');
      return;
    }
    setLoading(true);
    setError(null);

    const success = await login(email, password);
    if (success) {
      if (email.toLowerCase().includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError('Authentication failed. Please verify your credentials.');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setLoading(true);
    setError(null);
    const success = await switchPersona(account.key);
    if (success) {
      router.push(account.target);
    } else {
      setError(`Failed to authenticate as ${account.name}.`);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        backgroundImage:
          'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
            marginBottom: 16,
          }}
        >
          <Brain size={30} color="#ffffff" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
          MEETINTEL
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6 }}>
          Autonomous Enterprise Meeting Intelligence & Productivity Platform
        </p>
      </div>

      {/* Main Authentication Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px 0' }}>
            Enterprise Sign In
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            Sign in with your organization credentials or choose a demo persona below.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
              color: '#fca5a5',
              fontSize: 13,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleCredentialsLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              Work Email
            </label>
            <input
              type="email"
              placeholder="name@cognizant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                color: '#ffffff',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
                Password
              </label>
              <span style={{ fontSize: 11, color: '#818cf8', cursor: 'pointer' }}>
                Forgot?
              </span>
            </div>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                color: '#ffffff',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: 4,
              backgroundColor: '#4f46e5',
              backgroundImage: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
              transition: 'opacity 0.15s ease',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            <span>Sign In to Workspace</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0 20px',
            color: '#64748b',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
          <span style={{ padding: '0 12px' }}>Or 1-Click Demo Evaluation</span>
          <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
        </div>

        {/* Quick Demo Personas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.key}
              onClick={() => handleQuickLogin(account)}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 10,
                cursor: loading ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                color: '#f8fafc',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {account.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{account.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{account.title}</div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 7px',
                  borderRadius: 6,
                  backgroundColor:
                    account.badge === 'ADMIN'
                      ? 'rgba(99, 102, 241, 0.2)'
                      : 'rgba(255, 255, 255, 0.06)',
                  color: account.badge === 'ADMIN' ? '#a5b4fc' : '#94a3b8',
                }}
              >
                {account.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Security & Compliance Footer */}
      <div
        style={{
          marginTop: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          color: '#64748b',
          fontSize: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle2 size={14} color="#10b981" />
          <span>SOC 2 Type II Certified</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lock size={14} color="#10b981" />
          <span>256-bit AES Encryption</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} color="#818cf8" />
          <span>Zero Data Retention AI</span>
        </div>
      </div>
    </div>
  );
}
