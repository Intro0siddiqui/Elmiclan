"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, Activity, Settings, UserPlus } from "lucide-react";
import type { User, Rank } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { setCustomClaim } from "@/ai/flows/set-custom-claim";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const recentActivities = [
    { user: "Sam Scout", action: "Filed intel report #284", time: "5m ago" },
    { user: "New Member", action: "Registered with invite code", time: "15m ago" },
    { user: "Chris Conq", action: "Started 'Western Reach' campaign", time: "1h ago" },
    { user: "Alex Erra", action: "Completed orientation", time: "3h ago" },
];

const rankManagementSchema = z.object({
    email: z.string().email("Please enter a valid email."),
    rank: z.enum(["Errante", "Scout", "Conquistador", "Admin"]),
});

function RankManager() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof rankManagementSchema>>({
        resolver: zodResolver(rankManagementSchema),
        defaultValues: { email: "", rank: "Errante" },
    });

    async function onSubmit(values: z.infer<typeof rankManagementSchema>) {
        setLoading(true);
        setError(null);
        setResult(null);

        // NOTE: In a real app, you would get the user's UID from their email via a lookup.
        // For this demo, we'll just use the email as a stand-in for the UID.
        const response = await setCustomClaim({ userId: values.email, rank: values.rank });
        
        if (response.success) {
            setResult({ success: true, message: response.message });
            form.reset();
        } else {
            setError(response.message);
        }
        setLoading(false);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    <CardTitle>User Rank Management</CardTitle>
                </div>
                <CardDescription>Assign or update a user's rank within the clan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="member@elmiclan.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="rank"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>New Rank</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a new rank" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Errante">Errante</SelectItem>
                                        <SelectItem value="Scout">Scout</SelectItem>
                                        <SelectItem value="Conquistador">Conquistador</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Rank'}
                        </Button>
                    </form>
                </Form>
                 {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Update Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {result && result.success && (
                    <Alert variant="default" className="mt-4">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{result.message}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
}

export function AdminDashboard({ user }: { user: User }) {
  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
            <CardTitle>Administrator Control Panel</CardTitle>
            <CardDescription>Oversee and manage all aspects of the ElmiClan Portal.</CardDescription>
            </CardHeader>
        </Card>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,257</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">342</div>
                    <p className="text-xs text-muted-foreground">Online in last 24h</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">System Health</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-400">Nominal</div>
                    <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">89</div>
                    <p className="text-xs text-muted-foreground">+15 since last week</p>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentActivities.map((activity, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{activity.user}</TableCell>
                                <TableCell>{activity.action}</TableCell>
                                <TableCell className="text-right">{activity.time}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <RankManager />
        </div>
    </div>
  );
}
