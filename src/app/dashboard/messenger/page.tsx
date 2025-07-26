"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sendSecureMessage, SendSecureMessageInput } from '@/ai/flows/send-secure-message';
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


export default function MessengerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dmForm = useForm<z.infer<typeof dmFormSchema>>({
    resolver: zodResolver(dmFormSchema),
    defaultValues: {
      toUserId: '',
      message: '',
    },
  });

  const clanForm = useForm<z.infer<typeof clanFormSchema>>({
    resolver: zodResolver(clanFormSchema),
    defaultValues: {
      message: '',
    },
  });

  // A single submit handler that adapts based on the provided data
  async function handleSendMessage(values: {message: string, toUserId?: string}) {
    setLoading(true);
    setError(null);
    setResult(null);

    const input: SendSecureMessageInput = { 
      message: values.message,
      toUserId: values.toUserId, // This will be undefined for clan chat
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
      } else {
        throw new Error(response.error || 'Failed to send message.');
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred. Please try again later.';
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
          
          {/* Clan Chat Tab */}
          <TabsContent value="clan-chat">
            <Card>
              <CardHeader>
                <CardTitle>Clan Communications</CardTitle>
                <CardDescription>
                  Send a message to the unified, end-to-end encrypted clan chat.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...clanForm}>
                  <form onSubmit={clanForm.handleSubmit(handleSendMessage)} className="space-y-4">
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
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : <Send />}
                      <span>{loading ? 'Sending...' : 'Send to Clan Chat'}</span>
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Direct Message Tab */}
          <TabsContent value="dm">
             <Card>
              <CardHeader>
                <CardTitle>Direct Message</CardTitle>
                <CardDescription>
                  Send a private, end-to-end encrypted message to a specific clan member.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...dmForm}>
                  <form onSubmit={dmForm.handleSubmit(handleSendMessage)} className="space-y-4">
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
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : <Send />}
                      <span>{loading ? 'Sending...' : 'Send Direct Message'}</span>
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Sending Failed</AlertTitle>
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
