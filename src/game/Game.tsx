import { useEffect, useRef, useCallback, useState } from 'react';
import { GW, GH, makeInitialState } from '@/lib/gameState';
import { updateGame, flap, startGame } from '@/lib/gameLogic';
import { render } from '@/lib/renderer';
import {
  playFlap, playCoin, playMiss, playDie,
  startBgMusic, resumeAudioContext,
} from '@/lib/audio';

export default function Game() {
  const canvasRef = useRef(null);
  const stateRef = useRef(makeInitialState());
  const rafRef = useRef(0);
  const [isDead, setIsDead] = useState(false);
  const isDeadRef = useRef(false);

  const markDead = useCallback(() => {
    isDeadRef.current = true;
    setTimeout(() => setIsDead(true), 350);
  }, []);

  const markAlive = useCallback(() => {
    isDeadRef.current = false;
    setIsDead(false);
  }, []);

  const handleAudio = useCallback((e) => {
    switch (e) {
      case 'flap': playFlap(); break;
      case 'coin': playCoin(); break;
      case 'miss': playMiss(); break;
      case 'die':
        playDie();
        markDead();
        break;
      case 'point': break;
    }
  }, [markDead]);

  const doRetry = useCallback(() => {
    resumeAudioContext();
    markAlive();
    startGame(stateRef.current);
    startBgMusic();
  }, [markAlive]);

  const handleInput = useCallback(() => {
    resumeAudioContext();
    const state = stateRef.current;
    if (state.phase === 'start') {
      startGame(state);
      startBgMusic();
      return;
    }
    if (state.phase === 'playing') {
      flap(state);
      handleAudio('flap');
    }
  }, [handleAudio]);

  const handleRetry = useCallback((e) => {
    e.stopPropagation();
    if ('preventDefault' in e) e.preventDefault();
    doRetry();
  }, [doRetry]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = GW * 2;
    canvas.height = GH * 2;
    ctx.imageSmoothingEnabled = false;

    function loop() {
      const state = stateRef.current;
      updateGame(state, handleAudio);
      ctx.clearRect(0, 0, GW * 2, GH * 2);
      render(ctx, state);
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [handleAudio]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleInput();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleInput]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: `min(100vw, calc(100dvh * ${GW / GH}))`,
          height: `min(100dvh, calc(100vw * ${GH / GW}))`,
          cursor: 'pointer',
        }}
        onClick={handleInput}
        onTouchStart={(e) => { e.preventDefault(); handleInput(); }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
          }}
        />

        {/* CRT scanlines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 2px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)',
            pointerEvents: 'none',
          }}
        />

        {isDead && (
          <div
            style={{
              position: 'absolute',
              bottom: '22%',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
          >
            <button
              onClick={handleRetry}
              onTouchEnd={handleRetry}
              style={{
                background: '#22AA22',
                color: '#FFFFFF',
                fontFamily: '"Courier New", monospace',
                fontWeight: 'bold',
                fontSize: 'clamp(11px, 3vw, 16px)',
                letterSpacing: '3px',
                padding: '10px 28px',
                border: '3px solid #00FF00',
                boxShadow: '4px 4px 0 #003300, 0 0 16px rgba(0,255,0,0.5)',
                cursor: 'pointer',
                outline: 'none',
                animation: 'retryPulse 0.8s ease-in-out infinite alternate',
              }}
            >
              ▶ RETRY
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes retryPulse {
          from { box-shadow: 4px 4px 0 #003300, 0 0 10px rgba(0,255,0,0.4); }
          to { box-shadow: 4px 4px 0 #003300, 0 0 22px rgba(0,255,0,0.8); }
        }
      `}</style>
    </div>
  );
}