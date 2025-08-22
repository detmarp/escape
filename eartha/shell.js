import Shape from "./shape.js";
import DrawShell from "./drawshell.js";

// Class for defining and manipulating our pentagon / hexagon shell
export default class Shell {
  constructor(dax) {
    this.radius = 3;
    this.shape = Shape.makeDodecahedron(this.radius);
    this.drawShell = new DrawShell(this, dax);
  }
}