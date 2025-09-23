export default class HarpScene {
  constructor(program) {
    this.program = program;
    this.dax = this.program.scene.dax;
  }

  run() {
    this.dax.ez.add("cube");
    this.dax.ez.position(0, 1, 0);
    this.dax.ez.add("groundgrid");
  }
}
