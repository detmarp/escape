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
        this._cursor(ctx);
      }
      if (this.board.cursorLines) {
        this._cursorLines(ctx);
      }
      if (this.board.lock) {
        this._lock(ctx);
      }
    }
  }

  _cursor(ctx) {
    let pos = _toPosition(this.board.cursor);
    let size = 14;
    let color = '#00ff00';
    let thickness = 3;
    let length = 8;

    // Top-left L
    _rect(ctx, color, [pos[0] - size, pos[1] - size, length, thickness]);
    _rect(ctx, color, [pos[0] - size, pos[1] - size, thickness, length]);

    // Top-right L
    _rect(ctx, color, [pos[0] + size - length, pos[1] - size, length, thickness]);
    _rect(ctx, color, [pos[0] + size - thickness, pos[1] - size, thickness, length]);

    // Bottom-left L
    _rect(ctx, color, [pos[0] - size, pos[1] + size - thickness, length, thickness]);
    _rect(ctx, color, [pos[0] - size, pos[1] + size - length, thickness, length]);

    // Bottom-right L
    _rect(ctx, color, [pos[0] + size - length, pos[1] + size - thickness, length, thickness]);
    _rect(ctx, color, [pos[0] + size - thickness, pos[1] + size - length, thickness, length]);
  }

  _cursorLines(ctx) {
    let pos = this.board.cursorLines;
    let color = '#00ff00';
    let thickness = 1;
    let start = -40;
    let length = 320;
    _rect(ctx, color, [
      start,
      pos[1] - thickness / 2,
      length,
      thickness
    ]);
    _rect(ctx, color, [
      pos[0] - thickness / 2,
      start,
      thickness,
      length
    ]);

  }


  _lock(ctx) {
    let pos = _toPosition(this.board.lock);
    let size = 12;
    let color = '#ffff00';

    // 2 Hz duty cycle: 0.5 second period, 60% on (0.3s on, 0.2s off)
    let cycleTime = (this._node.age || 0) % 0.5;
    let isOn = cycleTime < 0.3;
    let thickness = isOn ? 3 : 1;

    _rect(ctx, color, [pos[0] - size, pos[1] - thickness / 2, size * 2, thickness]);
    _rect(ctx, color, [pos[0] - thickness / 2, pos[1] - size, thickness, size * 2]);
  }

}