// ============================================================
// MEETINTEL - Realistic Demo Data Generator
// "Global Product & Engineering Strategy Meeting"
// 487 participants, 12 major speakers, 1h 42m
// ============================================================

import {
  Meeting,
  Speaker,
  TranscriptSegment,
  Topic,
  Decision,
  ActionItem,
  Risk,
  MeetingQuestion,
  Commitment,
  ImportantMoment,
  MeetingSummary,
  MissedMeetingInsight,
  MeetingIntelligence,
  MeetingAnalytics,
  ProductivityScore,
  MeetingCost,
  User,
  Organization,
  Notification,
  AuditLogEntry,
} from '@/types';

// ---- Organization ----
export const demoOrganization: Organization = {
  id: 'org-meetintel-demo',
  name: 'Cognizant Technology Solutions',
  domain: 'cognizant.com',
  settings: {
    transcriptRetentionDays: 365,
    recordingRetentionDays: 180,
    aiProcessingEnabled: true,
    meetingConsentRequired: true,
    externalSharingEnabled: false,
    exportPermissions: ['pdf', 'markdown', 'csv', 'json'],
    compensationBands: [
      { role: 'Senior Vice President', estimatedHourlyCostINR: 15000 },
      { role: 'Vice President', estimatedHourlyCostINR: 10000 },
      { role: 'Director', estimatedHourlyCostINR: 7500 },
      { role: 'Senior Manager', estimatedHourlyCostINR: 5000 },
      { role: 'Manager', estimatedHourlyCostINR: 3500 },
      { role: 'Lead', estimatedHourlyCostINR: 2500 },
      { role: 'Senior Engineer', estimatedHourlyCostINR: 2000 },
      { role: 'Engineer', estimatedHourlyCostINR: 1500 },
    ],
  },
  createdAt: '2024-01-15T09:00:00Z',
};

// ---- Demo User ----
export const demoUser: User = {
  id: 'user-demo-001',
  organizationId: 'org-meetintel-demo',
  email: 'priya.sharma@cognizant.com',
  name: 'Priya Sharma',
  role: 'manager',
  department: 'Engineering',
  title: 'Senior Engineering Manager',
  projects: ['Project Phoenix', 'Cloud Migration', 'Platform Modernization'],
  topicsOfInterest: ['Cloud Migration', 'Infrastructure', 'Security', 'AI Strategy'],
  peopleOfInterest: ['Rajesh Kumar', 'Sarah Chen', 'Alex Thompson'],
  createdAt: '2024-01-15T09:00:00Z',
};

// ---- Speakers ----
export const demoSpeakers: Speaker[] = [
  {
    id: 'spk-001',
    meetingId: 'mtg-demo-001',
    name: 'Rajesh Kumar',
    speakerLabel: 'Rajesh Kumar',
    isIdentified: true,
    role: 'Chief Technology Officer',
    department: 'Technology',
    speakingDuration: 1122, // 18m 42s
    speakingPercentage: 18.2,
    contributionCount: 24,
    topicsDiscussed: ['Cloud Migration', 'AI Strategy', 'Infrastructure', 'Security'],
    decisionsInfluenced: ['dec-001', 'dec-002', 'dec-005'],
    actionsCreated: ['act-001', 'act-003'],
    questionsAsked: 3,
    questionsAnswered: 7,
    commitmentsMade: 2,
    segments: [],
  },
  {
    id: 'spk-002',
    meetingId: 'mtg-demo-001',
    name: 'Sarah Chen',
    speakerLabel: 'Sarah Chen',
    isIdentified: true,
    role: 'VP of Engineering',
    department: 'Engineering',
    speakingDuration: 954, // 15m 54s
    speakingPercentage: 15.5,
    contributionCount: 19,
    topicsDiscussed: ['Cloud Migration', 'Product Launch', 'Infrastructure'],
    decisionsInfluenced: ['dec-001', 'dec-003'],
    actionsCreated: ['act-002', 'act-004'],
    questionsAsked: 5,
    questionsAnswered: 4,
    commitmentsMade: 3,
    segments: [],
  },
  {
    id: 'spk-003',
    meetingId: 'mtg-demo-001',
    name: 'Michael Rodriguez',
    speakerLabel: 'Michael Rodriguez',
    isIdentified: true,
    role: 'Head of Product',
    department: 'Product',
    speakingDuration: 780, // 13m
    speakingPercentage: 12.7,
    contributionCount: 16,
    topicsDiscussed: ['Product Launch', 'Customer Escalations', 'AI Strategy'],
    decisionsInfluenced: ['dec-003', 'dec-006'],
    actionsCreated: ['act-005'],
    questionsAsked: 4,
    questionsAnswered: 3,
    commitmentsMade: 2,
    segments: [],
  },
  {
    id: 'spk-004',
    meetingId: 'mtg-demo-001',
    name: 'Ananya Patel',
    speakerLabel: 'Ananya Patel',
    isIdentified: true,
    role: 'Chief Information Security Officer',
    department: 'Security',
    speakingDuration: 660, // 11m
    speakingPercentage: 10.7,
    contributionCount: 14,
    topicsDiscussed: ['Cybersecurity', 'Cloud Migration', 'Compliance'],
    decisionsInfluenced: ['dec-002', 'dec-004'],
    actionsCreated: ['act-006', 'act-007'],
    questionsAsked: 6,
    questionsAnswered: 2,
    commitmentsMade: 1,
    segments: [],
  },
  {
    id: 'spk-005',
    meetingId: 'mtg-demo-001',
    name: 'David Kim',
    speakerLabel: 'David Kim',
    isIdentified: true,
    role: 'Director of DevOps',
    department: 'Infrastructure',
    speakingDuration: 540, // 9m
    speakingPercentage: 8.8,
    contributionCount: 12,
    topicsDiscussed: ['Infrastructure', 'Cloud Migration', 'Budget'],
    decisionsInfluenced: ['dec-001'],
    actionsCreated: ['act-008', 'act-009'],
    questionsAsked: 2,
    questionsAnswered: 5,
    commitmentsMade: 3,
    segments: [],
  },
  {
    id: 'spk-006',
    meetingId: 'mtg-demo-001',
    name: 'Lisa Thompson',
    speakerLabel: 'Lisa Thompson',
    isIdentified: true,
    role: 'VP of Finance',
    department: 'Finance',
    speakingDuration: 480, // 8m
    speakingPercentage: 7.8,
    contributionCount: 10,
    topicsDiscussed: ['Budget', 'Cloud Migration', 'Meeting Cost'],
    decisionsInfluenced: ['dec-007'],
    actionsCreated: ['act-010'],
    questionsAsked: 3,
    questionsAnswered: 1,
    commitmentsMade: 1,
    segments: [],
  },
  {
    id: 'spk-007',
    meetingId: 'mtg-demo-001',
    name: 'Alex Thompson',
    speakerLabel: 'Alex Thompson',
    isIdentified: true,
    role: 'Principal Architect',
    department: 'Architecture',
    speakingDuration: 420, // 7m
    speakingPercentage: 6.8,
    contributionCount: 9,
    topicsDiscussed: ['Cloud Migration', 'Infrastructure', 'AI Strategy'],
    decisionsInfluenced: ['dec-001', 'dec-005'],
    actionsCreated: ['act-011'],
    questionsAsked: 1,
    questionsAnswered: 4,
    commitmentsMade: 2,
    segments: [],
  },
  {
    id: 'spk-008',
    meetingId: 'mtg-demo-001',
    name: 'Fatima Al-Hassan',
    speakerLabel: 'Fatima Al-Hassan',
    isIdentified: true,
    role: 'Director of AI/ML',
    department: 'AI & Data Science',
    speakingDuration: 360, // 6m
    speakingPercentage: 5.9,
    contributionCount: 8,
    topicsDiscussed: ['AI Strategy', 'Product Launch', 'Infrastructure'],
    decisionsInfluenced: ['dec-005', 'dec-006'],
    actionsCreated: ['act-012'],
    questionsAsked: 2,
    questionsAnswered: 3,
    commitmentsMade: 1,
    segments: [],
  },
  {
    id: 'spk-009',
    meetingId: 'mtg-demo-001',
    name: 'James O\'Brien',
    speakerLabel: 'James O\'Brien',
    isIdentified: true,
    role: 'Senior Director, Customer Success',
    department: 'Customer Success',
    speakingDuration: 300, // 5m
    speakingPercentage: 4.9,
    contributionCount: 7,
    topicsDiscussed: ['Customer Escalations', 'Product Launch'],
    decisionsInfluenced: ['dec-006'],
    actionsCreated: ['act-013'],
    questionsAsked: 3,
    questionsAnswered: 1,
    commitmentsMade: 1,
    segments: [],
  },
  {
    id: 'spk-010',
    meetingId: 'mtg-demo-001',
    name: 'Wei Zhang',
    speakerLabel: 'Wei Zhang',
    isIdentified: true,
    role: 'Engineering Lead',
    department: 'Platform Engineering',
    speakingDuration: 240, // 4m
    speakingPercentage: 3.9,
    contributionCount: 6,
    topicsDiscussed: ['Infrastructure', 'Cloud Migration'],
    decisionsInfluenced: [],
    actionsCreated: ['act-014'],
    questionsAsked: 2,
    questionsAnswered: 2,
    commitmentsMade: 1,
    segments: [],
  },
  {
    id: 'spk-011',
    meetingId: 'mtg-demo-001',
    name: 'Priya Sharma',
    speakerLabel: 'Priya Sharma',
    isIdentified: true,
    role: 'Senior Engineering Manager',
    department: 'Engineering',
    speakingDuration: 180, // 3m
    speakingPercentage: 2.9,
    contributionCount: 5,
    topicsDiscussed: ['Cloud Migration', 'Project Phoenix'],
    decisionsInfluenced: [],
    actionsCreated: [],
    questionsAsked: 3,
    questionsAnswered: 1,
    commitmentsMade: 0,
    segments: [],
  },
  {
    id: 'spk-012',
    meetingId: 'mtg-demo-001',
    name: 'Tom Williams',
    speakerLabel: 'Tom Williams',
    isIdentified: true,
    role: 'VP of Human Resources',
    department: 'Human Resources',
    speakingDuration: 120, // 2m
    speakingPercentage: 1.9,
    contributionCount: 4,
    topicsDiscussed: ['Budget', 'Meeting Cost'],
    decisionsInfluenced: [],
    actionsCreated: [],
    questionsAsked: 1,
    questionsAnswered: 0,
    commitmentsMade: 0,
    segments: [],
  },
];

