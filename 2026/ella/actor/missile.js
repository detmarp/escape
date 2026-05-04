function _dot(ctx, color, position) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(position[0], position[1], 12, 0, 2 * Math.PI);
  ctx.fill();
}

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
  constructor(xxx, from, to) {
    this.game = xxx;
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
    _dot(ctx, '#0008', shadow);
    _dot(ctx, '#f04', pos);
  }
}