// Bots are just a messy work in progress
// BotB is mostly deprecated
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

function _sample(array, weightFunc) {
  if (array.length === 0) {
    return null;
  }
  if (array.length > 1) {
    let totalWeight = array.reduce((sum, item) => sum + weightFunc(item), 0);
    if (totalWeight <= 0) {
      return array[_rnd(array.length)];
    }
    let r = Math.random() * totalWeight;
    for (let item of array) {
      r -= weightFunc(item);
      if (r <= 0) {
        return item;
      }
    }
  }
  return array[0];
}

export default class BotB {
  constructor(game, id) {
    this.game = game;
    this.id = id;
    this.other = 1 - id;
    this.otherBoard = game.boards[this.other];
    //this.debug = true;
  }

  chooseTarget() {
    // make a map of cells, called squares{}
    this.squares = {};
    for (let cell of this._otherEachCell()) {
      this.squares[cell.index] = {
        cell,
        offset: cell.index,
        position: [cell.x, cell.y],
        x: cell.x,
        y: cell.y,
        shot: cell.shot,
        oob: cell.shot,
        weight: 0,
      };
    }

    // Find damaged but not sunk ships
    this.damage = [];
    for (let shot of this.otherBoard.shots) {
      let cell = this.otherBoard.extra.cells[shot];
      if (cell && cell.hit) {
        let ship = cell.shipExtra;
        if (ship && !ship.sunk) {
          this.damage.push(shot);
        }
      }
    }

    // ship neighbors as oob
    for (let ship of this.otherBoard.ships) {
      for (let idx of ship.OLD_cells) {
        let shipSquare = this.squares[idx];
        if (shipSquare) {
          // Orthogonal neighbors - only if !allowAdjacent AND ship is sunk
          if (!this.game.rules.allowAdjacent && ship.sunk) {
            const orthogonal = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (let [dx, dy] of orthogonal) {
              let nx = shipSquare.x + dx;
              let ny = shipSquare.y + dy;
              let nidx = ny * 10 + nx;
              let square = this.squares[nidx];
              if (square) {
                square.oob = true;
              }
            }
          }

          // Diagonal neighbors - if !allowDiagonal (skip sunk test for diagonals)
          if (!this.game.rules.allowDiagonal && shipSquare.shot) {
            const diagonal = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
            for (let [dx, dy] of diagonal) {
              let nx = shipSquare.x + dx;
              let ny = shipSquare.y + dy;
              let nidx = ny * 10 + nx;
              let square = this.squares[nidx];
              if (square) {
                square.oob = true;
              }
            }
          }
        }
      }
    }

    // make a list of targets
    this.targets = Object.values(this.squares).filter(s => !s.oob);
    if (this.damage.length > 0) {
      this._findWeightsForDamage();
      this.targets = this.targets.filter(s => s.weight > 0);
    }
    else {
      this._findWeightsForEmpty();
    }
    if (this.debug && this.other == 0) {
      this._debugPrintSquares();
    }

    // choose from weights
    let target = _sample(this.targets, s => s.weight);
    if (target) {
      return target.position;
    }
    return [_rnd(10), _rnd(10)];
  }

  _findWeightsForDamage() {
    for (let offset of this.damage) {
      let cell = this.otherBoard.extra.cells[offset];
      let x = cell.x, y = cell.y;
      let adjacent = [ [-1, 0], [1, 0], [0, -1], [0, 1] ];
      for (let [dx, dy] of adjacent) {
        let nx = x + dx;
        let ny = y + dy;
        let nidx = ny * 10 + nx;
        let square = this.squares[nidx];
        if (square && !square.shot) {
          square.weight += 10;
        }
      }
    }
  }

  _findWeightsForEmpty() {
    for (let square of this.targets) {
      if (!square.shot) {
        square.weight = 1;
      }
    }
  }

  _key(x, y) {
    return y * 10 + x;
  }

  * _otherEachCell() {
    let b = this.otherBoard;
    for (let cell of b.extra.cells) {
      yield cell;
    }
  }

  _debugPrintSquares() {
    function code(square) {
      let a = '  ';
      if (square && square.weight > 0) {
        a = Math.min(99, Math.floor(square.weight)).toString().padStart(2, ' ');
      }
      let b = square.oob ? 'x' : ' ';
      return `${a}${b}`;
    }
    console.log(`${this.targets.length} targets:`);
    let lines = [];
    for (let row = 0; row < 10; row++) {
      let r = [];
      for (let col = 0; col < 10; col++) {
        let square = this.squares[row * 10 + col];
        r.push(code(square));
      }
      lines.push(r.join('|'));
    }
    console.log(lines.join('\n'));
  }
}
