import uiContainer from './uicontainer.js';
import uiMain from './uimain.js';
import uiGame from './uigame.js';
import uiSettings from './uisettings.js';
import uiPreGame from './uipregame.js';
import Tiny from './tiny.js';
import SaveData from './savedata.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this.saveData = new SaveData();
    console.log('sss Loaded save data:', JSON.stringify(this.saveData.data));
    if (this.saveData.data.current) {
      var lastTiny = Tiny.fromObject(this.saveData.data.current);
      if (lastTiny) {
        this.lastGame = lastTiny;
      }
    }

    this.uiContainer = new uiContainer(this.parent, this);
    this.gotoMode('main');

    if (this.saveData.data.autocontinue && this.lastGame) {
      this.tryContinue();
    }
  }

  newGame() {
    this.tiny = new Tiny();
    this.save();
  }

  tryContinue() {
    if (this.lastGame) {
      this.tiny = this.lastGame;
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

  saveCurrent() {
    this.saveData.data.current = this.tiny.toObject();
    this.lastGame = this.tiny;
    this.save();
  }

  save() {
    this.saveData.save();
    console.log('ttt Saved data:', JSON.stringify(this.saveData.data));
  }
}