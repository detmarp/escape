import Flower from "./flower.js";

export default class Tweener {
  constructor() {
    this.flower = new Flower();
    this.id = 0;
    this.flower.debug = true;
    this.tweens = {};
  }

  add(element, params = {}) {
    if (this.debug) {
      console.log(`Tweener add: ${JSON.stringify(params)}`);
    }
    let id = this.id++;
    if (element.tweenerId != null) {
      let tween = this.tweens[element.tweenerId];
      if (tween) {
        this._kill(tween);
      }
      delete this.tweens[element.tweenerId];
    }
    if (params.from && params.to) {
      let flow = this.flower.addAnim(null, {
        duration: params.duration || 0.5,
        from: params.from,
        to: params.to,
        callback: (state) => {
          let t = state.v;
          let p = [
            params.from[0] + (params.to[0] - params.from[0]) * t,
            params.from[1] + (params.to[1] - params.from[1]) * t,
          ];
          element.update({ position: p });
        }
      });
      let tween = {
        flow,
        id,
        element,
      };
      element.tweenerId = id;
      this.tweens[id] = tween;
    }
  }

  work(dt) {
    let count = Object.keys(this.tweens).length;
    if (count && this.debug) {
      console.log(`Tweener count: ${count}`);
    }

    this.flower.work(dt);

    // Remove dead tweens
    for (const id in this.tweens) {
      const tween = this.tweens[id];
      if (tween.flow.dead) {
        this._kill(tween);
      }
    }
  }

  _kill(tween) {
    if (tween.flow) {
      this.flower.endAnim(tween.flow);
    }
    if (tween.element.tweenerId != null) {
      delete tween.element.tweenerId;
    }
    if (this.tweens[tween.id]) {
      delete this.tweens[tween.id];
    }
  }
}