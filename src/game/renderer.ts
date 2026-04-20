import {
  GameState, GW, GH, GROUND_Y, CEILING_Y, BIRD_X, BIRD_W, BIRD_H,
  DEATHS_FOR_AD,
} from './gameState';

const P = 2;

function px(x: number) { return Math.round(x * P); }

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(px(x), px(y), px(w), px(h));
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const c = '#E8F4FF';
  const cb = '#C5DFF5';
  rect(ctx, x + 2, y + 4, 10, 4, c);
  rect(ctx, x, y + 6, 14, 4, c);
  rect(ctx, x + 4, y + 2, 6, 3, c);
  rect(ctx, x + 1, y + 8, 2, 2, cb);
  rect(ctx, x + 11, y + 8, 2, 2, cb);
}

function drawSky(ctx: CanvasRenderingContext2D, scroll: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, px(GROUND_Y));
  grad.addColorStop(0, '#1E90FF');
  grad.addColorStop(0.5, '#87CEEB');
  grad.addColorStop(1, '#B0E2FF');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, px(GW), px(GROUND_Y));

  const cloudPositions = [
    { x: 10, y: 22 }, { x: 60, y: 14 }, { x: 110, y: 26 }, { x: 155, y: 18 },
  ];
  for (const cp of cloudPositions) {
    const cx = ((cp.x - scroll * 0.3 + GW * 2) % (GW + 20)) - 10;
    drawCloud(ctx, cx, cp.y);
  }
}

function drawCeiling(ctx: CanvasRenderingContext2D, scroll: number) {
  rect(ctx, 0, 0, GW, CEILING_Y, '#5B3010');
  rect(ctx, 0, CEILING_Y - 3, GW, 3, '#8B5010');
  rect(ctx, 0, CEILING_Y - 4, GW, 1, '#C07830');
  // ceiling tiles
  ctx.fillStyle = '#6A3A14';
  for (let x = -(scroll % 14); x < GW; x += 14) {
    ctx.fillRect(px(x), px(2), px(8), px(4));
  }
}

function drawGround(ctx: CanvasRenderingContext2D, scroll: number) {
  rect(ctx, 0, GROUND_Y, GW, GH - GROUND_Y, '#DEC061');
  rect(ctx, 0, GROUND_Y, GW, 2, '#8B6914');
  rect(ctx, 0, GROUND_Y + 2, GW, 2, '#C9A84C');
  ctx.fillStyle = '#C9A030';
  for (let x = -scroll % 16; x < GW; x += 16) {
    ctx.fillRect(px(x), px(GROUND_Y + 5), px(6), px(2));
    ctx.fillRect(px(x + 8), px(GROUND_Y + 10), px(6), px(2));
  }
}

function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, size: number) {
  const f = Math.floor(frame) % 4;
  const widths = [size, Math.ceil(size * 0.6), 1, Math.ceil(size * 0.6)];
  const w = widths[f];
  const off = (size - w) / 2;

  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(px(x - size / 2 + off + 1), px(y + size / 2 + 1), px(w), px(size - 1));

  ctx.fillStyle = '#FFD700';
  ctx.fillRect(px(x - size / 2 + off), px(y - size / 2), px(w), px(size));
  ctx.fillStyle = '#FFEC6E';
  if (w > 2) ctx.fillRect(px(x - size / 2 + off), px(y - size / 2), px(2), px(Math.ceil(size * 0.5)));
  ctx.fillStyle = '#CC8800';
  if (w > 2) ctx.fillRect(px(x - size / 2 + off + w - 1), px(y - size / 2 + 1), px(1), px(size - 2));
}

