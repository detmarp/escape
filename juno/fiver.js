import FiverState from './fiverstate.js';

export default class Fiver {
  constructor() {
    this.state = new FiverState();
  }

  doRoll() {
    if (this.state.roll < 3) {
      for (let i = 0; i < 5; i++) {
        if (!this.state.hold || !this.state.hold[i]) {
          this.state.dice[i] = 1 + Math.floor(Math.random() * 6);
        }
      }
      this.state.roll++;
    }
  }
}
