import Board from './board.js';
import Boreal from '../boreal/boreal.js';
import Ux2 from './ux2.js';
import Celest from '../celest/celest.js';

export default class ScreenCanvas1 {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
  }

  init() {
    ScreenCanvas1.count++;

    this.celest = new Celest(this.parent, 360, 640);
    this.celest.init();

    this.celest.outer.style.backgroundColor = '#8B4A8B';
    this.celest.inner.style.backgroundColor = '#F5F5DC';

    this.ux = new Ux2(this.celest.inner);

    this.header = this.ux.header({
      parent: this.celest.inner,
      onhome: () => this.params.program.goto('main')
    });

    this.bottom = this.ux.div({
      parent: this.celest.inner,
      size: [360, 620],
      position: [0, 24],
    });

    new Boreal(this.bottom);

    this.board = new Board(this.bottom, {
      onclick: () => this.params.program.goto('main')
    });
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