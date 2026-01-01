import { DealStatus, Role } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: DealStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusClasses: Record<DealStatus, string> = {
    OPEN: 'status-open',
    WON: 'status-won',
    LOST: 'status-lost',
  };

  return (
    <Badge variant="outline" className={cn("font-medium", statusClasses[status])}>
      {status}
    </Badge>
  );
}

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const roleClasses: Record<Role, string> = {
    ADMIN: 'role-admin',
    MANAGER: 'role-manager',
    REP: 'role-rep',
  };

  return (
    <Badge variant="secondary" className={cn("font-medium", roleClasses[role])}>
      {role}
    </Badge>
  );
}
