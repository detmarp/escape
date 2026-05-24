// HumanPlayer: handles all human input, state, and animation for a turn
export default class HumanPlayer {
  constructor(game, playerId, doneCallback) {
      this._dragActive = false;
    this.game = game;
    this.playerId = playerId;
    this.doneCallback = doneCallback;
    this.otherPlayerId = 1 - playerId;
    this.board = game.boards[playerId];
    this.otherBoard = game.boards[this.otherPlayerId];
    this.state = { label: 'none' };
    this.time = 0;
    this.cursor = null;
    this.fingerDown = false;
    this.lastTouch = null;
    this.target = null;
  }

  added() {}

  init() {
    this.gotoState('waitForTarget');
  }

  term() {}

  gotoState(label = 'none', duration = 0, onDone = null, onTick = null) {
    this.state = { label, duration, onDone, onTick, age: 0, t: 0, elapsed: false };
    this.time = 0;
    if (label === 'waitForTarget') {
      this.target = null;
      this.cursor = null;
      this.fingerDown = false;
      this.lastTouch = null;
      this.otherBoard.ready = true;
      this.otherBoard.cursor = null;
    }
    if (label === 'shootAnim') {
      this.otherBoard.ready = false;
    }
  }

  work(dt, time) {
    this.time = time;
    // State machine
    if (this.state.duration) {
      this.state.age += dt;
      this.state.t = Math.min(1, this.state.age / this.state.duration);
      if (this.state.t >= 1 && !this.state.elapsed) {
        this.state.elapsed = true;
        if (this.state.onDone) this.state.onDone();
      } else if (this.state.onTick) {
        this.state.onTick(this.state.t);
      }
    }

    // Mode 1: Drag-to-drop targeting
    if (this.state.label === 'waitForTarget') {
      // Show green border
      this.otherBoard.ready = true;
      // Show cursor if finger is down and in range
      if (this.fingerDown && this.cursor && this._inRange(this.cursor)) {
        this.otherBoard.cursor = this.cursor;
      } else {
        this.otherBoard.cursor = null;
      }
    }
    // Mode 2: Shoot animation
    if (this.state.label === 'shootAnim') {
      // Animate missile, then call onShotDone
      // (Animation handled by board/FX, just wait duration)
    }
  }

  onTouch(event) {
    // Only handle input in waitForTarget mode
    if (this.state.label !== 'waitForTarget') return;
    if (event.action === 'down') {
      this.fingerDown = true;
      if (event.x != null && event.y != null && this._inRange([event.x, event.y])) {
        this._dragActive = true;
        this.cursor = [event.x, event.y];
        this.lastTouch = [event.x, event.y];
      } else {
        this._dragActive = false;
        this.cursor = null;
      }
    } else if (event.action === 'drag') {
      this.fingerDown = true;
      if (this._dragActive && event.x != null && event.y != null) {
        this.cursor = [event.x, event.y];
        this.lastTouch = [event.x, event.y];
      }
    } else if (event.action === 'end' || event.action === 'up' || event.action === 'cancel') {
      this.fingerDown = false;
      if (this._dragActive && this.cursor && this._inRange(this.cursor)) {
        this.target = this.cursor;
        this.gotoState('shootAnim', 1.5, () => this._onShotDone());
        this.otherBoard.lock = this.target;
        this.otherBoard.cursor = null;
      } else {
        // Stay in waitForTarget mode, clear cursor and drag state
        this.cursor = null;
        this._dragActive = false;
        this.otherBoard.cursor = null;
      }
    }
  }

  _inRange(pos) {
    // Accept only integer 0-9 for both x and y
    if (!pos || pos.length !== 2) return false;
    const [x, y] = pos;
    return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < 10 && y >= 0 && y < 10;
  }

  _onShotDone() {
    // Actually perform the shot
    this.otherBoard.hudOff && this.otherBoard.hudOff();
    // Send missile effect event (for FX system)
    if (this._node && this._node.sendEvent) {
      this._node.sendEvent('missile', {
        fromIndex: this.playerId,
        toIndex: this.otherPlayerId,
        target: this.target,
      });
    }
    // Wait for missile flight, then land
    this.gotoState('flyMissile', 1.5, () => this._onMissileLanded());
  }

  _onMissileLanded() {
    this.otherBoard.hudOff && this.otherBoard.hudOff();
    this.game.shoot(this.otherPlayerId, this.target);
    // Find the shot result from the board's data
    let shot = this.otherBoard.data.shots[this.otherBoard.data.shots.length - 1];
    let cell = (shot != null) && this.otherBoard.extra.cells[shot];
    let hit = cell && cell.hit;
    // Send landed event for splash/explosion
    if (this._node && this._node.sendEvent) {
      this._node.sendEvent('landed', {
        fromIndex: this.playerId,
        toIndex: this.otherPlayerId,
        target: this.target,
        hit,
      });
    }
    // Wait a bit, then finish turn
    this.gotoState('postShot', 0.5, () => this._onAllDone());
  }

  _onAllDone() {
    this.otherBoard.hudOff && this.otherBoard.hudOff();
    if (this.doneCallback) {
      this.doneCallback();
      this.doneCallback = null;
    }
  }

  draw(ctx) {
    // Optionally: draw custom visuals for drag, missile, etc.
  }
}