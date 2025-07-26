
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { sendSecureMessage } from '@/ai/flows/send-secure-message';
import { fetchMessages, FetchMessagesOutput } from '@/ai/flows/fetch-messages';
import { Loader2, Send, Users, MessageSquarePlus, ArrowLeft } from 'lucide-react';
import { MOCK_USERS } from '@/hooks/use-auth';
import type { Rank, User } from '@/lib/types';
import { rankHierarchy } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { AnimatedPage } from '@/components/AnimatedPage';

const clanMessageFormSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
  rankRestricted: z.boolean().optional().default(false),
});

const directMessageFormSchema = z.object({
  toUserId: z.string(),
  message: z.string().min(1, 'Message cannot be empty.'),
});

// #region Clan Chat Components
function MessageHistory({ currentUserRank }: { currentUserRank: Rank }) {
    const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery<FetchMessagesOutput>({
        queryKey: ['clanMessages', currentUserRank],
        queryFn: ({ pageParam }) => fetchMessages({ from: pageParam as string | undefined, requestingUserRank: currentUserRank }),
        getNextPageParam: lastPage => lastPage.nextFrom,
        initialPageParam: undefined,
        refetchInterval: 5000, // Refetch every 5 seconds
    });

  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on initial load and when new messages are added
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [data?.pages.length, data?.pages[0]?.messages.length]);

  if (status === 'pending') {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Messages</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  const allMessages = data.pages.flatMap(page => page.messages).reverse();

  return (
    <Card className='h-[60vh] flex flex-col'>
      <CardHeader>
        <CardTitle>Live Clan Feed</CardTitle>
        <CardDescription>Messages from the main clan chat room.</CardDescription>
      </CardHeader>
      <CardContent className='flex-grow overflow-hidden'>
        <ScrollArea className="h-full p-4 border rounded-lg bg-black/50">
          <div data-radix-scroll-area-viewport ref={scrollViewportRef} className="h-full">
              <div className="flex justify-center my-2">
              {hasNextPage && (
                  <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : 'Load More Messages'}
                  </Button>
              )}
              </div>
              <div className="flex flex-col-reverse gap-4 font-mono text-white">
              {allMessages.map(msg => {
                  if (msg.type === 'event') {
                  return (
                      <div key={msg.id} className="flex items-center gap-2 text-sm text-gray-400">
                      <span>►►</span>
                      <span>{msg.content}</span>
                      </div>
                  );
                  }
                  return (
                  <div key={msg.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1">
                      <Avatar className="h-10 w-10 border-2 border-gray-500">
                          <AvatarFallback className="bg-blue-800 text-white text-xl">参</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-300">{msg.sender.split(':')[0].replace('@', '')}</span>
                      </div>
                      <div className="pt-2">
                          <div className="relative inline-block bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-lg px-4 py-2 shadow-md border border-blue-400">
                              {msg.content}
                          </div>
                      </div>
                  </div>
                  );
              })}
              </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ClanMessageForm({ userRank }: { userRank: Rank }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof clanMessageFormSchema>>({
        resolver: zodResolver(clanMessageFormSchema),
        defaultValues: { message: '', rankRestricted: false },
    });

    async function handleSendClanMessage(values: z.infer<typeof clanMessageFormSchema>) {
        setLoading(true);
        setError(null);
        
        try {
            const response = await sendSecureMessage({ message: values.message, toUserId: undefined, rankRestricted: values.rankRestricted });
            if (response.success) {
                form.reset();
                await queryClient.invalidateQueries({ queryKey: ['clanMessages'] });
            } else {
                throw new Error(response.error || 'Failed to send message.');
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Send to Clan</CardTitle>
                <CardDescription>Broadcast a message to the entire clan.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSendClanMessage)} className="space-y-4">
                        <FormField control={form.control} name="message" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea placeholder='Type your message to the clan here...' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {userRank !== 'Errante' && (
                            <FormField control={form.control} name="rankRestricted" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Visible to my rank and above only</FormLabel>
                                        <FormDescription>If checked, this message will be hidden from members with a lower rank than you.</FormDescription>
                                    </div>
                                </FormItem>
                            )} />
                        )}
                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>Action Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : <Send />}
                            <span>{loading ? 'Sending...' : 'Send to Clan Chat'}</span>
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
// #endregion

// #region Direct Message Components
const MOCK_CONVERSATIONS = [
  { id: 'convo-1', partnerName: 'Sam Scout', partnerMatrixId: '@scout:matrix.org', lastMessage: 'Hey, I found something interesting near the Crystal Caves. Let me know when you are online because I might need some help with it.', timestamp: '2h ago', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'avatar person' },
  { id: 'convo-2', partnerName: 'Ada Admin', partnerMatrixId: '@admin:matrix.org', lastMessage: 'Your last report was very detailed. Good work. Keep it up and you might be next in line for a promotion.', timestamp: '1d ago', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'avatar person' },
  { id: 'convo-3', partnerName: 'Chris Conq', partnerMatrixId: '@conquistador:matrix.org', lastMessage: 'We need to plan the next campaign. Are you available for a strategy session tomorrow?', timestamp: '3d ago', avatar: 'https://placehold.co/100x100.png', dataAiHint: 'avatar person' }
];

function ConversationList({ onNewChat, onSelectConversation }: { onNewChat: () => void; onSelectConversation: (partnerId: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Conversations</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onNewChat}>
                <MessageSquarePlus className="mr-2 h-4 w-4"/>
                New Chat
            </Button>
        </div>
        <CardDescription>Your recent direct message history.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {MOCK_CONVERSATIONS.map((convo) => (
            <div 
              key={convo.id} 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors" 
              onClick={() => onSelectConversation(convo.partnerMatrixId)}
            >
                <Avatar className="h-12 w-12 border-2 border-primary shrink-0">
                    <AvatarImage src={convo.avatar} alt={convo.partnerName} data-ai-hint={convo.dataAiHint} />
                    <AvatarFallback>{convo.partnerName.charAt(0)}</AvatarFallback>
                </Avatar>
                {/* This is the key fix: min-w-0 allows the flex item to shrink and the text to truncate */}
                <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold truncate">{convo.partnerName}</p>
                        <p className="text-xs text-muted-foreground shrink-0 ml-2">{convo.timestamp}</p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
            </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PartnerFinder({ currentUserRank, currentUserEmail, onSelectPartner, onBack }: { currentUserRank: Rank; currentUserEmail: string; onSelectPartner: (matrixId: string) => void; onBack: () => void; }) {
  const potentialPartners = Object.entries(MOCK_USERS)
    .map(([email, user]) => ({ email, ...(user as Omit<User, 'email'>) }))
    .filter(user => {
      if (user.email === currentUserEmail) return false;
      if (user.rank === 'Admin') return true;
      return rankHierarchy[user.rank] <= rankHierarchy[currentUserRank];
    });

  const currentUserMatrixId = `@${currentUserEmail.split('@')[0]}:matrix.org`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="mr-2 h-8 w-8" onClick={onBack}>
                <ArrowLeft />
           </Button>
          <Users className="h-5 w-5" />
          <CardTitle>Find a Partner</CardTitle>
        </div>
        <CardDescription>Select a user to start a conversation. Admins are always visible.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="your-id">Your Matrix ID (Share this to be contacted)</Label>
          <Input id="your-id" readOnly value={currentUserMatrixId} />
        </div>
        <div className="space-y-3">
          {potentialPartners.length > 0 ? (
            potentialPartners.map(user => {
              const userMatrixId = `@${user.email.split('@')[0]}:matrix.org`;
              return (
                <div key={user.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <div>
                    <p className="font-semibold">{user.name} ({user.rank})</p>
                    <p className="text-xs text-muted-foreground">{userMatrixId}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onSelectPartner(userMatrixId)}>Select</Button>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-center text-muted-foreground">No available partners of your rank right now.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DirectMessageForm({ toUserId, onBack, onMessageSent }: { toUserId: string; onBack: () => void; onMessageSent: () => void; }) {
  const form = useForm<z.infer<typeof directMessageFormSchema>>({
    resolver: zodResolver(directMessageFormSchema),
    defaultValues: { toUserId: toUserId, message: '' },
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    form.setValue('toUserId', toUserId);
  }, [toUserId, form]);

  async function handleSendMessage(values: z.infer<typeof directMessageFormSchema>) {
    setLoading(true);
    setError(null);

    try {
      const response = await sendSecureMessage({ message: values.message, toUserId: values.toUserId });
      if (response.success) {
        onMessageSent();
      } else {
        throw new Error(response.error || 'Failed to send message.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }
    
  return (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="mr-2 h-8 w-8" onClick={onBack}>
                    <ArrowLeft />
                </Button>
                <CardTitle>Send Direct Message</CardTitle>
            </div>
            <CardDescription>Your message to {toUserId} will be end-to-end encrypted.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSendMessage)} className="space-y-4">
                    <FormField control={form.control} name="toUserId" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Recipient Matrix ID</FormLabel>
                            <FormControl><Input {...field} readOnly /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Message</FormLabel>
                            <FormControl><Textarea placeholder="Type your direct message..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>Action Failed</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <Send />}
                        <span>{loading ? 'Sending...' : 'Send Direct Message'}</span>
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
// #endregion

type DmView = 'list' | 'new' | 'chat';

export default function MessengerPage() {
  const params = useParams();
  const { user } = useAuth();
  
  const [dmView, setDmView] = useState<DmView>('list');
  const [selectedPartner, setSelectedPartner] = useState<string>('');

  const mode = params.mode as string;

  useEffect(() => {
    setDmView('list');
    setSelectedPartner('');
  }, [mode]);

  if (!user) {
    return (
        <div className="w-full space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  const handleSelectPartner = (matrixId: string) => {
    setSelectedPartner(matrixId);
    setDmView('chat');
  };

  const handleBackToList = () => {
    setSelectedPartner('');
    setDmView('list');
  };
  
  const handleNewChat = () => {
    setDmView('new');
  };

  const renderDmContent = () => {
    switch (dmView) {
        case 'new':
            return <PartnerFinder currentUserRank={user.rank} currentUserEmail={user.email} onSelectPartner={handleSelectPartner} onBack={handleBackToList} />;
        case 'chat':
            return <DirectMessageForm toUserId={selectedPartner} onBack={handleBackToList} onMessageSent={handleBackToList} />;
        case 'list':
        default:
            return <ConversationList onNewChat={handleNewChat} onSelectConversation={handleSelectPartner}/>;
    }
  };

  return (
    <AnimatedPage>
      <div className="w-full space-y-6">
       {mode === 'clan' && (
        <>
          <ClanMessageForm userRank={user.rank} />
          <MessageHistory currentUserRank={user.rank} />
        </>
       )}
       {mode === 'dm' && renderDmContent()}
      </div>
    </AnimatedPage>
  );
}
