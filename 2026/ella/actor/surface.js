function _dot(ctx, color, position) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(position[0], position[1], 6, 0, 2 * Math.PI);
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
  constructor(board) {
    this.board = board;
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
      //p[0] += _randf(-2, 2);
      //p[1] += _randf(-2, 2);
      let color = s.hit ? 'red' : 'white';
      _dot(ctx, color, p);
    }

    if (this.board && false) {
      this._debugDrawNeighbors(ctx);
    }
  }

  _debugDrawNeighbors(ctx) {
    for (let row of this.board.cells) {
      for (let cell of row) {
        let pos = _toPosition(cell.position);
        let r = 10
        if (cell.adjacent) {
          ctx.strokeStyle = '#f00';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pos[0] - r, pos[1]);
          ctx.lineTo(pos[0] + r, pos[1]);
          ctx.moveTo(pos[0], pos[1] - r);
          ctx.lineTo(pos[0], pos[1] + r);
          ctx.stroke();
        }
        if (cell.diagonal) {
          ctx.strokeStyle = '#f00';
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
  }

  addShot(shot) {
    this.shots.push(shot);
  }
}