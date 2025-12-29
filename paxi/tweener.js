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

    this._checkEndElement(element);

    let callback = params.callback ||
      // default position tween callback
      ((state) => {
        let u = state.v;
        let ux = u;
        let uy = u;
        if (params.ufx) {
          ux = params.ufx(state.v);
        }
        if (params.ufy) {
          uy = params.ufy(state.v);
        }
        let p = [
          params.from[0] + (params.to[0] - params.from[0]) * ux,
          params.from[1] + (params.to[1] - params.from[1]) * uy,
        ];
        element.update({ position: p });
      });

    if (params.from && params.to) {
      let flow = this.flower.addAnim(null, {
        easing: params.easing,
        duration: params.duration || 0.5,
        from: params.from,
        to: params.to,
        callback,
      });
      let id = this.id++;
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

  _checkEndElement(element) {
    if (element.tweenerId != null) {
      let tween = this.tweens[element.tweenerId];
      if (tween) {
        this._kill(tween);
      }
      delete this.tweens[element.tweenerId];
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