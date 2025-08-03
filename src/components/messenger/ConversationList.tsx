
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Inbox } from 'lucide-react';

export function ConversationList({ onSelectConversation, onFindMore }: { onSelectConversation: (partnerId: string) => void; onFindMore: () => void; }) {
  const conversations: any[] = []; // This will hold real conversation data in the future

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Conversations</CardTitle>
        </div>
        <CardDescription>Your direct message history.</CardDescription>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 space-y-4 border-2 border-dashed rounded-lg">
            <Inbox className="h-10 w-10"/>
            <h3 className="text-lg font-semibold">No recent conversations</h3>
            <p className="text-sm">You haven't started any private chats yet. Find a partner below to begin.</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((convo: any) => (
                <div 
                  key={convo.id} 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors" 
                  onClick={() => onSelectConversation(convo.partnerMatrixId)}
                >
                    <Avatar className="h-12 w-12 border-2 border-primary flex-shrink-0">
                        <AvatarImage src={convo.avatar} alt={convo.partnerName} data-ai-hint={convo.dataAiHint} />
                        <AvatarFallback>{convo.partnerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold truncate">{convo.partnerName}</p>
                            <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">{convo.timestamp}</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                    </div>
                </div>
            ))}
          </div>
        )}
        <Button variant="link" className="w-full mt-2" onClick={onFindMore}>
            Find a partner to chat with
        </Button>
      </CardContent>
    </Card>
  );
}
