import { useState, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';

interface ShareImageOptions {
  arabicText: string;
  translation: string;
  reference: string;
  type: 'verse' | 'dua';
  filename?: string;
}

export function useShareImage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const generateAndShare = useCallback(async (options: ShareImageOptions) => {
    const { arabicText, translation, reference, type, filename } = options;
    
    if (!cardRef.current) {
      setError('Card reference not available');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Generate the image with high quality settings
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High quality for social media
        backgroundColor: '#f8fafc',
        width: 1080,
        style: {
          transform: 'translate(0, 0)', // Reset positioning for image generation
          position: 'static',
          left: '0',
          top: '0',
        },
      });

      // Convert data URL to blob for sharing
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Create a file from the blob
      const file = new File([blob], filename || `tasbihfy-${type}-${Date.now()}.png`, {
        type: 'image/png',
      });

      // Try to use the native share API first
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: type === 'verse' ? `Quran Verse - ${reference}` : `Dua - ${reference}`,
          text: `${arabicText}\n\n${translation}\n\n— ${reference}`,
          files: [file],
        });
      } else if (navigator.share) {
        // Fallback to sharing text with link to download image
        await navigator.share({
          title: type === 'verse' ? `Quran Verse - ${reference}` : `Dua - ${reference}`,
          text: `${arabicText}\n\n${translation}\n\n— ${reference}\n\nShared from tasbihfy.com`,
          url: window.location.href,
        });
      } else {
        // Fallback for desktop: download the image
        const link = document.createElement('a');
        link.download = filename || `tasbihfy-${type}-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Error generating share image:', err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
      setError('Failed to copy text');
    }
  }, []);

  return {
    generateAndShare,
    copyToClipboard,
    isGenerating,
    error,
    cardRef,
    clearError: () => setError(null),
  };
}

export default useShareImage;