// ---- Topics ----
export const demoTopics: Topic[] = [
  {
    id: 'top-001',
    meetingId: 'mtg-demo-001',
    name: 'Cloud Migration Strategy',
    duration: 1620, // 27 minutes
    startTime: 180,
    endTime: 1800,
    speakerIds: ['spk-001', 'spk-002', 'spk-005', 'spk-007', 'spk-010'],
    speakerNames: ['Rajesh Kumar', 'Sarah Chen', 'David Kim', 'Alex Thompson', 'Wei Zhang'],
    summary: 'Comprehensive discussion on migrating authentication and core platform services to AWS. The engineering team proposed a phased migration approach starting with the authentication service, followed by the API gateway and data services. Key concerns around security compliance and cost optimization were raised.',
    decisions: ['dec-001', 'dec-002'],
    actions: ['act-001', 'act-008', 'act-009', 'act-011'],
    risks: ['risk-001', 'risk-002'],
    segmentIds: ['seg-003', 'seg-004', 'seg-005', 'seg-006', 'seg-007', 'seg-008', 'seg-009', 'seg-010'],
  },
  {
    id: 'top-002',
    meetingId: 'mtg-demo-001',
    name: 'Cybersecurity & Compliance',
    duration: 840, // 14 minutes
    startTime: 1800,
    endTime: 2640,
    speakerIds: ['spk-004', 'spk-001', 'spk-007'],
    speakerNames: ['Ananya Patel', 'Rajesh Kumar', 'Alex Thompson'],
    summary: 'Security team raised critical concerns about the current vulnerability assessment findings. Ananya Patel presented the Q3 security audit results showing 12 high-priority vulnerabilities that must be addressed before the cloud migration. SOC 2 Type II certification timeline was discussed.',
    decisions: ['dec-004'],
    actions: ['act-006', 'act-007'],
    risks: ['risk-003', 'risk-004'],
    segmentIds: ['seg-011', 'seg-012', 'seg-013', 'seg-014', 'seg-015'],
  },
  {
    id: 'top-003',
    meetingId: 'mtg-demo-001',
    name: 'Product Launch - Project Phoenix',
    duration: 1080, // 18 minutes
    startTime: 2640,
    endTime: 3720,
    speakerIds: ['spk-003', 'spk-002', 'spk-008', 'spk-009'],
    speakerNames: ['Michael Rodriguez', 'Sarah Chen', 'Fatima Al-Hassan', 'James O\'Brien'],
    summary: 'Project Phoenix launch timeline review. The mobile app dependency was identified as a critical blocker. The product team confirmed that the launch will slip by approximately one week due to the mobile release dependency. Customer success team reported three enterprise clients awaiting the launch.',
    decisions: ['dec-003', 'dec-006'],
    actions: ['act-005', 'act-013'],
    risks: ['risk-005', 'risk-006'],
    segmentIds: ['seg-016', 'seg-017', 'seg-018', 'seg-019', 'seg-020', 'seg-021'],
  },
  {
    id: 'top-004',
    meetingId: 'mtg-demo-001',
    name: 'Budget & Cost Optimization',
    duration: 540, // 9 minutes
    startTime: 3720,
    endTime: 4260,
    speakerIds: ['spk-006', 'spk-001', 'spk-005', 'spk-012'],
    speakerNames: ['Lisa Thompson', 'Rajesh Kumar', 'David Kim', 'Tom Williams'],
    summary: 'Finance raised concerns about cloud infrastructure costs exceeding Q4 projections by 23%. A revised cost estimate is required before final deployment approval. The team discussed potential savings through reserved instances and right-sizing. HR flagged the need for additional headcount for the cloud team.',
    decisions: ['dec-007'],
    actions: ['act-010'],
    risks: ['risk-007'],
    segmentIds: ['seg-022', 'seg-023', 'seg-024', 'seg-025', 'seg-026'],
  },
  {
    id: 'top-005',
    meetingId: 'mtg-demo-001',
    name: 'AI Strategy & ML Platform',
    duration: 720, // 12 minutes
    startTime: 4260,
    endTime: 4980,
    speakerIds: ['spk-008', 'spk-001', 'spk-003', 'spk-007'],
    speakerNames: ['Fatima Al-Hassan', 'Rajesh Kumar', 'Michael Rodriguez', 'Alex Thompson'],
    summary: 'Fatima presented the AI/ML platform roadmap for Q4. Key initiatives include deploying the recommendation engine, building internal LLM capabilities, and integrating AI-powered analytics into the customer-facing product. The CTO emphasized the strategic importance of AI as a differentiator.',
    decisions: ['dec-005'],
    actions: ['act-012'],
    risks: ['risk-008'],
    segmentIds: ['seg-027', 'seg-028', 'seg-029', 'seg-030', 'seg-031'],
  },
  {
    id: 'top-006',
    meetingId: 'mtg-demo-001',
    name: 'Customer Escalations',
    duration: 480, // 8 minutes
    startTime: 4980,
    endTime: 5460,
    speakerIds: ['spk-009', 'spk-003', 'spk-002'],
    speakerNames: ['James O\'Brien', 'Michael Rodriguez', 'Sarah Chen'],
    summary: 'Three critical customer escalations were discussed. Enterprise client Meridian Corp reported performance degradation in the analytics module. Two other clients raised concerns about the delayed Phoenix launch. Engineering committed to deploying a hotfix within 48 hours for the Meridian issue.',
    decisions: [],
    actions: ['act-013', 'act-014'],
    risks: ['risk-009'],
    segmentIds: ['seg-032', 'seg-033', 'seg-034', 'seg-035'],
  },
  {
    id: 'top-007',
    meetingId: 'mtg-demo-001',
    name: 'Infrastructure & Platform Updates',
    duration: 600, // 10 minutes
    startTime: 5460,
    endTime: 6060,
    speakerIds: ['spk-005', 'spk-010', 'spk-007'],
    speakerNames: ['David Kim', 'Wei Zhang', 'Alex Thompson'],
    summary: 'DevOps team presented current infrastructure utilization metrics. Database clusters are operating at 78% capacity. The team proposed scaling the primary database cluster before Q4 traffic spike. Container orchestration improvements and CI/CD pipeline optimizations were discussed.',
    decisions: [],
    actions: ['act-008', 'act-009'],
    risks: ['risk-010'],
    segmentIds: ['seg-036', 'seg-037', 'seg-038', 'seg-039'],
  },
];

