
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
import { Loader2, MessageSquare, Send, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { sendSecureMessage } from '@/ai/flows/send-secure-message';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  toUserId: z.string().startsWith('@', { message: 'Matrix ID must start with @' }).min(5, { message: 'Matrix ID seems too short.' }),
  message: z.string().min(1, { message: 'Message cannot be empty.' }),
});

export default function MessengerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ roomId: string } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      toUserId: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not Authenticated',
            description: 'You must be logged in to send a message.',
        });
        return;
    }
    
    setIsLoading(true);
    setResult(null);

    try {
      const response = await sendSecureMessage({ ...values, fromUid: user.id });
      if (response.success && response.roomId) {
        setResult({ roomId: response.roomId });
        toast({
          title: 'Message Sent',
          description: `Your secure message has been sent to room: ${response.roomId}`,
        });
        form.reset();
      } else {
        throw new Error(response.error || 'Failed to send message.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Sending Message',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Secure Messenger</h1>
        <p className="text-muted-foreground mt-2">
          Send end-to-end encrypted messages to other clan members via Matrix.
        </p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Setup Note</AlertTitle>
        <AlertDescription>
          This is a functional demo. To make this work, you must create a free Matrix account, get an Access Token, and set `MATRIX_USER_ID` and `MATRIX_ACCESS_TOKEN` in a `.env.local` file at the project root.
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg">
        <CardHeader>
            <div className='flex items-center gap-2'>
                <MessageSquare className="h-6 w-6 text-primary" />
                <CardTitle>New Secure Message</CardTitle>
            </div>
            <CardDescription>
                Your message will be encrypted before it leaves this portal.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="toUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient&apos;s Matrix ID</FormLabel>
                    <FormControl>
                      <Input placeholder="@recipient:matrix.org" {...field} />
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
                    <FormLabel>Your Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Type your secure message here..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Encrypted Message
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

    </div>
  );
}
