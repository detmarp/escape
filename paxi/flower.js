export default class Flower {
  constructor(parent, scale) {
    this.anims = [];
    this.id = 0;
  }

  work(dt) {
    let now = Date.now();
    this.lastTime = this.lastTime || now;
    dt = dt || (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (this.debug && this.anims.length > 0) {
      let info = {
        dt: Math.round(dt * 1000),
        time: this.lastTime,
        count: this.anims.length,
      };
      console.log(`Flower ${JSON.stringify(info)}`);
    }

    let kills = 0;
    for (let i = 0; i < this.anims.length; i++) {
      let anim = this.anims[i];
      this._step(anim, dt);
      if (anim.kill || anim.dead) {
        anim.dead = true;
        kills++;
      }
      if (this.debug) {
        let state = {...anim.state};
        console.log(`  anim ${i}: ${JSON.stringify(state)}`);
      }
    }
    if (kills > 0) {
      this.anims = this.anims.filter(a => !a.kill && !a.dead);
    }
  }

  addAnim(obj = null, params = {}) {
    let state = obj || {};
    state.id = this.id++;
    let anim = {
      ...params,
      state,
    };
    this.anims.push(anim);
    return anim;
  }

  endAnim(anim) {
    if (!anim.kill && !anim.dead) {
      let t = 1;
      this._stepT(anim, t);
    }
  }

  _step(anim, dt) {
    if (anim.kill || anim.dead) {
      return;
    }

    let duration = anim.duration || 1;
    anim.age = (anim.age || 0) + dt;
    let t = (anim.age / duration);
    this._stepT(anim, t);
  }

  _stepT(anim, t) {
    if (t >= 1) {
      anim.kill = true;
      t = 1;
    }
    let state = anim.state;
    state.t = t;
    let f = (typeof anim.f === 'function') ? anim.f(t) : () => t;
    let v = f(t);
    state.v = v;
    if (typeof anim.callback === 'function') {
      anim.callback(state, anim);
    }
  }
}
