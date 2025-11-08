import Container from './container.js';
import ScreenTest from './screentest.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
    this.container = new Container(this.parent);
  }

  async run() {
    this.container.run();

    this.container.onResize = () => this._onResize();

    this.screenTest = new ScreenTest(this.container);
    this.screenTest.run();

    this._onResize();
  }

  _onResize() {
    this.screenTest.update();
  }
}