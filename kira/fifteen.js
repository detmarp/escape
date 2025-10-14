export default class Fifteen33 {
  constructor() {
    this.board = [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
      [12, 13, 14, 15],
    ];

    this.board[3][3] = null;

    this._shuffle(20);
  }

  _shuffle(number = 2) {
    let nullIndex = 15; // starts at bottom right
    let row = true;
    for (let n = 0; n < number; n++) {
      const nullX = nullIndex % 4;
      const nullY = Math.floor(nullIndex / 4);
      let pick;
      if (row) {
        // Pick a random col in the same row, not the null
        let choices = [0, 1, 2, 3].filter(c => c !== nullX);
        pick = choices[Math.floor(Math.random() * choices.length)];
        var targetIndex = nullY * 4 + pick;
      } else {
        // Pick a random row in the same col, not the null
        let choices = [0, 1, 2, 3].filter(r => r !== nullY);
        pick = choices[Math.floor(Math.random() * choices.length)];
        var targetIndex = pick * 4 + nullX;
      }
      // Move tiles by touching targetIndex
      const moves = this.touch(targetIndex);
      if (moves.length > 0) this.doMoves(moves);
      // Update nullIndex to new position
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (this.board[i][j] === null) {
            nullIndex = i * 4 + j;
          }
        }
      }
      row = !row;
    }
  }

  getMoves(x, y) {
    // Find null position
    let nullX = -1,
      nullY = -1;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.board[i][j] === null) {
          nullX = j;
          nullY = i;
        }
      }
    }
    if (x === nullX && y === nullY) return [];
    let moves = [];
    // Same row
    if (y === nullY) {
      let dir = x < nullX ? 1 : -1;
      for (let j = nullX - dir; dir > 0 ? j >= x : j <= x; j -= dir) {
        moves.push([y * 4 + j, y * 4 + j + dir]);
      }
      return moves;
    }
    // Same column
    if (x === nullX) {
      let dir = y < nullY ? 1 : -1;
      for (let i = nullY - dir; dir > 0 ? i >= y : i <= y; i -= dir) {
        moves.push([i * 4 + x, (i + dir) * 4 + x]);
      }
      return moves;
    }
    // Not in same row or column
    return [];
  }

  touch(index) {
    const x = index % 4;
    const y = Math.floor(index / 4);
    return this.getMoves(x, y);
  }

  isSolved() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i === 3 && j === 3) {
          if (this.board[i][j] !== null) return false;
        } else {
          if (this.board[i][j] !== i * 4 + j) return false;
        }
      }
    }
    // If solved, set piece 15 to actual 15
    this.board[3][3] = 15;
    return true;
  }

  doMoves(moves) {
    // Copy values to be moved
    const values = moves.map(move => {
      const fromIndex = move[0];
      const fromX = fromIndex % 4;
      const fromY = Math.floor(fromIndex / 4);
      return this.board[fromY][fromX];
    });
    // Move values
    for (let i = 0; i < moves.length; i++) {
      const fromIndex = moves[i][0];
      const toIndex = moves[i][1];
      const fromX = fromIndex % 4;
      const fromY = Math.floor(fromIndex / 4);
      const toX = toIndex % 4;
      const toY = Math.floor(toIndex / 4);
      this.board[fromY][fromX] = null;
      this.board[toY][toX] = values[i];
    }

    return this.isSolved();
  }

  toString() {
    const chars = 'ABCDEFGHIJKLMNO-';
    let result = '';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let val = this.board[i][j];
        if (val === null) {
          result += '-';
        } else {
          result += chars[val];
        }
      }
      result += '\n';
    }
    return result;
  }
}
