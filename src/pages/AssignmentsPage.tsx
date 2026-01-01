import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/ui/status-badge';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, UserX, Users } from 'lucide-react';
import { getAccessibleDeals, getTeamById, getUserById, getTeamSubtree } from '@/lib/team-utils';
import { isStale, formatDate } from '@/lib/delta-utils';

export default function AssignmentsPage() {
  const { currentUser, deals, teams, users, bulkAssignDeals } = useApp();
  
  const [selectedDeals, setSelectedDeals] = useState<Set<string>>(new Set());
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkOwnerId, setBulkOwnerId] = useState<string>('');
  const [bulkTeamId, setBulkTeamId] = useState<string>('');

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

  const accessibleDeals = useMemo(() => 
    getAccessibleDeals(currentUser.id, currentUser.role, currentUser.teamId, deals, teams),
    [currentUser, deals, teams]
  );

  // Filter to show problematic deals
  const problemDeals = useMemo(() => {
    return accessibleDeals.filter(deal => {
      const missingOwner = !deal.ownerUserId;
      const missingTeam = !deal.teamId;
      const stale = deal.status === 'OPEN' && isStale(deal.updatedAt, 7);
      return missingOwner || missingTeam || stale;
    });
  }, [accessibleDeals]);

  // For managers, show only users in their subtree
  const assignableUsers = useMemo(() => {
    if (currentUser.role === 'ADMIN') {
      return users.filter(u => u.active);
    }
    if (currentUser.teamId) {
      const subtree = getTeamSubtree(currentUser.teamId, teams);
      return users.filter(u => u.active && u.teamId && subtree.includes(u.teamId));
    }
    return [];
  }, [currentUser, users, teams]);

  const assignableTeams = useMemo(() => {
    if (currentUser.role === 'ADMIN') {
      return teams;
    }
    if (currentUser.teamId) {
      const subtree = getTeamSubtree(currentUser.teamId, teams);
      return teams.filter(t => subtree.includes(t.id));
    }
    return [];
  }, [currentUser, teams]);

  const toggleDealSelection = (dealId: string) => {
    setSelectedDeals(prev => {
      const next = new Set(prev);
      if (next.has(dealId)) {
        next.delete(dealId);
      } else {
        next.add(dealId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedDeals.size === problemDeals.length) {
      setSelectedDeals(new Set());
    } else {
      setSelectedDeals(new Set(problemDeals.map(d => d.id)));
    }
  };

  const handleBulkAssign = () => {
    const dealIds = Array.from(selectedDeals);
    bulkAssignDeals(
      dealIds,
      bulkOwnerId || undefined,
      bulkTeamId || undefined
    );
    setSelectedDeals(new Set());
    setBulkOwnerId('');
    setBulkTeamId('');
    setBulkModalOpen(false);
  };

  const getIssueType = (deal: typeof problemDeals[0]) => {
    const issues: string[] = [];
    if (!deal.ownerUserId) issues.push('No owner');
    if (!deal.teamId) issues.push('No team');
    if (deal.status === 'OPEN' && isStale(deal.updatedAt, 7)) issues.push('Stale');
    return issues;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Assignments</h1>
          <p className="text-muted-foreground mt-1">Manage deals needing attention</p>
        </div>
        {selectedDeals.size > 0 && (
          <Button onClick={() => setBulkModalOpen(true)}>
            Bulk Assign ({selectedDeals.size})
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <UserX className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {problemDeals.filter(d => !d.ownerUserId).length}
                </p>
                <p className="text-sm text-muted-foreground">Missing Owner</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {problemDeals.filter(d => !d.teamId).length}
                </p>
                <p className="text-sm text-muted-foreground">Missing Team</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {problemDeals.filter(d => d.status === 'OPEN' && isStale(d.updatedAt, 7)).length}
                </p>
                <p className="text-sm text-muted-foreground">Stale Deals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Deals Needing Attention</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedDeals.size === problemDeals.length && problemDeals.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Deal</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problemDeals.map(deal => {
                const owner = getUserById(deal.ownerUserId, users);
                const team = getTeamById(deal.teamId, teams);
                const issues = getIssueType(deal);

                return (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedDeals.has(deal.id)}
                        onCheckedChange={() => toggleDealSelection(deal.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Link to={`/deals/${deal.id}`} className="font-medium hover:underline">
                        {deal.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{deal.company}</TableCell>
                    <TableCell>
                      {owner ? (
                        <span>{owner.name}</span>
                      ) : (
                        <span className="text-warning italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {team ? (
                        <span>{team.name}</span>
                      ) : (
                        <span className="text-warning italic">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={deal.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {issues.map((issue, idx) => (
                          <span key={idx} className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(deal.updatedAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {problemDeals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    All deals are properly assigned. Great work!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bulk Assign Modal */}
      <Dialog open={bulkModalOpen} onOpenChange={setBulkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Assign {selectedDeals.size} Deals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Assign Owner</Label>
              <Select value={bulkOwnerId} onValueChange={setBulkOwnerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Leave unchanged" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Leave unchanged</SelectItem>
                  {assignableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign Team</Label>
              <Select value={bulkTeamId} onValueChange={setBulkTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Leave unchanged" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Leave unchanged</SelectItem>
                  {assignableTeams.map(team => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleBulkAssign}
              disabled={!bulkOwnerId && !bulkTeamId}
            >
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
