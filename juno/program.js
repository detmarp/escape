import JunoUi from './juno-ui.js';
import Fiver from './fiver.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this.ui = new JunoUi(this.parent, this);
    this.newGame();
    this.ui.run();
  }

  newGame() {
    this.fiver = new Fiver();
  }
}