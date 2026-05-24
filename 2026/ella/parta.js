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
      this._drawPip(ctx, p);
    }
  }

  _calcAlpha(p) {
    let alpha = 1.0;
    if (p.alpha != null) {
      alpha *= p.alpha;
    }

    if (p.fadef != null) {
      let t = p.t;
      if (t == null && p.ttl != null) {
        t = p.age / p.ttl;
      }
      if (t != null) {
        const threshold = Math.max(0, Math.min(1, p.fadef));
        if (t >= threshold) {
          alpha *= (1 - t) / (1 - threshold);
        }
      }
    }
    else if (p.fade != null && p.ttl != null) {
      const fadeStart = Math.max(0, p.fade);
      if (p.age >= fadeStart) {
        const remain = p.ttl - p.age;
        const fadeDuration = p.ttl - fadeStart;
        if (fadeDuration > 0) {
          alpha *= remain / fadeDuration;
        }
      }
    }

    alpha = Math.max(0, Math.min(1, alpha));
    return alpha;
  }

  _drawPip(ctx, p) {
    let alpha = this._calcAlpha(p);
    let useAlpha = alpha < 1;

    if (useAlpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
    }

    if (p.flip) {
      let f = p.f || 0;
      let s = p.strip[f];
      this.sprites.drawSprite(ctx, s, p.x, p.y, 1);
    }
    else if (p.still) {
      let s = p.strip[p.frame];
      this.sprites.drawSprite(ctx, s, p.x, p.y, 1);
    }
    else if (true) {
      ctx.fillStyle = p.color || '#f80';
      let hs = (p.size || 2) / 2;
      ctx.fillRect(p.x - hs, p.y - hs, hs * 2, hs * 2);
    }

    if (useAlpha) {
      ctx.restore();
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
    let p = this._instantiatePrefab(prefab, params);

    // if p.immediate then update it and don't add
    if (p) {
      let doAdd = true;
      if (p.oneShot) {
        this._updatePip(p, 0);
        doAdd = false;
      }
      if (doAdd) {
        this.particles.push(p);
      }
    }

    return p;
  }

  _instantiatePrefab(prefab, params) {
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

    if (p.strip) {
      p.strip = this.sprites.strips[p.strip];
    }

    let children = p.children;
    if (children) {
      delete p.children;
      for (const child of children) {
        this._subSpawn(child, p);
      }
    }

    this._sampler(p);

    if (p.strip && p.frame === 'pick') {
      p.frame = Math.floor(Math.random() * p.strip.length);
      p.still = true;
      return p;
    }

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
    const strip = this.sprites.strips[prefab.sprite];
    if (strip && strip.length > 0) {
      const frameCount = strip.length;
      let x = params.x || 0;
      let y = params.y || 0;
      p.id = prefab.sprite;
      p.x = x;
      p.y = y;
      // Only set ttl if not already set
      if (p.ttl == null) {
        let fps = params.fps || 12;
        p.fps = fps;
        p.ttl = (fps > 0) ? (frameCount / fps) : null;
      }
      // Only set fps if not already set and ttl is present
      if (p.fps == null && p.ttl != null) {
        p.fps = frameCount / p.ttl;
      }
      p.f = 0;
      return p;
    }
    // No valid strip: don't set fps/ttl, just assign id/x/y, and leave ttl as null unless explicitly set
    p.id = prefab.sprite;
    p.x = params.x || 0;
    p.y = params.y || 0;
    // Do not set ttl here; only use what was in prefab or params
    return p;
  }

  _sampler(obj) {
    // interpret value ranges on obj
    let rangeKeys = ['dx', 'dy', 'ttl']
    for (const key of rangeKeys) {
      const val = obj[key];
      if (Array.isArray(val)) {
        let [a, b] = val;
        obj[key] = Math.random() * (b - a) + a;
      }
    }
    let pickKeys = ['color']
    for (const key of pickKeys) {
      const val = obj[key];
      if (Array.isArray(val)) {
        obj[key] = val[Math.floor(Math.random() * val.length)];
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

  _randomSaturatedColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 80%)`;
  }

  _updatePips(list, dt) {
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      this._updatePip(p, dt);
      if (p.kill) {
        list.splice(i, 1);
      }
    }
  }

  _updatePip(p, dt) {
    p.age += dt;
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
      return;
    }
    p.x += p.dx * dt;
    p.y += p.dy * dt;
    p.dx += p.ax * dt;
    p.dy += p.ay * dt;
    this._subSpawn(p.spawn, p);
    if (p.onPulse) {
      this._subSpawn(p.onPulse.spawn, p);
    }
  }

  _subSpawn(spawn, emitter) {
    if (spawn) {
      let count = spawn.count || 1;
      for (let i = 0; i < count; i++) {
        let params = {
          x: emitter.x,
          y: emitter.y,
        };

        let optionals = ['dx', 'dy', 'ay'];
        for (const key of optionals) {
          if (spawn[key] !== undefined) {
            params[key] = spawn[key];
          }
        }

        this.spawnPrefab(spawn.prefab, params);
      }
    }
  }
}
