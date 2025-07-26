
"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

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
import { fetchMessages, FetchMessagesOutput } from '@/ai/flows/fetch-messages';
import { Loader2, Send } from 'lucide-react';
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

  async function handleSendMessage(values: { message: string, toUserId?: string }) {
    setLoading(true);
    setError(null);
    setResult(null);

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
                  <form onSubmit={clanForm.handleSubmit((values) => handleSendMessage(values))} className="space-y-4">
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
                  <form onSubmit={dmForm.handleSubmit((values) => handleSendMessage(values))} className="space-y-4">
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
          </Alert>
        )}
      </div>
    </AnimatedPage>
  );
}
