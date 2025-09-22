import Dax from '../dax/dax.js';

export default class AppScene {
  constructor(canvas, program) {
    this.canvas = canvas;
    this.program = program;
  }

  run() {
    this.dax = new Dax(this.canvas);
    this.dax.ez.add("cube");
    this.dax.ez.position(0, 1, 0);
    this.dax.ez.add("groundgrid");

    this.dax.start();
    this.dax.startOrbitControls();
  }
}
