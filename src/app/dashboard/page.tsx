"use client";

import { useAuth } from "@/hooks/use-auth";
import { AdminDashboard } from "@/components/dashboard/rank-specific/admin-dashboard";
import { ConquistadorDashboard } from "@/components/dashboard/rank-specific/conquistador-dashboard";
import { ErranteDashboard } from "@/components/dashboard/rank-specific/errante-dashboard";
import { ScoutDashboard } from "@/components/dashboard/rank-specific/scout-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedPage } from "@/components/AnimatedPage";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
        <div className="p-4 md:p-6 space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
    );
  }

  const renderDashboard = () => {
    switch (user.rank) {
      case "Errante":
        return <ErranteDashboard user={user} />;
      case "Scout":
        return <ScoutDashboard user={user} />;
      case "Conquistador":
        return <ConquistadorDashboard user={user} />;
      case "Admin":
        return <AdminDashboard user={user} />;
      default:
        return <div>Invalid user rank.</div>;
    }
  };

  return (
    <AnimatedPage>
        <div className="p-4 md:p-6">
            {renderDashboard()}
        </div>
    </AnimatedPage>
  );
}
