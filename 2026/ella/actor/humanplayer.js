import BotC from '../botc.js';

export default class HumanPlayer {
  constructor(game, playerId, doneCallback) {
    this.game = game;
    this.playerId = playerId;
    this.doneCallback = doneCallback;
    this.otherPlayerId = 1 - playerId;
    this.board = game.boards[playerId];
    this.otherBoard = game.boards[this.otherPlayerId];
  }

  added() {
  }

  init() {
    this.cursor = [0,0];
  }

  term() {
  }

  work(dt, time) {
    if (true) {
      let bot = new BotC(this.game, this.playerId);
      this.target = bot.chooseTarget();
      this.target = this.cursor
      this.otherBoard.cursor = this.target;
      this.otherBoard.ready = true;
    }
  }

  onTouch(event) {
    if (event.x != null) {
      this.cursor = [event.x, event.y];
    }
  }

  draw(ctx) {
  }
}