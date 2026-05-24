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

export default class OneBoat {
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
      // Convert 1D offset to 2D start position
      const w = 10;
      let startX = this.ship.offset % w;
      let startY = Math.floor(this.ship.offset / w);
      let endX = startX + (this.ship.vertical ? 0 : this.ship.size - 1);
      let endY = startY + (this.ship.vertical ? this.ship.size - 1 : 0);

      let r = 0.45;
      let tl = _toPosition([startX - r, startY - r]);
      let br = _toPosition([endX + r, endY + r]);

      // Fill with medium blue first
      ctx.fillStyle = '#48fb';
      ctx.fillRect(
        tl[0], tl[1],
        br[0] - tl[0],
        br[1] - tl[1]
      );

      ctx.strokeStyle = this.ship.sunk ? '#f00' : '#000';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        tl[0], tl[1],
        br[0] - tl[0],
        br[1] - tl[1]
      );
    }
  }
}