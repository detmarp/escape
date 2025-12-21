import Hanoi from './hanoi.js';
import View from './view.js';
import Paxi from './paxi.js';

export default class Controller {
  constructor(program, container) {
    this.program = program;

    this.program.savedata = this.program.savedata || {};
    this.program.savedata.settings = this.program.savedata.settings || {};
    this.program.savedata.settings.logsavedata = true;
    this.program.save();

    this.container = container;

    let hanoi = this._fromSaved();
    this._newGame(hanoi);
  }

  work() {
    this.view.work();
  }

  save() {
    let saved = this.program.savedata || {};
    saved.game = saved.game || {};
    saved.game.hanoi = this.hanoi.toObject();
    this.program.savedata = saved;
    this.program.save();
  }

  _fromSaved() {
    let saved = this.program.savedata || {};
    let hanoi = null;
    let size = 7;
    if (saved.game) {
      hanoi = Hanoi.fromObject(saved.game.hanoi);
      if (hanoi.gameOver) {
        size = hanoi.size;
        hanoi = null;
      }
    }

    if (!hanoi) {
      hanoi = new Hanoi(size);
    }

    return hanoi;
  }

  _newGame(hanoi) {
    this.hanoi = hanoi || new Hanoi(7);

    const delegate = {
      onRestart: () => this._onRestart(),
      onResize: (size) => this._onResize(size),
      onSave: () => this.save(),
    };
    this.paxi = new Paxi(this.hanoi, delegate);

    this.view = new View(this.container.outer, this.paxi);
    this.save();
  }

  _onRestart() {
    let hanoi = new Hanoi(this.hanoi.size);
    this._newGame(hanoi);
    this.save();
  }

  _onResize(size) {
    let hanoi;
    if (this.hanoi.gameOver) {
      hanoi = new Hanoi(size);
    }
    else {
      let obj = this.hanoi.toObject();
      obj.size = size;
      hanoi = Hanoi.fromObject(obj);
    }
    this._newGame(hanoi);
    this.save();
  }
}