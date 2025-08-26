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

  static hackHexes(shape) {
    shape.hexes = shape.hexes || [];

    var pi = [[0, 5, 1], [0, 1, 2],];
    var newVerts = [];
    var baseIndex = shape.verts.length;

    for (const group of pi) {
      const centers = group.map(pentId => {
        const verts = shape.pents[pentId];
        const center = verts.reduce(
          (acc, vid) => {
            const v = shape.verts[vid];
            return [acc[0] + v[0], acc[1] + v[1], acc[2] + v[2]];
          },
          [0, 0, 0]
        ).map(coord => coord / verts.length);
        return center;
      });
      console.log(JSON.stringify(centers));
      const avgCenter = centers.reduce(
        (acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]],
        [0, 0, 0]
      ).map(coord => coord / centers.length);
      const length = Math.sqrt(avgCenter[0] ** 2 + avgCenter[1] ** 2 + avgCenter[2] ** 2);
      const scale = shape.radius / length;
      avgCenter[0] *= scale;
      avgCenter[1] *= scale;
      avgCenter[2] *= scale;
      newVerts.push(avgCenter);
      shape.verts.push(avgCenter);
    }
    console.log(JSON.stringify(newVerts));
    newVerts.forEach(v => shape.verts.push(v));

    var edge1a = Shape.getEdge(shape.pents[0], 0, true);
    var edge1b = Shape.getEdge(shape.pents[1], 0, true);
    var hex1 = [...edge1a, baseIndex + 0, ...edge1b, baseIndex + 1];
    shape.hexes.push(hex1);
  }

  static getEdge(poly, edgeIndex, flip) {
    // return edge verts for a given edge
    const v1 = poly[edgeIndex];
    const v2 = poly[(edgeIndex + 1) % poly.length];
    return flip ? [v2, v1] : [v1, v2];
  }

}