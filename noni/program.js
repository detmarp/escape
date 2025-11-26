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
      this.newGame();
      this.goto.to('game');
    }

    this._onResize();

    this._startLoop();
  }

  newGame(tiny) {
    // Init with this tiny, or make a new one
    this.tiny = tiny || this.factory.tinyFromRandom();
    this.save();
  }

  tryContinue() {
    if (this.currentGame) {
      this.tiny = this.currentGame;
      this.save();
      //this.gotoMode('gameboard');
      return true;
    }
  }

  save() {
    this.saveData.save();
    if (this.saveData.data.logsavedata) {
      this.saveData._debugPrint('Saved:');
    }
  }

  saveCurrent(tiny) {
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