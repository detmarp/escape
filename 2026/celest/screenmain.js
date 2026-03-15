import Ux from './ux.js';
import MainLayout from './mainlayout.js';
import FiverHelper from './fiverhelper.js';
import Mediator from './mediator.js';

export default class ScreenMain {
  constructor(parent = document.body, params = {}) {
    this.parent = parent;
    this.params = params;
    this.fiver = params.program.fiver;
    this.helper = new FiverHelper(this.fiver);
  }

  init() {
    this.ux = new Ux();
    this._render();
    this.layout = new MainLayout(this.outer, this);
    this.mediator = new Mediator(this.fiver, this.helper, this.layout);
    this.mediator.command('start');
  }

  term() {
  }

  work(dt, time, frame) {
    this.mediator.work(dt, time, frame);
  }

  onRoll() {
    this.mediator.command('roll');
  }

  onSlot(index) {
    console.log(`sss Slot ${index} clicked`);
    this.mediator.command(`slot ${index}`);
  }

  onHold(index) {
    this.mediator.command(`toggle ${index}`);
  }

  onQuit() {
    this.params.program.goto('home');
  }

  _render() {
    this.outer = this.ux.div({
      parent: this.parent,
      fill: true,
    });
  }
}