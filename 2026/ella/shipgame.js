import ShipBoard from './shipboard.js';

export default class ShipGame {
  static _id = 0;

  constructor(params = {}) {
    this.id = ShipGame._id++;
    this.boards = [
      new ShipBoard(this.rules),
      new ShipBoard(this),
    ];
    this.fleet = [
      { name: 'Carrier', size: 5 },
      { name: 'Battleship', size: 4 },
      { name: 'Cruiser', size: 3 },
      { name: 'Submarine', size: 3 },
      { name: 'Destroyer', size: 2 },
    ];
    this.rules = {
      allowDiagonal: false,
      allowAdjacent: false,
      continueAfterHit: true,
      ...params.rules,
    };

    this.turn = 0;
    this.gameOver = false;
  }

  shoot(target, position) {
    let board = this.boards[target];
    let cell = board.cell(position[0], position[1]);
    let hit = false;

    if (!cell || cell.shot) {
      console.log(`ggg ${JSON.stringify(cell)} ${JSON.stringify(position)}`);
      return;
    }

    if (cell && cell.shipExtra) {
      hit = true;
    }
    let offset = position[1] * board.data.size[0] + position[0];
    board.data.shots.push(offset);
    board.rebuildExtra();

    if (hit && board.extra.hits.length >= board.extra.shipCellCount) {
      this.gameOver = true;
      this.winner = 1 - target
    }

    if (!this.gameOver && (!hit || !this.rules.continueAfterHit)) {
      this.turn = 1 - this.turn;
    }
  }

  static fromObject(obj) {
    let game = new ShipGame({
      rules: obj.rules,
    });

    let b0 = obj.boards ? obj.boards[0] : {};
    let b1 = obj.boards ? obj.boards[1] : {};
    game.boards[0] = ShipBoard.fromObject({ ...b0 });
    game.boards[1] = ShipBoard.fromObject({ ...b1 });

    game.boards[0].rebuildExtra();
    game.boards[1].rebuildExtra();

    return game;
  }

  toObject() {
    return {
      rules: this.rules,
      boards: this.boards.map(board => board.toObject()),
      turn: this.turn,
      gameOver: this.gameOver,
      winner: this.winner,
    };
  }
}
