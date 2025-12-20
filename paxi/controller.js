import Hanoi from './hanoi.js';
import View from './view.js';
import Paxi from './paxi.js';

export default class Controller {
  constructor(program, container) {
    this.program = program;
    this.container = container;

    this._newGame();
  }

  work() {
    this.view.work();
  }

  _newGame() {
    this.hanoi = new Hanoi();

    const delegate = {
      onRestart: () => this._onRestart()
    };
    this.paxi = new Paxi(this.hanoi, delegate);

    this.view = new View(this.container.outer, this.paxi);
  }

  _onRestart() {
    this._newGame();
  }
}