import Screen1 from './screen1.js';
import Screen2 from './screen2.js';
import Persist from './persist.js';

export default class Program {
  constructor(root = document.body) {
    this.root = root;
    this.persist = new Persist('ivy-game');
    this.persist.load();
    this.screenRoot = document.createElement('div');
    this.root.appendChild(this.screenRoot);
    this.screen = null;
  }

  run() {
    document.title = 'ivy';
    this.gotoScene();
  }

  gotoScene() {
    if (this.screen) {
      this.screen.term();
    }
    this.screenRoot.innerHTML = '';
    this.screen = new Screen2(this.screenRoot, this, {});
    this.screen.init();
  }

  save() {
    this.persist.data ||= {};
    this.persist.save();
  }

  _deleteSaved() {
    this.persist.clear();
  }
}
