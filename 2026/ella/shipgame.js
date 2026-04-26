import ShipBoard from './shipboard.js';

export default class ShipGame {
  static _id = 0;

  constructor() {
    this.id = ShipGame._id++;
    this.boards = [
      new ShipBoard(this),
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
    };

    this.boards[0]._update();
    this.boards[1]._update();

    this.turn = 0;
    this.gameOver = false;
  }

  shoot(target, position) {
    let board = this.boards[target];
    let cell = board.cells[position[1]] && board.cells[position[1]][position[0]];
    let hit = false;

    if (!cell || cell.shot) {
      return;
    }

    if (cell && cell.ship) {
      hit = true;
    }
    let shot = {
      position,
      hit: hit,
    };
    board.shots.push(shot);
    board._update();

    if (hit && board.hitCount >= board.shipCellCount) {
      this.gameOver = true;
      this.winner = 1 - target
    }

    if (!this.gameOver && (!hit || !this.rules.continueAfterHit)) {
      this.turn = 1 - this.turn;
    }

    return shot;
  }
}
