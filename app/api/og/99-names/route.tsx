import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    return new ImageResponse(
      <div style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a2e',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #16213e 2%, transparent 0%), radial-gradient(circle at 75px 75px, #16213e 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          {/* Header */}
          <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
              }}
            >
              <span style={{ fontSize: '36px', color: 'white' }}>☪️</span>
            </div>
            <div style={{ color: 'white', display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: '42px', fontWeight: 'bold', margin: '0', color: '#10b981' }}>
                Tasbihfy
              </h1>
              <p style={{ fontSize: '24px', margin: '0', opacity: 0.8 }}>
                99 Names of Allah
              </p>
            </div>
          </div>

          {/* Arabic Title */}
          <div style={{
              textAlign: 'center',
              marginBottom: '30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <h2 style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 10px 0',
              }}
            >
              The 99 Beautiful Names
            </h2>
            <p style={{
                fontSize: '24px',
                color: '#10b981',
                margin: '0',
                opacity: 0.9,
              }}
            >
              Asma ul Husna - The Most Beautiful Names
            </p>
          </div>

          {/* Sample Names */}
          <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              marginBottom: '40px',
            }}
          >
            {[
              { number: '1', transliteration: 'Ar-Rahman' },
              { number: '2', transliteration: 'Ar-Rahim' },
              { number: '3', transliteration: 'Al-Malik' },
            ].map((name, index) => (
              <div
                key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <span style={{
                    fontSize: '28px',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                  }}
                >
                  #{name.number}
                </span>
                <span style={{ fontSize: '14px', opacity: 0.8 }}>
                  {name.transliteration}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
              position: 'absolute',
              bottom: '30px',
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              opacity: 0.7,
            }}
          >
            <span style={{ fontSize: '18px', marginRight: '10px' }}>📿</span>
            <span style={{ fontSize: '18px' }}>
              Complete Collection with Meanings & Benefits
            </span>
          </div>
        </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}