import BotA from '../bota.js';
import Timer from './timer.js';

function _rand(n) {
  return Math.floor(Math.random() * n);
}

export default class DemoPlayerB {
  constructor(game, playerId, doneCallback) {
    this.game = game;
    this.playerId = playerId;
    this.doneCallback = doneCallback;
    this.otherPlayerId = 1 - playerId;
    this.board = game.boards[playerId];
    this.otherBoard = game.boards[this.otherPlayerId];
  }

  added() {
    this.otherBoard.ready = true;
    this._node.addActor(new Timer(0.05, () => this.onShoot()));
  }

  init() {
  }

  onShoot() {
    let bot = new BotA(this.game, this.playerId);
    this.target = bot._chooseTarget();
    let shot = this.game.shoot(this.otherPlayerId, this.target);
    this.otherBoard.ready = false;
    if (this.doneCallback) {
      this.doneCallback();
      this.doneCallback = null;
    }
  }

  onAllDone() {
    this.board.ready = false;
    this.board.cursor = null;
    this._node.tree.remove(this);
    if (this.doneCallback) {
      this.doneCallback();
      this.doneCallback = null;
    }
  }

  term() {
  }

  work(dt, time) {
  }

  draw(ctx) {
  }
}