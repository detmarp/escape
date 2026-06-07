function _dot(ctx, color, x, y) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
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

function _toPosition(x, y) {
  return [x * 24 + 12, y * 24 + 12];
}

export default class Surface {
  constructor(board) {
    this.board = board;
    this.shots = [];
    //this.debug = true;
  }

  added() {
  }

  init() {
  }

  work(dt, time) {
  }

  draw(ctx) {
    for (let cell of this.board.extra.cells) {
      if (cell.shot) {
        let hit = cell.hit;
        let color = hit ? 'red' : 'white';
        let x = cell.x;
        let y = cell.y;
        let pos = _toPosition(x, y);
        _dot(ctx, color, pos[0], pos[1]);
      }
    }

    if (this.debug) {
      this._debugDrawNeighbors(ctx);
    }
  }

  _debugDrawNeighbors(ctx) {
    if (!this.board || !this.board.extra) {
      return;
    }
    for (let cell of this.board.extra.cells) {
      let pos = _toPosition(cell.x, cell.y);
      let r = 10
      if (cell.adjacent) {
        ctx.strokeStyle = '#ff8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pos[0] - r, pos[1]);
        ctx.lineTo(pos[0] + r, pos[1]);
        ctx.moveTo(pos[0], pos[1] - r);
        ctx.lineTo(pos[0], pos[1] + r);
        ctx.stroke();
      }
      if (cell.diagonal) {
        ctx.strokeStyle = '#fc8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pos[0] - r, pos[1] - r);
        ctx.lineTo(pos[0] + r, pos[1] + r);
        ctx.moveTo(pos[0] - r, pos[1] + r);
        ctx.lineTo(pos[0] + r, pos[1] - r);
        ctx.stroke();
      }
    }
  }

  addShot(shot) {
    // Accepts a struct with {position, hit, offset}
    this.shots.push(shot);
  }
}