import { Search, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/lib/types';
import { cn } from '@/lib/utils';

const roleColors: Record<Role, string> = {
  ADMIN: 'role-admin',
  MANAGER: 'role-manager',
  REP: 'role-rep',
};

export function Topbar() {
  const { currentUser, tenant, switchRoleForDemo } = useApp();

  const handleRoleSwitch = (role: Role) => {
    switchRoleForDemo(role);
  };

  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search deals, contacts..."
            className="w-80 pl-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{tenant.name}</span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Badge variant="secondary" className={cn("font-medium", roleColors[currentUser.role])}>
                {currentUser.role}
              </Badge>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleRoleSwitch('ADMIN')}>
              <Badge variant="secondary" className="role-admin mr-2">ADMIN</Badge>
              Full access
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleSwitch('MANAGER')}>
              <Badge variant="secondary" className="role-manager mr-2">MANAGER</Badge>
              Team access
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleSwitch('REP')}>
              <Badge variant="secondary" className="role-rep mr-2">REP</Badge>
              Own deals only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
