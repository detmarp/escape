// Bots are just a messy work in progress
// BotA is motsly used for ship placement
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
      this.game.boards[this.id].data.ships.push(ship);
    }
    this.game.boards[this.id].rebuildExtra();
  }

  _chooseShips() {
    let board = new ShipBoard(this.game);

    for (let item of this.game.fleet) {
      this._tryAddShip(board, item);
    }

    return board.data.ships;
  }

  _tryAddShip(board, ship) {
    const [w, h] = board.data.size;
    let rows = [...Array(h).keys()];
    let cols = [...Array(w).keys()];
    let vertical = [false, true];
    _shuffle(rows);
    _shuffle(cols);
    _shuffle(vertical);
    for (let v of vertical) {
      for (let y of rows) {
        for (let x of cols) {
          if (this._fits(board, x, y, ship.size, v)) {
            board.data.ships.push({
              name: ship.name,
              size: ship.size,
              offset: y * w + x,
              vertical: v,
            });
            board.rebuildExtra();
            return;
          }
        }
      }
    }
  }

  _fits(board, x, y, len, vertical) {
    let [dx, dy] = vertical ? [0, 1] : [1, 0];
    for (let i = 0; i < len; i++) {
      let nx = x + dx * i;
      let ny = y + dy * i;
      let cell = board.cell(nx, ny);
      if (!cell || cell.shipExtra || cell.adjacent || cell.diagonal) return false;
    }
    return true;
  }

}