// ---- Transcript Segments ----
export const demoTranscript: TranscriptSegment[] = [
  // Opening - Rajesh Kumar (CTO)
  {
    id: 'seg-001',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    startTime: 0,
    endTime: 45,
    text: 'Good morning everyone. Thank you for joining today\'s Global Product and Engineering Strategy meeting. We have a packed agenda with nearly 500 participants across all regions. I want to make sure we cover the critical items efficiently. Let\'s get started.',
    confidence: 0.97,
    language: 'en',
    topics: [],
    isImportant: false,
  },
  {
    id: 'seg-002',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    startTime: 45,
    endTime: 120,
    text: 'Today we will cover cloud migration updates, our security posture review, Project Phoenix launch status, budget planning for Q4, AI strategy, and current customer escalations. I want decisions made today, not deferred. We\'ve spent too many meetings discussing without deciding.',
    confidence: 0.96,
    language: 'en',
    topics: [],
    isImportant: true,
    importanceReason: 'Executive directive setting meeting expectations',
  },
  // Cloud Migration Discussion
  {
    id: 'seg-003',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-002',
    speakerName: 'Sarah Chen',
    startTime: 180,
    endTime: 260,
    text: 'Let me start with the cloud migration update. We\'ve completed the proof of concept for migrating the authentication service to AWS. The results are very promising. Latency improved by 34% and we achieved 99.99% availability during the 30-day test period.',
    confidence: 0.95,
    language: 'en',
    topics: ['Cloud Migration'],
    isImportant: true,
    importanceReason: 'Key performance metrics for cloud migration PoC',
  },
  {
    id: 'seg-004',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-005',
    speakerName: 'David Kim',
    startTime: 265,
    endTime: 340,
    text: 'From the DevOps perspective, the infrastructure-as-code templates are ready. We\'ve built the complete Terraform configuration for the target architecture. The migration can technically begin as early as October 15th if we get the security sign-off.',
    confidence: 0.94,
    language: 'en',
    topics: ['Cloud Migration', 'Infrastructure'],
    isImportant: true,
    importanceReason: 'Migration readiness confirmation and timeline',
  },
  {
    id: 'seg-005',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-007',
    speakerName: 'Alex Thompson',
    startTime: 345,
    endTime: 420,
    text: 'I want to highlight one architectural concern. The authentication service is tightly coupled with the legacy session management system. We need to implement an API gateway abstraction layer first. This adds approximately two weeks to the timeline but significantly reduces risk.',
    confidence: 0.93,
    language: 'en',
    topics: ['Cloud Migration', 'Infrastructure'],
    isImportant: true,
    importanceReason: 'Architectural risk identification',
  },
  {
    id: 'seg-006',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    startTime: 425,
    endTime: 490,
    text: 'Alex, I agree with the gateway approach. Two weeks is acceptable if it reduces our rollback risk. Sarah, can your team handle the gateway implementation alongside the migration prep?',
    confidence: 0.96,
    language: 'en',
    topics: ['Cloud Migration'],
    isImportant: false,
  },
  {
    id: 'seg-007',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-002',
    speakerName: 'Sarah Chen',
    startTime: 495,
    endTime: 560,
    text: 'Yes, we can run both in parallel. I\'ll assign Wei Zhang\'s team to the gateway and keep the migration team focused on the AWS infrastructure. We should be able to hit the revised October timeline if we start the gateway work this week.',
    confidence: 0.95,
    language: 'en',
    topics: ['Cloud Migration'],
    isImportant: true,
    importanceReason: 'Resource allocation and timeline commitment',
  },
  {
    id: 'seg-008',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-010',
    speakerName: 'Wei Zhang',
    startTime: 565,
    endTime: 620,
    text: 'My team can take on the API gateway work. We\'ve actually been prototyping something similar for the microservices initiative. I estimate we can have a production-ready gateway in ten to twelve business days.',
    confidence: 0.92,
    language: 'en',
    topics: ['Cloud Migration', 'Infrastructure'],
    isImportant: false,
  },
  {
    id: 'seg-009',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    startTime: 625,
    endTime: 690,
    text: 'Good. Then I\'m making the decision now. We approve the AWS migration for the authentication service. The timeline is October with the gateway-first approach. David, you own the infrastructure preparation. Sarah, you own the overall migration execution. Ananya, I need your security review completed by October 1st.',
    confidence: 0.97,
    language: 'en',
    topics: ['Cloud Migration'],
    isImportant: true,
    importanceReason: 'Critical decision: AWS migration approved',
  },
  {
    id: 'seg-010',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-004',
    speakerName: 'Ananya Patel',
    startTime: 695,
    endTime: 760,
    text: 'Rajesh, I need to flag something important. Our Q3 security audit found 12 high-priority vulnerabilities in the current authentication system. I strongly recommend we address at least the critical ones before the migration, not after. Migrating vulnerable code to a new environment doesn\'t make it more secure.',
    confidence: 0.95,
    language: 'en',
    topics: ['Cloud Migration', 'Cybersecurity'],
    isImportant: true,
    importanceReason: 'Critical security concern raised',
  },
  // Cybersecurity Discussion
  {
    id: 'seg-011',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    startTime: 1800,
    endTime: 1860,
    text: 'Ananya, take us through the security audit findings. I want the full picture before we finalize migration timelines.',
    confidence: 0.96,
    language: 'en',
    topics: ['Cybersecurity'],
    isImportant: false,
  },
  {
    id: 'seg-012',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-004',
    speakerName: 'Ananya Patel',
    startTime: 1865,
    endTime: 1980,
    text: 'The Q3 audit identified 12 high-priority and 34 medium-priority vulnerabilities. Of the 12 critical ones, four are in the authentication module, three in the API layer, and five in the data access layer. The most concerning is a potential SQL injection vector in the legacy report generator that has been there for eighteen months.',
    confidence: 0.94,
    language: 'en',
    topics: ['Cybersecurity'],
    isImportant: true,
    importanceReason: 'Critical vulnerability disclosure',
  },
  {
    id: 'seg-013',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-004',
    speakerName: 'Ananya Patel',
    startTime: 1985,
    endTime: 2060,
    text: 'We also need to discuss our SOC 2 Type II certification. The auditors are coming in November. If these vulnerabilities are not remediated, we risk failing the certification. That would directly impact our ability to onboard enterprise clients in Q1.',
    confidence: 0.95,
    language: 'en',
    topics: ['Cybersecurity', 'Compliance'],
    isImportant: true,
    importanceReason: 'SOC 2 certification risk',
  },
  {
    id: 'seg-014',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    startTime: 2065,
    endTime: 2140,
    text: 'This is non-negotiable. Ananya, I want a remediation plan for all 12 critical vulnerabilities by end of this week. The four authentication vulnerabilities must be fixed before the migration begins. The remaining can be tracked but must be resolved before the SOC 2 audit.',
    confidence: 0.97,
    language: 'en',
    topics: ['Cybersecurity'],
    isImportant: true,
    importanceReason: 'Executive mandate on security remediation',
  },
  {
    id: 'seg-015',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-007',
    speakerName: 'Alex Thompson',
    startTime: 2145,
    endTime: 2210,
    text: 'I want to add that we should incorporate the security fixes into the migration architecture. The new AWS setup gives us an opportunity to implement a zero-trust network model. We can use AWS IAM and VPC configurations to enforce much tighter access controls than what we have today.',
    confidence: 0.93,
    language: 'en',
    topics: ['Cybersecurity', 'Cloud Migration'],
    isImportant: false,
  },
  // Project Phoenix Discussion
  {
    id: 'seg-016',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-003',
    speakerName: 'Michael Rodriguez',
    startTime: 2640,
    endTime: 2740,
    text: 'Moving to Project Phoenix. We had a target launch date of October 8th. I need to be transparent with everyone — we\'re going to slip. The mobile app integration is not ready, and it\'s a hard dependency for the launch. Our mobile team needs at least one additional week.',
    confidence: 0.95,
    language: 'en',
    topics: ['Product Launch'],
    isImportant: true,
    importanceReason: 'Product launch delay announcement',
  },
  {
    id: 'seg-017',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-002',
    speakerName: 'Sarah Chen',
    startTime: 2745,
    endTime: 2820,
    text: 'Michael, what exactly is blocking the mobile release? Is it a technical issue or a resource issue? Because if it\'s resources, I can potentially reallocate two senior engineers from the platform team to help accelerate.',
    confidence: 0.94,
    language: 'en',
    topics: ['Product Launch'],
    isImportant: false,
  },
  {
    id: 'seg-018',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-003',
    speakerName: 'Michael Rodriguez',
    startTime: 2825,
    endTime: 2920,
    text: 'It\'s primarily a technical issue. The push notification system needs to be rebuilt to support the new real-time collaboration features. We underestimated the complexity. The engineers are working overtime, but we need the time for proper testing. Rushing this would be worse than delaying.',
    confidence: 0.95,
    language: 'en',
    topics: ['Product Launch'],
    isImportant: true,
    importanceReason: 'Root cause explanation for delay',
  },
  {
    id: 'seg-019',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-008',
    speakerName: 'Fatima Al-Hassan',
    startTime: 2925,
    endTime: 3000,
    text: 'The AI recommendation engine that\'s part of Phoenix is ready from our side. We completed integration testing last Friday. So the AI features should not be on the critical path. We can support the launch whenever the mobile team is ready.',
    confidence: 0.93,
    language: 'en',
    topics: ['Product Launch', 'AI Strategy'],
    isImportant: false,
  },
  {
    id: 'seg-020',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-009',
    speakerName: 'James O\'Brien',
    startTime: 3005,
    endTime: 3080,
    text: 'I need to escalate a concern here. We have three enterprise clients — Meridian Corp, Stellar Financial, and TechNova — who were promised early access to Phoenix by October 10th. Slipping the launch impacts our client commitments and potentially our Q4 revenue targets. Can we do a phased launch?',
    confidence: 0.94,
    language: 'en',
    topics: ['Product Launch', 'Customer Escalations'],
    isImportant: true,
    importanceReason: 'Client commitment risk escalation',
  },
  {
    id: 'seg-021',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    startTime: 3085,
    endTime: 3180,
    text: 'Here is what we\'re going to do. Michael, the revised launch date is October 15th. No further slips — that is firm. We will do a phased rollout. Phase one: web-only launch for the three enterprise clients on October 10th without the mobile features. Phase two: full launch with mobile on October 15th. James, communicate this to the enterprise clients immediately.',
    confidence: 0.97,
    language: 'en',
    topics: ['Product Launch'],
    isImportant: true,
    importanceReason: 'Critical decision: Phased launch approved',
  },
  // Budget Discussion
  {
    id: 'seg-022',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-006',
    speakerName: 'Lisa Thompson',
    startTime: 3720,
    endTime: 3820,
    text: 'I need to bring up the cloud infrastructure costs. Based on the current projections, the AWS migration will push our Q4 infrastructure spend 23% over budget. That\'s approximately 47 lakhs over what was approved. We need to either find cost optimizations or request a budget revision.',
    confidence: 0.95,
    language: 'en',
    topics: ['Budget'],
    isImportant: true,
    importanceReason: 'Budget overrun alert',
  },
  {
    id: 'seg-023',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-005',
    speakerName: 'David Kim',
    startTime: 3825,
    endTime: 3900,
    text: 'Lisa, I think we can optimize significantly. If we switch to reserved instances instead of on-demand for the production workloads, we save roughly 35% on compute costs. We can also implement auto-scaling more aggressively for non-production environments.',
    confidence: 0.93,
    language: 'en',
    topics: ['Budget', 'Cloud Migration'],
    isImportant: false,
  },
  {
    id: 'seg-024',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    startTime: 3905,
    endTime: 3970,
    text: 'David, prepare a revised cost estimate incorporating the reserved instances and auto-scaling optimizations. Lisa, I need that cost comparison by next Wednesday. We cannot proceed with the migration without Finance sign-off on the revised numbers.',
    confidence: 0.96,
    language: 'en',
    topics: ['Budget', 'Cloud Migration'],
    isImportant: true,
    importanceReason: 'Budget review requirement before migration',
  },
  {
    id: 'seg-025',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-006',
    speakerName: 'Lisa Thompson',
    startTime: 3975,
    endTime: 4040,
    text: 'Agreed. I also want to point out that this meeting alone, with 487 participants and nearly two hours, has an estimated organizational cost of approximately 8 lakh rupees in productivity time. We should think about whether meetings of this size are the most efficient use of everyone\'s time.',
    confidence: 0.94,
    language: 'en',
    topics: ['Budget', 'Meeting Cost'],
    isImportant: true,
    importanceReason: 'Meeting cost awareness insight',
  },
  {
    id: 'seg-026',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-012',
    speakerName: 'Tom Williams',
    startTime: 4045,
    endTime: 4100,
    text: 'Lisa makes an excellent point. From an HR perspective, I\'d also like to flag that we need three additional headcount for the cloud migration team. I\'ve submitted the requisition but need leadership approval to fast-track the hiring.',
    confidence: 0.92,
    language: 'en',
    topics: ['Budget'],
    isImportant: false,
  },
  // AI Strategy Discussion
  {
    id: 'seg-027',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-008',
    speakerName: 'Fatima Al-Hassan',
    startTime: 4260,
    endTime: 4360,
    text: 'Let me present the AI and ML platform roadmap. We have three major initiatives for Q4. First, deploying the recommendation engine as part of Project Phoenix — that\'s already done. Second, building our internal LLM capabilities using fine-tuned models for customer support automation. Third, integrating predictive analytics into the enterprise dashboard.',
    confidence: 0.94,
    language: 'en',
    topics: ['AI Strategy'],
    isImportant: true,
    importanceReason: 'AI/ML roadmap presentation',
  },
  {
    id: 'seg-028',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    startTime: 4365,
    endTime: 4440,
    text: 'Fatima, AI is our strategic differentiator. I want to double down on this. What do you need in terms of compute resources and team expansion to accelerate the LLM initiative? This is highest priority after the cloud migration.',
    confidence: 0.96,
    language: 'en',
    topics: ['AI Strategy'],
    isImportant: true,
    importanceReason: 'Strategic AI investment decision',
  },
  {
    id: 'seg-029',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-008',
    speakerName: 'Fatima Al-Hassan',
    startTime: 4445,
    endTime: 4530,
    text: 'We need GPU compute capacity — specifically A100 instances for fine-tuning. I estimate we need about 4 additional ML engineers and a budget of approximately 25 lakhs for compute in Q4. The ROI projection shows this investment paying for itself within two quarters through customer support cost reduction.',
    confidence: 0.93,
    language: 'en',
    topics: ['AI Strategy', 'Budget'],
    isImportant: true,
    importanceReason: 'AI investment request with ROI projection',
  },
  {
    id: 'seg-030',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-003',
    speakerName: 'Michael Rodriguez',
    startTime: 4535,
    endTime: 4600,
    text: 'From a product perspective, the AI analytics integration is going to be a game-changer for our enterprise clients. Two of our top-10 clients have specifically asked for predictive analytics. This directly supports our Q1 renewal targets.',
    confidence: 0.94,
    language: 'en',
    topics: ['AI Strategy', 'Product Launch'],
    isImportant: false,
  },
  {
    id: 'seg-031',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    startTime: 4605,
    endTime: 4680,
    text: 'Approved. Fatima, you have budget approval for the GPU compute and the hiring. I want a detailed execution plan by next Friday. Alex, work with Fatima to ensure the AI infrastructure is aligned with our cloud migration architecture. We don\'t want to build this twice.',
    confidence: 0.97,
    language: 'en',
    topics: ['AI Strategy'],
    isImportant: true,
    importanceReason: 'AI budget and hiring approved by CTO',
  },
  // Customer Escalations
  {
    id: 'seg-032',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-009',
    speakerName: 'James O\'Brien',
    startTime: 4980,
    endTime: 5080,
    text: 'We have three critical customer escalations I need to bring to leadership\'s attention. First, Meridian Corp is experiencing performance degradation in the analytics module — response times have increased from 2 seconds to 8 seconds over the past two weeks. This is a Severity 1 issue for a 50-crore account.',
    confidence: 0.94,
    language: 'en',
    topics: ['Customer Escalations'],
    isImportant: true,
    importanceReason: 'Critical customer escalation - Meridian Corp',
  },
  {
    id: 'seg-033',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-002',
    speakerName: 'Sarah Chen',
    startTime: 5085,
    endTime: 5160,
    text: 'James, I\'m aware of the Meridian issue. We\'ve identified the root cause — it\'s a database query regression introduced in last week\'s release. Wei Zhang\'s team is working on a hotfix. We should have it deployed within 48 hours.',
    confidence: 0.95,
    language: 'en',
    topics: ['Customer Escalations'],
    isImportant: true,
    importanceReason: 'Root cause identified and hotfix timeline committed',
  },
  {
    id: 'seg-034',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-009',
    speakerName: 'James O\'Brien',
    startTime: 5165,
    endTime: 5240,
    text: 'Thank you Sarah. The second escalation is from Stellar Financial — they\'re concerned about our SOC 2 compliance status. Ananya, they\'ve asked for a formal compliance statement. The third is TechNova waiting on Phoenix, which we\'ve already discussed.',
    confidence: 0.93,
    language: 'en',
    topics: ['Customer Escalations'],
    isImportant: false,
  },
  {
    id: 'seg-035',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-004',
    speakerName: 'Ananya Patel',
    startTime: 5245,
    endTime: 5310,
    text: 'I\'ll prepare a compliance status letter for Stellar Financial this week. We can share our current SOC 2 Type I certification and the timeline for Type II. I want to be transparent about where we are without creating unnecessary concern.',
    confidence: 0.94,
    language: 'en',
    topics: ['Customer Escalations', 'Compliance'],
    isImportant: false,
  },
  // Infrastructure Updates
  {
    id: 'seg-036',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-005',
    speakerName: 'David Kim',
    startTime: 5460,
    endTime: 5560,
    text: 'Quick infrastructure update. Our primary database clusters are running at 78% capacity. With the Q4 traffic projections and the Phoenix launch, we expect to hit 90% by mid-November. I recommend we scale the database cluster by end of October, before the traffic spike.',
    confidence: 0.93,
    language: 'en',
    topics: ['Infrastructure'],
    isImportant: true,
    importanceReason: 'Infrastructure capacity warning',
  },
  {
    id: 'seg-037',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-010',
    speakerName: 'Wei Zhang',
    startTime: 5565,
    endTime: 5640,
    text: 'We\'ve also improved the CI/CD pipeline. Build times are down from 22 minutes to 14 minutes. The new parallel testing framework is working well. We\'re seeing a 30% improvement in developer productivity for the teams that have adopted it.',
    confidence: 0.92,
    language: 'en',
    topics: ['Infrastructure'],
    isImportant: false,
  },
  {
    id: 'seg-038',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-007',
    speakerName: 'Alex Thompson',
    startTime: 5645,
    endTime: 5720,
    text: 'David, regarding the database scaling — I suggest we consider moving to a read-replica architecture as part of the scaling effort. This would give us horizontal read scalability and also provide a disaster recovery benefit.',
    confidence: 0.93,
    language: 'en',
    topics: ['Infrastructure'],
    isImportant: false,
  },
  {
    id: 'seg-039',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-005',
    speakerName: 'David Kim',
    startTime: 5725,
    endTime: 5790,
    text: 'Good suggestion Alex. I\'ll include the read-replica architecture in the scaling proposal. We should also look at implementing connection pooling — currently we\'re not using PgBouncer and that\'s leaving performance on the table.',
    confidence: 0.92,
    language: 'en',
    topics: ['Infrastructure'],
    isImportant: false,
  },
  // Closing
  {
    id: 'seg-040',
    meetingId: 'mtg-demo-001',
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    startTime: 6060,
    endTime: 6120,
    text: 'Alright everyone, let me summarize the key decisions and actions from today. AWS migration is approved with the gateway-first approach. Security vulnerabilities must be remediated before migration. Project Phoenix launches in phases — web on October 10th, full launch October 15th. AI investment is approved. All action owners, please update your status by end of this week. Thank you everyone.',
    confidence: 0.97,
    language: 'en',
    topics: [],
    isImportant: true,
    importanceReason: 'Meeting closing summary by CTO',
  },
];

