import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { findNameBySlug } from '@/data/99-names';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const name = findNameBySlug(slug);

    if (!name) {
      return new Response('Name not found', { status: 404 });
    }

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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '50px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px',
              }}
            >
              <span style={{ fontSize: '24px', color: 'white' }}>☪️</span>
            </div>
            <div style={{ color: 'white' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0', color: '#10b981' }}>
                Tasbihfy
              </h1>
              <p style={{ fontSize: '16px', margin: '0', opacity: 0.8 }}>
                99 Names of Allah
              </p>
            </div>
          </div>

          {/* Name Number Badge */}
          <div
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '30px',
            }}
          >
            Name {name.id} of 99
          </div>

          {/* Main Name Display */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            <h2
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 20px 0',
                fontFamily: 'serif',
              }}
            >
              {name.arabic}
            </h2>
            <p
              style={{
                fontSize: '36px',
                color: '#10b981',
                margin: '0 0 15px 0',
                fontWeight: 'bold',
              }}
            >
              {name.transliteration}
            </p>
            <p
              style={{
                fontSize: '24px',
                color: 'white',
                margin: '0',
                opacity: 0.9,
              }}
            >
              {name.meaning}
            </p>
          </div>

          {/* Description */}
          <div
            style={{
              maxWidth: '800px',
              textAlign: 'center',
              marginBottom: '30px',
            }}
          >
            <p
              style={{
                fontSize: '18px',
                color: 'white',
                opacity: 0.8,
                lineHeight: 1.4,
                margin: '0',
              }}
            >
              {name.description.length > 120
                ? name.description.substring(0, 120) + '...'
                : name.description
              }
            </p>
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
            <span style={{ fontSize: '16px', marginRight: '8px' }}>📿</span>
            <span style={{ fontSize: '16px' }}>
              Learn meanings, benefits, and recite with Tasbihfy
            </span>
          </div>
        </div>,
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}