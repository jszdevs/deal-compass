import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Users, ChevronRight, Plus, Briefcase } from 'lucide-react';
import { getTeamMembers, getTeamDealsCount, getChildTeams, buildTeamTree, getTeamSubtree } from '@/lib/team-utils';
import { Team, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function TeamsPage() {
  const { currentUser, teams, users, deals, addTeam, assignUserTeam } = useApp();
  
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id || null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamParent, setNewTeamParent] = useState<string>('');
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  // Access control
  if (currentUser.role === 'REP') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-xl font-semibold">Not Authorized</h1>
        <p className="text-muted-foreground mt-2">You don't have access to view this page.</p>
        <Link to="/deals" className="text-primary hover:underline mt-4">Back to Deals</Link>
      </div>
    );
  }

  // For managers, only show their subtree
  const accessibleTeams = currentUser.role === 'MANAGER' && currentUser.teamId
    ? teams.filter(t => getTeamSubtree(currentUser.teamId!, teams).includes(t.id))
    : teams;

  const rootTeams = buildTeamTree(accessibleTeams);
  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const teamMembers = selectedTeamId ? getTeamMembers(selectedTeamId, users) : [];
  const dealsCount = selectedTeamId ? getTeamDealsCount(selectedTeamId, deals) : 0;
  const childTeams = selectedTeamId ? getChildTeams(selectedTeamId, teams) : [];

  // Users not in any team (for adding)
  const availableMembers = users.filter(u => 
    u.active && (!u.teamId || u.teamId !== selectedTeamId)
  );

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    addTeam(newTeamName.trim(), newTeamParent || undefined);
    setNewTeamName('');
    setNewTeamParent('');
    setAddTeamOpen(false);
  };

  const handleAddMember = () => {
    if (!selectedMemberId || !selectedTeamId) return;
    assignUserTeam(selectedMemberId, selectedTeamId);
    setSelectedMemberId('');
    setAddMemberOpen(false);
  };

  const renderTeamTree = (team: Team, depth: number = 0) => {
    const children = getChildTeams(team.id, accessibleTeams);
    const isSelected = selectedTeamId === team.id;

    return (
      <div key={team.id}>
        <button
          onClick={() => setSelectedTeamId(team.id)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
            isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <Users className="w-4 h-4" />
          {team.name}
        </button>
        {children.map(child => renderTeamTree(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Teams</h1>
          <p className="text-muted-foreground mt-1">Manage team structure and members</p>
        </div>
        {currentUser.role === 'ADMIN' && (
          <Dialog open={addTeamOpen} onOpenChange={setAddTeamOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Enter team name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parent Team (optional)</Label>
                  <Select value={newTeamParent} onValueChange={setNewTeamParent}>
                    <SelectTrigger>
                      <SelectValue placeholder="No parent (root team)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No parent</SelectItem>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddTeamOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTeam} disabled={!newTeamName.trim()}>Create Team</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Tree */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Team Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {rootTeams.map(team => renderTeamTree(team))}
              {rootTeams.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No teams created yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                {selectedTeam ? selectedTeam.name : 'Select a Team'}
              </CardTitle>
              {selectedTeam && (
                <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Member to {selectedTeam.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <Label>Select User</Label>
                      <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Choose a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMembers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddMemberOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddMember} disabled={!selectedMemberId}>Add Member</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedTeam ? (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      Members
                    </div>
                    <p className="text-2xl font-semibold mt-1">{teamMembers.length}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      Deals
                    </div>
                    <p className="text-2xl font-semibold mt-1">{dealsCount}</p>
                  </div>
                </div>

                {/* Child Teams */}
                {childTeams.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Sub-teams</h3>
                    <div className="space-y-1">
                      {childTeams.map(child => (
                        <button
                          key={child.id}
                          onClick={() => setSelectedTeamId(child.id)}
                          className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted text-sm"
                        >
                          <span>{child.name}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Members */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Members</h3>
                  {teamMembers.length > 0 ? (
                    <div className="space-y-2">
                      {teamMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded",
                            member.role === 'ADMIN' && 'role-admin',
                            member.role === 'MANAGER' && 'role-manager',
                            member.role === 'REP' && 'role-rep'
                          )}>
                            {member.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No members in this team.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Select a team from the list to view details.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
