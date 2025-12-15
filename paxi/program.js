import Container from "./container.js";

export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this.parent.innerHTML = '';
    this.container = new Container(this.parent);

    this._animate();
  }

  _work() {
    this.container.work();
    this.container.draw();
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