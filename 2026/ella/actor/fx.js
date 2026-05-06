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
    this.partA._tempAddSpark(180, 500);
    this.partA.work(dt);
    let n = (frame / 5) % 100;
    if (n % 1 < 0.1) {
      let x = n % 10;
      let y = Math.floor(n / 10);
      let p = this.partA._tempAddStaticFrame('fire', 0);
      p.x = x * 24 + 12 + 60;
      p.y = y * 24 + 12 + 20;
      p.ttl = 1;
    }
  }

  draw(ctx) {
    this.partA.draw(ctx);
  }
}