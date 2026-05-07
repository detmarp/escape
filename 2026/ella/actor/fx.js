import PartA from '../parta.js';

function _rand(n) {
  return Math.floor(Math.random() * n);
}

function _randf(a, b) {
  return a + Math.random() * (b - a);
}

export default class Fx {
  constructor() {
    this.data = null;
    this.loaded = false;
    this._loadData();
    this.partA = new PartA();
  }

  async _loadData() {
    try {
      const response = await fetch('data/particle.json');
      if (!response.ok) {
        throw new Error(`Failed to load particle data: ${response.status}`);
      }
      this.data = await response.json();
      this._parseData();
      this.loaded = true;
    } catch (error) {
      console.error('Failed to load particle data:', error);
    }
  }

  _parseData() {
    // TODO: Parse emitter templates from this.data
  }

  added() {
    let p = this.partA._tempAddStaticFrame('fire', 0);
    p.ttl = null;
  }

  init() {
  }

  work(dt, time, frame) {
    const names = ['smoke', 'splash', 'explosion', 'fire', 'shrapnel', 'sparks', 'smoke2'];
    this.partA._tempAddSpark(180, 500);
    this.partA.work(dt);
    this.thing = this.thing || {
      i: 0,
      tick: 0,
    };
    this.thing.tick += dt;
    if (this.thing.tick > 0.1) {
      this.thing.tick = 0;
      let n = this.thing.i % 100;
      let name = names[this.thing.i % names.length];
      this.thing.i++;
      let x = n % 10;
      let y = Math.floor(n / 10);
      let px = x * 24 + 12 + 60;
      let py = y * 24 + 12 + 20;
      let p = this.partA._tempMakeFlipOnce(name, 12, px, py);
    }
  }

  draw(ctx) {
    this.partA.draw(ctx);
  }
}