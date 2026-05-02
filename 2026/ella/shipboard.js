function _rnd(n) {
  return Math.floor(Math.random() * n);
}

export default class ShipBoard {
  constructor(game) {
    // .cells is [10][10]
    // a cell is
    // {
    //   position: [x, y],
    //   ship: Ship | null,
    //   shipIndex: number | null,
    //   adjacent: boolean,
    //   diagonal: boolean,
    //   shot: boolean,
    //   hit: boolean
    // }
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
    this.size = [10, 10];
    this.ships = [];
    this.shots = [];

    this.cells = Array(10).fill().map((_, y) => Array(10).fill().map((_, x) => ({ position: [x, y] })));
    this._update();
  }

  markShip(ship) {
  }

  markShot(position, hit) {
  }

  _update() {
    this.ships.forEach(ship => {
      ship.dx = ship.vertical ? 0 : 1;
      ship.dy = ship.vertical ? 1 : 0;
      ship.sank = false;
      ship.hitCount = 0;
      ship.cells = [];
    });

    // rebuild cells
    this.cells = Array(10).fill().map((_, y) => Array(10).fill().map((_, x) => ({ position: [x, y] })));

    this.shipCellCount = 0;
    for (let ship of this.ships) {
      this.shipCellCount += ship.size;
      for (let i = 0; i < ship.size; i++) {
        const x = ship.position[0] + ship.dx * i;
        const y = ship.position[1] + ship.dy * i;
        let cell = this.cells[y] && this.cells[y][x];
        if (cell) {
          cell.ship = ship;
          cell.shipIndex = i;
          ship.cells.push([x, y]);
        }
      }
    }

    for (let ship of this.ships) {
      for (let i = 0; i < ship.size; i++) {
        const adjacent = [ [-1, 0], [1, 0], [0, -1], [0, 1] ];
        for (let [dx, dy] of adjacent) {
          const x = ship.position[0] + ship.dx * i + dx;
          const y = ship.position[1] + ship.dy * i + dy;
          let cell = this.cells[y] && this.cells[y][x];
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
          const x = ship.position[0] + ship.dx * i + dx;
          const y = ship.position[1] + ship.dy * i + dy;
          let cell = this.cells[y] && this.cells[y][x];
          if (cell && !cell.ship && !this.game.rules.allowDiagonal) {
            cell.diagonal = true;
          }
        }
      }
    }

    this.hitCount = 0;
    for (let shot of this.shots) {
      const [x, y] = shot.position;
      let cell = this.cells[y] && this.cells[y][x];
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
      ship.hitCount = 0;
      for (let [x, y] of ship.cells) {
        let cell = this.cells[y] && this.cells[y][x];
        if (cell && cell.shot && cell.hit) {
          ship.hitCount++;
        }
      }
      ship.sunk = ship.hitCount === ship.size;
      if (ship.sunk) {
        this.sunkCount++;
      }
    }
  }

  _randomize() {
    this.ships = [];

    for (let item of this.game.fleet) {
      let vertical = _rnd(2) === 0;
      this.ships.push(
        {
          name: item.name,
          size: item.size,
          position: [_rnd(this.size[0]), _rnd(this.size[1])],
          vertical: vertical,
        }
      );
    }

    this.shots = [];
    for (let i = 0; i < 20; i++) {
      this.shots.push({
        position: [_rnd(this.size[0]), _rnd(this.size[1])],
        hit: _rnd(2) === 0,
      });
    }

    this.cursor = [_rnd(this.size[0]), _rnd(this.size[1])];

    this._update();
  }
}
