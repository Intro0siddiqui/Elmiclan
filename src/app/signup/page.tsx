"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Logo } from '@/components/icons';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { VALID_INVITE_CODES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  inviteCode: z.string().min(1, { message: 'Invite code is required.' })
    .refine(code => VALID_INVITE_CODES.includes(code.toUpperCase()), {
      message: 'Invalid invite code.',
    }),
});

export default function SignupPage() {
  const { signup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      inviteCode: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // New users start as 'Errante'
      await signup(values.email, 'Errante');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-zinc-900/50 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Logo className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold tracking-tighter">ElmiClan Portal</h1>
            </div>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>An invite code is required to join the clan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="new.member@elmiclan.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inviteCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invite Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your invite code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm">
            <p>
              Already have an account?{' '}
              <Link href="/" className="underline text-primary">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
        <Card className="mt-6 bg-secondary/50">
          <CardHeader>
            <CardTitle className="text-sm">Valid Invite Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
                {VALID_INVITE_CODES.map(code => <p key={code}>{code}</p>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
