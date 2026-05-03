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
    this.stepping = false;
    this.target = null;
  }

  added() {
    this.step = 'start';
    this.age = 0;
    this.doStep();
  }

  init() {
  }

  setPaused(paused) {
    this.paused = paused;
    if (!this.paused) {
      this.doStep();
    }
  }

  doStep() {
    switch (this.step) {
      case 'start':
        this._acquireTarget();
        break;
      case 'targeted':
        this._shoot();
        break;
      case 'shot':
        this._allDone();
        break;
      default:
        break;
    }
  }

  _acquireTarget() {
    this.step = 'targeted';
    let bot = new BotB(this.game, this.playerId);
    this.target = bot.chooseTarget();
    this.otherBoard.cursor = this.target;
    this.otherBoard.ready = true;
  }

  _shoot() {
    this.step = 'shot';
    let shot = this.game.shoot(this.otherPlayerId, this.target);
    this.otherBoard.ready = false;
    this.otherBoard.cursor = null;
  }

  _allDone() {
    this.step = 'done';
    this._node.tree.remove(this);
    if (this.doneCallback) {
      this.doneCallback();
      this.doneCallback = null;
    }
  }

  term() {
  }

  work(dt, time) {
    this.age += dt;
    if (this.age > 0.15 && !this.paused) {
      this.age = 0;
      this.doStep();
    }
  }

  draw(ctx) {
  }
}