import { useEffect, useRef, useCallback } from 'react';
import Game from './game/Game';
import { AdMob, InterstitialAdPluginEvents } from '@capacitor-community/admob';

export default function App() {
  const gameOverCountRef = useRef(0);
  const isShowingAdRef = useRef(false);

  const handleGameOver = useCallback(async () => {
    gameOverCountRef.current++;
    
    // Show AdMob ad every 5 game overs
    if (gameOverCountRef.current % 5 === 0) {
      isShowingAdRef.current = true;
      
      // Load and show ad asynchronously (non-blocking)
      (async () => {
        try {
          await AdMob.prepareInterstitial({
            adId: 'ca-app-pub-3940256099942544/4411468910',
          });
          await AdMob.showInterstitial();
        } catch (error) {
          console.error('AdMob error:', error);
          isShowingAdRef.current = false;
        }
      })();
    }
  }, []);

  useEffect(() => {
    // Initialize AdMob once
    (async () => {
      try {
        await AdMob.initialize();
        
        // Listen for ad dismissal event
        AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
          isShowingAdRef.current = false;
        });
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
        console.error('Error removing AdMob listeners:', error);
      }
    };
  }, []);

  return <Game onGameOver={handleGameOver} />;
}

