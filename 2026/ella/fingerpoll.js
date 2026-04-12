// This class handles incoming MyTouch events, and filters them to
// single-finger actions, pushed to a queue for polling.

export default class FingerPoll {
  constructor() {
    this.events = [];
  }

  onMyTouchEvent(touches, type) {
    // translate from MyTouch multi-touch event, to single-finger event
    // actions: down, drag, tap, drop, up, cancel, end

    let t = {
      touches: touches,
      type: type,
    };
    //console.log(`fff Touch event: ${JSON.stringify(t)}`);
    let now = Date.now();

    if (touches.length > 1) {
      this._cancel();
      return;
    }

    if (this.cancelled) {
      if (touches.length > 0) {
        return;
      }
      this.cancelled = null;
    }

    if (type === 'start') {
      this.dragging = null;
      this.cancelled = null;
      this.startTime = now;
      this.start = [...touches[0].start];
      this.events.push({ action: 'down', position: this.start, }
      );
    }
    if (this.start) {
      let position = touches.length ? [...touches[0].end] : [0, 0];
      if (type === 'move') {
        this.dragging = true;
        this.events.push({ action: 'drag', position: position, start: this.start });
      }
      if (type === 'end') {
        if (this.dragging) {
          this.events.push({ action: 'drop', position: position, start: this.start });
          this.dragging = null;
        }
        else {
          if (now - this.startTime < 400) {
            this.events.push({ action: 'tap', position: touches[0].start });
          }
        }
        this.events.push({ action: 'up', position: position });
        this.events.push({ action: 'end' });
        this.start = null;
      }
    }
    if (type === 'none') {
      this._cancel();
      this.cancelled = null;
    }
  }

  _cancel() {
    if (!this.cancelled) {
      if (this.start) {
        this.events.push({ action: 'cancel' });
        this.events.push({ action: 'end' });
        this.start = null;
      }
      this.dragging = null;
      this.cancelled = true;
    }
  }

  getNext() {
    if (this.events.length === 0) {
      //console.log(`ggg0`);
      return null;
    }
    let e = this.events.shift();
    //console.log(`ggg getNext: ${JSON.stringify(e)}`);
    return e;
  }
}