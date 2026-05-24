// Bots are just a messy work in progress
// BotC is a dumb random bot
import ShipBoard from "./shipboard.js";

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
    this.otherBoard.rebuildExtra();
    let x, y, cell;
    while (true) {
      x = _rnd(10);
      y = _rnd(10);
      cell = this.otherBoard.cell(x, y);
      if (cell && !cell.shot) break;
    }
    //console.log(`ccc ${JSON.stringify(cell)}`);
    return [x, y];
  }
}
