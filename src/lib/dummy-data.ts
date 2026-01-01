import { Tenant, User, Team, Deal, Memory } from './types';

export const tenant: Tenant = {
  id: 'tenant-1',
  name: 'Acme Sales',
};

export const users: User[] = [
  { id: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@acme.com', role: 'ADMIN', teamId: 'team-1', active: true },
  { id: 'user-2', name: 'Marcus Johnson', email: 'marcus.johnson@acme.com', role: 'MANAGER', teamId: 'team-2', active: true },
  { id: 'user-3', name: 'Emily Davis', email: 'emily.davis@acme.com', role: 'REP', teamId: 'team-2', active: true },
  { id: 'user-4', name: 'James Wilson', email: 'james.wilson@acme.com', role: 'REP', teamId: 'team-3', active: true },
  { id: 'user-5', name: 'Lisa Park', email: 'lisa.park@acme.com', role: 'MANAGER', teamId: 'team-3', active: true },
  { id: 'user-6', name: 'David Brown', email: 'david.brown@acme.com', role: 'REP', teamId: 'team-2', active: false },
  { id: 'user-7', name: 'Rachel Kim', email: 'rachel.kim@acme.com', role: 'REP', teamId: 'team-4', active: true },
];

export const teams: Team[] = [
  { id: 'team-1', name: 'Executive' },
  { id: 'team-2', name: 'Enterprise Sales', parentTeamId: 'team-1' },
  { id: 'team-3', name: 'Mid-Market Sales', parentTeamId: 'team-1' },
  { id: 'team-4', name: 'SMB Sales', parentTeamId: 'team-3' },
];

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

export const deals: Deal[] = [
  { id: 'deal-1', name: 'Enterprise Platform License', company: 'TechCorp Industries', ownerUserId: 'user-3', teamId: 'team-2', status: 'OPEN', updatedAt: daysAgo(1) },
  { id: 'deal-2', name: 'Annual SaaS Subscription', company: 'Global Finance Ltd', ownerUserId: 'user-3', teamId: 'team-2', status: 'OPEN', updatedAt: daysAgo(2) },
  { id: 'deal-3', name: 'Security Suite Upgrade', company: 'SecureNet Systems', ownerUserId: 'user-4', teamId: 'team-3', status: 'WON', updatedAt: daysAgo(5) },
  { id: 'deal-4', name: 'Data Analytics Platform', company: 'DataFlow Inc', ownerUserId: 'user-4', teamId: 'team-3', status: 'OPEN', updatedAt: daysAgo(10) },
  { id: 'deal-5', name: 'Cloud Migration Project', company: 'Legacy Systems Co', ownerUserId: 'user-7', teamId: 'team-4', status: 'OPEN', updatedAt: daysAgo(3) },
  { id: 'deal-6', name: 'API Integration Package', company: 'ConnectHub', ownerUserId: 'user-7', teamId: 'team-4', status: 'LOST', updatedAt: daysAgo(15) },
  { id: 'deal-7', name: 'Starter Plan Upgrade', company: 'GrowthStart LLC', ownerUserId: undefined, teamId: 'team-2', status: 'OPEN', updatedAt: daysAgo(4) },
  { id: 'deal-8', name: 'Custom Development', company: 'BuildIt Corp', ownerUserId: 'user-3', teamId: undefined, status: 'OPEN', updatedAt: daysAgo(8) },
  { id: 'deal-9', name: 'Compliance Module', company: 'RegTech Solutions', ownerUserId: 'user-4', teamId: 'team-3', status: 'OPEN', updatedAt: daysAgo(12) },
  { id: 'deal-10', name: 'Training Package', company: 'LearnFast Academy', ownerUserId: 'user-7', teamId: 'team-4', status: 'OPEN', updatedAt: daysAgo(1) },
];

export const memories: Memory[] = [
  // Deal 1 - Enterprise Platform License
  { id: 'mem-1', dealId: 'deal-1', authorUserId: 'user-3', createdAt: daysAgo(7), rawText: 'Initial discovery call. Customer is looking for a platform to consolidate their sales tools. Current budget is around $150k annually. Timeline is Q2 next year.' },
  { id: 'mem-2', dealId: 'deal-1', authorUserId: 'user-3', createdAt: daysAgo(4), rawText: 'Follow up call with their VP of Sales. Main objection is integration complexity with their existing CRM. Champion identified: Director of RevOps.' },
  { id: 'mem-3', dealId: 'deal-1', authorUserId: 'user-3', createdAt: daysAgo(1), rawText: 'Sent revised pricing proposal. Updated budget to $180k to include premium support. Next step is a technical review meeting scheduled for next week.' },

  // Deal 2 - Annual SaaS Subscription
  { id: 'mem-4', dealId: 'deal-2', authorUserId: 'user-3', createdAt: daysAgo(5), rawText: 'Demo completed successfully. Finance team was impressed with reporting capabilities. Need to address timeline concerns - they want faster implementation.' },
  { id: 'mem-5', dealId: 'deal-2', authorUserId: 'user-3', createdAt: daysAgo(2), rawText: 'Timeline adjusted to 6 weeks for implementation. Pricing discussion moved to next call. Champion confirmed as CFO who drove the initial inquiry.' },

  // Deal 3 - Security Suite Upgrade
  { id: 'mem-6', dealId: 'deal-3', authorUserId: 'user-4', createdAt: daysAgo(12), rawText: 'Initial contact from their CISO. Current security tools are outdated. Budget approved for modernization.' },
  { id: 'mem-7', dealId: 'deal-3', authorUserId: 'user-4', createdAt: daysAgo(5), rawText: 'Contract signed. Implementation starts next month. Total deal value $95k.' },

  // Deal 4 - Data Analytics Platform
  { id: 'mem-8', dealId: 'deal-4', authorUserId: 'user-4', createdAt: daysAgo(20), rawText: 'Discovery call. They need a unified analytics solution. Current tools are fragmented across departments.' },
  { id: 'mem-9', dealId: 'deal-4', authorUserId: 'user-4', createdAt: daysAgo(10), rawText: 'Demo with data team. Some objections around data migration complexity. Need to follow up with migration plan.' },

  // Deal 5 - Cloud Migration Project
  { id: 'mem-10', dealId: 'deal-5', authorUserId: 'user-7', createdAt: daysAgo(6), rawText: 'Initial assessment call. Legacy on-prem infrastructure needs cloud migration. Budget range $200-300k.' },
  { id: 'mem-11', dealId: 'deal-5', authorUserId: 'user-7', createdAt: daysAgo(3), rawText: 'Technical deep-dive with their IT team. Timeline extended to accommodate security review. Champion is the CTO.' },

  // Deal 10 - Training Package
  { id: 'mem-12', dealId: 'deal-10', authorUserId: 'user-7', createdAt: daysAgo(3), rawText: 'Initial call. They need training for 50+ sales reps. Looking at our certification program.' },
  { id: 'mem-13', dealId: 'deal-10', authorUserId: 'user-7', createdAt: daysAgo(1), rawText: 'Sent pricing for training packages. Budget approved. Next step is to finalize training schedule and materials.' },
];

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
