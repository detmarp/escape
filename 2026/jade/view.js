import MyTouch from './mytouch.js';

export default class View {
  constructor(root) {
    this.canvas = document.createElement('canvas');
    root.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.lastFrameTime = 0;
    this.frame = 0;
    this.myTouch = new MyTouch(this.canvas);
    this.myTouch.onChangeCallback = (touches, type) => {
      console.log(`ttt ${type}  ${JSON.stringify(touches)}`);
    }
  }

  start() {
    this.lastFrameTime = performance.now();
    this.loop();
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
    requestAnimationFrame(() => this.loop());
  }

  work(dt) {
    this.dt = dt;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.frame++;
  }

  draw() {
    this.ctx.fillStyle = this.frame % 2 ? '#ff0000' : '#0000ff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`frame ${this.frame}`, 8, 16);
    this.ctx.fillText(`dt ${this.dt.toFixed(4)}`, 8, 30);
    this.ctx.fillText(`canvas ${this.canvas.width},${this.canvas.height}`, 8, 44);
  }
}