function drawOdebu(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, angle: number) {
  ctx.save();
  const cx = px(x + BIRD_W / 2);
  const cy = px(y + BIRD_H / 2);
  ctx.translate(cx, cy);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.translate(-cx, -cy);

  const bx = px(x) - P;
  const by = px(y) - P * 2;
  const sc = P;

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(bx + sc, by + 14 * sc, 12 * sc, 2 * sc);

  // legs
  ctx.fillStyle = '#1A3A8A';
  if (frame === 0) {
    ctx.fillRect(bx + 4 * sc, by + 13 * sc, 2 * sc, 2 * sc);
    ctx.fillRect(bx + 7 * sc, by + 12 * sc, 2 * sc, 2 * sc);
  } else if (frame === 1) {
    ctx.fillRect(bx + 4 * sc, by + 12 * sc, 2 * sc, 2 * sc);
    ctx.fillRect(bx + 7 * sc, by + 13 * sc, 2 * sc, 2 * sc);
  } else {
    ctx.fillRect(bx + 3 * sc, by + 13 * sc, 2 * sc, 2 * sc);
    ctx.fillRect(bx + 8 * sc, by + 12 * sc, 2 * sc, 2 * sc);
  }
  ctx.fillStyle = '#111111';
  if (frame === 0) {
    ctx.fillRect(bx + 3 * sc, by + 14 * sc, 3 * sc, sc);
    ctx.fillRect(bx + 7 * sc, by + 13 * sc, 3 * sc, sc);
  } else if (frame === 1) {
    ctx.fillRect(bx + 3 * sc, by + 13 * sc, 3 * sc, sc);
    ctx.fillRect(bx + 7 * sc, by + 14 * sc, 3 * sc, sc);
  } else {
    ctx.fillRect(bx + 2 * sc, by + 14 * sc, 3 * sc, sc);
    ctx.fillRect(bx + 8 * sc, by + 13 * sc, 3 * sc, sc);
  }

  // body
  ctx.fillStyle = '#CC2200';
  ctx.fillRect(bx + sc, by + 6 * sc, 12 * sc, 7 * sc);
  ctx.fillRect(bx, by + 7 * sc, 14 * sc, 5 * sc);
  ctx.fillRect(bx + 2 * sc, by + 5 * sc, 10 * sc, sc);
  ctx.fillRect(bx + 2 * sc, by + 12 * sc, 10 * sc, sc);
  ctx.fillStyle = '#FF3311';
  ctx.fillRect(bx + 2 * sc, by + 6 * sc, 10 * sc, 6 * sc);
  ctx.fillRect(bx + sc, by + 7 * sc, 12 * sc, 4 * sc);
  ctx.fillStyle = '#FF6655';
  ctx.fillRect(bx + 3 * sc, by + 7 * sc, 2 * sc, 3 * sc);
  ctx.fillStyle = '#BB1100';
  ctx.fillRect(bx + 6 * sc, by + 10 * sc, 2 * sc, sc);
  ctx.fillStyle = '#1A3A8A';
  ctx.fillRect(bx + sc, by + 11 * sc, 12 * sc, 2 * sc);
  ctx.fillRect(bx + 2 * sc, by + 12 * sc, 10 * sc, sc);

  // arms
  ctx.fillStyle = '#FF3311';
  if (frame === 0) {
    ctx.fillRect(bx - sc, by + 5 * sc, 3 * sc, 2 * sc);
    ctx.fillRect(bx - 2 * sc, by + 3 * sc, 3 * sc, 3 * sc);
    ctx.fillRect(bx + 12 * sc, by + 5 * sc, 3 * sc, 2 * sc);
    ctx.fillRect(bx + 13 * sc, by + 3 * sc, 3 * sc, 3 * sc);
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(bx - 2 * sc, by + 2 * sc, 2 * sc, 2 * sc);
    ctx.fillRect(bx + 14 * sc, by + 2 * sc, 2 * sc, 2 * sc);
  } else if (frame === 1) {
    ctx.fillRect(bx - sc, by + 7 * sc, 3 * sc, 2 * sc);
    ctx.fillRect(bx + 12 * sc, by + 7 * sc, 3 * sc, 2 * sc);
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(bx - 2 * sc, by + 7 * sc, 2 * sc, 2 * sc);
    ctx.fillRect(bx + 14 * sc, by + 7 * sc, 2 * sc, 2 * sc);
  } else {
    ctx.fillRect(bx - sc, by + 9 * sc, 3 * sc, 2 * sc);
    ctx.fillRect(bx - sc, by + 10 * sc, 2 * sc, 2 * sc);
    ctx.fillRect(bx + 12 * sc, by + 9 * sc, 3 * sc, 2 * sc);
    ctx.fillRect(bx + 12 * sc, by + 10 * sc, 2 * sc, 2 * sc);
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(bx - sc, by + 11 * sc, 2 * sc, 2 * sc);
    ctx.fillRect(bx + 13 * sc, by + 11 * sc, 2 * sc, 2 * sc);
  }

  // head
  ctx.fillStyle = '#CC8855';
  ctx.fillRect(bx + 2 * sc, by, 10 * sc, 7 * sc);
  ctx.fillRect(bx + sc, by + sc, 12 * sc, 5 * sc);
  ctx.fillRect(bx + 3 * sc, by - sc, 8 * sc, sc);
  ctx.fillStyle = '#FFCC99';
  ctx.fillRect(bx + 3 * sc, by, 8 * sc, 6 * sc);
  ctx.fillRect(bx + 2 * sc, by + sc, 10 * sc, 4 * sc);
  ctx.fillStyle = '#FFE0BB';
  ctx.fillRect(bx + 4 * sc, by + sc, 2 * sc, 2 * sc);
  ctx.fillStyle = '#FF9999';
  ctx.fillRect(bx + 2 * sc, by + 3 * sc, 2 * sc, sc);
  ctx.fillRect(bx + 10 * sc, by + 3 * sc, 2 * sc, sc);
  ctx.fillStyle = '#000000';
  ctx.fillRect(bx + 5 * sc, by + 2 * sc, 2 * sc, 2 * sc);
  ctx.fillRect(bx + 8 * sc, by + 2 * sc, 2 * sc, 2 * sc);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(bx + 5 * sc, by + 2 * sc, sc, sc);
  ctx.fillRect(bx + 8 * sc, by + 2 * sc, sc, sc);
  ctx.fillStyle = '#884400';
  ctx.fillRect(bx + 4 * sc, by + sc, 3 * sc, sc);
  ctx.fillRect(bx + 8 * sc, by + sc, 3 * sc, sc);
  ctx.fillStyle = '#882200';
  ctx.fillRect(bx + 6 * sc, by + 4 * sc, 3 * sc, 2 * sc);
  ctx.fillStyle = '#CC4422';
  ctx.fillRect(bx + 6 * sc, by + 5 * sc, 3 * sc, sc);
  ctx.fillStyle = '#331100';
  ctx.fillRect(bx + 4 * sc, by - sc, 3 * sc, sc);
  ctx.fillRect(bx + 8 * sc, by - sc, 2 * sc, sc);

  if (frame === 2 || angle > 20) {
    ctx.fillStyle = '#88CCFF';
    ctx.fillRect(bx + 13 * sc, by + sc, sc, 2 * sc);
    ctx.fillRect(bx + 12 * sc, by + 2 * sc, sc, sc);
  }

  ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  rect(ctx, x + 1, y, 2, 1, color);
  rect(ctx, x + 5, y, 2, 1, color);
  rect(ctx, x, y + 1, 3, 2, color);
  rect(ctx, x + 4, y + 1, 3, 2, color);
  rect(ctx, x + 1, y + 3, 6, 1, color);
  rect(ctx, x + 2, y + 4, 4, 1, color);
  rect(ctx, x + 3, y + 5, 2, 1, color);
}

