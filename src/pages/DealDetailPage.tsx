import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge, RoleBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, ChevronDown, Plus, Clock, TrendingUp, AlertCircle, Users, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { getUserById, getTeamById, canUserAccessDeal } from '@/lib/team-utils';
import { getMemoriesForDeal, generateSnapshot, generateDeltaBullets, formatDate } from '@/lib/delta-utils';
import { cn } from '@/lib/utils';

const deltaIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  timeline: Calendar,
  pricing: DollarSign,
  objection: AlertCircle,
  nextstep: CheckCircle,
  stakeholder: Users,
  demo: TrendingUp,
  contract: CheckCircle,
  update: Clock,
};

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, deals, teams, users, memories, addMemory } = useApp();
  
  const [newMemoryText, setNewMemoryText] = useState('');
  const [expandedMemories, setExpandedMemories] = useState<Set<string>>(new Set());

  const deal = deals.find(d => d.id === id);
  
  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-xl font-semibold">Deal not found</h1>
        <Link to="/deals" className="text-primary hover:underline mt-2">Back to Deals</Link>
      </div>
    );
  }

  const hasAccess = canUserAccessDeal(currentUser.id, currentUser.role, currentUser.teamId, deal, teams);
  
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-xl font-semibold">Not Authorized</h1>
        <p className="text-muted-foreground mt-2">You don't have access to view this deal.</p>
        <Link to="/deals" className="text-primary hover:underline mt-4">Back to Deals</Link>
      </div>
    );
  }

  const owner = getUserById(deal.ownerUserId, users);
  const team = getTeamById(deal.teamId, teams);
  const dealMemories = getMemoriesForDeal(deal.id, memories);
  const snapshot = generateSnapshot(dealMemories);

  // Get delta bullets from comparing last two memories
  const lastMemory = dealMemories[dealMemories.length - 1];
  const prevMemory = dealMemories[dealMemories.length - 2];
  const latestDeltas = lastMemory ? generateDeltaBullets(lastMemory, prevMemory) : [];

  const canAddMemory = currentUser.role === 'REP' 
    ? deal.ownerUserId === currentUser.id 
    : true;

  const handleAddMemory = () => {
    if (!newMemoryText.trim()) return;
    addMemory(deal.id, newMemoryText.trim());
    setNewMemoryText('');
  };

  const toggleMemoryExpand = (memoryId: string) => {
    setExpandedMemories(prev => {
      const next = new Set(prev);
      if (next.has(memoryId)) {
        next.delete(memoryId);
      } else {
        next.add(memoryId);
      }
      return next;
    });
  };

  // Reverse chronological for timeline display
  const timelineMemories = [...dealMemories].reverse();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/deals')} className="mb-2 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Deals
          </Button>
          <h1 className="text-2xl font-semibold">{deal.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-muted-foreground">{deal.company}</span>
            <StatusBadge status={deal.status} />
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="text-muted-foreground">Owner: <span className="text-foreground">{owner?.name || 'Unassigned'}</span></p>
          <p className="text-muted-foreground">Team: <span className="text-foreground">{team?.name || 'None'}</span></p>
        </div>
      </div>

      {/* Snapshot and Deltas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Current Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{snapshot}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              What Changed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestDeltas.length > 0 ? (
              <ul className="space-y-2">
                {latestDeltas.map((delta, idx) => {
                  const Icon = deltaIcons[delta.type] || Clock;
                  return (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Icon className="w-4 h-4 text-primary" />
                      <span>{delta.text}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No changes detected.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Memory */}
      {canAddMemory && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Add Memory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Document what happened... Include details about timeline, pricing, stakeholders, objections, or next steps."
              value={newMemoryText}
              onChange={(e) => setNewMemoryText(e.target.value)}
              rows={3}
            />
            <Button onClick={handleAddMemory} disabled={!newMemoryText.trim()}>
              <Plus className="w-4 h-4 mr-1" />
              Add Memory
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {timelineMemories.length > 0 ? (
            <div className="space-y-0">
              {timelineMemories.map((memory, idx) => {
                const author = getUserById(memory.authorUserId, users);
                const prevMem = idx < timelineMemories.length - 1 ? timelineMemories[idx + 1] : undefined;
                const deltas = generateDeltaBullets(memory, prevMem);
                const isExpanded = expandedMemories.has(memory.id);

                return (
                  <div key={memory.id} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{author?.name || 'Unknown'}</span>
                        <span className="text-muted-foreground">{formatDate(memory.createdAt)}</span>
                      </div>
                      
                      {/* Delta bullets */}
                      <div className="flex flex-wrap gap-1.5">
                        {deltas.map((delta, dIdx) => (
                          <Badge key={dIdx} variant="secondary" className="text-xs font-normal">
                            {delta.text}
                          </Badge>
                        ))}
                      </div>

                      {/* Collapsible raw text */}
                      <Collapsible open={isExpanded} onOpenChange={() => toggleMemoryExpand(memory.id)}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
                            <ChevronDown className={cn("w-3 h-3 mr-1 transition-transform", isExpanded && "rotate-180")} />
                            {isExpanded ? 'Hide source' : 'View source'}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 p-3 bg-muted rounded-md text-sm text-muted-foreground">
                            {memory.rawText}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No memories recorded yet. Add the first one above.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
