import Ux from './ux.js';

export default class Screen2 {
  // static count
  static count = 0;

  constructor(parent, program, params = {}) {
    this.parent = parent;
    this.program = program;
    this.params = params;
    Screen2.count++;
  }

  init() {
    this.parent.innerHTML = '';
    this.div = Ux.screen2({
      parent: this.parent,
      text: 'Screen2',
    });
    this.header = Ux.header2({
      parent: this.div,
      buttons: [
        { text: 'Restart', onClick: () => this.program.gotoScene() },
        { text: 'Save', onClick: () => console.log('aaa B') },
        { text: 'New game', onClick: () => console.log('aaa C') },
        { text: 'Load test 1', onClick: () => console.log('aaa D') },
        { text: 'Load test 2', onClick: () => console.log('aaa E') },
      ],
    });
    Ux.hr({ parent: this.div });
    this.saveArea = Ux.text1({
      parent: this.div,
      text: `${JSON.stringify(this.program.persist.data)}`,
    });

    this._updateScreen();

    this.lastFrameTime = performance.now();
    this.frame = 0;
    this.loop();
  }

  term() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  loop() {
    const now = performance.now();
    let dt = (now - this.lastFrameTime) / 1000;
    if (dt > 0.01) {
      dt = Math.min(dt, 0.2);
      this.lastFrameTime = now;
      this.work(dt);
      this.draw();
    }
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  work(dt) {
    this.dt = dt;
    this.frame++;
  }

  draw() {
    this._updateScreen();
  }

  _updateScreen() {
    let params = {
      frame: this.frame,
      dt: this.dt,
      count: Screen2.count,
    };
    this.header.redraw(params);
  }
}
