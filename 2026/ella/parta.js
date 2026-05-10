import SpriteA from './spritea.js';

export default class PartA {
  constructor() {
    this.sprites = new SpriteA('data/sheet01');
    this.frame = 0;
    this.particles = [];
    this.prefabs = {};
    this._id = 0;
    this.debug = true;
  }

  work(dt) {
    this.frame++;

    this._updatePips(this.particles, dt);
  }

  draw(ctx) {
    if (this.debug) {
      // debug text particle count
      ctx.fillStyle = '#333';
      ctx.fillRect(1, 1, 26, 13);
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(`${String(this.particles.length).padStart(4, ' ')}`, 3, 11);
    }

    for (const p of this.particles) {
      if (p.flip) {
        let f = p.f || 0;
        let s = p.strip[f];
        this.sprites.drawSprite(ctx, s, p.x, p.y, 1);
        continue;
      }

      if (true) {
        ctx.fillStyle = p.color || '#f80';
        ctx.fillRect(p.x - 6, p.y - 6, 12, 12);
        continue
      }

      if (p.spark === 'yes') {
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

      if (p.flip) {
        let f = p.f || 0;
        this.sprites.drawFrame(ctx, p.id, f, p.x, p.y, 1);
      }
      if (p.sprite) {
        // just draw magenta 8x8 rect centered here
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(p.x - 4, p.y - 4, 8, 8);
      }
    }
  }

  async loadData(dataPath) {
    const response = await fetch(dataPath);
    if (!response.ok) {
      throw new Error(`Failed to load particle data: ${dataPath} (${response.status})`);
    }
    const data = await response.json();
    this._parseData(data);
  }

  spawnPrefab(name, params = {}) {
    const prefab = this.prefabs[name];
    return this._spawnPrefab(prefab, params);
  }

  _spawnPrefab(prefab, params) {
    if (!prefab) {
      return;
    }

    let defaults = {
      x: 0, y: 0,
      dx: 0, dy: 0,
      ax: 0, ay: 0,
    };
    let inits = {
      age: 0,
    };
    let p = { ...defaults, ...prefab, ...params, ...inits };
    this.particles.push(p);

    if (p.strip) {
      p.strip = this.sprites.strips[p.strip];
    }

    this._sampler(p, ['dx', 'dy', 'ttl']);

    let flipOnce = p.strip && (p.ttl || p.fps);
    if (flipOnce) {
      p.flip = true;
      p.f = 0;
      if (p.fps) {
        p.ttl = (p.fps > 0 && p.strip.length > 0) ? (p.strip.length / p.fps) : null;
      }
      else if (p.ttl) {
        p.fps = p.strip.length / p.ttl;
      }
      return p;
    }

    if (prefab.details == '1confetti') {
      // HERE ---------------------------
      p.spark = 'yes';
      p.x = params.x || 0;
      p.y = params.y || 0;
      p.dx = [-20, 20];
      p.dy = [-420, -380];
      p.ay = 200;
      p.ttl = [2.8, 3.2];
      p.color = this._randomSaturatedColor();
      return p;
    }
    if (prefab.type == 'emitter') {
      p.details = prefab.details;
      p.x = params.x || 0;
      p.y = params.y || 0;
      return p;
    }

    const strip = this.sprites.strips[prefab.sprite];
    if (!strip) {
      return p;
    }
    const frameCount = strip ? strip.length : 0;
    let x = params.x || 0;
    let y = params.y || 0;
    let fps = params.fps || 12;

    p.id = prefab.sprite;
    p.x = x;
    p.y = y;
    p.ttl = (fps > 0 && frameCount > 0) ? (frameCount / fps) : null;
    p.fps = fps;
    p.f = 0;
    //p.flip = true;
    return p;
  }

  _sampler(obj, keys) {
    // interpret value ranges on obj
    for (const key of keys) {
      const val = obj[key];
      if (typeof val === 'number') {
        continue;
      }
      if (Array.isArray(val)) {
        let [a, b] = val;
        obj[key] = Math.random() * (b - a) + a;
      }
    }
  }

  _parseData(data) {
    if (!data.prefabs) return;
    for (const prefab of data.prefabs) {
      prefab._id = this._id++;
      this.prefabs[prefab._id] = prefab;
      if (prefab.name) {
        this.prefabs[prefab.name] = prefab;
      }
    }
  }

  _tempAddStaticFrame(id, frame) {
    let p = this._makePip(this.particles);
    p.sprite = id;
    p.frame = frame;
    return p;
  }

  _tempAddSpark(x, y) {
    const p = this._makePip(this.particles);
    p.spark = 'yes';
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
      if (p.details == 'sparks') {
        // emitter emits something
        this.spawnPrefab('confetti', { x: 180, y: 500 });
      }

      if (p.flip && p.fps != null) {
        const strip = p.strip;
        if (strip && strip.length > 0) {
          p.f = Math.min(Math.floor(p.age * p.fps), strip.length - 1);
        }
      }
      if (p.ttl !== null) {
        p.t = p.age / p.ttl;
        if (p.t >= 1) {
          p.t = 1;
          p.kill = true;
        }
      }
      if (p.kill) {
        list.splice(i, 1);
        continue;
      }
      p.x += p.dx * dt;
      p.y += p.dy * dt;
      p.dx += p.ax * dt;
      p.dy += p.ay * dt;

      if (p.pulse) {
        if (p.pulse.func === "spawn") {
          this.spawnPrefab(p.pulse.params.prefab, { x: p.x, y: p.y });
        }
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
      //ttl: 1,
      age:0,
    };
    if (list) {
      list.push(s);
    }
    return s;
  }
}
