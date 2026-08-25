//import Screen1 from './screen1.js';
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

  async run() {
    document.title = 'ivy';
    this.gameData = this.persist.data?.current || {};
    await this.gotoScene();
  }

  async gotoScene() {
    if (this.screen) {
      this.screen.term();
    }
    this.screenRoot.innerHTML = '';
    const params = {
      gameData: this.gameData,
    };
    this.screen = new Screen2(this.screenRoot, this, params);
    await this.screen.init();
  }

  save() {
    this.persist.data ||= {};
    this.persist.data.count = (this.persist.data.count || 0) + 1;
    this.persist.save();
  }

  _deleteSaved() {
    this.persist.clear();
  }

  async loadObject(filename) {
    const mod = await import(filename);
    return JSON.parse(JSON.stringify(mod.default));
  }
}
