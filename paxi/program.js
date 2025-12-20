import Container from "./container.js";
import Controller from "./controller.js";

export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this.parent.innerHTML = '';
    this.container = new Container(this.parent, 3/4);

    this.controller = new Controller(this, this.container);

    this._animate();
  }

  _work() {
    this.container.work();
    this.controller.work();
  }

  _animate(callback) {
    this._work();
    const loop = () => {
      this._work();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}