// ---- Decisions ----
export const demoDecisions: Decision[] = [
  {
    id: 'dec-001',
    meetingId: 'mtg-demo-001',
    decisionNumber: 1,
    text: 'AWS migration for authentication service is approved with a gateway-first approach. Migration to begin in October.',
    timestamp: 625,
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    participants: ['Rajesh Kumar', 'Sarah Chen', 'David Kim', 'Alex Thompson', 'Wei Zhang'],
    confidence: 'high',
    confidenceScore: 96,
    status: 'approved',
    supportingTranscript: 'Good. Then I\'m making the decision now. We approve the AWS migration for the authentication service. The timeline is October with the gateway-first approach.',
    topicId: 'top-001',
    topicName: 'Cloud Migration Strategy',
    category: 'Infrastructure',
  },
  {
    id: 'dec-002',
    meetingId: 'mtg-demo-001',
    decisionNumber: 2,
    text: 'Security review of all 12 critical vulnerabilities must be completed before the cloud migration begins. Authentication vulnerabilities are top priority.',
    timestamp: 2065,
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    participants: ['Rajesh Kumar', 'Ananya Patel', 'Alex Thompson'],
    confidence: 'high',
    confidenceScore: 94,
    status: 'approved',
    supportingTranscript: 'This is non-negotiable. Ananya, I want a remediation plan for all 12 critical vulnerabilities by end of this week. The four authentication vulnerabilities must be fixed before the migration begins.',
    topicId: 'top-002',
    topicName: 'Cybersecurity & Compliance',
    category: 'Security',
  },
  {
    id: 'dec-003',
    meetingId: 'mtg-demo-001',
    decisionNumber: 3,
    text: 'Project Phoenix will launch in phases. Phase 1: Web-only for enterprise clients on October 10th. Phase 2: Full launch with mobile on October 15th.',
    timestamp: 3085,
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    participants: ['Rajesh Kumar', 'Michael Rodriguez', 'Sarah Chen', 'James O\'Brien'],
    confidence: 'high',
    confidenceScore: 97,
    status: 'approved',
    supportingTranscript: 'We will do a phased rollout. Phase one: web-only launch for the three enterprise clients on October 10th without the mobile features. Phase two: full launch with mobile on October 15th.',
    topicId: 'top-003',
    topicName: 'Product Launch - Project Phoenix',
    category: 'Product',
  },
  {
    id: 'dec-004',
    meetingId: 'mtg-demo-001',
    decisionNumber: 4,
    text: 'SOC 2 Type II audit preparation is mandatory. All critical vulnerabilities must be resolved before the November audit.',
    timestamp: 2065,
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    participants: ['Rajesh Kumar', 'Ananya Patel'],
    confidence: 'high',
    confidenceScore: 92,
    status: 'approved',
    supportingTranscript: 'The remaining can be tracked but must be resolved before the SOC 2 audit.',
    topicId: 'top-002',
    topicName: 'Cybersecurity & Compliance',
    category: 'Compliance',
  },
  {
    id: 'dec-005',
    meetingId: 'mtg-demo-001',
    decisionNumber: 5,
    text: 'AI/ML investment approved: GPU compute budget of ₹25 lakhs and 4 additional ML engineers for Q4. LLM initiative is highest priority after cloud migration.',
    timestamp: 4605,
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    participants: ['Rajesh Kumar', 'Fatima Al-Hassan', 'Alex Thompson', 'Michael Rodriguez'],
    confidence: 'high',
    confidenceScore: 95,
    status: 'approved',
    supportingTranscript: 'Approved. Fatima, you have budget approval for the GPU compute and the hiring.',
    topicId: 'top-005',
    topicName: 'AI Strategy & ML Platform',
    category: 'Strategy',
  },
  {
    id: 'dec-006',
    meetingId: 'mtg-demo-001',
    decisionNumber: 6,
    text: 'Enterprise clients Meridian Corp, Stellar Financial, and TechNova will receive early web access to Phoenix on October 10th as part of the phased launch.',
    timestamp: 3085,
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    participants: ['Rajesh Kumar', 'James O\'Brien', 'Michael Rodriguez'],
    confidence: 'high',
    confidenceScore: 91,
    status: 'approved',
    supportingTranscript: 'Phase one: web-only launch for the three enterprise clients on October 10th without the mobile features.',
    topicId: 'top-003',
    topicName: 'Product Launch - Project Phoenix',
    category: 'Product',
  },
  {
    id: 'dec-007',
    meetingId: 'mtg-demo-001',
    decisionNumber: 7,
    text: 'Revised cloud cost estimate required before migration proceeds. Finance must sign off on the revised numbers incorporating reserved instances and auto-scaling.',
    timestamp: 3905,
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    participants: ['Rajesh Kumar', 'Lisa Thompson', 'David Kim'],
    confidence: 'high',
    confidenceScore: 93,
    status: 'pending',
    supportingTranscript: 'We cannot proceed with the migration without Finance sign-off on the revised numbers.',
    topicId: 'top-004',
    topicName: 'Budget & Cost Optimization',
    category: 'Finance',
  },
];

