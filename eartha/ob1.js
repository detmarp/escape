import Dax from '../dax/dax.js';

export default class Ob1 {
  constructor() {
  }

  build() {
    this._buildParts();
    return this._buildMeshGroup();
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

  pentCenters(shape) {
    shape.pentCenters = shape.pents.map(pent => {
      const center = pent.reduce((acc, vertIndex) => {
        const vert = shape.verts[vertIndex];
        acc[0] += vert[0];
        acc[1] += vert[1];
        acc[2] += vert[2];
        return acc;
      }, [0, 0, 0]);
      const length = Math.sqrt(center[0] ** 2 + center[1] ** 2 + center[2] ** 2);
      return center.map(v => v * (shape.radius / length));
    });
  }

  _buildParts() {
    const radius = 3;
    var shape = this.dodecahedronVerts(undefined, radius);


    this.dodecahedronPents(shape);
    const faces = shape.pents;

    this.separatePents(shape);

    let ci = shape.verts.length;

    this.pentCenters(shape);

    shape.verts = shape.verts.map(([x, y, z]) => {
      const len = Math.sqrt(x * x + y * y + z * z);
      const scale = 0.8 + Math.random() * 0.4;
      return [x * scale, y * scale, z * scale];
    });

    if (shape.pentCenters) {
      for (const center of shape.pentCenters) {
        shape.verts.push(center);
      }
    }

    this.verts = shape.verts;
    this.tris = [];

    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      const centerIndex = ci + i;
      for (let j = 0; j < face.length; j++) {
        const v1 = face[j];
        const v0 = face[(j + 1) % face.length];
        this.tris.push([v0, v1, centerIndex]);
      }
    }
  }

  _buildMeshGroup() {
    const group = new Dax.THREE.Group();

    this.vertices = new Float32Array(this.tris.length * 9);
    this.indices = new Uint16Array(this.tris.length * 3);

    for (let i = 0; i < this.tris.length; i++) {
      const tri = this.tris[i];
      for (let j = 0; j < 3; j++) {
        const vert = this.verts[tri[j]];
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

    const frontMaterial = new Dax.THREE.MeshBasicMaterial({ color: 0x00ff00, side: Dax.THREE.FrontSide });
    const frontMesh = new Dax.THREE.Mesh(geometry, frontMaterial);
    group.add(frontMesh);

    const backMaterial = new Dax.THREE.MeshBasicMaterial({ color: 0x444444, side: Dax.THREE.BackSide });
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