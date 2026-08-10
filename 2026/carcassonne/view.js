import Sprites from './sprites.js';
import finger from './finger.js';

export default class View {
  constructor(root) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    root.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.cameraX = 0;
    this.cameraY = 0;
    this.zoom = 1;

    this.lastFrameTime = 0;
    this.running = false;

    this.sprites = new Sprites();
  }

  start() {
    this.running = true;
    this.lastFrameTime = performance.now();
    this.raf();
  }

  raf() {
    const now = performance.now();
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    this.work(dt);
    this.draw();

    if (this.running) {
      requestAnimationFrame(() => this.raf());
    }
  }

  work(dt) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  draw() {
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(-this.cameraX, -this.cameraY);
    this.ctx.scale(this.zoom, this.zoom);

    const tileSize = this.sprites.tileSize;
    const cols = Math.ceil(this.canvas.width / (tileSize * this.zoom)) + 1;
    const rows = Math.ceil(this.canvas.height / (tileSize * this.zoom)) + 1;
    const startCol = Math.floor(this.cameraX / tileSize);
    const startRow = Math.floor(this.cameraY / tileSize);

    for (let row = startRow; row < startRow + rows; row++) {
      for (let col = startCol; col < startCol + cols; col++) {
        this.sprites.draw(this.ctx, col, row);
      }
    }

    this.ctx.restore();
  }
}
