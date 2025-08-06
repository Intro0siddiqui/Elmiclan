
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Video, Mic, PlusCircle, Smile, Camera, Send } from 'lucide-react';

export function PrivateChatInterface({ partnerId, onBack }: { partnerId: string, onBack: () => void }) {
    const [message, setMessage] = useState('');
    const partnerName = partnerId.split(':')[0].replace('@', ''); // Extract name from matrix ID

    const ReplyPreview = ({ name, text }: { name: string; text: string }) => (
        <div className="bg-black/20 p-2 rounded-lg mb-1 border-l-2 border-blue-400">
            <p className="text-xs font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{text}</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Chat Header */}
            <div className="flex items-center p-2 border-b">
                <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
                    <ArrowLeft />
                </Button>
                <Avatar className="h-10 w-10">
                    <AvatarImage src="https://placehold.co/100x100.png" alt={partnerName} data-ai-hint="person avatar" />
                    <AvatarFallback>{partnerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                    <p className="font-semibold leading-none">{partnerName}</p>
                    <p className="text-xs text-muted-foreground">online</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <Button variant="ghost" size="icon"><Phone /></Button>
                    <Button variant="ghost" size="icon"><Video /></Button>
                </div>
            </div>

            {/* Message History */}
            <ScrollArea className="flex-grow p-4">
                <div className="flex flex-col gap-0.5">
                    <p className="text-center text-muted-foreground">No messages yet. Start a conversation!</p>
                </div>
            </ScrollArea>

            {/* Message Input Footer */}
            <div className="flex items-end gap-2 px-2 py-1 border-t">
                <div className="flex-grow flex items-center bg-zinc-800 rounded-full px-2">
                     <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground">
                        <Smile />
                    </Button>
                    <Textarea
                        placeholder="Message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-grow border-none focus-visible:ring-0 bg-transparent resize-none text-white placeholder:text-muted-foreground py-2 min-h-[40px]"
                        rows={1}
                    />
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground">
                            <Camera />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground">
                            <Mic />
                        </Button>
                    </div>
                </div>
                <Button variant="default" size="icon" className="h-9 w-9 rounded-full bg-primary flex-shrink-0">
                    {message ? <Send /> : <PlusCircle />}
                </Button>
            </div>
        </div>
    );
}
