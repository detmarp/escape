import Sprites from './sprites.js';
import Finger from './finger.js';

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
    this.windowSize = [window.innerWidth, window.innerHeight];

    this.lastFrameTime = 0;
    this.running = false;

    this.sprites = new Sprites();
    this.finger = new Finger(this.canvas);
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
    this.windowSize = [window.innerWidth, window.innerHeight];

    const w = window.innerWidth;
    const h = window.innerHeight;

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    this.finger.work(dt);
    this.cameraX = this.finger.x;
    this.cameraY = this.finger.y;
    this.zoom = 1;
  }

  draw() {
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.scale(this.zoom, this.zoom);

    let topleft = this._deviceToTile([0, 0]);
    console.log('topleft', topleft);
    let bottomright = this._deviceToTile([this.canvas.width, this.canvas.height]);

    for (let row = Math.ceil(topleft[1]); row < Math.floor(bottomright[1]); row++) {
      for (let col = Math.ceil(topleft[0]); col < Math.floor(bottomright[0]); col++) {
        this.ctx.save();
        this.ctx.translate(col * this.sprites.tileSize - this.cameraX, row * this.sprites.tileSize - this.cameraY);
        this.sprites.draw(this.ctx, col, row);
        this.ctx.restore();
      }
    }

    this.ctx.restore();
  }

  _deviceToTile(device) {
    const world = this._deviceToWorld(device);
    const tileSize = this.sprites.tileSize;
    return [world[0] / tileSize, world[1] / tileSize];
  }

  _deviceToWorld(device) {
    return [ (device[0] + this.cameraX) / this.zoom, (device[1] + this.cameraY) / this.zoom ];
  }
}
