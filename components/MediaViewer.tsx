
import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { FileAttachment } from '../types';

interface MediaViewerProps {
  content: { type: 'photo'; photos: FileAttachment[]; startIndex: number } | { type: 'pdf'; url: string };
  onClose: () => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ content, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(content.type === 'photo' ? content.startIndex : 0);

  const handleNext = useCallback(() => {
    if (content.type === 'photo') {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % content.photos.length);
    }
  }, [content]);

  const handlePrev = useCallback(() => {
    if (content.type === 'photo') {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + content.photos.length) % content.photos.length);
    }
  }, [content]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
          onClose();
      }
      if (content.type === 'photo') {
        if (e.key === 'ArrowRight') {
          handleNext();
        } else if (e.key === 'ArrowLeft') {
          handlePrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev, onClose, content.type]);

  if (content.type === 'pdf') {
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-[90vw] h-[90vh] bg-black rounded-lg overflow-hidden flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <embed src={content.url} type="application/pdf" className="w-full h-full" />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors"
                    aria-label="Close media viewer"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
    );
  }

  // iCloud-style Photo gallery view
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      style={{ perspective: '1000px' }}
    >
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors z-50"
            aria-label="Close media viewer"
        >
            <X size={24} />
        </button>

        <div className="relative w-[60vw] h-[70vh] md:w-[45vw] md:h-[75vh]" onClick={e => e.stopPropagation()}>
            {content.photos.map((photo, index) => {
                const offset = index - currentIndex;
                const isCurrent = offset === 0;
                const isPrev = offset === -1;
                const isNext = offset === 1;

                const style = {
                    transform: `translateX(${offset * 20}%) scale(${1 - Math.abs(offset) * 0.15}) rotateY(${-offset * 15}deg) translateZ(${Math.abs(offset) * -200}px)`,
                    opacity: Math.abs(offset) < 3 ? 1 : 0,
                    zIndex: content.photos.length - Math.abs(offset),
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    pointerEvents: isCurrent ? 'auto' : 'none' as 'auto' | 'none',
                    cursor: isNext || isPrev ? 'pointer' : 'default',
                };

                return (
                    <div
                        key={photo.id}
                        className="absolute inset-0 w-full h-full flex items-center justify-center"
                        style={style}
                        onClick={isNext ? handleNext : isPrev ? handlePrev : undefined}
                    >
                        <img
                            src={photo.dataUrl}
                            alt={photo.name}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-black"
                        />
                    </div>
                );
            })}
        </div>
        
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 rounded-full px-4 py-1.5 text-sm z-50">
            {currentIndex + 1} / {content.photos.length}
        </div>
    </div>
  );
};

export default MediaViewer;
