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
  constructor(board, shipIndex, params = {}) {
    this.board = board;
    this.shipIndex = shipIndex;
    this.params = params;
  }

  added() {
  }

  init() {
  }

  work(dt, time) {
  }

  draw(ctx) {
    if (!this.board || this.shipIndex == null) return;
    const ship = this.board.data.ships[this.shipIndex];
    const extra = this.board.extra && this.board.extra.shipExtra[this.shipIndex];
    if (!ship) return;
    // If hidden, only draw if sunk
    if (this.params && this.params.hidden && !(extra && extra.sunk)) return;

    // Convert 1D offset to 2D start position
    const w = 10;
    let startX = ship.offset % w;
    let startY = Math.floor(ship.offset / w);
    let endX = startX + (ship.vertical ? 0 : ship.size - 1);
    let endY = startY + (ship.vertical ? ship.size - 1 : 0);

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

    ctx.strokeStyle = extra && extra.sunk ? '#f00' : '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      tl[0], tl[1],
      br[0] - tl[0],
      br[1] - tl[1]
    );
  }
}