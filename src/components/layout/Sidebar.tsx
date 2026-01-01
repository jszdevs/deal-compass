import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, Users, UsersRound, GitBranch, Settings } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('ADMIN' | 'MANAGER' | 'REP')[];
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home, roles: ['ADMIN', 'MANAGER', 'REP'] },
  { label: 'Deals', href: '/deals', icon: Briefcase, roles: ['ADMIN', 'MANAGER', 'REP'] },
  { label: 'Teams', href: '/teams', icon: UsersRound, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Users', href: '/users', icon: Users, roles: ['ADMIN'] },
  { label: 'Assignments', href: '/assignments', icon: GitBranch, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN', 'MANAGER', 'REP'] },
];

export function Sidebar() {
  const location = useLocation();
  const { currentUser } = useApp();

  const accessibleItems = navItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  return (
    <aside className="w-56 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Deal Memory</h1>
            <p className="text-xs text-muted-foreground">Longitudinal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {accessibleItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser.role.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
