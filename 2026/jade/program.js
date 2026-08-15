import Astra from '../astra/astra.js';
import View from './view.js';

export default class Program {
  constructor(root = document.body) {
    this.root = root;
  }

  run() {
    document.title = 'jade';
    const astra = new Astra();
    astra.setFixedFullscreen();

    let view = new View(this.root);
    view.start();
  }
}
