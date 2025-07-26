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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sendSecureMessage, SendSecureMessageInput } from '@/ai/flows/send-secure-message';
import { Loader2, Send } from 'lucide-react';
import { AnimatedPage } from '@/components/AnimatedPage';

const formSchema = z.object({
  toUserId: z.string().startsWith('@', "Matrix ID must start with '@'").includes(':', "Matrix ID must include a homeserver (e.g., :matrix.org)"),
  message: z.string().min(1, 'Message cannot be empty.'),
});

export default function MessengerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      toUserId: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setResult(null);

    const input: SendSecureMessageInput = values;

    try {
      const response = await sendSecureMessage(input);
      if (response.success) {
        setResult({ success: true, message: `Message sent successfully to room ${response.roomId}` });
        form.reset();
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
        <Card>
          <CardHeader>
            <CardTitle>Secure Messenger</CardTitle>
            <CardDescription>
              Send end-to-end encrypted messages using the Matrix protocol. Your communications are private.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="toUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Matrix ID</FormLabel>
                      <FormControl>
                        <Input placeholder="@bob:matrix.org" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Encrypted Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Type your secret message here..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send />
                  )}
                  <span>{loading ? 'Sending...' : 'Send Secure Message'}</span>
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Sending Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && result.success && (
          <Alert variant="default">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </div>
    </AnimatedPage>
  );
}
