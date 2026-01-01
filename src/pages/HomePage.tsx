import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Briefcase, MessageSquare, Clock, AlertTriangle, ArrowRight, UserX, Users } from 'lucide-react';
import { getAccessibleDeals } from '@/lib/team-utils';
import { isStale, formatDate } from '@/lib/delta-utils';

export default function HomePage() {
  const { currentUser, deals, teams, memories, users } = useApp();
  
  const accessibleDeals = getAccessibleDeals(
    currentUser.id,
    currentUser.role,
    currentUser.teamId,
    deals,
    teams
  );

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // KPI calculations
  const activeDeals = accessibleDeals.filter(d => d.status === 'OPEN').length;
  
  const memoriesThisWeek = memories.filter(m => {
    const memDate = new Date(m.createdAt);
    return memDate >= weekAgo && accessibleDeals.some(d => d.id === m.dealId);
  }).length;

  const updatedLast7Days = accessibleDeals.filter(d => {
    const updateDate = new Date(d.updatedAt);
    return updateDate >= weekAgo;
  }).length;

  const staleDeals = accessibleDeals.filter(d => 
    d.status === 'OPEN' && isStale(d.updatedAt, 7)
  ).length;

  // Alerts
  const dealsMissingOwner = accessibleDeals.filter(d => !d.ownerUserId && d.status === 'OPEN');
  const dealsMissingTeam = accessibleDeals.filter(d => !d.teamId && d.status === 'OPEN');

  // Recently updated deals
  const recentDeals = [...accessibleDeals]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const getUserName = (userId?: string) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {currentUser.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your deals.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Deals"
          value={activeDeals}
          icon={<Briefcase className="w-5 h-5" />}
        />
        <KpiCard
          title="Memories This Week"
          value={memoriesThisWeek}
          icon={<MessageSquare className="w-5 h-5" />}
        />
        <KpiCard
          title="Updated (7 days)"
          value={updatedLast7Days}
          icon={<Clock className="w-5 h-5" />}
        />
        <KpiCard
          title="Stale Deals"
          value={staleDeals}
          description="No update in 7+ days"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dealsMissingOwner.length > 0 && (
              <div className="alert-card flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <UserX className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium">{dealsMissingOwner.length} deals missing owner</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Assign owners to track properly</p>
                </div>
              </div>
            )}
            {dealsMissingTeam.length > 0 && (
              <div className="alert-card flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium">{dealsMissingTeam.length} deals missing team</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Assign teams for visibility</p>
                </div>
              </div>
            )}
            {dealsMissingOwner.length === 0 && dealsMissingTeam.length === 0 && (
              <p className="text-sm text-muted-foreground">No alerts at this time.</p>
            )}
          </CardContent>
        </Card>

        {/* Recently Updated Deals */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recently Updated Deals</CardTitle>
            <Link to="/deals" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDeals.map(deal => (
                <Link
                  key={deal.id}
                  to={`/deals/${deal.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{deal.name}</p>
                    <p className="text-xs text-muted-foreground">{deal.company}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {getUserName(deal.ownerUserId)}
                    </span>
                    <StatusBadge status={deal.status} />
                    <span className="text-xs text-muted-foreground w-20 text-right">
                      {formatDate(deal.updatedAt)}
                    </span>
                  </div>
                </Link>
              ))}
              {recentDeals.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No deals to display.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