// ---- Action Items ----
export const demoActions: ActionItem[] = [
  {
    id: 'act-001',
    meetingId: 'mtg-demo-001',
    task: 'Prepare AWS migration infrastructure using the gateway-first approach',
    owner: 'David Kim',
    ownerId: 'spk-005',
    dueDate: '2024-10-01',
    priority: 'critical',
    status: 'open',
    sourceSpeaker: 'Rajesh Kumar',
    sourceSpeakerId: 'spk-001',
    timestamp: 625,
    confidence: 'high',
    confidenceScore: 96,
    requiresConfirmation: false,
    topicId: 'top-001',
    topicName: 'Cloud Migration Strategy',
  },
  {
    id: 'act-002',
    meetingId: 'mtg-demo-001',
    task: 'Own and execute the overall AWS migration plan for the authentication service',
    owner: 'Sarah Chen',
    ownerId: 'spk-002',
    dueDate: '2024-10-31',
    priority: 'critical',
    status: 'open',
    sourceSpeaker: 'Rajesh Kumar',
    sourceSpeakerId: 'spk-001',
    timestamp: 625,
    confidence: 'high',
    confidenceScore: 95,
    requiresConfirmation: false,
    topicId: 'top-001',
    topicName: 'Cloud Migration Strategy',
  },
  {
    id: 'act-003',
    meetingId: 'mtg-demo-001',
    task: 'Complete security review of authentication service by October 1st',
    owner: 'Ananya Patel',
    ownerId: 'spk-004',
    dueDate: '2024-10-01',
    priority: 'critical',
    status: 'open',
    sourceSpeaker: 'Rajesh Kumar',
    sourceSpeakerId: 'spk-001',
    timestamp: 695,
    confidence: 'high',
    confidenceScore: 97,
    requiresConfirmation: false,
    topicId: 'top-001',
    topicName: 'Cloud Migration Strategy',
  },
  {
    id: 'act-004',
    meetingId: 'mtg-demo-001',
    task: 'Assign Wei Zhang\'s team to API gateway implementation',
    owner: 'Sarah Chen',
    ownerId: 'spk-002',
    dueDate: '2024-09-20',
    priority: 'high',
    status: 'open',
    sourceSpeaker: 'Sarah Chen',
    sourceSpeakerId: 'spk-002',
    timestamp: 495,
    confidence: 'high',
    confidenceScore: 93,
    requiresConfirmation: false,
    topicId: 'top-001',
    topicName: 'Cloud Migration Strategy',
  },
  {
    id: 'act-005',
    meetingId: 'mtg-demo-001',
    task: 'Ensure Project Phoenix is ready for phased launch — web on Oct 10, full on Oct 15',
    owner: 'Michael Rodriguez',
    ownerId: 'spk-003',
    dueDate: '2024-10-10',
    priority: 'critical',
    status: 'open',
    sourceSpeaker: 'Rajesh Kumar',
    sourceSpeakerId: 'spk-001',
    timestamp: 3085,
    confidence: 'high',
    confidenceScore: 96,
    requiresConfirmation: false,
    topicId: 'top-003',
    topicName: 'Product Launch - Project Phoenix',
  },
  {
    id: 'act-006',
    meetingId: 'mtg-demo-001',
    task: 'Prepare remediation plan for all 12 critical security vulnerabilities',
    owner: 'Ananya Patel',
    ownerId: 'spk-004',
    dueDate: '2024-09-20',
    priority: 'critical',
    status: 'open',
    sourceSpeaker: 'Rajesh Kumar',
    sourceSpeakerId: 'spk-001',
    timestamp: 2065,
    confidence: 'high',
    confidenceScore: 97,
    requiresConfirmation: false,
    topicId: 'top-002',
    topicName: 'Cybersecurity & Compliance',
  },
  {
    id: 'act-007',
    meetingId: 'mtg-demo-001',
    task: 'Fix the 4 authentication vulnerabilities before cloud migration begins',
    owner: 'Ananya Patel',
    ownerId: 'spk-004',
    dueDate: '2024-10-01',
    priority: 'critical',
    status: 'open',
    sourceSpeaker: 'Rajesh Kumar',
    sourceSpeakerId: 'spk-001',
    timestamp: 2065,
    confidence: 'high',
    confidenceScore: 96,
    requiresConfirmation: false,
    topicId: 'top-002',
    topicName: 'Cybersecurity & Compliance',
  },
  {
    id: 'act-008',
    meetingId: 'mtg-demo-001',
    task: 'Prepare revised cloud cost estimate with reserved instances and auto-scaling optimizations',
    owner: 'David Kim',
    ownerId: 'spk-005',
    dueDate: '2024-09-25',
    priority: 'high',
    status: 'open',
    sourceSpeaker: 'Rajesh Kumar',
    sourceSpeakerId: 'spk-001',
    timestamp: 3905,
    confidence: 'high',
    confidenceScore: 94,
    requiresConfirmation: false,
    topicId: 'top-004',
    topicName: 'Budget & Cost Optimization',
  },
  {
    id: 'act-009',
    meetingId: 'mtg-demo-001',
    task: 'Scale primary database cluster before Q4 traffic spike — include read-replica architecture',
    owner: 'David Kim',
    ownerId: 'spk-005',
    dueDate: '2024-10-31',
    priority: 'high',
    status: 'open',
    sourceSpeaker: 'David Kim',
    sourceSpeakerId: 'spk-005',
    timestamp: 5460,
    confidence: 'high',
    confidenceScore: 91,
    requiresConfirmation: false,
    topicId: 'top-007',
    topicName: 'Infrastructure & Platform Updates',
  },
  {
    id: 'act-010',
    meetingId: 'mtg-demo-001',
    task: 'Provide finance sign-off on revised cloud migration costs by next Wednesday',
    owner: 'Lisa Thompson',
    ownerId: 'spk-006',
    dueDate: '2024-09-25',
    priority: 'high',
    status: 'open',
    sourceSpeaker: 'Rajesh Kumar',
    sourceSpeakerId: 'spk-001',
    timestamp: 3905,
    confidence: 'high',
    confidenceScore: 93,
    requiresConfirmation: false,
    topicId: 'top-004',
    topicName: 'Budget & Cost Optimization',
  },
  {
    id: 'act-011',
    meetingId: 'mtg-demo-001',
    task: 'Work with Fatima to align AI infrastructure with cloud migration architecture',
    owner: 'Alex Thompson',
    ownerId: 'spk-007',
    dueDate: '2024-09-27',
    priority: 'high',
    status: 'open',
    sourceSpeaker: 'Rajesh Kumar',
    sourceSpeakerId: 'spk-001',
    timestamp: 4605,
    confidence: 'high',
    confidenceScore: 92,
    requiresConfirmation: false,
    topicId: 'top-005',
    topicName: 'AI Strategy & ML Platform',
  },
  {
    id: 'act-012',
    meetingId: 'mtg-demo-001',
    task: 'Prepare detailed AI/ML execution plan with GPU compute requirements and hiring timeline',
    owner: 'Fatima Al-Hassan',
    ownerId: 'spk-008',
    dueDate: '2024-09-27',
    priority: 'high',
    status: 'open',
    sourceSpeaker: 'Rajesh Kumar',
    sourceSpeakerId: 'spk-001',
    timestamp: 4605,
    confidence: 'high',
    confidenceScore: 94,
    requiresConfirmation: false,
    topicId: 'top-005',
    topicName: 'AI Strategy & ML Platform',
  },
  {
    id: 'act-013',
    meetingId: 'mtg-demo-001',
    task: 'Communicate phased launch plan to enterprise clients (Meridian, Stellar, TechNova)',
    owner: 'James O\'Brien',
    ownerId: 'spk-009',
    dueDate: '2024-09-18',
    priority: 'critical',
    status: 'open',
    sourceSpeaker: 'Rajesh Kumar',
    sourceSpeakerId: 'spk-001',
    timestamp: 3085,
    confidence: 'high',
    confidenceScore: 96,
    requiresConfirmation: false,
    topicId: 'top-003',
    topicName: 'Product Launch - Project Phoenix',
  },
  {
    id: 'act-014',
    meetingId: 'mtg-demo-001',
    task: 'Deploy hotfix for Meridian Corp analytics performance issue within 48 hours',
    owner: 'Wei Zhang',
    ownerId: 'spk-010',
    dueDate: '2024-09-19',
    priority: 'critical',
    status: 'open',
    sourceSpeaker: 'Sarah Chen',
    sourceSpeakerId: 'spk-002',
    timestamp: 5085,
    confidence: 'high',
    confidenceScore: 95,
    requiresConfirmation: false,
    topicId: 'top-006',
    topicName: 'Customer Escalations',
  },
];

// ---- Risks ----
export const demoRisks: Risk[] = [
  {
    id: 'risk-001',
    meetingId: 'mtg-demo-001',
    description: 'Authentication service is tightly coupled with legacy session management — migration may introduce breaking changes',
    severity: 'high',
    timestamp: 345,
    speakerId: 'spk-007',
    speakerName: 'Alex Thompson',
    mitigation: 'Implement API gateway abstraction layer before migration (adds ~2 weeks)',
    status: 'mitigating',
    confidence: 'high',
    topicId: 'top-001',
    topicName: 'Cloud Migration Strategy',
  },
  {
    id: 'risk-002',
    meetingId: 'mtg-demo-001',
    description: 'Migrating vulnerable code to AWS without fixing security vulnerabilities first',
    severity: 'critical',
    timestamp: 695,
    speakerId: 'spk-004',
    speakerName: 'Ananya Patel',
    mitigation: 'Fix 4 critical authentication vulnerabilities before migration begins',
    status: 'identified',
    confidence: 'high',
    topicId: 'top-001',
    topicName: 'Cloud Migration Strategy',
  },
  {
    id: 'risk-003',
    meetingId: 'mtg-demo-001',
    description: 'SQL injection vulnerability in legacy report generator has been present for 18 months',
    severity: 'critical',
    timestamp: 1865,
    speakerId: 'spk-004',
    speakerName: 'Ananya Patel',
    mitigation: 'Part of critical vulnerability remediation plan',
    status: 'identified',
    confidence: 'high',
    topicId: 'top-002',
    topicName: 'Cybersecurity & Compliance',
  },
  {
    id: 'risk-004',
    meetingId: 'mtg-demo-001',
    description: 'SOC 2 Type II certification may fail if critical vulnerabilities are not remediated before November audit',
    severity: 'high',
    timestamp: 1985,
    speakerId: 'spk-004',
    speakerName: 'Ananya Patel',
    mitigation: 'All critical vulnerabilities must be resolved before November audit',
    status: 'identified',
    confidence: 'high',
    topicId: 'top-002',
    topicName: 'Cybersecurity & Compliance',
  },
  {
    id: 'risk-005',
    meetingId: 'mtg-demo-001',
    description: 'Project Phoenix launch may slip by one week due to mobile app dependency',
    severity: 'high',
    timestamp: 2640,
    speakerId: 'spk-003',
    speakerName: 'Michael Rodriguez',
    mitigation: 'Phased launch approach — web first on Oct 10, full on Oct 15',
    status: 'mitigating',
    confidence: 'high',
    topicId: 'top-003',
    topicName: 'Product Launch - Project Phoenix',
  },
  {
    id: 'risk-006',
    meetingId: 'mtg-demo-001',
    description: 'Three enterprise clients (Meridian, Stellar, TechNova) may be impacted by Phoenix launch delay — affects Q4 revenue targets',
    severity: 'high',
    timestamp: 3005,
    speakerId: 'spk-009',
    speakerName: 'James O\'Brien',
    mitigation: 'Early web access for enterprise clients on Oct 10',
    status: 'mitigating',
    confidence: 'high',
    topicId: 'top-003',
    topicName: 'Product Launch - Project Phoenix',
  },
  {
    id: 'risk-007',
    meetingId: 'mtg-demo-001',
    description: 'Q4 cloud infrastructure spend projected 23% over budget (~₹47 lakhs over approved amount)',
    severity: 'medium',
    timestamp: 3720,
    speakerId: 'spk-006',
    speakerName: 'Lisa Thompson',
    mitigation: 'Reserved instances and auto-scaling optimizations expected to reduce costs by ~35%',
    status: 'mitigating',
    confidence: 'high',
    topicId: 'top-004',
    topicName: 'Budget & Cost Optimization',
  },
  {
    id: 'risk-008',
    meetingId: 'mtg-demo-001',
    description: 'AI infrastructure needs may conflict with cloud migration architecture if not coordinated',
    severity: 'medium',
    timestamp: 4605,
    speakerId: 'spk-001',
    speakerName: 'Rajesh Kumar',
    mitigation: 'Alex Thompson to align AI infrastructure with cloud migration architecture',
    status: 'mitigating',
    confidence: 'medium',
    topicId: 'top-005',
    topicName: 'AI Strategy & ML Platform',
  },
  {
    id: 'risk-009',
    meetingId: 'mtg-demo-001',
    description: 'Meridian Corp (₹50 crore account) experiencing Severity 1 performance degradation',
    severity: 'critical',
    timestamp: 4980,
    speakerId: 'spk-009',
    speakerName: 'James O\'Brien',
    mitigation: 'Hotfix identified and will be deployed within 48 hours',
    status: 'mitigating',
    confidence: 'high',
    topicId: 'top-006',
    topicName: 'Customer Escalations',
  },
  {
    id: 'risk-010',
    meetingId: 'mtg-demo-001',
    description: 'Database clusters at 78% capacity — expected to hit 90% by mid-November with Q4 traffic and Phoenix launch',
    severity: 'medium',
    timestamp: 5460,
    speakerId: 'spk-005',
    speakerName: 'David Kim',
    mitigation: 'Scale database cluster by end of October with read-replica architecture',
    status: 'identified',
    confidence: 'high',
    topicId: 'top-007',
    topicName: 'Infrastructure & Platform Updates',
  },
];

