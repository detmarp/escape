import SaveData from './savedata.js';
import TinyHistory from '../mika/tinyhistory.js';
import TinyFactory from '../mika/tinyfactory.js';
import Container from './container.js';
import GoToScreen from './gotoscreen.js';
import UxElement from './uxelement.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
    this.container = new Container(this.parent);
    this.goto = new GoToScreen(this);
    this.factory = new TinyFactory();
  }

  async run() {
    this.saveData = new SaveData();
    //this.saveData._debugClear();
    if (this.saveData.data.logsavedata) {
      this.saveData._debugPrint('Loaded:');
    }

    await this.factory.initialize();

    this.container.run();

    this.container.onResize = () => this._onResize();

    this.outer = (new UxElement(this.container.outer)).testFill(undefined, { });

    this.goto.to('main');
    //this.goto.to('settings');
    //this.goto.to('credits');
    this.newGame();
    //this.goto.to('pregame');

    this._onResize();
  }

  newGame(tiny) {
    // Init with this tiny, or make a new one
    this.tiny = tiny || this.factory.tinyFromRandom();
    this.save();
  }

  save() {
    this.saveData.save();
    if (this.saveData.data.logsavedata) {
      this.saveData._debugPrint('Saved:');
    }
  }

  _onResize() {
    this.goto.update();
    this.outer.update();
  }
}