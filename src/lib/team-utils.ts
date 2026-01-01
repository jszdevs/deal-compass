import { Team, User, Deal } from './types';

export function getTeamSubtree(teamId: string, allTeams: Team[]): string[] {
  const subtree: string[] = [teamId];
  
  const findChildren = (parentId: string) => {
    allTeams.forEach(team => {
      if (team.parentTeamId === parentId) {
        subtree.push(team.id);
        findChildren(team.id);
      }
    });
  };
  
  findChildren(teamId);
  return subtree;
}

export function getTeamById(teamId: string | undefined, allTeams: Team[]): Team | undefined {
  if (!teamId) return undefined;
  return allTeams.find(t => t.id === teamId);
}

export function getUserById(userId: string | undefined, allUsers: User[]): User | undefined {
  if (!userId) return undefined;
  return allUsers.find(u => u.id === userId);
}

export function getTeamMembers(teamId: string, allUsers: User[]): User[] {
  return allUsers.filter(u => u.teamId === teamId);
}

export function getTeamDealsCount(teamId: string, allDeals: Deal[]): number {
  return allDeals.filter(d => d.teamId === teamId).length;
}

export function getChildTeams(parentTeamId: string, allTeams: Team[]): Team[] {
  return allTeams.filter(t => t.parentTeamId === parentTeamId);
}

export function buildTeamTree(allTeams: Team[]): Team[] {
  return allTeams.filter(t => !t.parentTeamId);
}

export function canUserAccessDeal(userId: string, userRole: string, userTeamId: string | undefined, deal: Deal, allTeams: Team[]): boolean {
  if (userRole === 'ADMIN') {
    return true;
  }
  
  if (userRole === 'REP') {
    return deal.ownerUserId === userId;
  }
  
  if (userRole === 'MANAGER' && userTeamId) {
    const subtree = getTeamSubtree(userTeamId, allTeams);
    return deal.teamId ? subtree.includes(deal.teamId) : false;
  }
  
  return false;
}

export function getAccessibleDeals(userId: string, userRole: string, userTeamId: string | undefined, allDeals: Deal[], allTeams: Team[]): Deal[] {
  return allDeals.filter(deal => canUserAccessDeal(userId, userRole, userTeamId, deal, allTeams));
}
