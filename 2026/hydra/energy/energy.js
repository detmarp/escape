import AutoCanvas from './autocanvas.js';
import NodeTree from './nodeTree.js';

export default class Energy {
  static instance = null;

  static create(params = {}) {
    if (Energy.instance) {
      return Energy.instance;
    }
    return new Energy(params);
  }

  static get frame() {
    return Energy.instance?.frame ?? 0;
  }

  static get time() {
    return Energy.instance?.time ?? 0;
  }

  constructor(params = {}) {
    this.frame = 0;
    this.time = 0;
    this.lastTime = performance.now();
    this.canvas = AutoCanvas.setFullscreenCanvas(params.parentElement);
    this.tree = new NodeTree();
    this.tree.setCanvas(this.canvas);
  }

  run() {
    this._running = true;
    this._loop();
  }

  stop() {
    this._running = false;
  }

  _loop() {
    if (!this._running) return;
    requestAnimationFrame(() => this._loop());
    this._tick();
  }

  _tick() {
    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt < 0.01) return;
    dt = Math.min(dt, 0.1);
    this.frame++;
    this.time += dt;

    this.canvas.resize();

    // const ctx = this.canvas.getContext('2d');
    // let color = this.frame % 2 === 0 ? '#fa0' : '#fc0';
    // ctx.fillStyle = color;
    // ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.tree.update(dt);
  }
}