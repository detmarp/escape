import UxElement from './uxelement.js';

export default class ScreenTest {
  constructor(container) {
    this.container = container;
  }

  run() {
    this.update();
  }

  update() {
    // Clear and rebuild everything on each update
    this.container.clear();

    this.outer = (new UxElement(this.container.outer)).testFill(undefined, { });
    this.inner = (new UxElement(this.container.inner)).testFill(undefined, { radius: this.container.u(10) });

    (new UxElement(this.container.inner)).box(null, {
      x: this.container.u(100),
      y: this.container.u(100),
      width: this.container.u(400),
      height: this.container.u(400),
      radius: this.container.u(10),
    });
  }
}
