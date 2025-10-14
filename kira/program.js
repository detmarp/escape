import Ui from './ui.js';
import Fifteen from './fifteen.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this.fifteen = new Fifteen(this.parent);
    this.ui = new Ui(this.parent, this);
  }
}