function drawSkull(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const c = '#CCCCCC';
  rect(ctx, x - 3, y - 3, 6, 5, c);
  rect(ctx, x - 2, y - 4, 4, 1, c);
  rect(ctx, x - 2, y + 2, 4, 2, c);
  rect(ctx, x - 1, y + 1, 2, 1, '#333');
  rect(ctx, x - 2, y - 1, 2, 2, '#333');
  rect(ctx, x, y - 1, 2, 2, '#333');
}

const PIXEL_FONT: Record<string, number[][]> = {
  '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2': [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
  '3': [[1,1,1],[0,0,1],[0,1,1],[0,0,1],[1,1,1]],
  '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
  '5': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  '6': [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
  '7': [[1,1,1],[0,0,1],[0,1,0],[0,1,0],[0,1,0]],
  '8': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
  '9': [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
  'A': [[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'B': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,1,0]],
  'C': [[1,1,1],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
  'D': [[1,1,0],[1,0,1],[1,0,1],[1,0,1],[1,1,0]],
  'E': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],
  'F': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
  'G': [[1,1,1],[1,0,0],[1,0,1],[1,0,1],[1,1,1]],
  'H': [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'I': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  'K': [[1,0,1],[1,1,0],[1,0,0],[1,1,0],[1,0,1]],
  'L': [[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
  'M': [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
  'N': [[1,0,1],[1,1,1],[1,1,1],[1,0,1],[1,0,1]],
  'O': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  'P': [[1,1,1],[1,0,1],[1,1,1],[1,0,0],[1,0,0]],
  'Q': [[0,1,0],[1,0,1],[1,0,1],[1,1,0],[0,1,1]],
  'R': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
  'S': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  'T': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
  'U': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  'V': [[1,0,1],[1,0,1],[1,0,1],[0,1,0],[0,1,0]],
  'W': [[1,0,1],[1,0,1],[1,1,1],[1,1,1],[1,0,1]],
  'X': [[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
  'Y': [[1,0,1],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
  'Z': [[1,1,1],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
  ' ': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
  '!': [[0,1,0],[0,1,0],[0,1,0],[0,0,0],[0,1,0]],
  '/': [[0,0,1],[0,1,0],[0,1,0],[1,0,0],[1,0,0]],
  ':': [[0,0,0],[0,1,0],[0,0,0],[0,1,0],[0,0,0]],
  'x': [[0,0,0],[1,0,1],[0,1,0],[1,0,1],[0,0,0]],
};

function drawPixelText(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  text: string,
  color: string,
  shadow: string,
  scale: number = 2,
) {
  const s = scale;
  for (let ci = 0; ci < text.length; ci++) {
    const ch = text[ci].toUpperCase();
    const bitmap = PIXEL_FONT[ch] || PIXEL_FONT[' '];
    for (let row = 0; row < bitmap.length; row++) {
      for (let col = 0; col < bitmap[row].length; col++) {
        if (bitmap[row][col]) {
          const px_ = Math.round((x + ci * 4 + col) * s * P / P);
          const py_ = Math.round((y + row) * s * P / P);
          const ps = s;
          ctx.fillStyle = shadow;
          ctx.fillRect(px_ + ps, py_ + ps, ps, ps);
          ctx.fillStyle = color;
          ctx.fillRect(px_, py_, ps, ps);
        }
      }
    }
  }
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  const { score, missCount, deathCount } = state;

  // score
  drawPixelText(ctx, GW / 2 - String(score).length * 4, 15, String(score), '#FFD700', '#000000', 3);

  // miss hearts (top-left)
  for (let i = 0; i < 3; i++) {
    drawHeart(ctx, 4 + i * 11, 15, i >= missCount ? '#FF4444' : '#333333');
  }

  // death counter (top-right)
  drawPixelText(ctx, GW - 22, 15, `x${deathCount}`, deathCount >= DEATHS_FOR_AD - 1 ? '#FF4444' : '#CCCCCC', '#000000', 2);
  drawSkull(ctx, GW - 7, 18);

  // flash miss warning
  if (state.flashTimer > 0 && state.missCount > 0) {
    const alpha = state.flashTimer / 10;
    ctx.fillStyle = `rgba(255,0,0,${alpha * 0.3})`;
    ctx.fillRect(0, 0, px(GW), px(GH));
    const msg = `MISS! ${state.missCount}/3`;
    drawPixelText(ctx, GW / 2 - msg.length * 3, GH / 2 - 15, msg, '#FF4444', '#000000', 3);
  }
}

export function render(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.imageSmoothingEnabled = false;

  drawSky(ctx, state.bgScroll);
  drawCeiling(ctx, state.groundScroll);
  drawGround(ctx, state.groundScroll);

  // sparkles
  for (const s of state.sparkles) {
    ctx.fillStyle = s.color;
    ctx.fillRect(px(s.x), px(s.y), P, P);
  }

  // coins (uncollected)
  for (const coin of state.coins) {
    if (!coin.collected) {
      // warning indicator if coin is very high or low
      if (coin.x < GW && coin.x > 0 && (coin.y < CEILING_Y + 30 || coin.y > GROUND_Y - 30)) {
        ctx.fillStyle = `rgba(255,80,0,${0.5 + Math.sin(Date.now() / 150) * 0.3})`;
        const warnX = Math.min(GW - 4, Math.max(2, coin.x));
        ctx.fillRect(px(warnX - 2), px(coin.y - 2), px(4), px(4));
      }
      drawCoin(ctx, coin.x, coin.y, coin.frame, coin.size);
    }
  }

  // missed coin X marks
  for (const coin of state.coins) {
    if (coin.missed && coin.x > 0) {
      rect(ctx, coin.x - 3, coin.y - 3, 2, 2, '#FF3333');
      rect(ctx, coin.x + 1, coin.y - 3, 2, 2, '#FF3333');
      rect(ctx, coin.x - 1, coin.y - 1, 2, 2, '#FF3333');
      rect(ctx, coin.x - 3, coin.y + 1, 2, 2, '#FF3333');
      rect(ctx, coin.x + 1, coin.y + 1, 2, 2, '#FF3333');
    }
  }

  // character
  const bird = state.bird;
  const angle = state.phase === 'dead' ? bird.deathSpin : bird.angle;
  drawOdebu(ctx, BIRD_X, bird.y, bird.wingFrame, angle);

  // HUD (above ceiling line)
  if (state.phase === 'playing' || state.phase === 'dead') {
    drawHUD(ctx, state);
  }

  // START screen
  if (state.phase === 'start') {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, px(CEILING_Y), px(GW), px(GH - CEILING_Y));

    drawPixelText(ctx, GW / 2 - 27, GH / 2 - 46, 'KUSOGE', '#FFD700', '#000000', 4);
    drawPixelText(ctx, GW / 2 - 20, GH / 2 - 28, 'BIRD', '#FF6600', '#000000', 4);

    const bounce = Math.sin(Date.now() / 300) * 3;
    drawOdebu(ctx, GW / 2 - 6, GH / 2 - 72 + bounce, 1, 0);

    drawPixelText(ctx, GW / 2 - 30, GH / 2 - 4, 'TAP TO START', '#FFFFFF', '#000000', 2);
    const hi = `BEST: ${state.highScore}`;
    drawPixelText(ctx, GW / 2 - hi.length * 4, GH / 2 + 10, hi, '#FFD700', '#333333', 2);
    drawPixelText(ctx, GW / 2 - 42, GH / 2 + 24, 'MISS 3 COINS = DIE', '#FF8888', '#000000', 2);
    drawPixelText(ctx, GW / 2 - 38, GH / 2 + 34, 'HIT WALLS = DIE', '#FF8888', '#000000', 2);
  }

  // DEAD screen
  if (state.phase === 'dead') {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, px(GH / 2 - 32), px(GW), px(44));
    drawPixelText(ctx, GW / 2 - 20, GH / 2 - 26, 'DEAD!', '#FF4444', '#000000', 4);
    const sc = `SCORE: ${state.score}`;
    drawPixelText(ctx, GW / 2 - sc.length * 4, GH / 2 + 2, sc, '#FFD700', '#333333', 2);

    if (state.deathCount >= DEATHS_FOR_AD - 1) {
      drawPixelText(ctx, GW / 2 - 40, GH / 2 + 14, 'ADS COMING SOON!', '#FF3300', '#000000', 2);
    }
  }
}
