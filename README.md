# MEETINTEL — Enterprise Meeting Productivity & Intelligence Platform
### Smart India Hackathon 2026 (SIH-2026) Final Release Candidate

MEETINTEL is an enterprise-grade meeting intelligence, productivity analytics, and automated decision-tracking platform. It ingests meeting audio/transcripts, performs grounded AI analysis, generates multi-level executive briefings, tracks decisions and action items, quantifies meeting organizational load/waste, and enforces strict multi-tenant isolation and 6-tier RBAC governance.

---

## 🌟 Key Highlights & Capabilities

- **Audio & Transcript Ingestion**: Ingests audio files and transcripts with speaker diarization and millisecond-accurate timestamps.
- **Grounded AI Intelligence**: Multi-level executive summaries (30-second briefing, structured takeaways), deterministic decision detection, action item extraction, risk severity classification, and interactive meeting AI chat with verifiable citations.
- **Executive Analytics & Waste Detection**: Computes aggregate meeting volume, cost estimation, time allocation by department, and identifies reclaimable meeting waste (with rupee cost savings).
- **Personal Productivity Suite**: Tracks focus hours, task completion velocity, commitment fulfillment, and provides personalized AI coaching.
- **Enterprise Integrations**: Connectors for Google Calendar, Google Meet, Microsoft Teams, Outlook Calendar, and Zoom with AES-256 encrypted credential storage and idempotent bi-directional sync.
- **Multi-Tenant Isolation & 6-Tier RBAC**: Strict tenant isolation across all DB models and API endpoints with role-based governance (`SUPER_ADMIN`, `ADMIN`, `HR`, `MANAGER`, `MEETING_ORGANIZER`, `EMPLOYEE`).
- **Zero-Dependency Demo Mode**: Runs immediately with rich enterprise mock data and offline fallback without requiring live PostgreSQL or paid third-party AI keys.

---

## 🚀 Quick Start (Demo Mode)

MEETINTEL is configured to run in demo enterprise mode out-of-the-box with zero external service requirements.

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env
```
Default `.env` settings provide instant demo evaluation:
- `DEFAULT_AI_PROVIDER="demo"`
- `DEFAULT_SPEECH_PROVIDER="demo"`
- `NEXT_PUBLIC_DEMO_MODE="true"`

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Production Build & Release

To compile and launch the optimized production server:

```bash
# Validate database schema
npx prisma validate

# Type-check TypeScript codebase (0 errors)
npx tsc --noEmit

# Lint source code
npm run lint

# Compile production bundle
npm run build

# Start production server
npm run start
```

---

## 🧪 Comprehensive Verification Suites

All test suites verify live endpoints against `http://localhost:3000`:

| Suite | Script | Scope | Result |
|---|---|---|---|
| **Phase 3 Regression** | `node scripts/test-api-e2e.mjs` | AI pipeline, decisions, chat citations, idempotency | **8/8 PASS** |
| **Phase 4 Regression** | `node scripts/test-phase4-apis.mjs` | Executive analytics, volume, waste detection | **11/11 PASS** |
| **Phase 5 Regression** | `node scripts/test-phase5-apis.mjs` | Integrations sync, actions, commitments, notifications | **16/16 PASS** |
| **Phase 6 Regression** | `node scripts/test-phase6-apis.mjs` | RBAC governance, tenant boundary, secret protection | **20/20 PASS** |
| **Phase 7 Browser E2E** | `node scripts/test-phase7-browser.mjs` | 22 routes, 3 responsive viewports, 26-step user journey | **51/51 PASS** |
| **Phase 7 Final** | `node scripts/test-phase7-final.mjs` | Health, token privacy, citations, idempotency | **16/16 PASS** |
| **Total Automated Tests** | — | Comprehensive end-to-end platform verification | **122/122 PASS (100%)** |

---

## 🔒 Security & Privacy Architecture

- **Token Encryption**: Integration access tokens and credentials encrypted using AES-256-GCM.
- **Multi-Tenant Scoping**: All database queries and memory store fallbacks enforce strict tenant IDs.
- **Zero Raw Secret Exposure**: Sensitive tokens masked in API responses (`sk-***`); client bundles contain zero private keys.
- **Strict Role-Based Access Control**: Sensitive routes (`/admin/*`) strictly restricted to authorized administrative roles.
- **Immutable Audit Logging**: Governance actions, invites, and security events logged with tamper-proof timestamps.

---

## 📄 License
Proprietary — Developed for Smart India Hackathon 2026. All rights reserved.
