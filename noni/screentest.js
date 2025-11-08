import UxElement from './uxelement.js';

export default class ScreenTest {
  constructor(container) {
    this.container = container;
  }

  run() {
    this.container.clear();

    this.outer = (new UxElement(this.container.outer)).testFill(undefined, { });
    this.inner = (new UxElement(this.container.inner)).testFill(undefined, { radius: this.container.u(10) });

    this.update();
  }

  update() {
    this.outer.update();
    this.inner.update();
  }
}
