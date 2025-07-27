
'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

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
import { Loader2, Send, Users, MessageSquarePlus, ArrowLeft, Inbox, Phone, Video, Mic, PlusCircle, Tag, UserPlus, Smile, Camera, Search, KeyRound } from 'lucide-react';
import { MOCK_USERS } from '@/hooks/use-auth';
import type { Rank, User } from '@/lib/types';
import { rankHierarchy } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { AnimatedPage } from '@/components/AnimatedPage';
import { Separator } from '@/components/ui/separator';

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
        refetchInterval: 5000,
    });

  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

function ConversationList({ onSelectConversation, onFindMore }: { onSelectConversation: (partnerId: string) => void; onFindMore: () => void; }) {
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
            <h3 className="text-lg font-semibold">No Recent Conversations</h3>
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

function UidConnector({ onSelectPartner }: { onSelectPartner: (matrixId: string) => void }) {
    const [uid, setUid] = useState('');
    const [error, setError] = useState('');

    const handleConnect = () => {
        setError('');
        const user = Object.values(MOCK_USERS).find(u => u.id === uid);
        if (user) {
            const matrixId = `@${user.name.split(' ')[0].toLowerCase()}${user.name.split(' ')[1].toLowerCase()}:matrix.org`;
            onSelectPartner(matrixId);
        } else {
            setError('User ID not found. Please check the ID and try again.');
        }
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

function PartnerFinder({ currentUser, onSelectPartner, refProp }: { currentUser: User; onSelectPartner: (matrixId: string) => void; refProp: React.RefObject<HTMLDivElement>; }) {
  const potentialPartners = Object.values(MOCK_USERS)
    .filter(user => {
      if (user.id === currentUser.id) return false;
      // Show only users of the same or lower rank.
      return rankHierarchy[user.rank] <= rankHierarchy[currentUser.rank];
    });
  
  const currentUserMatrixId = `@${currentUser.email.split('@')[0]}:matrix.org`;

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
        <div className="space-y-2">
          <Label htmlFor="your-id">Your Matrix ID (For Manual Invites)</Label>
          <Input id="your-id" readOnly value={currentUserMatrixId} />
        </div>
        
        <Separator />
        
        <UidConnector onSelectPartner={onSelectPartner} />
        
        <Separator />

        <div>
            <Label>Public Directory (Same or Lower Rank)</Label>
            <p className='text-xs text-muted-foreground mb-4'>Users visible based on your current rank.</p>
            <div className="space-y-3">
            {potentialPartners.length > 0 ? (
                potentialPartners.map(user => {
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

const MOCK_CHAT_HISTORY = [
    { id: 2, sender: 'me', text: 'Look similar to where u live' },
    { id: 3, sender: 'me', text: 'Kinda' },
    { id: 4, sender: 'other', text: 'That\'s where we live' },
    { id: 5, sender: 'me', text: 'Look similar to where u live', repliedTo: { name: 'Ada Admin', text: 'That\'s where we live' } },
    { id: 6, sender: 'me', text: 'I thought so' },
    { id: 7, sender: 'me', text: 'But then I thought my memory is weak' },
    { id: 8, sender: 'other', text: 'It is', repliedTo: { name: 'You', text: 'But then I thought my memory is weak' } },
    { id: 9, sender: 'me', text: 'It isn\'t because I was right' },
    { id: 10, sender: 'me', text: 'But I just didn\'t trusted it' },
];

function PrivateChatInterface({ partnerId, onBack }: { partnerId: string, onBack: () => void }) {
    const [message, setMessage] = useState('');
    const partner = Object.values(MOCK_USERS).find(u => partnerId.includes(u.email.split('@')[0])) || { name: 'Unknown User' };

    const ReplyPreview = ({ name, text }: { name: string; text: string }) => (
        <div className="bg-black/20 p-2 rounded-lg mb-1 border-l-2 border-blue-400">
            <p className="text-xs font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{text}</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Chat Header */}
            <div className="flex items-center p-2 border-b">
                <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
                    <ArrowLeft />
                </Button>
                <Avatar className="h-10 w-10">
                    <AvatarImage src="https://placehold.co/100x100.png" alt={partner.name} data-ai-hint="person avatar" />
                    <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                    <p className="font-semibold leading-none">{partner.name}</p>
                    <p className="text-xs text-muted-foreground">online</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <Button variant="ghost" size="icon"><Phone /></Button>
                    <Button variant="ghost" size="icon"><Video /></Button>
                </div>
            </div>

            {/* Message History */}
            <ScrollArea className="flex-grow p-4">
                <div className="flex flex-col gap-0.5">
                    {MOCK_CHAT_HISTORY.map((msg, index) => {
                        const prevMsg = MOCK_CHAT_HISTORY[index - 1];
                        const nextMsg = MOCK_CHAT_HISTORY[index + 1];
                        
                        const isSameSenderAsPrev = prevMsg && prevMsg.sender === msg.sender;
                        const isSameSenderAsNext = nextMsg && nextMsg.sender === msg.sender;

                        const isFirstInGroup = !isSameSenderAsPrev;
                        const isLastInGroup = !isSameSenderAsNext;

                        const senderClasses = cn(
                            'rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white',
                             isLastInGroup ? 'rounded-br-lg' : 'rounded-br-md',
                             isFirstInGroup ? 'rounded-tr-3xl' : 'rounded-tr-md'
                        );

                        const otherClasses = cn(
                            'bg-zinc-800 text-white',
                            isLastInGroup ? 'rounded-bl-lg' : 'rounded-bl-md',
                            isFirstInGroup ? 'rounded-tl-3xl' : 'rounded-tl-md'
                        );

                        return (
                            <div key={msg.id} className={cn('flex items-end gap-2', msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
                                {msg.sender === 'other' && (
                                    <div className='w-8'>
                                        {!isSameSenderAsNext && (
                                            <Avatar className={cn('h-8 w-8 self-end')}>
                                                <AvatarImage src="https://placehold.co/100x100.png" alt={partner.name} data-ai-hint="person avatar" />
                                                <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                )}
                                <div className={cn("flex flex-col gap-1 max-w-xs md:max-w-md", msg.sender === 'me' ? 'items-end' : 'items-start')}>
                                    {msg.repliedTo && <ReplyPreview name={msg.repliedTo.name} text={msg.repliedTo.text} />}
                                    <div className={cn('px-4 py-2', msg.sender === 'me' ? senderClasses : otherClasses)}>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            {/* Message Input Footer */}
            <div className="flex items-end gap-2 px-2 py-1 border-t">
                <div className="flex-grow flex items-center bg-zinc-800 rounded-full px-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground">
                        <Smile />
                    </Button>
                    <Textarea
                        placeholder="Message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-grow border-none focus-visible:ring-0 bg-transparent resize-none text-white placeholder:text-muted-foreground py-2 min-h-[40px]"
                        rows={1}
                    />
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground">
                            <Camera />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground">
                            <Mic />
                        </Button>
                    </div>
                </div>
                <Button variant="default" size="icon" className="h-9 w-9 rounded-full bg-primary flex-shrink-0">
                    {message ? <Send /> : <PlusCircle />}
                </Button>
            </div>
        </div>
    );
}
// #endregion

export default function MessengerPage() {
  const params = useParams();
  const { user } = useAuth();
  
  const [isChatActive, setIsChatActive] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const partnerFinderRef = useRef<HTMLDivElement>(null);

  const mode = params.mode as string;

  useEffect(() => {
    setIsChatActive(false);
    setSelectedPartner('');
  }, [mode]);

  if (!user) {
    return (
        <div className="w-full space-y-4 p-4 md:p-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  const handleSelectPartner = (matrixId: string) => {
    setSelectedPartner(matrixId);
    setIsChatActive(true);
  };

  const handleBackToList = () => {
    setSelectedPartner('');
    setIsChatActive(false);
  };
  
  const handleFindMore = () => {
    partnerFinderRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderDmContent = () => {
    if (isChatActive) {
      return <PrivateChatInterface partnerId={selectedPartner} onBack={handleBackToList} />;
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-4 md:p-6 space-y-6">
                <ConversationList onSelectConversation={handleSelectPartner} onFindMore={handleFindMore} />
                <PartnerFinder currentUser={user} onSelectPartner={handleSelectPartner} refProp={partnerFinderRef} />
            </div>
        </ScrollArea>
    );
  };

  return (
    <AnimatedPage>
      <div className="h-screen w-full bg-background overflow-hidden">
       {mode === 'clan' && (
        <div className="space-y-6 p-4 md:p-6">
          <ClanMessageForm userRank={user.rank} />
          <MessageHistory currentUserRank={user.rank} />
        </div>
       )}
       {mode === 'dm' && renderDmContent()}
      </div>
    </AnimatedPage>
  );
}
