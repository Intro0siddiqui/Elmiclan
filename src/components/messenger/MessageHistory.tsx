
'use client';

import { useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchMessages, FetchMessagesOutput } from '@/ai/flows/fetch-messages';
import type { Rank } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export function MessageHistory({ currentUserRank }: { currentUserRank: Rank }) {
    const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery<FetchMessagesOutput>({
        queryKey: ['clanMessages', currentUserRank],
        queryFn: ({ pageParam }) => fetchMessages({ from: pageParam as string | undefined, requestingUserRank: currentUserRank }),
        getNextPageParam: lastPage => lastPage.nextFrom,
        initialPageParam: undefined,
        refetchInterval: 5000,
    });

  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [data?.pages.length, data?.pages[0]?.messages.length]);

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
    <Card className='h-[60vh] flex flex-col'>
      <CardHeader>
        <CardTitle>Live Clan Feed</CardTitle>
        <CardDescription>Messages from the main clan chat room.</CardDescription>
      </CardHeader>
      <CardContent className='flex-grow overflow-hidden'>
        <ScrollArea className="h-full p-4 border rounded-lg bg-black/50">
          <div data-radix-scroll-area-viewport ref={scrollViewportRef} className="h-full">
              <div className="flex justify-center my-2">
              {hasNextPage && (
                  <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : 'Load More Messages'}
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
                  );
                  }
                  return (
                  <div key={msg.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1">
                      <Avatar className="h-10 w-10 border-2 border-gray-500">
                          <AvatarFallback className="bg-blue-800 text-white text-xl">参</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-300">{msg.sender.split(':')[0].replace('@', '')}</span>
                      </div>
                      <div className="pt-2">
                          <div className="relative inline-block bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-lg px-4 py-2 shadow-md border border-blue-400">
                              {msg.content}
                          </div>
                      </div>
                  </div>
                  );
              })}
              </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
