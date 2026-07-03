/* a random ship placement bot
*/

import Random from "./myrandom.js";
import ShipRules from "./shiprules.js";
import ShipBoard from "./shipboard.js";

export default class BotSetup {
  constructor(rules, seed) {
    let r = new ShipRules(rules);
    this.rules = r.data;
    this.seed = seed;
    this.random = new Random(seed);
  }

  // Returns an array of placed ships
  makeShips() {
    return this._chooseShips();
  }

  _chooseShips() {
    let board = new ShipBoard(this.rules);

    for (let item of this.rules.fleet) {
      this._tryAddShip(board, item);
    }

    return board.data.ships;
  }

  _tryAddShip(board, ship) {
    const [w, h] = board.data.size;
    let rows = this.random.shuffle([...Array(h).keys()]);
    let cols = this.random.shuffle([...Array(w).keys()]);
    let vertical = this.random.shuffle([false, true]);
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
