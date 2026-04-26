function _dot(ctx, color, position) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(position[0], position[1], 2, 0, 2 * Math.PI);
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

export default class Temp {
  constructor(ship) {
    this.ship = ship;
  }

  added() {
  }

  init() {
  }

  work(dt, time) {
  }

  draw(ctx) {
    if (this.ship) {
      let start = this.ship.position.slice();
      let end = start.slice();
      end[this.ship.vertical ? 1 : 0] += this.ship.size - 1;

      let r = 0.45
      let tl = _toPosition([start[0] - r, start[1] - r]);
      let br = _toPosition([end[0] + r, end[1] + r]);

      // Fill with medium blue first
      ctx.fillStyle = '#48fb';
      ctx.fillRect(
        tl[0], tl[1],
        br[0] - tl[0],
        br[1] - tl[1]
      );

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        tl[0], tl[1],
        br[0] - tl[0],
        br[1] - tl[1]
      );
    }
  }
}