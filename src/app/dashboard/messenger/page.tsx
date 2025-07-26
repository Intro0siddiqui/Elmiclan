"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { sendSecureMessage, SendSecureMessageInput } from '@/ai/flows/send-secure-message';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { fetchMessages, FetchMessagesOutput } from '@/ai/flows/fetch-messages';
import { Loader2, Send, Volume2 } from 'lucide-react';
import { AnimatedPage } from '@/components/AnimatedPage';

// Schema for Direct Messages
const dmFormSchema = z.object({
  toUserId: z.string().min(1, 'Recipient Matrix ID is required.'),
  message: z.string().min(1, 'Message cannot be empty.'),
});

// Schema for Clan Chat
const clanFormSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

type ResultState = {
    success: boolean;
    message: string;
    audioDataUri?: string;
};

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
    // This effect is to auto-scroll to the bottom when the component first loads.
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
      <ScrollArea className="flex-grow p-4 border rounded-lg" ref={scrollRef}>
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
        <div className="flex flex-col-reverse gap-4">
          {allMessages.map(msg => (
            <div key={msg.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{msg.sender.charAt(1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{msg.sender.split(':')[0]}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function MessengerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const dmForm = useForm<z.infer<typeof dmFormSchema>>({
    resolver: zodResolver(dmFormSchema),
    defaultValues: { toUserId: '', message: '' },
  });

  const clanForm = useForm<z.infer<typeof clanFormSchema>>({
    resolver: zodResolver(clanFormSchema),
    defaultValues: { message: '' },
  });

  async function handleSendMessage(values: { message: string, toUserId?: string }, asVoice = false) {
    setLoading(true);
    setError(null);
    setResult(null);

    if (asVoice) {
        try {
            const response = await textToSpeech({ text: values.message });
            setResult({
                success: true,
                message: 'Voice message generated successfully. You can play it below.',
                audioDataUri: response.audioDataUri,
            });
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during TTS.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
        return;
    }

    const input: SendSecureMessageInput = {
      message: values.message,
      toUserId: values.toUserId,
    };

    try {
      const response = await sendSecureMessage(input);
      if (response.success) {
        const successMessage = values.toUserId
          ? `Message sent successfully to ${values.toUserId}!`
          : `Message sent successfully to the clan chat!`;
        setResult({ success: true, message: successMessage });
        dmForm.reset();
        clanForm.reset();
        if (!values.toUserId) {
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

  return (
    <AnimatedPage>
      <div className="max-w-2xl mx-auto space-y-6">
        <Tabs defaultValue="clan-chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clan-chat">Clan Chat</TabsTrigger>
            <TabsTrigger value="dm">Direct Message</TabsTrigger>
          </TabsList>

          <TabsContent value="clan-chat">
            <Card>
              <CardHeader>
                <CardTitle>Clan Communications</CardTitle>
                <CardDescription>View recent messages and send your own to the unified clan chat.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MessageHistory />
                <Form {...clanForm}>
                  <form onSubmit={clanForm.handleSubmit((values) => handleSendMessage(values, false))} className="space-y-4">
                    <FormField
                      control={clanForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Type your message to the clan here..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                        <Button type="submit" className="flex-1" disabled={loading}>
                          {loading ? <Loader2 className="animate-spin" /> : <Send />}
                          <span>{loading ? 'Sending...' : 'Send to Clan Chat'}</span>
                        </Button>
                        <Button type="button" variant="outline" className="flex-1" disabled={loading} onClick={clanForm.handleSubmit((values) => handleSendMessage(values, true))}>
                            {loading ? <Loader2 className="animate-spin" /> : <Volume2 />}
                            <span>{loading ? 'Generating...' : 'Send as Voice'}</span>
                        </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dm">
            <Card>
              <CardHeader>
                <CardTitle>Direct Message</CardTitle>
                <CardDescription>Send a private, end-to-end encrypted message to a specific clan member.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...dmForm}>
                  <form onSubmit={dmForm.handleSubmit((values) => handleSendMessage(values, false))} className="space-y-4">
                    <FormField
                      control={dmForm.control}
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
                    <FormField
                      control={dmForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Type your private message here..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                        <Button type="submit" className="flex-1" disabled={loading}>
                          {loading ? <Loader2 className="animate-spin" /> : <Send />}
                          <span>{loading ? 'Sending...' : 'Send Direct Message'}</span>
                        </Button>
                        <Button type="button" variant="outline" className="flex-1" disabled={loading} onClick={dmForm.handleSubmit((values) => handleSendMessage(values, true))}>
                            {loading ? <Loader2 className="animate-spin" /> : <Volume2 />}
                            <span>{loading ? 'Generating...' : 'Send as Voice'}</span>
                        </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
            {result.audioDataUri && (
                <div className="mt-2">
                    <audio controls src={result.audioDataUri}>
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
          </Alert>
        )}
      </div>
    </AnimatedPage>
  );
}
