import Shape from "./shape.js";
import DrawShell from "./drawshell.js";
import Vector from "./vector.js";

// Class for defining and manipulating our pentagon / hexagon shell
export default class Shell {
  constructor(dax) {
    this.radius = 3;
    this.shape = Shape.makeDodecahedron(this.radius);
    this.drawShell = new DrawShell(this, dax);

    this.separatePents(this.shape);
    for (const poly of this.shape.pents) {
      this.scalePoly(this.shape, poly, 0.5);
    }
  }

  getPolyCenter(poly) {
    let center = [0, 0, 0];

    for (const vertIndex of poly) {
      const vert = this.shape.verts[vertIndex];
      Vector.addTo(center, vert);
    }

    Vector.scaleTo(center, 1 / poly.length);
    return center;
  }

  separatePents(shape) {
    const used = new Set();

    for (let i = 0; i < shape.pents.length; i++) {
      const pent = shape.pents[i];

      for (let j = 0; j < pent.length; j++) {
        const vertIndex = pent[j];

        if (used.has(vertIndex)) {
          // Vertex already used, create a copy
          const newIndex = shape.verts.length;
          shape.verts.push([...shape.verts[vertIndex]]);
          shape.pents[i][j] = newIndex;
        } else {
          // First time using this vertex
          used.add(vertIndex);
        }
      }
    }
  }

    scalePoly(shape, poly, scale = 1) {
    // Find center of poly
    const center = poly.reduce(
      (acc, idx) => {
        const v = shape.verts[idx];
        return Vector.addTo(acc, v);
      },
      [0, 0, 0]
    );
    Vector.scaleTo(center, 1 / poly.length);

    // For each vert, scale its vector from center
    for (const idx of poly) {
      const v = shape.verts[idx];
      const dir = [
        v[0] - center[0],
        v[1] - center[1],
        v[2] - center[2]
      ];
      Vector.scaleTo(dir, scale);  // Just scale, don't normalize first
      shape.verts[idx] = Vector.add([...center], dir);
    }
  }

}