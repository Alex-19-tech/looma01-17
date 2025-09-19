import { ReactNode } from 'react';
import { useChatInterfaceLimit } from '@/hooks/useChatInterfaceLimit';
import { ChatInterfaceCounter } from './ChatInterfaceCounter';
import { UpgradeModal } from './UpgradeModal';
import { useState } from 'react';

interface ChatInterfaceLimitGuardProps {
  children: ReactNode;
  showCounter?: boolean;
}

export function ChatInterfaceLimitGuard({ 
  children, 
  showCounter = true 
}: ChatInterfaceLimitGuardProps) {
  const { canCreate, count, maxCount, hasUnlimited, loading } = useChatInterfaceLimit();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {showCounter && (
        <ChatInterfaceCounter 
          count={count}
          maxCount={maxCount}
          hasUnlimited={hasUnlimited}
          className="mb-4"
        />
      )}
      
      {children}
      
      <UpgradeModal 
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentCount={count}
        maxCount={maxCount}
      />
    </>
  );
}