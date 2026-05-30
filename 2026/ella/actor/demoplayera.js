import BotC from '../botc.js';

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
  constructor(game, playerId, doneCallback, changeCallback) {
    this.game = game;
    this.playerId = playerId;
    this.doneCallback = doneCallback;
    this.changeCallback = changeCallback;
    this.otherPlayerId = 1 - playerId;
    this.board = game.boards[playerId];
    this.otherBoard = game.boards[this.otherPlayerId];
    this.state = {label: 'none'};
    this.time = 0;
  }

  added() {
    //console.log('ppp added');
  }

  init() {
    //console.log('ppp init');
    let b = this.game.boards[this.playerId];
    this.gotoState('firstPause', 0.5, () => this.onFindTarget());
  }

  setPaused() {
  }

  onFindTarget() {
    let bot = new BotC(this.game, this.playerId);
    this.target = bot.chooseTarget();
    this.otherBoard.cursor = this.target;
    this.otherBoard.ready = true;
    if (!this.target) {
      this.onAllDone();
      return;
    }
    // make some inbetween target points
    function shuffle(list) {
      list = [...list];
      for (let i = list.length - 1; i > 0; i--) {
        const j = _rand(i + 1);
        [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    }
    function r(x) { return (_rand(4) + x + 3) % 10; }
    this.betweenTargets = [
      [r(this.target[0]), this.target[1]],
      [this.target[0], r(this.target[1])],
      [r(this.target[0]), r(this.target[1])],
    ];
    this.betweenTargets = shuffle(this.betweenTargets);
    this.betweenTargets.push(this.target);
    this.gotoState('animCursor', 1.5, () => this.onLockCursor(), (t) => this.onAnimCursor(t));
  }

  onAnimCursor(t) {
    const p = this._walkCurve(this.betweenTargets, t);
    this.otherBoard.cursor = p;
  }

  _walkCurve(points, t) {
    const n = points.length;
    if (n < 2) {
      return points[0] || [0, 0];
    }
    const tc = Math.max(0, Math.min(1, t));
    const cr1 = (a, b, c, d, u) => {
      const u2 = u * u;
      const u3 = u2 * u;
      return 0.5 * ((2 * b) + ((-a + c) * u) + ((2 * a - 5 * b + 4 * c - d) * u2) + ((-a + 3 * b - 3 * c + d) * u3));
    };
    const cr2 = (p0, p1, p2, p3, u) => [
      cr1(p0[0], p1[0], p2[0], p3[0], u),
      cr1(p0[1], p1[1], p2[1], p3[1], u),
    ];

    const samplesPerSeg = 8;
    const sampled = [points[0]];
    for (let i = 0; i < n - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(n - 1, i + 2)];
      for (let s = 1; s <= samplesPerSeg; s++) {
        sampled.push(cr2(p0, p1, p2, p3, s / samplesPerSeg));
      }
    }

    let total = 0;
    const cum = [0];
    for (let i = 1; i < sampled.length; i++) {
      const dx = sampled[i][0] - sampled[i - 1][0];
      const dy = sampled[i][1] - sampled[i - 1][1];
      total += Math.hypot(dx, dy);
      cum.push(total);
    }
    if (total <= 0) {
      return sampled[0];
    }

    const targetD = tc * total;
    let k = 1;
    while (k < cum.length && cum[k] < targetD) {
      k++;
    }
    const a = Math.max(0, k - 1);
    const b = Math.min(cum.length - 1, k);
    const span = cum[b] - cum[a];
    const f = span > 0 ? (targetD - cum[a]) / span : 0;
    return [
      sampled[a][0] + ((sampled[b][0] - sampled[a][0]) * f),
      sampled[a][1] + ((sampled[b][1] - sampled[a][1]) * f),
    ];
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
    console.log(`mmm0 onMissleLanded target ${JSON.stringify(this.target)}`);
    this.game.shoot(this.otherPlayerId, this.target);
    if (this.changeCallback) {
      this.changeCallback();
    }
    // Find the shot result from the board's data
    let shot = this.otherBoard.data.shots[this.otherBoard.data.shots.length - 1];
    let cell = (shot != null) && this.otherBoard.extra.cells[shot];
    let hit = cell && cell.hit;
    this._node.sendEvent('landed', {
      fromIndex: this.playerId,
      toIndex: this.otherPlayerId,
      target: this.target,
      hit,
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
    //console.log('ppp term');
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
    //console.log(`ppp ${this.time.toFixed(2)} - gotoState was ${this.state.label} going to ${label} for ${duration}`);
    this.state = {label, duration, onDone, onTick, age: 0, t:0};
    //console.log(`aaa ${JSON.stringify(this.game.toObject())}`);
  }
}