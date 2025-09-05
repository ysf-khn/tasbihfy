import React from 'react';
import Image from 'next/image';

interface ShareableCardProps {
  arabicText: string;
  translation: string;
  reference: string;
  type: 'verse' | 'dua';
  className?: string;
}

export const ShareableCard = React.forwardRef<HTMLDivElement, ShareableCardProps>(
  ({ arabicText, translation, reference, type, className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={`fixed -left-[9999px] bg-white ${className}`}
        style={{
          width: '1080px',
          minHeight: '800px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Card Container */}
        <div className="w-full min-h-full flex flex-col p-12" style={{ backgroundColor: '#f8fafc' }}>
          {/* Header with Branding */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20">
                <Image
                  src="/tasbihfy_logo.jpeg"
                  alt="Tasbihfy Logo"
                  width={80}
                  height={80}
                  className="rounded-3xl shadow-lg object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold" style={{ color: '#1f2937' }}>Tasbihfy</h1>
                <p className="text-xl" style={{ color: '#57c5b6' }}>tasbihfy.com</p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col justify-center space-y-10 max-w-5xl mx-auto">
            {/* Arabic Text */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <p
                className="text-center"
                style={{
                  fontFamily: "'Scheherazade New', 'Noto Naskh Arabic', 'Arabic Typesetting', serif",
                  direction: 'rtl',
                  textAlign: 'center',
                  fontSize: arabicText.length > 200 ? '2.5rem' : arabicText.length > 100 ? '3rem' : '3.5rem',
                  lineHeight: '2.2',
                  letterSpacing: '0.02em',
                  wordSpacing: '0.1em',
                  color: '#1f2937',
                  padding: '1rem 0',
                }}
              >
                {arabicText}
              </p>
            </div>

            {/* Translation */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <p 
                className="text-center"
                style={{
                  fontSize: translation.length > 300 ? '1.5rem' : translation.length > 150 ? '1.75rem' : '2rem',
                  lineHeight: '1.8',
                  color: '#4b5563',
                  fontWeight: '400',
                }}
              >
                {translation}
              </p>
            </div>

            {/* Reference */}
            <div className="text-center">
              <p 
                className="font-semibold"
                style={{
                  fontSize: '1.5rem',
                  color: '#57c5b6',
                }}
              >
                — {reference}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8">
            <div className="text-center" style={{ borderTop: '2px solid #e5e7eb' }}>
              <p 
                className="pt-6"
                style={{
                  fontSize: '1.25rem',
                  color: '#6b7280',
                  fontWeight: '500',
                }}
              >
                {type === 'verse' ? '📖 Share the Quran' : '🤲 Share Islamic Duas'} • tasbihfy.com
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ShareableCard.displayName = 'ShareableCard';

export default ShareableCard;