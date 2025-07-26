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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { sendSecureMessage, SendSecureMessageInput } from '@/ai/flows/send-secure-message';
import { fetchMessages, FetchMessagesOutput } from '@/ai/flows/fetch-messages';
import { Loader2, Send, Users, MessageSquarePlus } from 'lucide-react';
import { AnimatedPage } from '@/components/AnimatedPage';
import { MOCK_USERS } from '@/hooks/use-auth';
import type { Rank } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { rankHierarchy } from '@/lib/types';

// Main form schema
const messageFormSchema = z.object({
  toUserId: z.string().optional(),
  message: z.string().min(1, 'Message cannot be empty.'),
  rankRestricted: z.boolean().optional().default(false),
});

type ResultState = {
  success: boolean;
  message: string;
};

function MessageBubble({ text }: { text: string }) {
  return (
    <div className="relative inline-block bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-lg px-4 py-2 shadow-md border border-blue-400">
      <div
        className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0"
        style={{
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderRight: '10px solid #2563EB', // Corresponds to from-blue-600
        }}
      />
      {text}
    </div>
  );
}

function MessageHistory({ currentUserRank }: { currentUserRank: Rank }) {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery<FetchMessagesOutput>({
    queryKey: ['clanMessages', currentUserRank],
    queryFn: ({ pageParam }) =>
      fetchMessages({
        from: pageParam as string | undefined,
        requestingUserRank: currentUserRank,
      }),
    getNextPageParam: lastPage => lastPage.nextFrom,
    initialPageParam: undefined,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollableNode = scrollRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (scrollableNode) {
      scrollableNode.scrollTop = scrollableNode.scrollHeight;
    }
  }, [data?.pages.length]);

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
    <div className="flex flex-col h-[60vh] gap-4">
      <ScrollArea className="flex-grow p-4 border rounded-lg bg-black" ref={scrollRef}>
        <div className="flex justify-center my-2">
          {hasNextPage && (
            <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Messages'
              )}
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
                  <MessageBubble text={msg.content} />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

const MOCK_CONVERSATIONS = [
  {
    id: 'convo-1',
    partnerName: 'Sam Scout',
    partnerMatrixId: '@scout:matrix.org',
    lastMessage: 'Hey, I found something interesting near the Crystal Caves. Let me know when you are online.',
    timestamp: '2h ago',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'avatar person',
  },
  {
    id: 'convo-2',
    partnerName: 'Ada Admin',
    partnerMatrixId: '@admin:matrix.org',
    lastMessage: 'Your last report was very detailed. Good work. Keep it up and you might be next in line for a promotion.',
    timestamp: '1d ago',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'avatar person',
  },
   {
    id: 'convo-3',
    partnerName: 'Chris Conq',
    partnerMatrixId: '@conquistador:matrix.org',
    lastMessage: 'We need to plan the next campaign. Are you available for a strategy session tomorrow?',
    timestamp: '3d ago',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'avatar person',
  }
];

function ConversationList() {
    // In a real app, you would use useQuery to fetch this data
  const conversations = MOCK_CONVERSATIONS;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Conversations</CardTitle>
            </div>
            <Button variant="outline" size="sm">
                <MessageSquarePlus className="mr-2 h-4 w-4"/>
                New Chat
            </Button>
        </div>
        <CardDescription>Your recent direct message history.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {conversations.map((convo) => (
            <div key={convo.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors">
                <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarImage src={convo.avatar} alt={convo.partnerName} data-ai-hint={convo.dataAiHint} />
                    <AvatarFallback>{convo.partnerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold truncate">{convo.partnerName}</p>
                        <p className="text-xs text-muted-foreground">{convo.timestamp}</p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
            </div>
        ))}
      </CardContent>
    </Card>
  )
}


function PartnerFinder({
  currentUserRank,
  currentUserEmail,
  onSelectPartner,
}: {
  currentUserRank: Rank;
  currentUserEmail: string;
  onSelectPartner: (matrixId: string) => void;
}) {
  const potentialPartners = Object.entries(MOCK_USERS)
    .map(([email, user]) => ({ email, ...user }))
    .filter(user => {
      if (user.email === currentUserEmail) return false; // Exclude self
      // Show users of equal or lower rank
      return rankHierarchy[user.rank] <= rankHierarchy[currentUserRank];
    });

  const currentUserMatrixId = `@${currentUserEmail.split('@')[0]}:matrix.org`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <CardTitle>Find a Partner</CardTitle>
        </div>
        <CardDescription>Connect with members to grow together. You can message anyone if you have their ID.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="your-id">Your Matrix ID (Share this to be contacted)</Label>
          <Input id="your-id" readOnly value={currentUserMatrixId} />
        </div>
        <p className="text-sm text-muted-foreground">
          You can see members of your rank or lower. Select a user to start a conversation.
        </p>
        <div className="space-y-3">
          {potentialPartners.length > 0 ? (
            potentialPartners.map(user => {
              const userMatrixId = `@${user.email.split('@')[0]}:matrix.org`;
              return (
                <div key={user.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <div>
                    <p className="font-semibold">
                      {user.name} ({user.rank})
                    </p>
                    <p className="text-xs text-muted-foreground">{userMatrixId}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onSelectPartner(userMatrixId)}>
                    Select
                  </Button>
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

export default function MessengerPage() {
  const { user } = useAuth();
  const params = useParams();
  const mode = params.mode as string;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPartnerFinder, setShowPartnerFinder] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { toUserId: '', message: '', rankRestricted: false },
  });

  const handleSelectPartner = (matrixId: string) => {
    form.setValue('toUserId', matrixId);
    setShowPartnerFinder(false); // Hide finder and show the form
  };

  async function handleSendMessage(values: z.infer<typeof messageFormSchema>) {
    if (mode === 'dm' && !values.toUserId) {
      form.setError('toUserId', { type: 'manual', message: 'Recipient Matrix ID is required for Direct Messages.' });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const input: SendSecureMessageInput = {
      message: values.message,
      toUserId: mode === 'dm' ? values.toUserId : undefined,
      rankRestricted: mode === 'clan' ? values.rankRestricted : false,
    };

    try {
      const response = await sendSecureMessage(input);
      if (response.success) {
        const successMessage = mode === 'dm' ? `Message sent successfully!` : `Message sent successfully to the clan chat!`;
        setResult({ success: true, message: successMessage });
        form.reset({
          message: '',
          toUserId: mode === 'dm' ? values.toUserId : '',
          rankRestricted: false,
        });
        if (mode === 'clan') {
          await queryClient.invalidateQueries({ queryKey: ['clanMessages'] });
        }
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

  if (!user) return null;

  const renderDmContent = () => {
    if (showPartnerFinder) {
        return <PartnerFinder currentUserRank={user.rank} currentUserEmail={user.email} onSelectPartner={handleSelectPartner} />;
    }
    return (
        <>
            <ConversationList/>
        </>
    );
  };

  return (
    <AnimatedPage>
      <div className="max-w-4xl mx-auto space-y-6">
       {mode === 'clan' && (
        <Card>
            <CardHeader>
                <CardTitle>Clan Chat</CardTitle>
                <CardDescription>Communicate with all clan members in the main chat room.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSendMessage)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Your Message</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder='Type your message to the clan here...'
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        {user.rank !== 'Errante' && (
                        <FormField
                            control={form.control}
                            name="rankRestricted"
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Visible to my rank and above only
                                </FormLabel>
                                <FormDescription>
                                    If checked, this message will be hidden from members with a lower rank than you.
                                </FormDescription>
                                </div>
                            </FormItem>
                            )}
                        />
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <Send />}
                        <span>{loading ? 'Sending...' : 'Send to Clan Chat'}</span>
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
       )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Action Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && result.success && (
          <Alert variant="default" className="mt-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        {mode === 'clan' ? (
          <MessageHistory currentUserRank={user.rank} />
        ) : (
          renderDmContent()
        )}
      </div>
    </AnimatedPage>
  );
}