// ---- Important Moments ----
export const demoImportantMoments: ImportantMoment[] = [
  {
    id: 'moment-001', meetingId: 'mtg-demo-001', type: 'executive_statement', timestamp: 45,
    description: 'CTO sets expectation: decisions must be made today, not deferred',
    speakerName: 'Rajesh Kumar', speakerId: 'spk-001', confidence: 'high',
  },
  {
    id: 'moment-002', meetingId: 'mtg-demo-001', type: 'announcement', timestamp: 180,
    description: 'Cloud migration PoC results: 34% latency improvement, 99.99% availability',
    speakerName: 'Sarah Chen', speakerId: 'spk-002', confidence: 'high',
  },
  {
    id: 'moment-003', meetingId: 'mtg-demo-001', type: 'risk', timestamp: 345,
    description: 'Architectural risk: tight coupling between auth service and legacy session management',
    speakerName: 'Alex Thompson', speakerId: 'spk-007', confidence: 'high',
  },
  {
    id: 'moment-004', meetingId: 'mtg-demo-001', type: 'decision', timestamp: 625,
    description: 'AWS migration APPROVED with gateway-first approach for October',
    speakerName: 'Rajesh Kumar', speakerId: 'spk-001', confidence: 'high',
  },
  {
    id: 'moment-005', meetingId: 'mtg-demo-001', type: 'risk', timestamp: 695,
    description: 'CISO flags: 12 high-priority security vulnerabilities must be fixed before migration',
    speakerName: 'Ananya Patel', speakerId: 'spk-004', confidence: 'high',
  },
  {
    id: 'moment-006', meetingId: 'mtg-demo-001', type: 'risk', timestamp: 1865,
    description: 'Critical: SQL injection vulnerability in legacy report generator — present for 18 months',
    speakerName: 'Ananya Patel', speakerId: 'spk-004', confidence: 'high',
  },
  {
    id: 'moment-007', meetingId: 'mtg-demo-001', type: 'deadline', timestamp: 1985,
    description: 'SOC 2 Type II audit in November — all critical vulns must be fixed before then',
    speakerName: 'Ananya Patel', speakerId: 'spk-004', confidence: 'high',
  },
  {
    id: 'moment-008', meetingId: 'mtg-demo-001', type: 'action_assigned', timestamp: 2065,
    description: 'Ananya Patel assigned: remediation plan for 12 critical vulnerabilities by EOW',
    speakerName: 'Rajesh Kumar', speakerId: 'spk-001', confidence: 'high',
  },
  {
    id: 'moment-009', meetingId: 'mtg-demo-001', type: 'announcement', timestamp: 2640,
    description: 'Project Phoenix launch will SLIP — mobile dependency not ready',
    speakerName: 'Michael Rodriguez', speakerId: 'spk-003', confidence: 'high',
  },
  {
    id: 'moment-010', meetingId: 'mtg-demo-001', type: 'escalation', timestamp: 3005,
    description: 'Three enterprise clients at risk due to Phoenix delay — Q4 revenue impact',
    speakerName: 'James O\'Brien', speakerId: 'spk-009', confidence: 'high',
  },
  {
    id: 'moment-011', meetingId: 'mtg-demo-001', type: 'decision', timestamp: 3085,
    description: 'Phased launch APPROVED: Web Oct 10, Full Oct 15 — no further slips allowed',
    speakerName: 'Rajesh Kumar', speakerId: 'spk-001', confidence: 'high',
  },
  {
    id: 'moment-012', meetingId: 'mtg-demo-001', type: 'important_change', timestamp: 3720,
    description: 'Q4 cloud costs projected 23% OVER BUDGET — ₹47 lakhs over approved amount',
    speakerName: 'Lisa Thompson', speakerId: 'spk-006', confidence: 'high',
  },
  {
    id: 'moment-013', meetingId: 'mtg-demo-001', type: 'commitment', timestamp: 3975,
    description: 'Meeting cost awareness: this 487-person meeting costs ~₹8 lakhs in productivity time',
    speakerName: 'Lisa Thompson', speakerId: 'spk-006', confidence: 'high',
  },
  {
    id: 'moment-014', meetingId: 'mtg-demo-001', type: 'decision', timestamp: 4605,
    description: 'AI/ML investment APPROVED: ₹25 lakhs GPU budget + 4 ML engineers',
    speakerName: 'Rajesh Kumar', speakerId: 'spk-001', confidence: 'high',
  },
  {
    id: 'moment-015', meetingId: 'mtg-demo-001', type: 'escalation', timestamp: 4980,
    description: 'Meridian Corp (₹50 crore account) — Severity 1 performance degradation',
    speakerName: 'James O\'Brien', speakerId: 'spk-009', confidence: 'high',
  },
  {
    id: 'moment-016', meetingId: 'mtg-demo-001', type: 'commitment', timestamp: 5085,
    description: 'Engineering commits: Meridian hotfix within 48 hours',
    speakerName: 'Sarah Chen', speakerId: 'spk-002', confidence: 'high',
  },
  {
    id: 'moment-017', meetingId: 'mtg-demo-001', type: 'risk', timestamp: 5460,
    description: 'Database at 78% capacity — expected 90% by mid-November',
    speakerName: 'David Kim', speakerId: 'spk-005', confidence: 'high',
  },
];

// ---- Meeting Summaries ----
export const demoSummaries: MeetingSummary[] = [
  {
    id: 'sum-001',
    meetingId: 'mtg-demo-001',
    level: 'executive_30s',
    content: 'AWS cloud migration approved with a security-first approach. Project Phoenix delayed by one week — phased launch approved (web Oct 10, full Oct 15). AI/ML investment of ₹25 lakhs approved. Three critical customer escalations addressed, including a Severity 1 issue for Meridian Corp. Security team identified 12 critical vulnerabilities requiring remediation before migration and SOC 2 audit.',
    generatedAt: '2024-09-17T12:00:00Z',
  },
  {
    id: 'sum-002',
    meetingId: 'mtg-demo-001',
    level: 'two_minute',
    content: `The Global Product & Engineering Strategy Meeting brought together 487 participants to address six critical topics across the organization.

**Cloud Migration:** The AWS migration for the authentication service was formally approved by CTO Rajesh Kumar. The approach includes a gateway-first architecture to reduce migration risk (adding ~2 weeks). David Kim's DevOps team has infrastructure-as-code ready. Migration timeline is October, contingent on security review completion.

**Security:** CISO Ananya Patel reported 12 high-priority vulnerabilities from the Q3 audit, including a critical SQL injection vector in the legacy report generator. Four authentication vulnerabilities must be fixed before migration begins. SOC 2 Type II audit in November is at risk if vulnerabilities are not remediated.

**Project Phoenix:** Launch delayed by one week due to mobile app dependency. CTO approved a phased approach: web-only for three enterprise clients on October 10th, full launch with mobile on October 15th. No further delays permitted.

**Budget:** Cloud costs projected 23% over Q4 budget (~₹47 lakhs). David Kim tasked with proposing reserved instance and auto-scaling optimizations. Finance sign-off required before migration proceeds.

**AI Strategy:** Fatima Al-Hassan received approval for ₹25 lakhs in GPU compute and 4 additional ML engineers. AI is designated the second-highest priority after cloud migration. Architecture alignment with cloud migration is required.

**Customer Escalations:** Meridian Corp (₹50 crore account) facing Severity 1 performance issue — hotfix committed within 48 hours. Enterprise clients notified of phased Phoenix launch.`,
    generatedAt: '2024-09-17T12:00:00Z',
  },
  {
    id: 'sum-003',
    meetingId: 'mtg-demo-001',
    level: 'detailed',
    content: `# Global Product & Engineering Strategy Meeting — Detailed Summary

## Meeting Overview
- **Date:** September 17, 2024
- **Duration:** 1 hour 42 minutes
- **Participants:** 487
- **Key Speakers:** 12
- **Decisions Made:** 7
- **Actions Assigned:** 14
- **Risks Identified:** 10

## 1. Cloud Migration Strategy (27 minutes)

The meeting opened with Sarah Chen presenting the proof-of-concept results for migrating the authentication service to AWS. Key metrics showed a 34% latency improvement and 99.99% availability during the 30-day test period.

David Kim confirmed that infrastructure-as-code (Terraform) templates are ready and migration could technically begin October 15th with security approval.

Alex Thompson raised an architectural concern about tight coupling between the authentication service and the legacy session management system. He recommended implementing an API gateway abstraction layer first, adding approximately two weeks to the timeline but significantly reducing rollback risk.

CTO Rajesh Kumar approved the migration with the gateway-first approach. Sarah Chen will lead overall execution, David Kim owns infrastructure preparation, and Wei Zhang's team will handle the API gateway implementation.

**Critical Decision:** CISO Ananya Patel interrupted to flag that the Q3 security audit found 12 high-priority vulnerabilities in the current authentication system. She strongly recommended fixing critical vulnerabilities before migration, not after.

## 2. Cybersecurity & Compliance (14 minutes)

Ananya Patel presented the full Q3 security audit findings:
- 12 high-priority vulnerabilities
- 34 medium-priority vulnerabilities
- 4 in authentication, 3 in API layer, 5 in data access layer
- Most concerning: SQL injection vector in legacy report generator (present 18 months)

The SOC 2 Type II certification audit is scheduled for November. Failing to remediate vulnerabilities could result in certification failure, directly impacting enterprise client onboarding in Q1.

Rajesh Kumar mandated:
1. Remediation plan for all 12 critical vulnerabilities by end of week
2. Four authentication vulnerabilities fixed before migration
3. Remaining vulnerabilities resolved before November SOC 2 audit

## 3. Project Phoenix Launch (18 minutes)

Michael Rodriguez disclosed that Project Phoenix will miss the October 8th launch date. The mobile app integration is not ready due to underestimated complexity in rebuilding the push notification system for real-time collaboration features.

James O'Brien escalated the impact: three enterprise clients (Meridian Corp, Stellar Financial, TechNova) were promised early access by October 10th, affecting Q4 revenue targets.

Rajesh Kumar decided on a phased approach:
- Phase 1: Web-only launch for enterprise clients on October 10th
- Phase 2: Full launch with mobile on October 15th
- No further delays permitted

## 4. Budget & Cost Optimization (9 minutes)

Lisa Thompson raised that Q4 cloud infrastructure spend is projected 23% over budget (~₹47 lakhs). David Kim suggested reserved instances (35% savings) and aggressive auto-scaling for non-production environments.

Notable observation from Lisa: the meeting itself (487 participants, ~2 hours) costs approximately ₹8 lakhs in organizational productivity time.

## 5. AI Strategy & ML Platform (12 minutes)

Fatima Al-Hassan presented three Q4 AI initiatives:
1. Recommendation engine deployment (completed)
2. Internal LLM capabilities for customer support automation
3. Predictive analytics integration

Rajesh Kumar approved:
- ₹25 lakhs GPU compute budget
- 4 additional ML engineers
- AI designated second-highest priority after cloud migration
- Alex Thompson to align AI infrastructure with cloud migration architecture

## 6. Customer Escalations (8 minutes)

Three critical escalations:
1. **Meridian Corp** — Performance degradation in analytics (response times: 2s → 8s). Root cause identified (database query regression). Hotfix within 48 hours.
2. **Stellar Financial** — SOC 2 compliance status concern. Ananya to prepare formal compliance statement.
3. **TechNova** — Awaiting Phoenix launch (addressed by phased launch plan).

## 7. Infrastructure Updates (10 minutes)

- Database clusters at 78% capacity, projected 90% by mid-November
- CI/CD pipeline improved: build times reduced from 22 to 14 minutes (30% dev productivity gain)
- Database scaling recommended before Q4 traffic spike with read-replica architecture`,
    generatedAt: '2024-09-17T12:00:00Z',
  },
  {
    id: 'sum-004',
    meetingId: 'mtg-demo-001',
    level: 'missed_meeting',
    content: `# What You Missed

Based on your profile and interests (Cloud Migration, Infrastructure, Security, AI Strategy), here are the critical items from the meeting:

## 🔴 Must-Know Items

### 1. AWS Migration Approved
**Time: 10:25 - 11:30** | **Decision by: Rajesh Kumar (CTO)**

The authentication service migration to AWS was formally approved. Key points:
- Gateway-first approach (adds ~2 weeks but reduces risk)
- David Kim owns infrastructure prep
- Sarah Chen owns overall execution
- **YOUR TEAM'S Impact:** Security review must be completed by October 1st before migration begins

### 2. 12 Critical Security Vulnerabilities
**Time: 30:00 - 44:00** | **Flagged by: Ananya Patel (CISO)**

The Q3 security audit found 12 high-priority vulnerabilities including a SQL injection vector that's been present for 18 months. Four are in the authentication module — these MUST be fixed before migration.

### 3. Project Phoenix Delayed
**Time: 44:00 - 62:00** | **Announced by: Michael Rodriguez**

Launch slipping by one week due to mobile dependency. CTO approved phased launch:
- Web-only for enterprise clients: October 10
- Full launch: October 15

### 4. AI Investment Approved
**Time: 71:00 - 83:00** | **Approved by: Rajesh Kumar**

₹25 lakhs for GPU compute + 4 ML engineers. AI is now second-highest priority after cloud migration.

## ⚠️ Actions Affecting You

- Cloud migration timeline depends on security review completion
- Alex Thompson assigned to align AI infrastructure with cloud migration architecture
- Database scaling needed before Q4 traffic spike

## 📊 Key Numbers
- 7 decisions made
- 14 action items assigned
- 10 risks identified
- Estimated meeting cost: ₹8 lakhs`,
    generatedAt: '2024-09-17T12:00:00Z',
  },
];

