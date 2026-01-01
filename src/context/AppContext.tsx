import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Team, Deal, Memory, Tenant, Role, AppState } from '@/lib/types';
import { tenant as defaultTenant, users as defaultUsers, teams as defaultTeams, deals as defaultDeals, memories as defaultMemories, generateId } from '@/lib/dummy-data';

interface AppContextType extends AppState {
  switchRoleForDemo: (role: Role) => void;
  addMemory: (dealId: string, rawText: string) => void;
  assignDealOwner: (dealId: string, userId: string | undefined) => void;
  assignDealTeam: (dealId: string, teamId: string | undefined) => void;
  bulkAssignDeals: (dealIds: string[], ownerId?: string, teamId?: string) => void;
  changeUserRole: (userId: string, role: Role) => void;
  assignUserTeam: (userId: string, teamId: string | undefined) => void;
  toggleUserActive: (userId: string) => void;
  addUser: (name: string, email: string, role: Role, teamId?: string) => void;
  addTeam: (name: string, parentTeamId?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'longitudinal-deal-memory-state';

function loadState(): AppState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
  }
  return null;
}

function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

function getDefaultState(): AppState {
  return {
    currentUser: defaultUsers[0], // Start as Admin
    tenant: defaultTenant,
    users: defaultUsers,
    teams: defaultTeams,
    deals: defaultDeals,
    memories: defaultMemories,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = loadState();
    return saved || getDefaultState();
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const switchRoleForDemo = (role: Role) => {
    const userWithRole = state.users.find(u => u.role === role && u.active);
    if (userWithRole) {
      setState(prev => ({ ...prev, currentUser: userWithRole }));
    }
  };

  const addMemory = (dealId: string, rawText: string) => {
    const newMemory: Memory = {
      id: generateId(),
      dealId,
      authorUserId: state.currentUser.id,
      createdAt: new Date().toISOString(),
      rawText,
    };
    
    // Also update the deal's updatedAt
    setState(prev => ({
      ...prev,
      memories: [...prev.memories, newMemory],
      deals: prev.deals.map(d => 
        d.id === dealId ? { ...d, updatedAt: new Date().toISOString() } : d
      ),
    }));
  };

  const assignDealOwner = (dealId: string, userId: string | undefined) => {
    setState(prev => ({
      ...prev,
      deals: prev.deals.map(d => 
        d.id === dealId ? { ...d, ownerUserId: userId, updatedAt: new Date().toISOString() } : d
      ),
    }));
  };

  const assignDealTeam = (dealId: string, teamId: string | undefined) => {
    setState(prev => ({
      ...prev,
      deals: prev.deals.map(d => 
        d.id === dealId ? { ...d, teamId, updatedAt: new Date().toISOString() } : d
      ),
    }));
  };

  const bulkAssignDeals = (dealIds: string[], ownerId?: string, teamId?: string) => {
    setState(prev => ({
      ...prev,
      deals: prev.deals.map(d => {
        if (dealIds.includes(d.id)) {
          return {
            ...d,
            ...(ownerId !== undefined && { ownerUserId: ownerId }),
            ...(teamId !== undefined && { teamId }),
            updatedAt: new Date().toISOString(),
          };
        }
        return d;
      }),
    }));
  };

  const changeUserRole = (userId: string, role: Role) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => 
        u.id === userId ? { ...u, role } : u
      ),
    }));
  };

  const assignUserTeam = (userId: string, teamId: string | undefined) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => 
        u.id === userId ? { ...u, teamId } : u
      ),
    }));
  };

  const toggleUserActive = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => 
        u.id === userId ? { ...u, active: !u.active } : u
      ),
    }));
  };

  const addUser = (name: string, email: string, role: Role, teamId?: string) => {
    const newUser: User = {
      id: generateId(),
      name,
      email,
      role,
      teamId,
      active: true,
    };
    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
  };

  const addTeam = (name: string, parentTeamId?: string) => {
    const newTeam: Team = {
      id: generateId(),
      name,
      parentTeamId,
    };
    setState(prev => ({
      ...prev,
      teams: [...prev.teams, newTeam],
    }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      switchRoleForDemo,
      addMemory,
      assignDealOwner,
      assignDealTeam,
      bulkAssignDeals,
      changeUserRole,
      assignUserTeam,
      toggleUserActive,
      addUser,
      addTeam,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
