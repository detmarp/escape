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
  }

  _chooseTarget() {
    return [_rnd(10), _rnd(10)];
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
