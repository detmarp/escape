export default class Part1 {
  // parent: element
  // scale: optional string name of a scale var
  constructor(parent, scale) {
    this.parent = parent;
    this.scale = scale || '--part1-scale';
    this.max = 500;
    this.count = 0;
    this.nodes = [];
    this.pool = [];

    let div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = `calc(100px * var(${this.scale}, 1))`;
    div.style.height = `calc(100px * var(${this.scale}, 1))`;
    div.style.left = `calc(100px * var(${this.scale}, 1))`;
    div.style.top = `calc(100px * var(${this.scale}, 1))`;
    div.style.background = 'magenta';
    this.parent.appendChild(div);
    this.div = div;
    this.div.age = 0;

  }

  work(dt) {
    let now = Date.now();
    this.lastTime = this.lastTime || now;
    dt = dt || (now - this.lastTime);
    this.lastTime = now;

    // Update age
    this.div.age += dt;

    // Calculate pingpong position (0 to 540px, period 1s)
    const period = 2000; // ms
    const max = 540;
    const t = (this.div.age % period) / period;
    const pos = Math.abs((t * 2 - 1) * max);

    this.div.style.left = this.scale ? `calc(${pos}px * var(${this.scale}))` : `${pos}px`;
  }

  updateNode(node) {
  }

  create() {
  }

  kill(node) {
  }
}