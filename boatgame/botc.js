// Bots are just a messy work in progress
// BotC is a dumb random bot
import ShipBoard from "./shipboard.js";
import MyRandom from "./myrandom.js";

function _rnd(n) {
  return Math.floor(Math.random() * n);
}

export default class BotC {
  constructor(game, id) {
    this.game = game;
    this.id = id;
    this.other = 1 - id;
    this.otherBoard = game.boards[this.other];
    //this.debug = true;
  }

  chooseTarget() {
    console.log(`ccc0 shooting at board ${this.other} ==================`);
    this.otherBoard.rebuildExtra(true);
    this.sunkList = this._findSunkShips();
    this.damageList = this._findDamageShots();
    console.log(`ccc1 sunk ${this.sunkList.length} ${JSON.stringify(this.sunkList)}`);
    console.log(`ccc2 damage ${this.damageList.length} ${JSON.stringify(this.damageList)}`);
    let weights = this._getWeightList(this.otherBoard, this.sunkList, this.damageList);
    let lines = [];
    for (let i = 0; i < weights.length; i += 10) {
      lines.push('  ' + weights.slice(i, i + 10).map(w => w.toString().padStart(3, ' ')).join(''));
    }
    let grid = lines.join(' \n');
    grid = grid.replace(/ 0 /g, ' - ');
    console.log(`ccc3 weights \n${grid}`);
    let rand = new MyRandom();
    let i = rand.pick(weights);
    let x = i % 10;
    let y = Math.floor(i / 10);
    return [x, y];
  }

  * _unsunkShips(board, predicate) {
    // for all unsunk ships, take their size and iterate over all in-bounds possible board positions, for vertical in {false true }, for each also make list of cell indexes, so: { size: int, start: int, vertical: boolean, cells: int[] }
    let unsunk = [];
    for (let shipExtra of board.extra.shipExtra) {
      if (!shipExtra.sunk) {
        unsunk.push(shipExtra);
      }
    }
    for (let ship of unsunk) {
      let size = ship.size;
      for (let vertical of [false, true]) {
        let w = board.data.size[0];
        let h = board.data.size[1];
        let delta = vertical ? w : 1;
        let maxX = vertical ? w - 1 : w - size;
        let maxY = vertical ? h - size : h - 1;
        for (let y = 0; y <= maxY; y++) {
          for (let x = 0; x <= maxX; x++) {
            let cells = Array.from({ length: size }, (_, i) => (y * w + x) + i * delta);
            let placement = {
              size,
              start: y * w + x,
              vertical,
              cells,
            };
            if (predicate && !predicate(placement)) {
              continue;
            }
            yield placement;
          }
        }
      }
    }
  }

  _findSunkShips() {
    // Return a list of ships that are fully sunk (shipExtra objects)
    let sunk = [];
    // Loop over all cells, collect unique sunk ships
    let seen = new Set();
    for (let cell of this.otherBoard.extra.cells) {
      if (cell.shipExtra && cell.shipExtra.sunk && !seen.has(cell.shipExtra)) {
        sunk.push(cell.shipExtra);
        seen.add(cell.shipExtra);
      }
    }
    return sunk;
  }

  _findDamageShots() {
    // Return a list of shot cells that are hits on ships that are not fully sunk
    let damage = [];
    for (let cell of this.otherBoard.extra.cells) {
      if (cell.shot && cell.hit && cell.shipExtra && !cell.shipExtra.sunk) {
        damage.push(cell);
      }
    }
    return damage;
  }

  _getWeightList(board, sunkList, damageList) {
    // for each cell in extra.cells, 0 if shot, adjacent or diagonal, othewwise 1
    let weights = Array(board.extra.cells.length).fill(0);

    let shipPredicate = null;
    let cellFilter = null;

    let damagedCells = new Set(damageList.map(cell => cell.index));
    let open = new Set(board.extra.cells.filter(cell => !cell.shot && !cell.adjacent && !cell.diagonal).map(cell => cell.index));
    let shotCells = new Set(board.extra.cells.filter(cell => cell.shot).map(cell => cell.index));

    if (damageList.length > 0) {
      let w = board.data.size[0];
      let h = board.data.size[1];

      let isAdjacentToDamaged = (index) => {
        let x = index % w;
        let y = Math.floor(index / w);
        for (let [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && damagedCells.has(ny * w + nx)) {
            return true;
          }
        }
        return false;
      };

      shipPredicate = p => p.cells.some(c => damagedCells.has(c)) && p.cells.every(c => damagedCells.has(c) || open.has(c));

      cellFilter = index => !shotCells.has(index) && isAdjacentToDamaged(index);
    }
    else {
      // No damaged ships; justs open water
      shipPredicate = p => p.cells.every(c => open.has(c));
      cellFilter = index => open.has(index);
    }

    // placement loop here?
    for (let placement of this._unsunkShips(board, shipPredicate)) {
      for (let cell of placement.cells) {
        if (cellFilter &&  !cellFilter(cell)) {
          continue;
        }
        weights[cell] = (weights[cell] || 0) + 1;
      }
    }

    return weights;
  }
}
