export default class Timer {
  constructor(duration, callback) {
    this.duration = duration;
    this.callback = callback;
  }

  added() {
    this._node.ttl = this.duration;
  }

  term() {
    if (this.callback) {
      this.callback();
    }
  }
}