export default class DrawShip {
  constructor(board) {
    this.board = board;
    this.position = [0, 0];
    this.cellSize = 22;
    this.size = [this.cellSize * 10, this.cellSize * 10];
  }

  work(dt, time, frame) {
  }

  draw(ctx, ooscale = 1) {
    this._grid(ctx);


    // Draw random markers
    for (let i = 0; i < this.board.shots.length; i++) {
      const shot = this.board.shots[i];
      const gridX = shot.position[0];
      const gridY = shot.position[1];
      const type = shot.hit ? 'hit' : 'miss';
      this._marker(ctx, gridX, gridY, type, ooscale);
    }

    for (let ship of this.board.ships) {
      for (let cell of ship.cells) {
        this._shipCell(ctx, cell[0], cell[1]);
      }
    }

    for (let row of this.board.cells) {
      for (let cell of row) {
        if (cell.adjacent) {
          this._drawX(ctx, cell.x, cell.y, false);
        }
        if (cell.diagonal) {
          this._drawX(ctx, cell.x, cell.y, true);
        }
      }
    }

    if (this.board.cursor) {
      const [gridX, gridY] = this.board.cursor;
      this._crosshairs(ctx, gridX, gridY);
    }
  }

  _grid(ctx) {
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(0, 0, this.size[0], this.size[1]);

    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 10; i++) {
      const lineX = i * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX, this.size[1]);
      ctx.stroke();
    }

    for (let i = 0; i <= 10; i++) {
      const lineY = i * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(this.size[0], lineY);
      ctx.stroke();
    }
  }

  _crosshairs(ctx, gridX, gridY) {
    ctx.strokeStyle = '#df0';
    ctx.lineWidth = 4;

    const x = gridX * this.cellSize;
    const y = gridY * this.cellSize;
    const cornerSize = 6;
    const offset = 2;

    const corners = [
      [x - offset, y - offset],
      [x + this.cellSize + offset, y - offset],
      [x - offset, y + this.cellSize + offset],
      [x + this.cellSize + offset, y + this.cellSize + offset],
    ];

    const directions = [
      [[0, cornerSize], [cornerSize, 0]],
      [[0, cornerSize], [-cornerSize, 0]],
      [[0, -cornerSize], [cornerSize, 0]],
      [[0, -cornerSize], [-cornerSize, 0]],
    ];

    ctx.beginPath();
    corners.forEach(([cx, cy], i) => {
      directions[i].forEach(([dx, dy]) => {
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + dx, cy + dy);
      });
    });
    ctx.stroke();
  }

  _marker(ctx, gridX, gridY, type, ooscale = 1) {
    const x = (gridX + 0.5) * this.cellSize;
    const y = (gridY + 0.5) * this.cellSize;
    const radius = 6;

    ctx.fillStyle = type === 'hit' ? '#FF0000' : '#000000';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  _drawX(ctx, gridX, gridY, x) {
    ctx.strokeStyle = '#F00';
    ctx.lineWidth = 1;
    const center = [(gridX + 0.5) * this.cellSize, (gridY + 0.5) * this.cellSize];
    const size = 8;

    ctx.beginPath();
    if (x) {
      ctx.moveTo(center[0] - size, center[1] - size);
      ctx.lineTo(center[0] + size, center[1] + size);
      ctx.moveTo(center[0] + size, center[1] - size);
      ctx.lineTo(center[0] - size, center[1] + size);
    } else {
      ctx.moveTo(center[0] - size, center[1]);
      ctx.lineTo(center[0] + size, center[1]);
      ctx.moveTo(center[0], center[1] - size);
      ctx.lineTo(center[0], center[1] + size);
    }
    ctx.stroke();
  }

  _shipCell(ctx, gridX, gridY) {
    const margin = 3;
    const x = gridX * this.cellSize + margin;
    const y = gridY * this.cellSize + margin;
    const size = this.cellSize - margin * 2;

    ctx.fillStyle = '#003366';
    ctx.fillRect(x, y, size, size);
  }
}