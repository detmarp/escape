function _rect(ctx, color, rect) {
  ctx.fillStyle = color;
  ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
}

function _rand(n) {
  return Math.floor(Math.random() * n);
}

function _randf(a, b) {
  return a + Math.random() * (b - a);
}

export default class Missile {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  added() {
    this._node.ttl = 1.5;

  }

  init() {
  }

  work(dt, time) {
  }

  draw(ctx) {
    let a = this.from;
    let b = this.to;
    let t = this._node.t;
    let pos = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    let h = 1 - (((t - 0.5) * 2) ** 2);
    let x = 50;
    let shadow = [pos[0] + h * x, pos[1] + h * x];
    let rm = 8;

    let shadows = [
      '#333355ff',
      '#33335560',
      '#33335500',
    ];
    let rs = rm * (0.6 + 2.2 * h);
    let r0 = (1 - h) * 0.9 * rs;
    let g = ctx.createRadialGradient(...shadow, r0, ...shadow, rs);
    g.addColorStop(0.00, shadows[0]);
    g.addColorStop(0.46, shadows[1]);
    g.addColorStop(1.00, shadows[2]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(shadow[0], shadow[1], rs, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#f20';
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], rm, 0, 2 * Math.PI);
    ctx.fill();
  }
}