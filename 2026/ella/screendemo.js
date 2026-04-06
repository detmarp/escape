import EllaBoard from './ellaboard.js';
import Boreal from '../boreal/boreal.js';
import Ux2 from './ux2.js';
import Celest from '../celest/celest.js';

export default class ScreenDemo {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
  }

  init() {
    ScreenDemo.count++;

    this.celest = new Celest(this.parent, 360, 640);
    this.celest.init();

    this.celest.outer.style.backgroundColor = '#456';
    this.celest.inner.style.backgroundColor = '#fdb';

    this.ux = new Ux2(this.celest.inner);

    this.header = this.ux.header({
      parent: this.celest.inner,
      onhome: () => this.params.program.goto('main')
    });

    this.bottom = this.ux.div({
      parent: this.celest.inner,
      size: [360, 580],
      position: [0, 30],
    });

    new Boreal(this.bottom);

    this.board = new EllaBoard(this.bottom, {
      onclick: () => this.params.program.goto('main')
    });
    this.board.init();

    this.footer = this.ux.div({
      size: [360, 30],
      position: [0, 610],
      border: `#222`,
    });
    this.ux.button2({
      size: [40,28],
      position: [0, 1],
      parent: this.footer,
      text: 'Run',
    });
    this.ux.button2({
      size: [40,28],
      position: [40, 1],
      parent: this.footer,
      text: 'Pause',
    });
    this.ux.button2({
      size: [40,28],
      position: [80, 1],
      parent: this.footer,
      text: 'Step',
    });
    this.ux.button2({
      size: [40,28],
      position: [120, 1],
      parent: this.footer,
      text: 'Undo',
    });
    this.ux.button2({
      size: [40,28],
      position: [160, 1],
      parent: this.footer,
      text: 'Restart',
    });

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