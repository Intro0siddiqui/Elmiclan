import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Castle, Users2 } from "lucide-react";
import type { User } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

export function ConquistadorDashboard({ user }: { user: User }) {
  return (
    <div className="grid gap-6">
       <Card>
        <CardHeader>
          <CardTitle>Hail, Conquistador {user.name}!</CardTitle>
          <CardDescription>You are the vanguard of the clan, a leader who turns strategy into victory.</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground">
            As a Conquistador, you lead our forces, claim new lands, and solidify the clan's influence. Your decisions shape our destiny.
          </p>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-3">
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Campaigns Led</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Victories that strengthen the clan.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outposts Secured</CardTitle>
            <Castle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Expanding our dominion.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Troops Commanded</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150+</div>
            <p className="text-xs text-muted-foreground">
              Warriors who follow your banner.
            </p>
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>War Council Report</CardTitle>
            <CardDescription>Current campaign progress and resource allocation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Northern Expanse Campaign</span>
                    <span className="text-sm text-muted-foreground">75%</span>
                </div>
                <Progress value={75} aria-label="Northern Expanse Campaign Progress"/>
             </div>
             <div>
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Ironstone Mine Fortification</span>
                    <span className="text-sm text-muted-foreground">40%</span>
                </div>
                <Progress value={40} aria-label="Ironstone Mine Fortification Progress"/>
             </div>
          </CardContent>
       </Card>
    </div>
  );
}
