

"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { sendSecureMessage, SendSecureMessageInput } from '@/ai/flows/send-secure-message';
import { fetchMessages, FetchMessagesOutput } from '@/ai/flows/fetch-messages';
import { Loader2, Send, Users } from 'lucide-react';
import { AnimatedPage } from '@/components/AnimatedPage';
import { MOCK_USERS } from '@/hooks/use-auth';
import type { Rank } from '@/lib/types';
import { Label } from '@/components/ui/label';

// Main form schema
const messageFormSchema = z.object({
  toUserId: z.string().optional(),
  message: z.string().min(1, 'Message cannot be empty.'),
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

function MessageHistory() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<FetchMessagesOutput>({
    queryKey: ['clanMessages'],
    queryFn: ({ pageParam }) => fetchMessages({ from: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextFrom,
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
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
                )
            }
            return (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-10 w-10 border-2 border-gray-500">
                        {/* The '参' character is used as a placeholder like in the image */}
                        <AvatarFallback className="bg-blue-800 text-white text-xl">参</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-300">{msg.sender.split(':')[0].replace('@', '')}</span>
                </div>
                <div className="pt-2">
                    <MessageBubble text={msg.content} />
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function PartnerFinder({ currentUserRank, currentUserEmail }: { currentUserRank: Rank, currentUserEmail: string }) {
    const potentialPartners = Object.entries(MOCK_USERS)
        .map(([email, user]) => ({ email, ...user }))
        .filter(user => {
            if (user.email === currentUserEmail) return false; // Exclude self
            if (user.rank === 'Admin') return true; // Admins are always visible
            return user.rank === currentUserRank;
        });
    const currentUserMatrixId = `@${currentUserEmail.split('@')[0]}:matrix.org`;


    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <CardTitle>Find a Partner</CardTitle>
                </div>
                <CardDescription>
                    Connect with members of a similar rank to grow together.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="your-id">Your Matrix ID (Share this to be contacted)</Label>
                    <Input id="your-id" readOnly value={currentUserMatrixId} />
                </div>
                <p className="text-sm text-muted-foreground">
                    You can send requests to members of your rank or to any Admin. Copy their ID to start a conversation.
                </p>
                <div className="space-y-3">
                    {potentialPartners.length > 0 ? (
                        potentialPartners.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                                <div>
                                    <p className="font-semibold">{user.name} ({user.rank})</p>
                                    <p className="text-xs text-muted-foreground">{`@${user.email.split('@')[0]}:matrix.org`}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(`@${user.email.split('@')[0]}:matrix.org`)}
                                >
                                    Copy ID
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-center text-muted-foreground">No available partners of your rank right now.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default function MessengerPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const mode = pathname.includes('/dm') ? 'dm' : 'clan';

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { toUserId: '', message: '' },
  });

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
    };

    try {
      const response = await sendSecureMessage(input);
      if (response.success) {
        const successMessage = mode === 'dm'
          ? `Message sent successfully!`
          : `Message sent successfully to the clan chat!`;
        setResult({ success: true, message: successMessage });
        form.reset({
            message: '',
            toUserId: mode === 'dm' ? values.toUserId : ''
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

  return (
    <AnimatedPage>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>{mode === 'clan' ? 'Clan Chat' : 'Direct Message'}</CardTitle>
                <CardDescription>
                    {mode === 'clan' ? 'Communicate with all clan members in the main chat room.' : 'Send a private, end-to-end encrypted message.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSendMessage)} className="space-y-4">
                        {mode === 'dm' && (
                            <FormField
                            control={form.control}
                            name="toUserId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Recipient Matrix ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="@username:matrix.org" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Message</FormLabel>
                                <FormControl>
                                <Textarea placeholder={mode === 'clan' ? "Type your message to the clan here..." : "Type your private message here..."} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : <Send />}
                            <span>{loading ? 'Sending...' : (mode === 'clan' ? 'Send to Clan Chat' : 'Send Direct Message')}</span>
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
        
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
             <MessageHistory />
        ) : (
            <PartnerFinder currentUserRank={user.rank} currentUserEmail={user.email} />
        )}

      </div>
    </AnimatedPage>
  );
}
