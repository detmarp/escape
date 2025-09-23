import Maker from './maker.js';

export default class HarpScene {
  constructor(program) {
    this.program = program;
    this.dax = this.program.scene.dax;
  }

  run() {
    //this.dax.ez.add("cube");
    this.dax.ez.position(0, 1, 0);
    this.dax.ez.add("groundgrid");

    var maker = new Maker(this.dax.THREE);
    var ob = maker.testOne();
    ob.position.set(2, 0.5, 0);
    this.dax.scene.add(ob);
  }
}
