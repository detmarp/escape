import uiContainer from './uicontainer.js';
import uiMain from './uimain.js';
import uiGame from './uigame.js';
import uiSettings from './uisettings.js';
import uiPreGame from './uipregame.js';
import Tiny from './tiny.js';
import SaveData from './savedata.js';
import TinyHistory from './tinyhistory.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this.saveData = new SaveData();
    if (this.saveData.data.logsavedata) {
      this.saveData._debugPrint('Loaded:');
    }

    this.currentGame = this._getCurrentFromHistory();

    this.uiContainer = new uiContainer(this.parent, this);
    this.gotoMode('main');

    if (this.saveData.data.autocontinue && this.currentGame) {
      this.tryContinue();
    }
  }

  newGame(tiny) {
    // Init with this tiny, or make a new one
    this.tiny = tiny || new Tiny();
    this.save();
  }

  tryContinue() {
    if (this.currentGame) {
      this.tiny = this.currentGame;
      this.save();
      this.gotoMode('gameboard');
      return true;
    }
  }

  gotoMode(mode) {
    if (mode === 'main') {
      this.uiContainer.div.innerHTML = '';
      this.uiMain = new uiMain(this.uiContainer.div, this);
    } else if (mode === 'settings') {
      this.uiSettings = new uiSettings(this.uiContainer.div, this);
    } else if (mode === 'pregame') {
      this.uiPreGame = new uiPreGame(this.uiContainer.div, this);
    } else if (mode === 'gameboard') {
      this.uiGame = new uiGame(this.uiContainer.div, this);
    }
  }

  saveCurrent(tiny) {
    this.saveData.data = this.saveData.data || {};
    let history = new TinyHistory(this.saveData.data.history);
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

    return recent && Tiny.fromObject(recent);
  }

  save() {
    this.saveData.save();
    if (this.saveData.data.logsavedata) {
      this.saveData._debugPrint('Saved:');
    }
  }
}