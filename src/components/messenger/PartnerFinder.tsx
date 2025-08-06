
'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/lib/types';
import { rankHierarchy } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ClientOnly } from '@/components/ui/client-only';
import { Search, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function UidConnector({ onSelectPartner }: { onSelectPartner: (matrixId: string) => void }) {
    const [uid, setUid] = useState('');
    const [error, setError] = useState('');

    const handleConnect = async () => {
        setError('');
        const { data, error } = await supabase.from('profiles').select('email').eq('id', uid).single();
        if (error || !data) {
            setError('User ID not found. Please check the ID and try again.');
            return;
        }
        const matrixId = `@${data.email.split('@')[0]}:matrix.org`;
        onSelectPartner(matrixId);
    };
    
    return (
        <div className='space-y-4'>
            <div className='space-y-2'>
                <Label className='flex items-center gap-2'><KeyRound className='h-4 w-4' /><span>Connect via UID</span></Label>
                <p className='text-xs text-muted-foreground'>If you have another member's private UID, you can connect directly, bypassing rank restrictions.</p>
            </div>
            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input 
                    type="text" 
                    placeholder="Enter member UID..." 
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                />
                <Button type="button" onClick={handleConnect}>Connect</Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    )
}

export function PartnerFinder({ currentUser, onSelectPartner, refProp }: { currentUser: User; onSelectPartner: (matrixId: string) => void; refProp: React.RefObject<HTMLDivElement>; }) {
  const [potentialPartners, setPotentialPartners] = useState<User[]>([]);

  useEffect(() => {
    const fetchPotentialPartners = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, rank:ranks(name)')
        .neq('id', currentUser.id);

      if (error) {
        console.error('Error fetching potential partners:', error);
        return;
      }

      const filteredPartners = data.filter((user: any) => {
        // Show only users of the same or lower rank.
        return rankHierarchy[user.rank as keyof typeof rankHierarchy] <= rankHierarchy[currentUser.rank as keyof typeof rankHierarchy];
      });
      setPotentialPartners(filteredPartners as User[]);
    };

    fetchPotentialPartners();
  }, [currentUser]);
  
  return (
    <Card ref={refProp}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          <CardTitle>Find a Partner</CardTitle>
        </div>
        <CardDescription>Browse the directory or connect directly via UID.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ClientOnly>
          <div className="space-y-2">
            <Label htmlFor="your-id">Your UID (For Manual Invites)</Label>
            <Input id="your-id" readOnly value={currentUser.id} />
          </div>
        </ClientOnly>
        
        <Separator />
        
        <UidConnector onSelectPartner={onSelectPartner} />
        
        <Separator />

        <div>
            <Label>Public Directory (Same or Lower Rank)</Label>
            <p className='text-xs text-muted-foreground mb-4'>Users visible based on your current rank.</p>
            <div className="space-y-3">
            {potentialPartners.length > 0 ? (
                potentialPartners.map(user => {
                    if (!user.email) return null;
                    const userMatrixId = `@${user.email.split('@')[0]}:matrix.org`;
                    return (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                        <div>
                            <p className="font-semibold">{user.name} ({user.rank})</p>
                            <p className="text-xs text-muted-foreground">UID: {user.id}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => onSelectPartner(userMatrixId)}>Select</Button>
                        </div>
                    );
                })
            ) : (
                <p className="text-sm text-center text-muted-foreground">No available partners of your rank right now.</p>
            )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
