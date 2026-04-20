export const GW = 160;
export const GH = 280;
export const GROUND_Y = 252;
export const CEILING_Y = 12;
export const BIRD_X = 72;
export const BIRD_W = 12;
export const BIRD_H = 9;

export const COIN_SPEED = 0.9;
export const COIN_BASE_INTERVAL = 72;
export const GRAVITY = 0.11;
export const FLAP_VY = -3.2;
export const MAX_FALL = 4;
export const MAX_MISSES = 3;
export const DEATHS_FOR_AD = 5;

export type Phase = 'start' | 'playing' | 'dead' | 'ad';

export interface Bird {
  y: number;
  vy: number;
  angle: number;
  wingFrame: number;
  wingTimer: number;
  deathSpin: number;
  deathSpinV: number;
}

export interface Coin {
  x: number;
  y: number;
  collected: boolean;
  missed: boolean;
  frame: number;
  size: number;
}

export interface GameState {
  phase: Phase;
  bird: Bird;
  coins: Coin[];
  score: number;
  missCount: number;
  deathCount: number;
  frameCount: number;
  coinTimer: number;
  highScore: number;
  adTimer: number;
  bgScroll: number;
  groundScroll: number;
  flashTimer: number;
  sparkles: Sparkle[];
}

export interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export function makeBird(): Bird {
  return {
    y: GH / 2 - 20,
    vy: 0,
    angle: 0,
    wingFrame: 0,
    wingTimer: 0,
    deathSpin: 0,
    deathSpinV: 0,
  };
}

export function makeInitialState(): GameState {
  return {
    phase: 'start',
    bird: makeBird(),
    coins: [],
    score: 0,
    missCount: 0,
    deathCount: 0,
    frameCount: 0,
    coinTimer: 0,
    highScore: parseInt(localStorage.getItem('kusoge_hi') || '0', 10),
    adTimer: 0,
    bgScroll: 0,
    groundScroll: 0,
    flashTimer: 0,
    sparkles: [],
  };
}
