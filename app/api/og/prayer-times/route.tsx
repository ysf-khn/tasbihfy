import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'City';
    const country = searchParams.get('country') || 'Country';

    return new ImageResponse(
      <div style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a2e',
            backgroundImage: 'linear-gradient(45deg, #16213e 25%, transparent 25%), linear-gradient(-45deg, #16213e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #16213e 75%), linear-gradient(-45deg, transparent 75%, #16213e 75%)',
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
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
              <span style={{ fontSize: '36px', color: 'white' }}>🕌</span>
            </div>
            <div style={{ color: 'white', display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: '42px', fontWeight: 'bold', margin: '0', color: '#10b981' }}>
                Tasbihfy
              </h1>
              <p style={{ fontSize: '24px', margin: '0', opacity: 0.8 }}>
                Prayer Times
              </p>
            </div>
          </div>

          {/* City and Country */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 10px 0',
              }}
            >
              {city}
            </h2>
            <p
              style={{
                fontSize: '32px',
                color: '#10b981',
                margin: '0',
                opacity: 0.9,
              }}
            >
              {country}
            </p>
          </div>

          {/* Prayer Times Icons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '30px',
              marginBottom: '30px',
            }}
          >
            {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
              <div
                key={prayer}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: 'white',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>🕐</span>
                </div>
                <span style={{ fontSize: '14px', opacity: 0.8 }}>
                  {prayer}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              opacity: 0.7,
            }}
          >
            <span style={{ fontSize: '18px', marginRight: '10px' }}>🧭</span>
            <span style={{ fontSize: '18px' }}>
              Accurate Prayer Times & Qibla Direction
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