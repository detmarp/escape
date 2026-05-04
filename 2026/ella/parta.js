import SpriteA from './spritea.js';

export default class PartA {
  constructor() {
    this.sprites = new SpriteA('data/sheet00');
    this.frame = 0;
  }

  work(dt) {
    this.frame++;
  }

  draw(ctx) {
    if (!this.sprites.loaded || this.sprites.flat.length === 0) {
      return;
    }
    let i = Math.floor(this.frame / 10) % this.sprites.flat.length;
    this.sprites._drawEntry(ctx, this.sprites.flat[i], 48, 48, 1);
  }

}
