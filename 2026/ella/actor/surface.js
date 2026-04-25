function _dot(ctx, color, position) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(position[0], position[1], 4, 0, 2 * Math.PI);
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

function _toPosition(cell) {
  return [cell[0] * 24 + 12, cell[1] * 24 + 12];
}

export default class Surface {
  constructor() {
    this.shots = [];
  }

  added() {
  }

  init() {
  }

  work(dt, time) {
  }

  draw(ctx) {
    for (let s of this.shots) {
      let p = _toPosition(s.position);
      p[0] += _randf(-2, 2);
      p[1] += _randf(-2, 2);
      let color = s.hit ? 'red' : 'white';
      _dot(ctx, color, p);
    }
  }

  addShot(shot) {
    this.shots.push(shot);
  }
}