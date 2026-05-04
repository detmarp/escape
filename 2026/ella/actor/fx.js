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
  }

  init() {
  }

  work(dt, time) {
    this.partA.work(dt);
  }

  draw(ctx) {
    this.partA.draw(ctx);
  }
}