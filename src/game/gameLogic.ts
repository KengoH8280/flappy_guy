import {
  GameState, Coin, Sparkle,
  GW, GROUND_Y, CEILING_Y, BIRD_X, BIRD_W, BIRD_H,
  COIN_SPEED, COIN_BASE_INTERVAL,
  GRAVITY, FLAP_VY, MAX_FALL, MAX_MISSES,
  makeBird, makeInitialState,
} from './gameState';

const COIN_R = 5;

function randBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function spawnCoin(score: number): Coin {
  const margin = 20;
  const minY = CEILING_Y + margin;
  const maxY = GROUND_Y - margin;
  const y = randBetween(minY, maxY);
  const speedBoost = Math.min(score * 0.02, 0.8);
  return {
    x: GW + 8,
    y,
    collected: false,
    missed: false,
    frame: Math.random() * 4,
    size: Math.random() < 0.2 ? 7 : 5,
  };
}

function makeSparkles(x: number, y: number): Sparkle[] {
  const colors = ['#FFD700', '#FFEC6E', '#FFA500', '#FFFFFF', '#FF6600'];
  return Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.3;
    const speed = 1.2 + Math.random() * 2.5;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.5,
      life: 18 + Math.floor(Math.random() * 12),
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });
}

export type AudioEvent = 'flap' | 'coin' | 'miss' | 'die' | 'point';

export function flap(state: GameState): void {
  if (state.phase !== 'playing') return;
  state.bird.vy = FLAP_VY;
}

export function startGame(state: GameState): void {
  const deathCount = state.deathCount;
  const highScore = state.highScore;
  const fresh = makeInitialState();
  Object.assign(state, fresh);
  state.deathCount = deathCount;
  state.highScore = highScore;
  state.phase = 'playing';
}

export function dismissAd(state: GameState): void {
  state.phase = 'start';
  state.deathCount = 0;
}

export function updateGame(
  state: GameState,
  onAudio: (e: AudioEvent) => void,
): void {
  if (state.phase !== 'playing') {
    if (state.phase === 'dead') {
      state.bird.y += state.bird.vy;
      state.bird.vy = Math.min(state.bird.vy + GRAVITY, MAX_FALL);
      state.bird.deathSpin += state.bird.deathSpinV;
      if (state.bird.deathSpinV > 0) state.bird.deathSpinV -= 0.2;
    }
    if (state.phase === 'ad') state.adTimer++;
    state.bgScroll = (state.bgScroll + 0.25) % GW;
    return;
  }

  state.frameCount++;
  state.bgScroll = (state.bgScroll + 0.5) % GW;
  state.groundScroll = (state.groundScroll + COIN_SPEED) % 16;
  if (state.flashTimer > 0) state.flashTimer--;

  // bird physics
  const bird = state.bird;
  bird.vy = Math.min(bird.vy + GRAVITY, MAX_FALL);
  bird.y += bird.vy;
  bird.angle = Math.max(-20, Math.min(60, bird.vy * 5));
  bird.wingTimer++;
  if (bird.wingTimer >= 7) {
    bird.wingFrame = (bird.wingFrame + 1) % 3;
    bird.wingTimer = 0;
  }

  // sparkles
  state.sparkles = state.sparkles
    .map(s => ({ ...s, x: s.x + s.vx, y: s.y + s.vy, vy: s.vy + 0.08, life: s.life - 1 }))
    .filter(s => s.life > 0);

  // spawn coins
  state.coinTimer++;
  const interval = Math.max(45, COIN_BASE_INTERVAL - Math.floor(state.score * 0.25));
  if (state.coinTimer >= interval) {
    state.coinTimer = 0;
    state.coins.push(spawnCoin(state.score));
    if (state.score > 15 && Math.random() < 0.25) {
      setTimeout(() => {
        if (state.phase === 'playing') {
          const c = spawnCoin(state.score);
          c.x = GW + 30;
          c.y = state.coins[state.coins.length - 1]?.y + randBetween(-40, 40) || c.y;
          c.y = Math.max(CEILING_Y + 20, Math.min(GROUND_Y - 20, c.y));
          state.coins.push(c);
        }
      }, 300);
    }
  }

  // move coins (gentle speed increase)
  for (const coin of state.coins) {
    coin.x -= COIN_SPEED + state.score * 0.008;
    coin.frame = (coin.frame + 0.18) % 4;
  }

  // collect coins
  for (const coin of state.coins) {
    if (coin.collected || coin.missed) continue;
    const dx = coin.x - (BIRD_X + BIRD_W / 2);
    const dy = coin.y - (bird.y + BIRD_H / 2);
    if (Math.sqrt(dx * dx + dy * dy) < COIN_R + 7) {
      coin.collected = true;
      state.score++;
      state.sparkles.push(...makeSparkles(coin.x, coin.y));
      onAudio('coin');
      if (state.score > state.highScore) {
        state.highScore = state.score;
        localStorage.setItem('kusoge_hi', String(state.score));
      }
    }
  }

  // miss detection: coin has passed the character
  for (const coin of state.coins) {
    if (!coin.collected && !coin.missed && coin.x < BIRD_X - BIRD_W) {
      coin.missed = true;
      state.missCount++;
      state.flashTimer = 10;
      onAudio('miss');
      if (state.missCount >= MAX_MISSES) {
        killBird(state, onAudio);
        return;
      }
    }
  }

  // wall collision (top ceiling and ground)
  if (bird.y + BIRD_H >= GROUND_Y || bird.y <= CEILING_Y) {
    killBird(state, onAudio);
    return;
  }

  // clean up off-screen coins
  state.coins = state.coins.filter(c => c.x > -20);
}

function killBird(state: GameState, onAudio: (e: AudioEvent) => void) {
  state.phase = 'dead';
  state.deathCount++;
  state.bird.deathSpinV = 7;
  onAudio('die');
}
