import React, { useEffect, useRef } from 'react';

interface KhoaverseLibraryViewProps {
  onBackToStore: () => void;
  onBuyBook: (productId?: string) => void;
  initialSlug?: string | null;
}

export const KhoaverseLibraryView: React.FC<KhoaverseLibraryViewProps> = ({
  onBackToStore,
  onBuyBook,
  initialSlug,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data) return;
      if (e.data.type === 'NAVIGATE_STORE') {
        onBackToStore();
      } else if (e.data.type === 'BUY_BOOK') {
        onBuyBook(e.data.title);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onBackToStore, onBuyBook]);

  // Handle initial slug
  const handleIframeLoad = () => {
    if (initialSlug && iframeRef.current?.contentWindow) {
      const cleanSlug = initialSlug.replace(/-/g, ' ');
      iframeRef.current.contentWindow.postMessage(
        { type: 'OPEN_BOOK_TITLE', title: cleanSlug },
        '*'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-[#EDEBE6]">
      <iframe
        ref={iframeRef}
        src={initialSlug ? `/sach3d/index.html?book=${encodeURIComponent(initialSlug)}&read=1` : "/sach3d/index.html"}
        onLoad={handleIframeLoad}
        className="w-full h-full border-0 block"
        title="KhoaVerse Reading Space"
        allow="autoplay"
      />
    </div>
  );
};