// ---- Missed Meeting Insights ----
export const demoMissedInsights: MissedMeetingInsight[] = [
  {
    id: 'missed-001',
    meetingId: 'mtg-demo-001',
    title: 'Cloud Migration Approved — Gateway-First Approach',
    timeRange: { start: 180, end: 760 },
    description: 'The engineering team presented AWS migration PoC results showing 34% latency improvement. After discussion of architectural risks (tight coupling with legacy session management), the CTO approved migration with a gateway-first approach for October.',
    importantPoints: [
      'AWS migration formally approved by CTO',
      'Gateway abstraction layer will be built first (adds ~2 weeks)',
      'DevOps infrastructure-as-code templates ready',
      'Security review required before migration starts',
      '12 critical vulnerabilities flagged by CISO',
    ],
    decisions: [demoDecisions[0], demoDecisions[1]],
    actions: [demoActions[0], demoActions[1], demoActions[2], demoActions[3]],
    risks: [demoRisks[0], demoRisks[1]],
    confidence: 'high',
    speakerNames: ['Rajesh Kumar', 'Sarah Chen', 'David Kim', 'Alex Thompson', 'Ananya Patel'],
  },
  {
    id: 'missed-002',
    meetingId: 'mtg-demo-001',
    title: 'Critical Security Vulnerabilities — SOC 2 at Risk',
    timeRange: { start: 1800, end: 2640 },
    description: 'CISO Ananya Patel presented Q3 security audit findings revealing 12 high-priority and 34 medium-priority vulnerabilities. A critical SQL injection vector has been present for 18 months. SOC 2 Type II certification in November is at risk.',
    importantPoints: [
      '12 high-priority, 34 medium-priority vulnerabilities found',
      'SQL injection in legacy report generator — 18 months old',
      '4 vulnerabilities in authentication module',
      'SOC 2 Type II audit in November at risk',
      'Remediation plan required by end of week',
    ],
    decisions: [demoDecisions[3]],
    actions: [demoActions[5], demoActions[6]],
    risks: [demoRisks[2], demoRisks[3]],
    confidence: 'high',
    speakerNames: ['Ananya Patel', 'Rajesh Kumar', 'Alex Thompson'],
  },
  {
    id: 'missed-003',
    meetingId: 'mtg-demo-001',
    title: 'Project Phoenix Launch Delayed — Phased Rollout Approved',
    timeRange: { start: 2640, end: 3720 },
    description: 'Product Head Michael Rodriguez disclosed that Phoenix will miss the October 8 launch date due to mobile app dependency. After escalation of enterprise client risk, CTO approved a phased approach: web-only for enterprise clients Oct 10, full launch Oct 15.',
    importantPoints: [
      'Mobile push notification system rebuild underestimated',
      'Three enterprise clients at risk (Meridian, Stellar, TechNova)',
      'Q4 revenue targets potentially impacted',
      'AI recommendation engine ready — not on critical path',
      'No further delays permitted by CTO',
    ],
    decisions: [demoDecisions[2], demoDecisions[5]],
    actions: [demoActions[4], demoActions[12]],
    risks: [demoRisks[4], demoRisks[5]],
    confidence: 'high',
    speakerNames: ['Michael Rodriguez', 'Sarah Chen', 'James O\'Brien', 'Rajesh Kumar'],
  },
  {
    id: 'missed-004',
    meetingId: 'mtg-demo-001',
    title: 'Budget Alert — Cloud Costs 23% Over Budget',
    timeRange: { start: 3720, end: 4260 },
    description: 'VP Finance Lisa Thompson flagged that Q4 cloud infrastructure spend is projected 23% over approved budget (~₹47 lakhs). Cost optimization through reserved instances proposed. Finance sign-off required before migration proceeds.',
    importantPoints: [
      'Q4 cloud spend 23% over budget (~₹47 lakhs)',
      'Reserved instances could save ~35%',
      'Finance sign-off required before migration',
      'This meeting costs ~₹8 lakhs in productivity time',
      '3 additional headcount requested for cloud team',
    ],
    decisions: [demoDecisions[6]],
    actions: [demoActions[7], demoActions[9]],
    risks: [demoRisks[6]],
    confidence: 'high',
    speakerNames: ['Lisa Thompson', 'Rajesh Kumar', 'David Kim', 'Tom Williams'],
  },
  {
    id: 'missed-005',
    meetingId: 'mtg-demo-001',
    title: 'AI Strategy — ₹25 Lakhs Investment Approved',
    timeRange: { start: 4260, end: 4980 },
    description: 'Director of AI/ML Fatima Al-Hassan presented the Q4 roadmap. CTO approved ₹25 lakhs for GPU compute and 4 ML engineers. AI designated second-highest priority after cloud migration. Architecture alignment with cloud migration required.',
    importantPoints: [
      'Three Q4 AI initiatives: recommendation engine, LLM, predictive analytics',
      '₹25 lakhs GPU compute budget approved',
      '4 additional ML engineers approved',
      'ROI: investment pays for itself in 2 quarters',
      'Must align AI infrastructure with cloud migration architecture',
    ],
    decisions: [demoDecisions[4]],
    actions: [demoActions[10], demoActions[11]],
    risks: [demoRisks[7]],
    confidence: 'high',
    speakerNames: ['Fatima Al-Hassan', 'Rajesh Kumar', 'Michael Rodriguez', 'Alex Thompson'],
  },
];

// ---- Questions ----
export const demoQuestions: MeetingQuestion[] = [
  {
    id: 'q-001', meetingId: 'mtg-demo-001',
    question: 'Can your team handle the gateway implementation alongside the migration prep?',
    askedBy: 'Rajesh Kumar', askedById: 'spk-001', timestamp: 425,
    isResolved: true, answer: 'Yes, we can run both in parallel.', answeredBy: 'Sarah Chen', answeredAt: 495,
  },
  {
    id: 'q-002', meetingId: 'mtg-demo-001',
    question: 'What exactly is blocking the mobile release? Is it a technical issue or a resource issue?',
    askedBy: 'Sarah Chen', askedById: 'spk-002', timestamp: 2745,
    isResolved: true, answer: 'Primarily a technical issue. Push notification system needs rebuild for real-time collaboration.', answeredBy: 'Michael Rodriguez', answeredAt: 2825,
  },
  {
    id: 'q-003', meetingId: 'mtg-demo-001',
    question: 'Can we do a phased launch for the enterprise clients?',
    askedBy: 'James O\'Brien', askedById: 'spk-009', timestamp: 3005,
    isResolved: true, answer: 'Yes — web-only on Oct 10, full launch Oct 15.', answeredBy: 'Rajesh Kumar', answeredAt: 3085,
  },
  {
    id: 'q-004', meetingId: 'mtg-demo-001',
    question: 'What do you need in terms of compute resources and team expansion to accelerate the LLM initiative?',
    askedBy: 'Rajesh Kumar', askedById: 'spk-001', timestamp: 4365,
    isResolved: true, answer: 'GPU A100 instances, 4 ML engineers, ~₹25 lakhs compute budget for Q4.', answeredBy: 'Fatima Al-Hassan', answeredAt: 4445,
  },
];

// ---- Commitments ----
export const demoCommitments: Commitment[] = [
  {
    id: 'cmt-001', meetingId: 'mtg-demo-001',
    text: 'Engineering will deploy Meridian Corp hotfix within 48 hours',
    committedBy: 'Sarah Chen', committedById: 'spk-002', timestamp: 5085,
    deadline: '2024-09-19', confidence: 'high', status: 'in_progress',
  },
  {
    id: 'cmt-002', meetingId: 'mtg-demo-001',
    text: 'API gateway will be production-ready in 10-12 business days',
    committedBy: 'Wei Zhang', committedById: 'spk-010', timestamp: 565,
    deadline: '2024-10-04', confidence: 'high', status: 'in_progress',
  },
  {
    id: 'cmt-003', meetingId: 'mtg-demo-001',
    text: 'Security remediation plan for all 12 critical vulnerabilities delivered by end of week',
    committedBy: 'Ananya Patel', committedById: 'spk-004', timestamp: 2065,
    deadline: '2024-09-20', confidence: 'high', status: 'completed',
  },
  {
    id: 'cmt-004', meetingId: 'mtg-demo-001',
    text: 'AI/ML detailed execution plan ready by next Friday',
    committedBy: 'Fatima Al-Hassan', committedById: 'spk-008', timestamp: 4605,
    deadline: '2024-09-27', confidence: 'high', status: 'pending',
  },
];

