import UxElement from './uxelement.js';

export default class ScreenTest {
  constructor(container) {
    this.container = container;
  }

  run() {
    this.container.outer.innerHTML = '';
    this.outer = (new UxElement(this.container.outer)).testFill();

    this.container.inner.innerHTML = '';
    this.inner = (new UxElement(this.container.inner)).testFill();

    this.update();
  }

  update() {
    this.outer.update();
    this.inner.update();
  }
}
