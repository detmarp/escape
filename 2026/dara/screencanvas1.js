import Board from './board.js';

export default class ScreenCanvas1 {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
  }

  init() {
    ScreenCanvas1.count++;

    this.board = new Board(this.parent);
    this.board.init();

  }

  term() {
    if (this.board) {
      this.board.term();
    }
  }

  work(dt, time, frame) {
    if (this.board) {
      this.board.update(dt, time, frame);
    }
  }
}