// ---- Meeting ----
export const demoMeeting: Meeting = {
  id: 'mtg-demo-001',
  organizationId: 'org-meetintel-demo',
  title: 'Global Product & Engineering Strategy Meeting',
  description: 'Quarterly cross-functional strategy alignment meeting covering cloud migration, security posture, product launches, budget planning, AI strategy, and customer escalations.',
  scheduledAt: '2024-09-17T09:00:00Z',
  duration: 6120, // 1h 42m in seconds
  participantCount: 487,
  organizerId: 'spk-001',
  organizerName: 'Rajesh Kumar',
  status: 'COMPLETED',
  source: 'upload',
  tags: ['strategy', 'engineering', 'product', 'quarterly'],
  productivityScore: {
    overall: 78,
    agendaClarity: 82,
    decisionDensity: 85,
    actionClarity: 91,
    participation: 58,
    timeEfficiency: 73,
    explanations: {
      agendaClarity: 'Clear agenda set at the beginning with 6 defined topics. All topics were covered within the allocated time.',
      decisionDensity: '7 decisions were made in a 102-minute meeting — above average for meetings of this size.',
      actionClarity: '14 action items with clear owners and deadlines. Only 1 action requires ownership confirmation.',
      participation: 'Only 12 of 487 participants actively contributed. Consider smaller breakout sessions for better engagement.',
      timeEfficiency: 'Cloud migration discussion ran slightly long at 27 minutes. Budget discussion was efficient at 9 minutes.',
    },
  },
  estimatedCost: {
    totalCostINR: 812500,
    participantCount: 487,
    durationMinutes: 102,
    averageHourlyCostINR: 1000,
    label: 'Estimated organizational time cost based on average compensation bands',
  },
  createdAt: '2024-09-17T08:00:00Z',
  processedAt: '2024-09-17T12:00:00Z',
};

// ---- Additional demo meetings for the list view ----
export const demoMeetingsList: Meeting[] = [
  demoMeeting,
  {
    id: 'mtg-demo-002',
    organizationId: 'org-meetintel-demo',
    title: 'Weekly Engineering Standup',
    scheduledAt: '2024-09-16T09:30:00Z',
    duration: 1800,
    participantCount: 24,
    organizerId: 'spk-002',
    organizerName: 'Sarah Chen',
    status: 'COMPLETED',
    source: 'google_meet',
    tags: ['engineering', 'weekly', 'standup'],
    productivityScore: { overall: 72, agendaClarity: 65, decisionDensity: 60, actionClarity: 85, participation: 78, timeEfficiency: 72, explanations: {} },
    estimatedCost: { totalCostINR: 18000, participantCount: 24, durationMinutes: 30, averageHourlyCostINR: 1500, label: 'Estimated' },
    createdAt: '2024-09-16T09:00:00Z',
    processedAt: '2024-09-16T10:30:00Z',
  },
  {
    id: 'mtg-demo-003',
    organizationId: 'org-meetintel-demo',
    title: 'Security Architecture Review',
    scheduledAt: '2024-09-15T14:00:00Z',
    duration: 3600,
    participantCount: 18,
    organizerId: 'spk-004',
    organizerName: 'Ananya Patel',
    status: 'COMPLETED',
    source: 'teams',
    tags: ['security', 'architecture', 'review'],
    productivityScore: { overall: 85, agendaClarity: 90, decisionDensity: 78, actionClarity: 88, participation: 82, timeEfficiency: 85, explanations: {} },
    estimatedCost: { totalCostINR: 54000, participantCount: 18, durationMinutes: 60, averageHourlyCostINR: 3000, label: 'Estimated' },
    createdAt: '2024-09-15T13:00:00Z',
    processedAt: '2024-09-15T15:30:00Z',
  },
  {
    id: 'mtg-demo-004',
    organizationId: 'org-meetintel-demo',
    title: 'Project Phoenix Sprint Review',
    scheduledAt: '2024-09-14T11:00:00Z',
    duration: 2700,
    participantCount: 35,
    organizerId: 'spk-003',
    organizerName: 'Michael Rodriguez',
    status: 'COMPLETED',
    source: 'zoom',
    tags: ['product', 'sprint', 'phoenix'],
    productivityScore: { overall: 81, agendaClarity: 78, decisionDensity: 72, actionClarity: 90, participation: 75, timeEfficiency: 88, explanations: {} },
    estimatedCost: { totalCostINR: 43750, participantCount: 35, durationMinutes: 45, averageHourlyCostINR: 1667, label: 'Estimated' },
    createdAt: '2024-09-14T10:00:00Z',
    processedAt: '2024-09-14T12:00:00Z',
  },
  {
    id: 'mtg-demo-005',
    organizationId: 'org-meetintel-demo',
    title: 'AI/ML Platform Roadmap Planning',
    scheduledAt: '2024-09-13T15:00:00Z',
    duration: 4500,
    participantCount: 12,
    organizerId: 'spk-008',
    organizerName: 'Fatima Al-Hassan',
    status: 'COMPLETED',
    source: 'google_meet',
    tags: ['ai', 'ml', 'roadmap', 'planning'],
    productivityScore: { overall: 88, agendaClarity: 92, decisionDensity: 85, actionClarity: 90, participation: 88, timeEfficiency: 82, explanations: {} },
    estimatedCost: { totalCostINR: 30000, participantCount: 12, durationMinutes: 75, averageHourlyCostINR: 2000, label: 'Estimated' },
    createdAt: '2024-09-13T14:00:00Z',
    processedAt: '2024-09-13T16:30:00Z',
  },
  {
    id: 'mtg-demo-006',
    organizationId: 'org-meetintel-demo',
    title: 'Q4 Budget Planning Committee',
    scheduledAt: '2024-09-12T10:00:00Z',
    duration: 5400,
    participantCount: 42,
    organizerId: 'spk-006',
    organizerName: 'Lisa Thompson',
    status: 'COMPLETED',
    source: 'teams',
    tags: ['finance', 'budget', 'quarterly'],
    productivityScore: { overall: 74, agendaClarity: 80, decisionDensity: 68, actionClarity: 75, participation: 65, timeEfficiency: 78, explanations: {} },
    estimatedCost: { totalCostINR: 157500, participantCount: 42, durationMinutes: 90, averageHourlyCostINR: 2500, label: 'Estimated' },
    createdAt: '2024-09-12T09:00:00Z',
    processedAt: '2024-09-12T12:00:00Z',
  },
];

// ---- Analytics ----
export const demoAnalytics: MeetingAnalytics = {
  totalMeetings: 156,
  totalHours: 312,
  totalParticipants: 4280,
  averageDuration: 72,
  decisionsPerMeeting: 3.2,
  actionsPerMeeting: 5.8,
  actionCompletionRate: 68,
  decisionCompletionRate: 82,
  meetingEfficiency: 74,
  meetingsWithoutDecisions: 34,
  meetingsWithoutActions: 18,
  totalEstimatedCostINR: 15600000,
  meetingsByMonth: [
    { month: 'Apr 2024', count: 22, hours: 44 },
    { month: 'May 2024', count: 25, hours: 52 },
    { month: 'Jun 2024', count: 28, hours: 58 },
    { month: 'Jul 2024', count: 24, hours: 48 },
    { month: 'Aug 2024', count: 30, hours: 62 },
    { month: 'Sep 2024', count: 27, hours: 48 },
  ],
  topCategories: [
    { name: 'Engineering', count: 48 },
    { name: 'Product', count: 32 },
    { name: 'Strategy', count: 24 },
    { name: 'Security', count: 18 },
    { name: 'Finance', count: 16 },
    { name: 'HR', count: 12 },
    { name: 'Customer Success', count: 6 },
  ],
  participationDistribution: [
    { range: '1-10', count: 45 },
    { range: '11-25', count: 52 },
    { range: '26-50', count: 28 },
    { range: '51-100', count: 18 },
    { range: '100+', count: 13 },
  ],
  productivityTrend: [
    { date: '2024-04', score: 68 },
    { date: '2024-05', score: 71 },
    { date: '2024-06', score: 69 },
    { date: '2024-07', score: 74 },
    { date: '2024-08', score: 76 },
    { date: '2024-09', score: 78 },
  ],
};

// ---- Notifications ----
export const demoNotifications: Notification[] = [
  {
    id: 'notif-001', userId: 'user-demo-001', type: 'summary_ready',
    title: 'Meeting Intelligence Ready', message: 'AI analysis complete for "Global Product & Engineering Strategy Meeting"',
    meetingId: 'mtg-demo-001', isRead: false, createdAt: '2024-09-17T12:05:00Z',
  },
  {
    id: 'notif-002', userId: 'user-demo-001', type: 'action_assigned',
    title: 'Action Assigned to Your Team', message: 'David Kim assigned: Prepare AWS migration infrastructure. Due: October 1',
    meetingId: 'mtg-demo-001', isRead: false, createdAt: '2024-09-17T12:06:00Z',
  },
  {
    id: 'notif-003', userId: 'user-demo-001', type: 'decision_affecting',
    title: 'Decision Affecting Your Project', message: 'AWS migration approved — impacts Cloud Migration project',
    meetingId: 'mtg-demo-001', isRead: false, createdAt: '2024-09-17T12:07:00Z',
  },
  {
    id: 'notif-004', userId: 'user-demo-001', type: 'topic_related',
    title: 'Topic Related to Your Interest', message: 'Cloud Migration Strategy was discussed for 27 minutes',
    meetingId: 'mtg-demo-001', isRead: true, createdAt: '2024-09-17T12:08:00Z',
  },
  {
    id: 'notif-005', userId: 'user-demo-001', type: 'action_overdue',
    title: 'Overdue Action', message: 'Security review completion is approaching deadline',
    meetingId: 'mtg-demo-001', isRead: true, createdAt: '2024-09-17T14:00:00Z',
  },
];

export const demoProductivityScore: ProductivityScore = demoMeeting.productivityScore || {
  overall: 87,
  agendaClarity: 92,
  decisionDensity: 88,
  actionClarity: 91,
  participation: 58,
  timeEfficiency: 73,
  explanations: {
    agendaClarity: 'Clear agenda set at the beginning with 6 defined topics. All topics were covered within the allocated time.',
    decisionDensity: '7 decisions were made in a 102-minute meeting — above average for meetings of this size.',
    actionClarity: '14 action items with clear owners and deadlines. Only 1 action requires ownership confirmation.',
    participation: 'Only 12 of 487 participants actively contributed. Consider smaller breakout sessions for better engagement.',
    timeEfficiency: 'Cloud migration discussion ran slightly long at 27 minutes. Budget discussion was efficient at 9 minutes.',
  },
};

// ---- Full Meeting Intelligence ----
export const demoMeetingIntelligence: MeetingIntelligence = {
  meeting: demoMeeting,
  summaries: demoSummaries,
  speakers: demoSpeakers,
  transcript: demoTranscript,
  topics: demoTopics,
  decisions: demoDecisions,
  actions: demoActions,
  risks: demoRisks,
  questions: demoQuestions,
  commitments: demoCommitments,
  importantMoments: demoImportantMoments,
  missedInsights: demoMissedInsights,
};

// ---- Helper Functions ----

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function getConfidenceColor(confidence: string): string {
  switch (confidence) {
    case 'high': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'low': return '#ef4444';
    default: return '#6b7280';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#dc2626';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#6b7280';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return '#dc2626';
    case 'high': return '#f97316';
    case 'medium': return '#3b82f6';
    case 'low': return '#22c55e';
    default: return '#6b7280';
  }
}
