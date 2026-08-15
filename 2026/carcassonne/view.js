import Sprites from './sprites.js';
import Finger from './finger.js';

class Random {
  constructor(seed) {
    this.seed = Math.floor(Math.abs(seed));
  }

  next(n) {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return Math.floor(this.seed / 233280 * n);
  }
}


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

    this.drag = [];
  }

  start() {
    this.running = true;
    this.lastFrameTime = performance.now();
    this.raf();
  }

  raf() {
    const now = performance.now();
    let dt = (now - this.lastFrameTime) / 1000;

    if (dt > 0.0) {
      this.lastFrameTime = now;
      dt = Math.min(dt, 0.1);
      this.work(dt);
      this.draw();
    }
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
    let [dx, dy] = [0, 0];
    if (this.finger.dragging) {
      [dx, dy] = [this.finger.dx / dt, this.finger.dy / dt];
      console.log(`ddd0 ${dx},${dy}`);
      if (this.drag.length > 2) {
        this.drag.shift();
      }
      this.drag.push([dx, dy]);
    }

    if (this.finger.isIdle) {
      if (this.drag.length > 0) {
        console.log(`ddd1 drag ${this.drag}`);
        this.inertia = this.drag.reduce((acc, [dx, dy]) => {
          return [acc[0] + dx, acc[1] + dy];
        }, [0, 0]);
        this.inertia = [this.inertia[0] / this.drag.length, this.inertia[1] / this.drag.length];
        console.log(`ddd2 inertia ${this.inertia}`);
        this.drag = [];
      }
      if (this.inertia) {
        dx = this.inertia[0] * dt;
        dy = this.inertia[1] * dt;
      }
    }
    else {
      this.inertia = null;
    }

    this.cameraX = this.finger.x;
    this.cameraY = this.finger.y;
    this.zoom = 1;

    this._rebuildBoard();
  }

  draw() {
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.scale(this.zoom, this.zoom);

    for (let key in this.board) {
      let tile = this.board[key];
      let col = tile.col;
      let row = tile.row;
      this.ctx.save();
      this.ctx.translate(col * this.sprites.tileSize - this.cameraX, row * this.sprites.tileSize - this.cameraY);
      let rand = new Random(col * 1000 + row);
      let n = rand.next(64);
      let r = rand.next(4);
      this.sprites.draw(this.ctx, n, r);
      this.ctx.restore();
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

  _rebuildBoard() {
    this.board ||= {};
    let missing = null;

    let topleft = this._deviceToTile([0, 0]);
    let bottomright = this._deviceToTile([this.canvas.width, this.canvas.height]);

    let padding = 1;
    let left = Math.ceil(topleft[0]) - padding;
    let right = Math.floor(bottomright[0]) + padding;
    let top = Math.ceil(topleft[1]) - padding;
    let bottom = Math.floor(bottomright[1]) + padding;

    let found = [];
    for (let row = top; row < bottom; row++) {
      for (let col = left; col < right; col++) {
        let key = `${col},${row}`;
        if (this.board[key]) {
          found.push(key);
        }
        else {
          this.board[key] = true;
          missing ||= [];
          missing.push({
            key: key,
            col: col,
            row: row,
          });
        }
      }
    }

    if (!missing && found.length == Object.keys(this.board).length) {
      return;
    }

    let newBoard = {};
    for (let key of found) {
      newBoard[key] = this.board[key];
    }
    if (missing) {
      for (let tile of missing) {
        newBoard[tile.key] = tile;
      }
    }
    console.log(`bbb ${found.length} ${missing?.length || 0} ${Object.keys(this.board).length}`);
    this.board = newBoard;
  }
}
