"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sendSecureMessage, SendSecureMessageInput } from '@/ai/flows/send-secure-message';
import { Loader2, Send } from 'lucide-react';
import { AnimatedPage } from '@/components/AnimatedPage';

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

export default function MessengerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setResult(null);

    // The toUserId is no longer needed for a unified chat, but the flow expects the object.
    const input: SendSecureMessageInput = { message: values.message };

    try {
      const response = await sendSecureMessage(input);
      if (response.success) {
        setResult({ success: true, message: `Message sent successfully to the clan chat!` });
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
            <CardTitle>Clan Communications</CardTitle>
            <CardDescription>
              Send a message to the unified, end-to-end encrypted clan chat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
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
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send />
                  )}
                  <span>{loading ? 'Sending...' : 'Send to Clan Chat'}</span>
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
