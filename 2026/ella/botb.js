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
      this.squares[this._key(cell.position[0], cell.position[1])] = {
        cell,
        position: cell.position,
        x: cell.position[0],
        y: cell.position[1],
        shot: cell.shot,
        oob: cell.shot,
        weight: 0,
      };
    }

    // Find damaged but not sunk ships
    this.damage = [];
    for (let shot of this.otherBoard.shots) {
      if (shot.hit) {
        let cell = this.otherBoard.cells[shot.position[1]] && this.otherBoard.cells[shot.position[1]][shot.position[0]];
        if (cell) {
          let ship = cell.ship;
          if (ship && !ship.sunk) {
            this.damage.push(shot.position);
          }
        }
      }
    }

    // ship neighbors as oob
    for (let ship of this.otherBoard.ships) {
      for (let [x, y] of ship.cells) {
        let shipSquare = this.squares[this._key(x, y)];
        if (shipSquare) {
          // Orthogonal neighbors - only if !allowAdjacent AND ship is sunk
          if (!this.game.rules.allowAdjacent && ship.sunk) {
            const orthogonal = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (let [dx, dy] of orthogonal) {
              let square = this.squares[this._key(x + dx, y + dy)];
              if (square) {
                square.oob = true;
              }
            }
          }

          // Diagonal neighbors - if !allowDiagonal (skip sunk test for diagonals)
          if (!this.game.rules.allowDiagonal && shipSquare.shot) {
            const diagonal = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
            for (let [dx, dy] of diagonal) {
              let square = this.squares[this._key(x + dx, y + dy)];
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
    for (let pos of this.damage) {
      let [x, y] = pos;
      let adjacent = [ [-1, 0], [1, 0], [0, -1], [0, 1] ];
      for (let [dx, dy] of adjacent) {
        let square = this.squares[this._key(x + dx, y + dy)];
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
    return `${x},${y}`;
  }

  * _otherEachCell() {
    let b = this.otherBoard;
    for (let row of b.cells) {
      for (let cell of row) {
        yield cell;
      }
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
        let square = this.squares[this._key(col, row)];
        r.push(code(square));
      }
      lines.push(r.join('|'));
    }
    console.log(lines.join('\n'));
  }
}
