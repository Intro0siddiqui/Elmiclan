
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { sendSecureMessage } from '@/ai/flows/send-secure-message';
import type { Rank } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Send } from 'lucide-react';

const clanMessageFormSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
  rankRestricted: z.boolean().optional().default(false),
});

export function ClanMessageForm({ userRank }: { userRank: Rank }) {
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
