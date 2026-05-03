import BotB from '../botb.js';
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
    this.paused = false;
    this.step = 'none'; // 'none', 'acquire', 'shoot'
    this.target = null;
  }

  added() {
    this.step = 'acquire';
    if (!this.paused) {
      this._node.addActor(new Timer(0.05, () => this.onAcquireTarget()));
    }
  }

  init() {
  }

  setPaused(paused) {
    this.paused = paused;
  }

  doStep() {
    if (this.step === 'acquire') {
      this.onAcquireTarget();
    } else if (this.step === 'shoot') {
      this.onShoot();
    }
  }

  onAcquireTarget() {
    let bot = new BotB(this.game, this.playerId);
    this.target = bot.chooseTarget();
    this.otherBoard.cursor = this.target;
    this.otherBoard.ready = true;
    this.step = 'shoot';

    if (!this.paused) {
      this._node.addActor(new Timer(0.5, () => this.onShoot()));
    }
  }

  onShoot() {
    let shot = this.game.shoot(this.otherPlayerId, this.target);
    this.otherBoard.ready = false;
    this.otherBoard.cursor = null;
    this.step = 'none';
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