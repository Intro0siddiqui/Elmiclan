'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-supabase-auth';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedPage } from '@/components/AnimatedPage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageHistory } from '@/components/messenger/MessageHistory';
import { ClanMessageForm } from '@/components/messenger/ClanMessageForm';
import { ConversationList } from '@/components/messenger/ConversationList';
import { PartnerFinder } from '@/components/messenger/PartnerFinder';
import { PrivateChatInterface } from '@/components/messenger/PrivateChatInterface';

export default function MessengerPage() {
  const params = useParams();
  const { user } = useAuth();
  
  const [isChatActive, setIsChatActive] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const partnerFinderRef = useRef<HTMLDivElement>(null);

  const mode = params.mode as string;

  useEffect(() => {
    setIsChatActive(false);
    setSelectedPartner('');
  }, [mode]);

  if (!user) {
    return (
        <div className="w-full space-y-4 p-4 md:p-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  const handleSelectPartner = (matrixId: string) => {
    setSelectedPartner(matrixId);
    setIsChatActive(true);
  };

  const handleBackToList = () => {
    setSelectedPartner('');
    setIsChatActive(false);
  };
  
  const handleFindMore = () => {
    partnerFinderRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderDmContent = () => {
    if (isChatActive) {
      return <PrivateChatInterface partnerId={selectedPartner} onBack={handleBackToList} />;
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-4 md:p-6 space-y-6">
                <ConversationList onSelectConversation={handleSelectPartner} onFindMore={handleFindMore} />
                <PartnerFinder currentUser={user} onSelectPartner={handleSelectPartner} refProp={partnerFinderRef} />
            </div>
        </ScrollArea>
    );
  };

  return (
    <AnimatedPage>
      <div className="h-screen w-full bg-background overflow-hidden">
       {mode === 'clan' && (
        <div className="space-y-6 p-4 md:p-6">
          <ClanMessageForm userRank={user.rank} />
          <MessageHistory currentUserRank={user.rank} />
        </div>
       )}
       {mode === 'dm' && renderDmContent()}
      </div>
    </AnimatedPage>
  );
}