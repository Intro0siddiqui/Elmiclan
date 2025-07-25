import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Binoculars, MapTrifold, Compass } from "lucide-react";
import type { User } from "@/lib/types";
import Image from "next/image";

export function ScoutDashboard({ user }: { user: User }) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Greetings, Scout {user.name}!</CardTitle>
          <CardDescription>The eyes and ears of the clan. The untamed wilds await your discovery.</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground">
            As a Scout, you venture into the unknown to gather intelligence and map new territories. Your findings are vital to our expansion.
          </p>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-3">
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
            <Compass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your report.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Territories Charted</CardTitle>
            <MapTrifold className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Expanding our knowledge of the world.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Intel Reports Filed</CardTitle>
            <Binoculars className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              Your observations are invaluable.
            </p>
          </CardContent>
        </Card>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Featured Discovery: The Crystal Caves</CardTitle>
          </CardHeader>
          <CardContent>
            <Image
                src="https://placehold.co/800x400.png"
                alt="Crystal Caves"
                width={800}
                height={400}
                className="rounded-lg object-cover"
                data-ai-hint="fantasy cave"
            />
          </CardContent>
       </Card>
    </div>
  );
}
