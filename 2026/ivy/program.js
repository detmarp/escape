import Screen1 from './screen1.js';
import Persist from './persist.js';
import Ux from './ux.js';

export default class Program {
  constructor(root = document.body) {
    this.root = root;
    this.persist = new Persist('ivy-game');
    this.persist.load();
    this.savedBlob = this.persist.data || this._initializeBlob();
    if (!this.savedBlob.current) {
      this.savedBlob.current = this._initializeBlob().current;
    }
    this.current = this.savedBlob.current;
    this.screenRoot = null;
    this.screen1 = null;
    //this._deleteSaved();
  }

  _initializeBlob() {
    const now = Date.now();
    return {
      settings: {},
      current: {
        count: 0,
        created: now,
        saved: now,
        spaceport: null,
      },
      history: [],
    };
  }

  run() {
    document.title = 'ivy';
    Ux.setupFullscreen();
    this.screenRoot = Ux.createScreenRoot(this.root);
    this.reset();
  }

  reset() {
    if (this.screen1 && typeof this.screen1.term === 'function') {
      this.screen1.term();
    }
    this.screenRoot.innerHTML = '';
    this.screen1 = new Screen1(this.screenRoot, this, this.current.spaceport);
    this.screen1.init();
  }

  save() {
    this.current.count += 1;
    this.current.saved = Date.now();
    this.current.spaceport = this.screen1.space.getState();
    this.persist.data = this.savedBlob;
    this.persist.save();
  }

  _deleteSaved() {
    this.persist.clear();
    this.savedBlob = this._initializeBlob();
    this.current = this.savedBlob.current;
  }
}
