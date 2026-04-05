import Boreal from '../boreal/boreal.js';
import Ux2 from './ux2.js';

export default class ScreenMain {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
    this.ux = new Ux2(this.parent);
  }

  init() {
    ScreenMain.count++;
    new Boreal(this.parent);

    this.ux.div({
      type: 'h1',
      text: 'Main'
    });

    let menu = this.ux.stack({gap: 4});

    const menuItems = ['home', 'settings', 'demo', 'test', 'setup'];
    for (const name of menuItems) {
      this.ux.div({
        parent: menu,
        type: 'button',
        text: name,
        onclick: () => this.params.program.goto(name)
      });
    }

    this.info = this.ux.cornerInfo({
      parent: this.parent,
    });
  }

  term() {}

  work(dt, time, frame) {
    this.info.update({
      text: [
        `count: ${ScreenMain.count}`,
        `frame: ${frame}`,
        `time: ${time.toFixed(3)}`,
        `dt: ${dt.toFixed(3)}`
      ].join('\n')
    });
  }
}