function _rnd(n) {
  return Math.floor(Math.random() * n);
}

export default class ShipBoard {
  constructor(game) {
    // this.data is the minimal, serializable source of truth
    // this.extra is derived from .data and more convenient
    // ships[] has {
    //   name: string,
    //   size: number,
    //   position: [x, y],
    //   vertical: boolean,
    //   cells: [x, y][],
    //   hitCount: number,
    //   sunk: boolean
    // }
    // shots[] has {position:[x,y], hit: boolean}
    this.game = game;
    this.data = {
      size: [10, 10],
      ships: [],
      shots: [],
      gameOver: false,
    };
    this.rebuildExtra();
    this.size = [10, 10];
    this.ships = [];
    this.shots = [];

    const [w, h] = this.size;
    this.OLD_cells = Array(w * h).fill().map((_, i) => {
      const x = i % w;
      const y = Math.floor(i / w);
      return { position: [x, y] };
    });
    this._update();
  }

  rebuildExtra() {
    const { size, ships, shots } = this.data;
    let shipExtra = [];
    const [w, h] = size;
    const cells = Array(w * h).fill().map((_, i) => ({
      index: i,
      x: i % w,
      y: Math.floor(i / w),
      shipExtra: null,
      shipIndex: null,
      shipOffset: null,
      adjacent: false,
      diagonal: false,
      shot: false,
      hit: false,
    }));

    // Place ships on cells using .offset and .vertical
    ships.forEach((ship, i) => {
      let s = {
        ...ship,
        hits: 0,
      };
      const [dx, dy] = ship.vertical ? [0, 1] : [1, 0];
      for (let j = 0; j < ship.size; j++) {
        const x0 = ship.offset % w;
        const y0 = Math.floor(ship.offset / w);
        const x = x0 + dx * j;
        const y = y0 + dy * j;
        const idx = y * w + x;
        if (cells[idx]) {
          cells[idx].shipExtra = s;
          cells[idx].shipIndex = i;
          cells[idx].shipOffset = j;
        }
      }
      shipExtra.push(s);
    });

    // Mark shots, hits, misses
    const hits = [];
    const misses = [];
    for (let offset of shots) {
      const x = offset % w;
      const y = Math.floor(offset / w);
      const idx = y * w + x;
      if (cells[idx]) {
        cells[idx].shot = true;
        let hit = cells[idx].shipExtra != null;
        cells[idx].hit = hit;
        if (hit) {
          hits.push([x, y]);
        } else {
          misses.push([x, y]);
        }
      }
    }

    this.extra = {
      cells,
      hits,
      misses,
      shipExtra,
    };

    this._setNeighbors();
  }

