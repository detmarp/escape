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
      [  x1, -z1 ],
      [  x2, -z2 ],
      [  x2,  z2 ],
      [  x1,  z1 ],
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
      // top, 0
      [0, 1, 2, 3, 4],
      // upper ring, 1-5
      [1, 0, 5, 12, 6],
      [2, 1, 6, 11, 7],
      [3, 2, 7, 10, 8],
      [4, 3, 8, 14, 9],
      [0, 4, 9, 13, 5],
      // lower ring, 6-10
      [6, 12, 17, 16, 11],
      [7, 11, 16, 15, 10],
      [8, 10, 15, 19, 14],
      [9, 14, 19, 18, 13],
      [5, 13, 18, 17, 12],
      // bottom, 11
      [15, 16, 17, 18, 19],
    ];
  }

  static getPentInfo(shape) {
    return [
      // top, 0
      { neighbors: [1, 2, 3, 4, 5] },
      // top ring, 1-5
      { neighbors: [0, 5, 10, 6, 2] },
      { neighbors: [0, 1, 6, 7, 3] },
      { neighbors: [0, 2, 7, 8, 4] },
      { neighbors: [0, 3, 8, 9, 5] },
      { neighbors: [0, 4, 9, 10, 1] },
      // bottom ring, 6-10
      { neighbors: [1, 10, 11, 7, 2] },
      { neighbors: [2, 6, 11, 8, 3] },
      { neighbors: [3, 7, 11, 9, 4] },
      { neighbors: [4, 8, 11, 10, 5] },
      { neighbors: [5, 9, 11, 6, 1] },
      // bottom, 11
      { neighbors: [7, 6, 10, 9, 8] },
    ];
  }

  addTris(shape = {}, poly) {
    if (!shape.tris) shape.tris = [];
    const center = poly[0];
    for (let i = 1; i < poly.length - 1; i++) {
      shape.tris.push([center, poly[i + 1], poly[i]]);
    }
  }

}