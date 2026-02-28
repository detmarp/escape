import Ux from './ux.js';
import MainLayout from './mainlayout.js';

export default class ScreenMain {
  constructor(parent = document.body, params = {}) {
    this.parent = parent;
    this.params = params;
  }

  init() {
    this.ux = new Ux();
    this._render();
    this.layout = new MainLayout(this.outer);
  }

  term() {
  }

  _render() {
    this.outer = this.ux.div({ parent: this.parent });
  }
}