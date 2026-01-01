import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';

export default function SettingsPage() {
  const { currentUser, tenant } = useApp();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-medium">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                <p className="text-xs text-muted-foreground capitalize mt-1">Role: {currentUser.role.toLowerCase()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tenant Name</p>
              <p className="font-medium">{tenant.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tenant ID</p>
              <p className="font-mono text-sm">{tenant.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">About This Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This is a UI-only demonstration of the Longitudinal Deal Memory platform. 
              All data is stored locally in your browser and will persist across page refreshes. 
              Use the role switcher in the top-right corner to experience different permission levels:
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary">Admin:</span>
                <span className="text-muted-foreground">Full access to all deals, users, teams, and assignments.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-warning">Manager:</span>
                <span className="text-muted-foreground">Access to deals within their team subtree, plus teams and assignments.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">Rep:</span>
                <span className="text-muted-foreground">Access only to their own assigned deals.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
