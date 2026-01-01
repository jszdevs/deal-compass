export type Role = 'ADMIN' | 'MANAGER' | 'REP';
export type DealStatus = 'OPEN' | 'WON' | 'LOST';

export interface Tenant {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId?: string;
  active: boolean;
}

export interface Team {
  id: string;
  name: string;
  parentTeamId?: string;
}

export interface Deal {
  id: string;
  name: string;
  company: string;
  ownerUserId?: string;
  teamId?: string;
  status: DealStatus;
  updatedAt: string;
}

export interface Memory {
  id: string;
  dealId: string;
  authorUserId: string;
  createdAt: string;
  rawText: string;
}

export interface DeltaBullet {
  type: string;
  text: string;
}

export interface AppState {
  currentUser: User;
  tenant: Tenant;
  users: User[];
  teams: Team[];
  deals: Deal[];
  memories: Memory[];
}
