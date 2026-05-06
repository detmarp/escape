import SpriteA from './spritea.js';

export default class PartA {
  constructor() {
    this.sprites = new SpriteA('data/sheet01');
    this.frame = 0;
    this.particles = [];
  }

  /*
  temp = different kinds of particles
  * colored rect, with ttl and possible fade
  * a single sprite/frame
  * a single sprite, random from from flipbook
  * a flipbook sprite, that runs once and dies
  * a cycling flipbook sprite
  * pick a random flipbook from a list
  */

  work(dt) {
    this.frame++;

    this._updatePips(this.particles, dt);
  }

  draw(ctx) {
    this._tempDrawFire(ctx);
    this._tempDrawSparks(ctx);

    for (const p of this.particles) {
      if (p.sprite) {
        // just draw magenta 8x8 rect centered here
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
      }
    }

    function _x(x) { return 60 + x * 24 + 12; }
    function _y(y) { return 320 + y * 24 + 12; }
    this._tempDrawFrames(ctx, 'smoke', _x(0), _y(0));
    this._tempDrawFrames(ctx, 'splash', _x(1), _y(0));
    this._tempDrawFrames(ctx, 'explosion', _x(2), _y(0));
    this._tempDrawFrames(ctx, 'fire', _x(3), _y(0));
    this._tempDrawFrames(ctx, 'shrapnel', _x(4), _y(0));
    this._tempDrawFrames(ctx, 'sparks', _x(5), _y(0));
    this._tempDrawFrames(ctx, 'smoke2', _x(6), _y(0));
  }

  _tempDrawFrames(ctx, id, x, y) {
    let s = this.sprites.sprites[id];
    if (!s) return;
    let f = Math.floor(this.frame / 6) % s.length;
    this.sprites.draw(ctx, id, x, y, 1, f);
  }

  _tempAddStaticFrame(id, frame) {
    let p = this._makePip(this.particles);
    p.sprite = id;
    p.frame = frame;
    return p;
  }

  _tempDrawFire(ctx) {
    if (!this.sprites.loaded || this.sprites.flat.length === 0) {
      return;
    }
    let i = Math.floor(this.frame / 10) % this.sprites.flat.length;
    this.sprites._drawEntry(ctx, this.sprites.flat[i], 48, 48, 1);
  }

  _tempDrawSparks(ctx) {
    for (const p of this.particles) {
      let alpha = 1.0;
      if (p.ttl !== null) {
        const lifeRatio = p.age / p.ttl;
        if (lifeRatio > 0.8) {
          alpha = 1.0 - (lifeRatio - 0.8) / 0.2;
        }
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      ctx.restore();
    }
  }

  _tempAddSpark(x, y) {
    const p = this._makePip(this.particles);
    p.x = x;
    p.y = y;
    p.dx = (Math.random() - 0.5) * 40;
    p.dy = -400 + (Math.random() - 0.5) * 80;
    p.ay = 200;
    p.ttl = 2.8 + Math.random() * 0.4;
    p.color = this._randomSaturatedColor();
  }

  _randomSaturatedColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 80%)`;
  }

  _updatePips(list, dt, func) {
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.age += dt;
      if (p.kill || (p.ttl !== null && p.age > p.ttl)) {
        list.splice(i, 1);
        continue;
      }
      p.x += p.dx * dt;
      p.y += p.dy * dt;
      p.dx += p.ax * dt;
      p.dy += p.ay * dt;
      if (func) {
        func(p);
      }
    }
  }

  _makePip(list) {
    let s = {
      x:0, y:0,
      dx: 0, dy: 0,
      ax: 0, ay:0,
      color: '#fff',
      alpha: 1,
      ttl: 1,
      age:0,
    };
    if (list) {
      list.push(s);
    }
    return s;
  }
}
