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
    this.top = Ux.screen2({
      parent: this.parent,
      buttons: [
        { text: 'Restart', onClick: () => this.program.gotoScene() },
        { text: 'B', onClick: () => console.log('aaa B') },
        { text: 'C', onClick: () => console.log('aaa C') },
      ],
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
    this.top.redraw(params);
  }
}