  _setNeighbors() {
    // Set the .extra.cells flags for ship cell neighbors
    const { cells } = this.extra;
    const { size, ships } = this.data;
    const [w, h] = size;
    // Clear all flags first
    for (const cell of cells) {
      cell.adjacent = false;
      cell.diagonal = false;
    }

    // Mark adjacent and diagonal neighbors for each ship
    for (const ship of ships) {
      // Only use offset and size, do not use vertical
      for (let i = 0; i < ship.size; i++) {
        const idx = ship.offset + i;
        const x = idx % w;
        const y = Math.floor(idx / w);
        if (!this.game?.rules?.allowAdjacent) {
          // Adjacent (orthogonal)
          const adjacent = [ [-1, 0], [1, 0], [0, -1], [0, 1] ];
          for (const [ax, ay] of adjacent) {
            const nx = x + ax;
            const ny = y + ay;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nidx = ny * w + nx;
              const ncell = cells[nidx];
              if (ncell && ncell.shipExtra == null && !this.game?.rules?.allowAdjacent) {
                ncell.adjacent = true;
              }
            }
          }
        }
        if (!this.game?.rules?.allowDiagonal) {
          // Diagonal
          const diagonal = [ [-1, -1], [1, -1], [-1, 1], [1, 1] ];
          for (const [dx2, dy2] of diagonal) {
            const nx = x + dx2;
            const ny = y + dy2;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nidx = ny * w + nx;
              const ncell = cells[nidx];
              if (ncell && ncell.shipExtra == null && !this.game?.rules?.allowDiagonal) {
                ncell.diagonal = true;
              }
            }
          }
        }
      }
    }
  }

  hudOff() {
    this.cursor = null;
    this.ready = false;
    this.lock = null;
  }

  cell(x, y) {
    if (x < 0 || x >= this.size[0]) {
      return null;
    }
    return this.OLD_cells[y * this.size[0] + x];
  }

  _update() {
    this.ships.forEach(ship => {
      ship.OLD_dx = ship.vertical ? 0 : 1;
      ship.OLD_dy = ship.vertical ? 1 : 0;
      ship.sunk = false;
      ship.OLD_hitCount = 0;
      ship.OLD_cells = [];
    });

    // rebuild cells
    const [w, h] = this.size;
    this.OLD_cells = Array(w * h).fill().map((_, i) => {
      const x = i % w;
      const y = Math.floor(i / w);
      return { position: [x, y] };
    });

    this.shipCellCount = 0;
    for (let ship of this.ships) {
      this.shipCellCount += ship.size;
      for (let i = 0; i < ship.size; i++) {
        const x = ship.position[0] + ship.OLD_dx * i;
        const y = ship.position[1] + ship.OLD_dy * i;
        let cell = this.cell(x, y);
        if (cell) {
          cell.ship = ship;
          cell.shipIndex = i;
          ship.OLD_cells.push([x, y]);
        }
      }
    }

    for (let ship of this.ships) {
      for (let i = 0; i < ship.size; i++) {
        const adjacent = [ [-1, 0], [1, 0], [0, -1], [0, 1] ];
        for (let [dx, dy] of adjacent) {
          const x = ship.position[0] + ship.OLD_dx * i + dx;
          const y = ship.position[1] + ship.OLD_dy * i + dy;
          let cell = this.cell(x, y);
          if (cell && !cell.ship && !this.game.rules.allowAdjacent) {
            cell.adjacent = true;
          }
        }
      }
    }
    for (let ship of this.ships) {
      for (let i = 0; i < ship.size; i++) {
        const diagonal = [ [-1, -1], [1, -1], [-1, 1], [1, 1] ];
        for (let [dx, dy] of diagonal) {
          const x = ship.position[0] + ship.OLD_dx * i + dx;
          const y = ship.position[1] + ship.OLD_dy * i + dy;
          let cell = this.cell(x, y);
          if (cell && !cell.ship && !this.game.rules.allowDiagonal) {
            cell.diagonal = true;
          }
        }
      }
    }

    this.hitCount = 0;
    for (let shot of this.shots) {
      const [x, y] = shot.position;
      let cell = this.cell(x, y);
      if (cell) {
        cell.shot = true;
        cell.hit = shot.hit;
        if (shot.hit) {
          this.hitCount++;
        }
      }
    }

    // Check for sunk ships
    this.sunkCount = 0;
    for (let ship of this.ships) {
      ship.OLD_hitCount = 0;
      for (let [x, y] of ship.OLD_cells) {
        let cell = this.cell(x, y);
        if (cell && cell.shot && cell.hit) {
          ship.OLD_hitCount++;
        }
      }
      ship.sunk = ship.OLD_hitCount === ship.size;
      if (ship.sunk) {
        this.sunkCount++;
      }
    }
  }

  static fromObject(obj) {
    let board = new ShipBoard();
    // fill in ships, copying only the necessary properties
    // also shots, and game over
    let ships = obj.ships || [];
    board.data = {
      size: obj.size || [10, 10],
      ships: ships.map(ship => ({
        size: ship.size,
        offset: ship.offset,
        vertical: ship.vertical,
      })),
      shots: obj.shots || [],
      gameOver: obj.gameOver || false,
    };
    return board;
  }

  toObject() {
    return {
      ships: this.ships,
      shots: this.shots,
      code: this._boardCode(),
    };
  }

  _rebuild() {
    // rebuild the board and ship objects from mimimal data
    this._update();
  }

  _strip() {
    // remove all non essential data from board and ships
  }

  _boardCode() {
    this.rebuildExtra();
    let code = '';
    const { cells } = this.extra;
    const [w, h] = this.data.size;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const cell = cells[idx];
        if (!cell) {
          code += '?';
          continue;
        }
        if (cell.shipExtra) {
          const shipIndex = cell.shipIndex ?? 0;
          const c = String.fromCharCode(97 + Math.max(0, Math.min(25, shipIndex)));
          const c2 = cell.hit ? c.toUpperCase() : c;
          code += c2;
          continue;
        }
        if (cell.shot && !cell.hit) {
          code += '*';
          continue;
        }
        code += '.';
      }
    }
    return code;
  }

}
