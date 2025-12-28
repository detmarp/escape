import Flower from "./flower.js";

export default class Tweener {
  constructor() {
    this.flower = new Flower();
    this.flower.debug = true;
  }

  add(element, params = {}) {
    console.log(`ttt 000 ${JSON.stringify(params)}`);
    if (params.from && params.to) {
      this.flower.addAnim(null, {
        duration: params.duration || 0.5,
        from: params.from,
        to: params.to,
        callback: (state) => {
          let t = state.v;
          let p = [
            params.from[0] + (params.to[0] - params.from[0]) * t,
            params.from[1] + (params.to[1] - params.from[1]) * t,
          ];
          console.log(`qqq ${JSON.stringify(state)}, ${JSON.stringify(params)}, ${JSON.stringify(p)}`);
          element.update({ position: p });
        }
      });
    }
  }

  work(dt) {
    console.log(`ttt 1`);
    this.flower.work(dt);
  }
}