import Dax from '../dax/dax.js';

export default class Ob1 {
  constructor() {
  }

  build() {
    var shape = this._buildParts();
    return this._buildMeshGroup(shape);
  }

  dodecahedronVerts(shape = {}, radius = 1) {
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

  dodecahedronPents(shape = {}) {
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

  addTris(shape = {}, poly) {
    if (!shape.tris) shape.tris = [];
    const center = poly[0];
    for (let i = 1; i < poly.length - 1; i++) {
      shape.tris.push([center, poly[i + 1], poly[i]]);
    }
  }

  _buildParts() {
    const radius = 3;
    var shape = this.dodecahedronVerts(undefined, radius);
    this.dodecahedronPents(shape);
    this.separatePents(shape);
    for (const pent of shape.pents) {
      this.addTris(shape, pent);
    }
    for (const pent of shape.pents) {
      this.scalePoly(shape, pent, 0.5);
    }
    return shape;
  }

  vectorAdd(a, b) {
    a[0] += b[0];
    a[1] += b[1];
    a[2] += b[2];
    return a;
  }

  vectorScale(a, scale) {
    a[0] *= scale;
    a[1] *= scale;
    a[2] *= scale;
    return a;
  }

  vectorDistance(a, b) {
    return this.vectorLength([
      a[0] - b[0],
      a[1] - b[1],
      a[2] - b[2]
    ]);
  }

  vectorLength(a) {
    return Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);
  }

  scalePoly(shape, poly, scale = 1) {
    // Find center of poly
    const center = poly.reduce(
      (acc, idx) => {
        const v = shape.verts[idx];
        return this.vectorAdd(acc, v);
      },
      [0, 0, 0]
    );
    this.vectorScale(center, 1 / poly.length);

    // For each vert, scale its vector from center
    for (const idx of poly) {
      const v = shape.verts[idx];
      const dir = [
        v[0] - center[0],
        v[1] - center[1],
        v[2] - center[2]
      ];
      this.vectorScale(dir, scale);  // Just scale, don't normalize first
      shape.verts[idx] = this.vectorAdd([...center], dir);
    }
  }

  _buildMeshGroup(shape) {
    const group = new Dax.THREE.Group();

    this.vertices = new Float32Array(shape.tris.length * 9);
    this.indices = new Uint16Array(shape.tris.length * 3);

    for (let i = 0; i < shape.tris.length; i++) {
      const tri = shape.tris[i];
      for (let j = 0; j < 3; j++) {
        const vert = shape.verts[tri[j]];
        this.vertices[i * 9 + j * 3 + 0] = vert[0];
        this.vertices[i * 9 + j * 3 + 1] = vert[1];
        this.vertices[i * 9 + j * 3 + 2] = vert[2];
        this.indices[i * 3 + j] = i * 3 + j;
      }
    }

    const geometry = new Dax.THREE.BufferGeometry();
    geometry.setAttribute('position', new Dax.THREE.BufferAttribute(this.vertices, 3));
    geometry.setIndex(new Dax.THREE.BufferAttribute(this.indices, 1));
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();

    const frontMaterial = new Dax.THREE.MeshLambertMaterial({ color: 0x00ff00, side: Dax.THREE.FrontSide });
    const frontMesh = new Dax.THREE.Mesh(geometry, frontMaterial);
    group.add(frontMesh);

    const backMaterial = new Dax.THREE.MeshLambertMaterial({ color: 0x444444, side: Dax.THREE.BackSide });
    const backMesh = new Dax.THREE.Mesh(geometry, backMaterial);
    group.add(backMesh);

    const wireframeMaterial = new Dax.THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });
    const wireframeMesh = new Dax.THREE.Mesh(geometry, wireframeMaterial);
    group.add(wireframeMesh);

    return group;
  }
}