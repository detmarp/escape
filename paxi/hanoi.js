export default class Hanoi {
  constructor(size) {
    this.size = size;
    this.goal = Math.pow(2, size) - 1

    this.pegs = [
      [],
      [],
      []
    ];
    for (let i = size - 1; i >= 0; i--) {
      this.pegs[0].push(i);
    }
    this.moves = 0;
  }

  static fromObject(obj) {
    let size = 7;
    if (obj && typeof obj.size === 'number') {
      size = Math.round(obj.size);
      size = Math.max(2, Math.min(20, size));
    }

    let hanoi = new Hanoi(size);

    if (!obj) {
      return hanoi;
    }

    if (typeof obj.moves === 'number') {
      hanoi.moves = Math.max(0, Math.round(obj.moves));
    }

    hanoi.gameOver = !!obj.gameover;

    // Reconstruct the pegs safely
    let location = {}
    if (Array.isArray(obj.pegs)) {
      for (let p = 0; p < 3; p++) {
        let peg = obj.pegs[p];
        if (Array.isArray(peg)) {
          for (let disk of peg) {
            if (typeof disk === 'number') {
              location[disk] = p;
            }
          }
        }
      }
    }

    let pegs = [[], [], []];
    for (let disk = size - 1; disk >= 0; disk--) {
      let pegIndex = location[disk];
      if (pegIndex === undefined || pegIndex < 0 || pegIndex > 2) {
        pegIndex = 0;
      }
      pegs[pegIndex].push(disk);
    }
    hanoi.pegs = pegs;
    // Sort each peg from high to low (largest disk to smallest)
    for (let peg of hanoi.pegs) {
      peg.sort((a, b) => b - a);
    }

    hanoi._checkGameOver();
    return hanoi;
  }

  canSelect(peg) {
    if (this.gameOver) {
      return false;
    }

    return peg >= 0 && peg < 3 && this.pegs[peg].length > 0;
  }

  canMove(fromPeg, toPeg) {
    if (this.gameOver) {
      return false;
    }

    if (!this.canSelect(fromPeg)) {
      return false;
    }
    let from = this.pegs[fromPeg];
    let disk = from[from.length - 1];
    if (toPeg < 0 || toPeg >= 3) {
      return false;
    }
    let to = this.pegs[toPeg];
    if (to.length === 0) {
      return true;
    }
    return disk < to[to.length - 1];
  }

  doMove(fromPeg, toPeg) {
    if (!this.canMove(fromPeg, toPeg)) {
      return;
    }
    let from = this.pegs[fromPeg];
    let disk = from.pop();
    let to = this.pegs[toPeg];
    to.push(disk);

    this.moves++;

    this._checkGameOver();
  }

  _onAction(action, params = {}) {
    let command = `_onAction_${action}`;
    if (typeof this[command] === 'function') {
      this[command](params);
    }
    else {
      console.warn(`Error action: ${JSON.stringify(action)}`);
    }
  }

  _onAction_select(params) {
  }

  _onAction_deselect(params) {
  }

  _onAction_move(params) {
  }

  _onAction_gameover(params) {
  }

  _onAction_add(params) {
  }

  _checkGameOver() {
    let over = (this.pegs[0].length === 0) &&
      (this.pegs[1].length === 0 || this.pegs[2].length === 0);
    this.gameOver = over;
    return over;
  }

  toObject() {
    return {
      size: this.size,
      pegs: this.pegs.map(peg => [...peg]),
      moves: this.moves,
      gameover: !!this.gameOver
    };
  }
}