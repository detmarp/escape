import Background from './background.js';
import SaveData from './savedata.js';
import TinyHistory from './tinyhistory.js';
import TinyFactory from './tinyfactory.js';
import Container from './container.js';
import GoToScreen from './gotoscreen.js';

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

    this.currentGame = this._getCurrentFromHistory();

    this.container.run();

    this.container.onResize = () => this._onResize();

    this.background = new Background(this.container.outer);

    this.goto.to('main');

    let tryAutoStart = this.saveData.data.autoquickstart;
    if (this.saveData.data.autocontinue && this.currentGame) {
      if (this.tryContinue()) {
        tryAutoStart = false;
      }
    }
    if (tryAutoStart) {
      let seed = Math.floor(Math.random() * 900000) + 100000;
      this.pregame = this.setupPregame({ gameseed: seed, autostart: true, });
      this.goto.to('pregame');
    }

    this._onResize();

    this._startLoop();
  }

  setupPregame(params) {
    // ALL pregames are created through this call
    // Look at params
    //   params.savegame
    //   params.gameseed
    //   else random
    // TODO - handle optional rules struct

    // Roll new random pregame
    // New pregame from gameseed
    // Using savedata, goto pregame
    // Using savedata, goto game in progress
    let pregame = {...(params ?? {}) };
    this.pregame = pregame;
    return pregame;
  }

  setupTiny(pregame = {}) {
    // ALL Tiny instances are created here
    let tiny = this.factory.tinyFromPregame(pregame);
    this.tiny = tiny;
  }

  save() {
    this.saveData.save();
    if (this.saveData.data.logsavedata) {
      this.saveData._debugPrint('Saved:');
    }
    console.log(`eee 0 ${this.tiny && this.tiny.timeStamp} - save()`);

  }

  saveCurrent(tiny) {
    console.log(`eee 1 ${this.tiny && this.tiny.timeStamp} - saveCurrent()`);
    this.saveData.data = this.saveData.data || {};
    let history = new TinyHistory(this.factory, this.saveData.data.history);
    let data = history.saveGame(tiny);
    this.saveData.data.history = data;
    this.save();
  }

  _getCurrentFromHistory() {
    let recent;
    const hist = (this.saveData && this.saveData.data && this.saveData.data.history) || [];
    for (const item of hist) {
      if (!item || item.gameOver) {
        continue;
      }
      if (!recent || recent.timeStamp < item.timeStamp) {
        recent = item;
      }
    }

    return recent && this.factory.tinyFromSaveData(recent);
  }

  _onResize() {
    this.goto.update();
    this.background.update();
  }

  _startLoop() {
    const loop = () => {
      this.goto.work();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}