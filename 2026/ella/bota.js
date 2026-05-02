import ShipBoard from "./shipboard.js";

function _rnd(n) {
  return Math.floor(Math.random() * n);
}

function _shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = _rnd(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export default class BotA {
  constructor(game, id) {
    this.game = game;
    this.id = id;
    this.other = 1 - id;
  }

  placeShips() {
    let ships = this._chooseShips();
    for (let ship of ships) {
      this.game.boards[this.id].ships.push(ship);
    }
    this.game.boards[this.id]._update();
  }

  startTurn() {
    this.game.boards[this.other].cursor = null;
  }

  setTarget() {
    let target = null;
    if (this.id == this.game.turn) {
       target = this._chooseTarget();
    }
    this.game.boards[this.other].cursor = target;
    return target;
  }

  _chooseTarget() {
    this._getTargetStatus();
    console.log(`bbb ${JSON.stringify(this.targetStatus)}`);

    let empty = [];
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        let cell = this.game.boards[this.other].cells[y][x];
        if (!cell.shot) empty.push([x, y]);
      }
    }
    return empty.length ? empty[_rnd(empty.length)] : null;
  }

  _getTargetStatus() {
    this.targetStatus = {};
    let board = this.game.boards[this.other];

    let missCount = 0;
    let hitCount = 0;
    let empty = [];
    let damage = [];

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        let cell = board.cells[y][x];
        if (!cell.shot) {
          empty.push([x, y]);
        } else {
          if (cell.hit) {
            hitCount++;
            if (cell.ship && !cell.ship.sunk) {
              damage.push([x, y]);
            }
          } else {
            missCount++;
          }
        }
      }
    }

    let shipCount = board.ships.length;
    let sunkCount = board.sunkCount || 0;

    let unsunkShips = board.ships.filter(ship => !ship.sunk);
    let shipSizes = [Infinity, 0];
    for (let ship of unsunkShips) {
      shipSizes[0] = Math.min(shipSizes[0], ship.size);
      shipSizes[1] = Math.max(shipSizes[1], ship.size);
    }
    if (unsunkShips.length === 0) {
      shipSizes = [0, 0];
    }

    this.targetStatus = {
      missCount,
      hitCount,
      empty,
      shipCount,
      sunkCount,
      damage,
      shipSizes,
    };
  }

  _chooseShips() {
    let board = new ShipBoard(this.game);

    for (let item of this.game.fleet) {
      this._tryAddShip(board, item);
    }

    return board.ships;
  }

  _tryAddShip(board, ship) {
    let rows = [...Array(10).keys()];
    let cols = [...Array(10).keys()];
    let vertical = [false, true];
    _shuffle(rows);
    _shuffle(cols);
    _shuffle(vertical);
    for (let v of vertical) {
      for (let y of rows) {
        for (let x of cols) {
          if (this._fits(board.cells, x, y, ship.size, v)) {
            board.ships.push({
              name: ship.name,
              size: ship.size,
              position: [x, y],
              vertical: v,
            });
            board._update();
            return;
          }
        }
      }
    }
  }

  _fits(cells, x, y, len, vertical) {
    let [dx, dy] = vertical ? [0, 1] : [1, 0];
    for (let i = 0; i < len; i++) {
      let nx = x + dx * i;
      let ny = y + dy * i;
      let cell = cells[ny] && cells[ny][nx];
      if (!cell || cell.ship || cell.adjacent || cell.diagonal) return false;
    }
    return true;
  }

}
