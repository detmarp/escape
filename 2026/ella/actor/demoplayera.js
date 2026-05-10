import BotB from '../botb.js';

function _rand(n) {
  return Math.floor(Math.random() * n);
}
/*
planning
states for doing CPU player
will construct when it's time for seqence, and die when the turn ends
sequence
- pause
- turn on "ready" flag - for green box visual
- choose target position
- animate cursor for a little while to look like thinking
- flash cursor as locked on
- do missile flying amin ~1.5 seconds
- turn off "ready" flag
- record hit or miss - this is where game gets "shoot" moment, and sets game over else sets next turn
- note if boat sunk, and if game over
- placeholder for future particle effects; splash and ripples for miss, or expolosion and fire for hit
- pause 0.5 seconds then add red or white pip to board for hit or miss
- if boat sunk, then placeholder for "you sank my battleship" message
- if game over, then add the red X marker
*/
export default class DemoPlayerA {
  constructor(game, playerId, doneCallback) {
    this.game = game;
    this.playerId = playerId;
    this.doneCallback = doneCallback;
    this.otherPlayerId = 1 - playerId;
    this.board = game.boards[playerId];
    this.otherBoard = game.boards[this.otherPlayerId];
    this.state = {label: 'none'};
    this.time = 0;
  }

  added() {
    console.log('ppp added');
  }

  init() {
    console.log('ppp init');
    let b = this.game.boards[this.playerId];
    this.gotoState('firstPause', 0.5, () => this.onFindTarget());
  }

  setPaused() {
  }

  onFindTarget() {
    let bot = new BotB(this.game, this.playerId);
    this.target = bot.chooseTarget();
    this.otherBoard.cursor = this.target;
    this.otherBoard.ready = true;
    if (!this.target) {
      this.onAllDone();
      return;
    }
    this.gotoState('animCursor', 1.5, () => this.onLockCursor(), (t) => this.onAnimCursor(t));
  }

  onAnimCursor(t) {
    this.otherBoard.cursor = [_rand(10), _rand(10)];
  }

  onLockCursor() {
    this.otherBoard.hudOff();
    this.otherBoard.lock = this.target;
    this.gotoState('lockingCursor', 0.5, () => {
      this._node.sendEvent('missile', {
        fromIndex: this.playerId,
        toIndex: this.otherPlayerId,
        target: this.target,
      });
      this.gotoState('flyMissile', 1.5, () => this.onMissleLanded());
    });
  }

  onMissleLanded() {
    this.otherBoard.hudOff();
    let shot = this.game.shoot(this.otherPlayerId, this.target);
    this._node.sendEvent('landed', {
      fromIndex: this.playerId,
      toIndex: this.otherPlayerId,
      target: this.target,
      hit: shot.hit,
    });
    this.gotoState('handleHit', 0.5, () => this.onEndTurn());
  }

  onEndTurn() {
    this.gotoState('handleEndTurn', 0.25, () => this.onAllDone());
  }

  onAllDone() {
    this.otherBoard.hudOff();
    this._node.tree.remove(this);
    if (this.doneCallback) {
      this.doneCallback();
      this.doneCallback = null;
    }
  }

  term() {
    console.log('ppp term');
  }

  work(dt, time) {
    this.time = time;

    //console.log(`ppp work dt ${dt} time ${time} state ${this.state.label} age ${this.state.age}`);

    // state machine
    if (!this.state.elapsed && this.state.duration) {
      this.state.age += dt;
      this.t = Math.min(1, this.state.age / this.state.duration);
      if (this.t >= 1) {
        // elapsed
        this.state.elapsed = true;
        if (this.state.onDone) {
          this.state.onDone();
        }
      }
      else {
        if (this.state.onTick) {
          this.state.onTick(this.t);
        }
      }
    }
  }

  draw(ctx) {
  }

  gotoState(label = 'none', duration = 0, onDone = null, onTick = null) {
    console.log(`ppp ${this.time.toFixed(2)} - gotoState was ${this.state.label} going to ${label} for ${duration}`);
    this.state = {label, duration, onDone, onTick, age: 0, t:0};
  }
}