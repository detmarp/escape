import Dax from '../dax/dax.js';

// Static class for helping manage a sort of standard shape object.
// Verts, faces, pentagons, etc.
export default class Shape {
  static makeDodecahedron(radius = 1) {
    var shape = {};
    this._addDodecahedronVerts(shape, radius);
    this._addDodecahedronPents(shape);
    return shape;
  }

  static _addDodecahedronVerts(shape, radius) {
    const phi = (1 + Math.sqrt(5)) / 2;
    const a = 0.80065080835204; // vertical offset for top/bottom
    const r_top = Math.sqrt(1 * 1 - a * a); // horizontal distance for top pentagon
    const y_upper = 1 * 0.16245985;
    //const y_upper = 1 * 0.01
    const r_upper = Math.sqrt(1 * 1 - y_upper * y_upper); // horizontal distance for upper ring

    const z1 = 1 * (1) * (Math.sqrt(10 + 2*Math.sqrt(5))) / 4;
    const x1 = 1 * (1) * (Math.sqrt(5) - 1) / 4;
    const x2 = 1 * -(1 + Math.sqrt(5)) / 4;
    const z2 = 1 * (Math.sqrt(10 - 2*Math.sqrt(5))) / 4;

    const pent = [
      [ 1,  0 ],
      [  x1,  z1 ],
      [  x2,  z2 ],
      [  x2, -z2 ],
      [  x1, -z1 ],
    ];

    shape.verts = [];

    const addPentagon = (s, y, flip = false) => {
      for (let i = 0; i < 5; i++) {
        const x = flip ? -pent[i][0] * s : pent[i][0] * s;
        shape.verts.push([x, y, pent[i][1] * s]);
      }
    };

    addPentagon(r_top, a);
    addPentagon(r_upper, y_upper);
    addPentagon(r_upper, -y_upper, true);
    addPentagon(r_top, -a, true);

    shape.verts = shape.verts.map(([x, y, z]) => [x * radius, y * radius, z * radius]);
    shape.radius = radius;

    return shape;
  }

  static _addDodecahedronPents(shape) {
    shape.pents = [
      [0, 1, 2, 3, 4], // top
      [1, 0, 5, 12, 6], // upper ring
      [2, 1, 6, 11, 7],
      [3, 2, 7, 10, 8],
      [4, 3, 8, 14, 9],
      [0, 4, 9, 13, 5],
      [17, 16, 11, 6, 12], // lower ring
      [16, 15, 10, 7, 11],
      [15, 19, 14, 8, 10],
      [19, 18, 13, 9, 14],
      [18, 17, 12, 5, 13],
      [15, 16, 17, 18, 19], // bottom
    ];
  }

  static getPentInfo(shape) {
    return [
      { neighbors: [1, 5, 4, 3, 2] },
      { neighbors: [0, 2, 7, 11, 6] },
      { neighbors: [0, 3, 8, 10, 7] },
      { neighbors: [0, 4, 9, 14, 8] },
      { neighbors: [0, 5, 12, 13, 9] },
      { neighbors: [0, 1, 6, 17, 18] },
      { neighbors: [1, 7, 10, 15, 17] },
      { neighbors: [2, 8, 14, 19, 10] },
      { neighbors: [3, 9, 13, 18, 14] },
      { neighbors: [4, 12, 11, 16, 13] },
      { neighbors: [2, 7, 19, 15, 11] },
      { neighbors: [1, 6, 17, 16, 12] },
    ];
  }
}