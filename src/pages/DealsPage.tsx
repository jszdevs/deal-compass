import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { getAccessibleDeals, getTeamById, getUserById } from '@/lib/team-utils';
import { isStale, formatDate } from '@/lib/delta-utils';
import { DealStatus } from '@/lib/types';

export default function DealsPage() {
  const { currentUser, deals, teams, users } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'ALL'>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [ownerFilter, setOwnerFilter] = useState<string>('ALL');
  const [showStaleOnly, setShowStaleOnly] = useState(false);

  const accessibleDeals = useMemo(() => 
    getAccessibleDeals(currentUser.id, currentUser.role, currentUser.teamId, deals, teams),
    [currentUser, deals, teams]
  );

  const filteredDeals = useMemo(() => {
    return accessibleDeals.filter(deal => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!deal.name.toLowerCase().includes(query) && 
            !deal.company.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL' && deal.status !== statusFilter) {
        return false;
      }

      // Team filter
      if (teamFilter !== 'ALL' && deal.teamId !== teamFilter) {
        return false;
      }

      // Owner filter
      if (ownerFilter !== 'ALL') {
        if (ownerFilter === 'UNASSIGNED' && deal.ownerUserId) {
          return false;
        }
        if (ownerFilter !== 'UNASSIGNED' && deal.ownerUserId !== ownerFilter) {
          return false;
        }
      }

      // Stale filter
      if (showStaleOnly && !isStale(deal.updatedAt, 7)) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [accessibleDeals, searchQuery, statusFilter, teamFilter, ownerFilter, showStaleOnly]);

  const canFilterByTeam = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';
  const canFilterByOwner = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Deals</h1>
        <p className="text-muted-foreground mt-1">
          {currentUser.role === 'REP' 
            ? 'Manage your assigned deals' 
            : 'View and manage all accessible deals'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DealStatus | 'ALL')}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="WON">Won</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                </SelectContent>
              </Select>

              {canFilterByTeam && (
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Teams</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {canFilterByOwner && (
                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Owners</SelectItem>
                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                    {users.filter(u => u.active).map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  id="stale-filter"
                  checked={showStaleOnly}
                  onCheckedChange={setShowStaleOnly}
                />
                <Label htmlFor="stale-filter" className="text-sm text-muted-foreground">
                  Stale (7+ days)
                </Label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map(deal => {
                const owner = getUserById(deal.ownerUserId, users);
                const team = getTeamById(deal.teamId, teams);
                const stale = isStale(deal.updatedAt, 7) && deal.status === 'OPEN';

                return (
                  <TableRow key={deal.id} className="cursor-pointer hover:bg-muted/50">
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
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {team ? (
                        <span>{team.name}</span>
                      ) : (
                        <span className="text-muted-foreground italic">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={deal.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={stale ? 'text-warning font-medium' : 'text-muted-foreground'}>
                        {formatDate(deal.updatedAt)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredDeals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No deals found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
