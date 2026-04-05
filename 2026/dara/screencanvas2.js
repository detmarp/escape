import Boreal from '../boreal/boreal.js';
import Ux2 from './ux2.js';

export default class ScreenCanvas2 {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
    this.ux = new Ux2(this.parent);
  }

  init() {
    ScreenCanvas2.count++;
    new Boreal(this.parent);

    this.ux.div({
      type: 'h1',
      text: 'Canvas Game 2'
    });

    this.ux.div({
      type: 'button',
      text: 'main',
      onclick: () => this.params.program.goto('main')
    });

    this.info = this.ux.cornerInfo({
      parent: this.parent,
    });

  }

  term() {}

  work(dt, time, frame) {
    this.info.update({
      text: [
        `count: ${ScreenCanvas2.count}`,
        `frame: ${frame}`,
        `time: ${time.toFixed(3)}`,
        `dt: ${dt.toFixed(3)}`
      ].join('\n')
    });
  }
}