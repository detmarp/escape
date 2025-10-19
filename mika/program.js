import uiContainer from './uicontainer.js';
import uiMain from './uimain.js';
import uiGame from './uigame.js';
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
    this.uiContainer = new uiContainer(this.parent, this);
    this.gotoMode('main');

    this.newGame();
    this.gotoMode('gameboard');
  }

  newGame() {
    this.tiny = new Tiny();
    this.save();
  }

  gotoMode(mode) {
    if (mode === 'main') {
      this.uiContainer.div.innerHTML = '';
      this.uiMain = new uiMain(this.uiContainer.div, this);
    } else if (mode === 'settings') {
    } else if (mode === 'pregame') {
      this.uiPreGame = new uiPreGame(this.uiContainer.div, this);
    } else if (mode === 'gameboard') {
      this.uiGame = new uiGame(this.uiContainer.div, this);
    } else {
    }
  }

  save() {
    this.saveData.save();
    console.log('ttt Saved data:', JSON.stringify(this.saveData.data));
  }
}