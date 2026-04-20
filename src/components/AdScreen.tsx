import { useEffect, useState } from 'react';

interface AdScreenProps {
  onDismiss: () => void;
}

const AD_DURATION = 8;

const fakeAds = [
  {
    title: 'DOWNLOAD NOW!!!',
    subtitle: 'CLASH OF COIN BIRD 3D!!!',
    body: 'TOP RATED GAME IN 196 COUNTRIES!!!',
    rating: '★★★★★',
    dl: '1,000,000,000+ DOWNLOADS',
    cta: 'FREE DOWNLOAD',
    bg: '#FF4400',
    accent: '#FFEE00',
    img: '🐦',
  },
  {
    title: 'AMAZING OFFER!!!',
    subtitle: 'COIN BIRD PRO VIP ULTRA+',
    body: 'REMOVE ADS FOR ONLY $99.99/WEEK',
    rating: '★★★★★',
    dl: '5 STARS, TRUST ME BRO',
    cta: 'BUY NOW ($99.99)',
    bg: '#0044FF',
    accent: '#00FFAA',
    img: '💰',
  },
  {
    title: '⚠️ WARNING ⚠️',
    subtitle: 'YOUR PHONE HAS 99 VIRUSES!!!',
    body: 'TAP NOW TO CLEAN & WIN $1,000,000!!!',
    rating: '☆☆☆☆☆',
    dl: 'DEFINITELY REAL APP',
    cta: 'CLAIM PRIZE NOW',
    bg: '#006600',
    accent: '#00FF00',
    img: '🦠',
  },
];

export default function AdScreen({ onDismiss }: AdScreenProps) {
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [ad] = useState(() => fakeAds[Math.floor(Math.random() * fakeAds.length)]);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(iv);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    const biv = setInterval(() => setBlink(b => !b), 400);
    return () => { clearInterval(iv); clearInterval(biv); };
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.92)', fontFamily: '"Courier New", monospace' }}
    >
      <div
        className="relative w-full max-w-sm mx-4 p-1 overflow-hidden"
        style={{
          background: ad.bg,
          border: `4px solid ${ad.accent}`,
          boxShadow: `0 0 30px ${ad.accent}, inset 0 0 20px rgba(0,0,0,0.3)`,
          imageRendering: 'pixelated',
        }}
      >
        {/* Scanlines overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
          }}
        />

        {/* AD label */}
        <div
          className="text-center py-1 mb-1 text-xs font-bold tracking-widest"
          style={{ background: ad.accent, color: '#000', fontSize: '10px' }}
        >
          ADVERTISEMENT
        </div>

        <div className="text-center p-3">
          {/* Big emoji */}
          <div className="text-6xl mb-2" style={{ filter: 'drop-shadow(2px 2px 0 #000)' }}>
            {ad.img}
          </div>

          {/* Title */}
          <div
            className="text-2xl font-black mb-1"
            style={{
              color: ad.accent,
              textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
              fontSize: '20px',
              letterSpacing: '2px',
            }}
          >
            {ad.title}
          </div>

          {/* Subtitle */}
          <div
            className="font-black mb-2"
            style={{
              color: '#FFFFFF',
              textShadow: '1px 1px 0 #000',
              fontSize: '13px',
              letterSpacing: '1px',
            }}
          >
            {ad.subtitle}
          </div>

          {/* Body */}
          <div
            className="mb-3 p-2"
            style={{
              background: 'rgba(0,0,0,0.4)',
              color: ad.accent,
              fontSize: '11px',
              fontWeight: 'bold',
              border: `2px solid ${ad.accent}`,
            }}
          >
            {ad.body}
          </div>

          {/* Rating / downloads */}
          <div className="mb-1" style={{ color: '#FFD700', fontSize: '12px' }}>
            {ad.rating}
          </div>
          <div className="mb-3" style={{ color: '#CCCCCC', fontSize: '9px' }}>
            {ad.dl}
          </div>

          {/* CTA button (fake) */}
          <div
            className="py-2 px-4 mb-3 cursor-not-allowed"
            style={{
              background: blink ? ad.accent : '#FFFFFF',
              color: '#000000',
              fontWeight: 'bold',
              fontSize: '13px',
              fontFamily: '"Courier New", monospace',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              transition: 'none',
            }}
          >
            {ad.cta}
          </div>

          {/* Skip button */}
          {countdown === 0 ? (
            <button
              onClick={onDismiss}
              className="w-full py-2 font-bold text-sm"
              style={{
                background: '#222222',
                color: '#00FF00',
                border: '2px solid #00FF00',
                boxShadow: '0 0 8px #00FF00',
                cursor: 'pointer',
                fontFamily: '"Courier New", monospace',
                letterSpacing: '2px',
                fontSize: '12px',
              }}
            >
              [ SKIP AD ]
            </button>
          ) : (
            <div
              className="py-2 text-sm"
              style={{
                background: '#111',
                color: '#888888',
                border: '2px solid #444',
                fontSize: '11px',
                fontFamily: '"Courier New", monospace',
              }}
            >
              SKIP IN {countdown}s...
            </div>
          )}
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4" style={{ background: '#000', opacity: 0.5 }} />
        <div className="absolute top-0 right-0 w-4 h-4" style={{ background: '#000', opacity: 0.5 }} />
        <div className="absolute bottom-0 left-0 w-4 h-4" style={{ background: '#000', opacity: 0.5 }} />
        <div className="absolute bottom-0 right-0 w-4 h-4" style={{ background: '#000', opacity: 0.5 }} />
      </div>
    </div>
  );
}
