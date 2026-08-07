import Screen1 from './screen1.js';
import Persist from './persist.js';
import Ux from './ux.js';

export default class Program {
  constructor(root = document.body) {
    this.root = root;
    this.persist = new Persist('ivy-game');
    this.persist.load();
    this.screenRoot = null;
    this.screen1 = null;
    //this._deleteSaved();
  }

  run() {
    document.title = 'ivy';
    Ux.setupFullscreen();
    this.screenRoot = Ux.createScreenRoot(this.root);
    this.gotoScene();
  }

  gotoScene() {
    if (this.screen1) {
      this.screen1.term();
    }
    this.screenRoot.innerHTML = '';
    this.screen1 = new Screen1(this.screenRoot, this, this.persist.data?.current);
    this.screen1.init();
  }

  save() {
    let current = this.screen1.space.getState();
    this.persist.data ||= {};
    this.persist.data.current = current;
    this.persist.save();
  }

  _deleteSaved() {
    this.persist.clear();
  }
}
