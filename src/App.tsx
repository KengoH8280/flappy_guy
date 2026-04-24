import { useEffect, useRef, useCallback } from 'react';
import Game from './game/Game';

let AdMob: any = null;
let InterstitialAdPluginEvents: any = null;

// Try to load AdMob if available (Capacitor environment)
try {
  const admobModule = require('@capacitor-community/admob');
  AdMob = admobModule.AdMob;
  InterstitialAdPluginEvents = admobModule.InterstitialAdPluginEvents;
} catch {
  // AdMob not available (e.g., in web dev environment)
}

export default function App() {
  const gameOverCountRef = useRef(0);

  const handleGameOver = useCallback(async () => {
    gameOverCountRef.current++;
    
    // Show AdMob ad every 5 game overs (only if AdMob is available)
    if (AdMob && gameOverCountRef.current % 5 === 0) {
      // Load and show ad asynchronously (non-blocking)
      (async () => {
        try {
          await AdMob.prepareInterstitial({
            adId: 'ca-app-pub-3940256099942544/4411468910',
          });
          await AdMob.showInterstitial();
        } catch (error) {
          console.error('AdMob error:', error);
        }
      })();
    }
  }, []);

  useEffect(() => {
    // Initialize AdMob once (only if available)
    if (!AdMob) return;

    (async () => {
      try {
        await AdMob.initialize();
        
        // Listen for ad dismissal event
        if (InterstitialAdPluginEvents) {
          AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
            // Ad dismissed
          });
        }
      } catch (error) {
        console.error('AdMob initialization error:', error);
      }
    })();

    return () => {
      // Cleanup listeners on unmount
      try {
        if (typeof (AdMob as any).removeAllListeners === 'function') {
          (AdMob as any).removeAllListeners();
        }
      } catch (error) {
        // Error removing listeners
      }
    };
  }, []);

  return <Game onGameOver={handleGameOver} />;
}

