import Boreal from '../../2026/boreal/boreal.js';
import Ux2 from '../ux2.js';

export default class ScreenTest {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
    this.ux = new Ux2(this.parent);
  }

  init() {
    ScreenTest.count++;
    new Boreal(this.parent);

    this.ux.div({
      type: 'h1',
      text: 'Test'
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
        `count: ${ScreenTest.count}`,
        `frame: ${frame}`,
        `time: ${time.toFixed(3)}`,
        `dt: ${dt.toFixed(3)}`
      ].join('\n')
    });
  }
}