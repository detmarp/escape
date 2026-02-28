import Ux from './ux.js';
import Celest from './celest.js';
import MainLayout from './mainlayout.js';

export default class ScreenMain {
  constructor(parent = document.body, params = {}) {
    this.parent = parent;
    this.params = params;
  }

  init() {
    this.ux = new Ux();
    this._render();
    this.celest = new Celest(this.outer, 300, 400);
    this.celest.init();

    this.layout = new MainLayout(this.celest.inner);
  }

  term() {
  }

  _render() {
    this.outer = this.ux.div({ parent: this.parent });
  }
}