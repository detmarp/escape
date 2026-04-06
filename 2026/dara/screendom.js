import Boreal from '../boreal/boreal.js';
import Ux2 from './ux2.js';
import Celest from '../celest/celest.js';

export default class ScreenDom {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
  }

  init() {
    ScreenDom.count++;

    this.celest = new Celest(this.parent, 360, 640);
    this.celest.init();

    this.celest.outer.style.backgroundColor = '#8B4A8B';
    this.celest.inner.style.backgroundColor = '#F5F5DC';

    this.ux = new Ux2(this.celest.inner);

    this.header = this.ux.header({
      parent: this.celest.inner,
    });
    Object.assign(this.header.style, {
      position: 'absolute',
      left: 'calc(0 * var(--logic-w, 1px))',
      top: 'calc(0 * var(--logic-h, 1px))',
      width: 'calc(360 * var(--logic-w, 1px))',
      height: 'calc(20 * var(--logic-h, 1px))'
    });

    this.bottom = this.ux.div({
      parent: this.celest.inner
    });
    Object.assign(this.bottom.style, {
      position: 'absolute',
      left: 'calc(0 * var(--logic-w, 1px))',
      top: 'calc(20 * var(--logic-h, 1px))',
      width: 'calc(360 * var(--logic-w, 1px))',
      height: 'calc(620 * var(--logic-h, 1px))'
    });

    new Boreal(this.bottom);
    this.bottomUx = new Ux2(this.bottom);

    this.info = this.bottomUx.cornerInfo({
      parent: this.bottom,
    });

    this.bottomUx.text2({
      size: [100, 160],
      position: [10, 190],
      text: `Dom`,
    });

    this.bottomUx.button2({
      size: [100, 100],
      position: [10, 380],
      text: 'Main',
      onclick: () => this.params.program.goto('main'),
    });

  }

  term() {
    if (this.celest) {
      this.celest.term();
    }
  }

  work(dt, time, frame) {
    this.info.update({
      text: [
        `count: ${ScreenDom.count}`,
        `frame: ${frame}`,
        `time: ${time.toFixed(3)}`,
        `dt: ${dt.toFixed(3)}`
      ].join('\n')
    });
  }
}