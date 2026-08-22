import SpaceCity from './spacecity.js';
import SpaceUtil from './spaceutil.js';

export default class SpaceGame {
  constructor() {
    this._id = 0;
    this.city = new SpaceCity(this);
    this.util = new SpaceUtil(this);
  }

  init(data) {
    this._id = data?.id || 0;
    this.data = { ...data.data || {} };
  }

  start(now) {
    this.now = now;
  }

  *update(now) {
    if (now <= this.now) {
      return;
    }

    let pending = [];//this._findPending(now);

    if (pending.length > 0) {
      console.log(`ppp0 pending: ${JSON.stringify(pending)}`);
      for (var p of pending) {
        console.log(`ppp1 pending: ${p.time - this.time} ${JSON.stringify(p)}`);
      }
      let mark = pending[0];
      if (mark.time <= now) {
        this.time = mark.time;
        pending.shift();
        // do mark
        if (mark.type === 'upgrade') {
          let event = {
            type: 'upgrade',
            id: mark.id,
          };
          this._doEvent(event);
          yield event;
        }
      }
    }

    if (!this.lastSecond || Math.floor(this.lastSecond / 10000) < Math.floor(now / 10000)) {
      yield* this._doAction({
        action: 'tick',
        time: now,
      });
    }

    this.now = now;
  }

  doCommand(command) {
    if (command.command === 'build') {
      let event = {
        type: 'build',
      };
      this._enqueueEvent(event, 10);
      return event;
    }
    return null;
  }

  _enqueueEvent(event, delay) {
    this.data.pending ||= [];
    this.data.pending.push({ event, time: this.now + delay * 1000 });
    this.data.pending.sort((a, b) => a.time - b.time);
    this.dirty = true;
  }

  *_doAction(action) {
    //console.log(`ddd Action: ${JSON.stringify(action)}`);
    if (action.action === 'tick') {
      this.lastSecond = action.time;
    }
    yield action;
  }
}