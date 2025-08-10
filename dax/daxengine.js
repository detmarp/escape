import DaxRenderer from './daxrenderer.js';
import DaxScene from './daxscene.js';

export default class DaxEngine {
  constructor() {
    this.renderer = new DaxRenderer();
    this.scene = new DaxScene();
    this.time = 0;
    this.dt = 1/60;
    this.startTime = null;
    this.isRunning = false;
  }

  init(canvas) {
    this.renderer.init(canvas);
  }

  start() {
    this.isRunning = true;
    this.gameLoop();
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.work();
    this.draw();

    requestAnimationFrame(() => this.gameLoop());
  }

  work() {
    const now = performance.now();
    if (this.startTime === null) {
      this.startTime = now;
      this.time = 0;
      this.lastTime = 0;
    } else {
      const newTime = (now - this.startTime) / 1000;
      this.dt = newTime - this.time;
      this.time = newTime;
    }
    let c = this.scene.find("cube");
    if (c) {
      if (typeof c.yrot === 'undefined') {
        c.yrot = 0;
      }
      c.yrot += this.dt;
    }
  }

  draw() {
    this.renderer.render(this.scene);
  }

}
