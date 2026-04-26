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

export default class Air {
  constructor(board) {
    this.board = board;
  }

  added() {
  }

  init() {
  }

  work(dt, time) {
  }

  draw(ctx) {
    if (this.board) {
      if (this.board.cursor) {
        _dot(ctx, 'red', _toPosition(this.board.cursor));
      }
    }
  }

  _cursor() {
  }
}