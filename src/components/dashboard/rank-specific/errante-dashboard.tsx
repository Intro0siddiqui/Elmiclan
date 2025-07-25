import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShieldQuestion } from "lucide-react";
import type { User } from "@/lib/types";

export function ErranteDashboard({ user }: { user: User }) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.name}!</CardTitle>
          <CardDescription>You are an Errante, a traveler finding your path. Your journey begins now.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            As an Errante, your main goal is to learn the ways of the clan and prove your worth.
            Explore the portal, complete introductory tasks, and engage with the community to advance.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Current Standing</CardTitle>
            <ShieldQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rank: {user.rank}</div>
            <p className="text-xs text-muted-foreground">
              The first step in a long and rewarding journey.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Next Steps</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>Visit the Rank Advisor for guidance.</li>
                <li>Introduce yourself in the clan forums.</li>
                <li>Complete the "Path of the Errante" orientation module.</li>
             </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
