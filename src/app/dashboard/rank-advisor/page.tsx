"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-supabase-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2, Sparkles, User } from 'lucide-react';
import { rankAdvisor, RankAdvisorInput, RankAdvisorOutput } from '@/ai/flows/rank-advisor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RankAdvisorPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RankAdvisorOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetAdvice = async () => {
    if (!user) {
      setError('You must be logged in to use the Rank Advisor.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const profileData = `Skills: ${user.profile.skills.join(', ')}; Achievements: ${user.profile.achievements.join(', ')}; Recent Activity Level: ${user.profile.activity}`;
    const input: RankAdvisorInput = {
      currentRank: user.rank,
      profileData: profileData,
    };

    try {
      const response = await rankAdvisor(input);
      setResult(response);
    } catch (e) {
      console.error(e);
      setError('An error occurred while consulting the Rank Advisor. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Rank Advisor</h1>
        <p className="text-muted-foreground mt-2">
          Receive personalized AI-powered guidance on how to advance to the next rank.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Profile Analysis</CardTitle>
          <CardDescription>
            Our AI advisor will analyze your current profile to suggest the most effective path forward.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Button onClick={handleGetAdvice} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Get Advancement Advice
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                    <Bot className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Advisor&apos;s Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap font-sans">
            {result.recommendations}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
