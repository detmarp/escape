import Container from './container.js';
import GoToScreen from './gotoscreen.js';
import UxElement from './uxelement.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
    this.container = new Container(this.parent);
    this.goto = new GoToScreen(this);
  }

  async run() {
    this.container.run();

    this.container.onResize = () => this._onResize();

    this.outer = (new UxElement(this.container.outer)).testFill(undefined, { });

    this.goto.to('main');

    this._onResize();
  }

  _onResize() {
    this.goto.update();
    this.outer.update();
  }
}