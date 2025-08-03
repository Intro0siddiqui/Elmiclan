
'use client';

import { useState } from 'react';
import { MOCK_USERS } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Video, Mic, PlusCircle, Smile, Camera, Send } from 'lucide-react';

const MOCK_CHAT_HISTORY = [
    { id: 2, sender: 'me', text: 'Look similar to where u live' },
    { id: 3, sender: 'me', text: 'Kinda' },
    { id: 4, sender: 'other', text: 'That's where we live' },
    { id: 5, sender: 'me', text: 'Look similar to where u live', repliedTo: { name: 'Ada Admin', text: 'That's where we live' } },
    { id: 6, sender: 'me', text: 'I thought so' },
    { id: 7, sender: 'me', text: 'But then I thought my memory is weak' },
    { id: 8, sender: 'other', text: 'It is', repliedTo: { name: 'You', text: 'But then I thought my memory is weak' } },
    { id: 9, sender: 'me', text: 'It isn't because I was right' },
    { id: 10, sender: 'me', text: 'But I just didn't trusted it' },
];

export function PrivateChatInterface({ partnerId, onBack }: { partnerId: string, onBack: () => void }) {
    const [message, setMessage] = useState('');
    const partner = Object.values(MOCK_USERS).find(u => u.email && partnerId.includes(u.email.split('@')[0])) || { name: 'Unknown User', email: '' };

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
                    <AvatarImage src="https://placehold.co/100x100.png" alt={partner.name} data-ai-hint="person avatar" />
                    <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                    <p className="font-semibold leading-none">{partner.name}</p>
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
                    {MOCK_CHAT_HISTORY.map((msg, index) => {
                        const prevMsg = MOCK_CHAT_HISTORY[index - 1];
                        const nextMsg = MOCK_CHAT_HISTORY[index + 1];
                        
                        const isSameSenderAsPrev = prevMsg && prevMsg.sender === msg.sender;
                        const isSameSenderAsNext = nextMsg && nextMsg.sender === msg.sender;

                        const isFirstInGroup = !isSameSenderAsPrev;
                        const isLastInGroup = !isSameSenderAsNext;

                        const senderClasses = cn(
                            'rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white',
                             isLastInGroup ? 'rounded-br-lg' : 'rounded-br-md',
                             isFirstInGroup ? 'rounded-tr-3xl' : 'rounded-tr-md'
                        );

                        const otherClasses = cn(
                            'bg-zinc-800 text-white',
                            isLastInGroup ? 'rounded-bl-lg' : 'rounded-bl-md',
                            isFirstInGroup ? 'rounded-tl-3xl' : 'rounded-tl-md'
                        );

                        return (
                            <div key={msg.id} className={cn('flex items-end gap-2', msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
                                {msg.sender === 'other' && (
                                    <div className='w-8'>
                                        {!isSameSenderAsNext && (
                                            <Avatar className={cn('h-8 w-8 self-end')}>
                                                <AvatarImage src="https://placehold.co/100x100.png" alt={partner.name} data-ai-hint="person avatar" />
                                                <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                )}
                                <div className={cn("flex flex-col gap-1 max-w-xs md:max-w-md", msg.sender === 'me' ? 'items-end' : 'items-start')}>
                                    {msg.repliedTo && <ReplyPreview name={msg.repliedTo.name} text={msg.repliedTo.text} />}
                                    <div className={cn('px-4 py-2', msg.sender === 'me' ? senderClasses : otherClasses)}>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
