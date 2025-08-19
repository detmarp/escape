import Dax from '../dax/dax.js';

export default class Ob1 {
  constructor() {
  }

  build() {
    this._buildParts();
    return this._buildMeshGroup();

    for (let i = 0; i < 20 * 3; i++) {
      this.vertices[i] = (Math.random() - 0.5) * 4;
    }

    for (let i = 0; i < 20; i++) {
      this.indices[i * 3] = i * 3;
      this.indices[i * 3 + 1] = i * 3 + 1;
      this.indices[i * 3 + 2] = i * 3 + 2;
    }

    const geometry = new Dax.THREE.BufferGeometry();
    geometry.setAttribute('position', new Dax.THREE.BufferAttribute(this.vertices, 3));
    //geometry.setIndex(new Dax.THREE.BufferAttribute(this.indices, 1));

    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();  // Needed for mobile rendering

    const group = new Dax.THREE.Group();

    const frontMaterial = new Dax.THREE.MeshBasicMaterial({ color: 0x00ff00, side: Dax.THREE.FrontSide });
    const frontMesh = new Dax.THREE.Mesh(geometry, frontMaterial);
    group.add(frontMesh);

    const backMaterial = new Dax.THREE.MeshBasicMaterial({ color: 0x444444, side: Dax.THREE.BackSide });
    const backMesh = new Dax.THREE.Mesh(geometry, backMaterial);
    group.add(backMesh);

    const wireframeMaterial = new Dax.THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true,
        polygonOffsetFactor: -1, // pull wireframe closer to camera
        polygonOffsetUnits: -1
    });
    const wireframeMesh = new Dax.THREE.Mesh(geometry, wireframeMaterial);
    group.add(wireframeMesh);

    return group;
  }

  _buildParts() {
    this.verts = [];
    this.tris = [];

const radius = 1;
const phi = (1 + Math.sqrt(5)) / 2;
const a = radius * 0.85065080835204; // vertical offset for top/bottom

const r_top = Math.sqrt(radius*radius - a*a); // horizontal distance for top/bottom pentagons
const y_upper = radius / (2 * phi);
const r_upper = Math.sqrt(radius*radius - y_upper*y_upper);

const z1 = radius * (1) * (Math.sqrt(10 + 2*Math.sqrt(5))) / 4;
const x1 = radius * (1) * (Math.sqrt(5) - 1) / 4;
const x2 = radius * -(1 + Math.sqrt(5)) / 4;
const z2 = radius * (Math.sqrt(10 - 2*Math.sqrt(5))) / 4;

const pent = [
  [ radius,  0 ],
  [  x1,  z1 ],
  [  x2,  z2 ],
  [  x2, -z2 ],
  [  x1, -z1 ],
];

this.verts = [];

const addPentagon = (s, y, flip = false) => {
  for (let i = 0; i < 5; i++) {
    const x = flip ? -pent[i][0] * s : pent[i][0] * s;
    this.verts.push([x, y, pent[i][1] * s]);
  }
};

addPentagon(r_top, a);
addPentagon(r_upper, y_upper);  // upper ring at +radius/phi, scaled by r/radius
addPentagon(r_upper, -y_upper, true);  // lower ring at -radius/phi, scaled by r/radius
addPentagon(r_top, -a, true);

// this.verts = [
//   // top pentagon (y = +a)
//   [ pent[0][0], a, pent[0][1] ],
//   [ pent[1][0], a, pent[1][1] ],
//   [ pent[2][0], a, pent[2][1] ],
//   [ pent[3][0], a, pent[3][1] ],
//   [ pent[4][0], a, pent[4][1] ],

//   // middle ring (10 vertices)
// [  r,  radius / phi,  0 ],           // vertex 5
// [  radius / phi,  radius / phi,  r ], // vertex 6
// [ -radius / phi,  radius / phi,  r ], // vertex 7
// [ -r,  radius / phi,  0 ],           // vertex 8
// [  0,  radius / phi, -r ],           // vertex 9

// // Lower ring (5 vertices at y = -radius/phi)
// [  r,  -radius / phi,  0 ],          // vertex 10
// [  radius / phi,  -radius / phi,  r ], // vertex 11
// [ -radius / phi,  -radius / phi,  r ], // vertex 12
// [ -r,  -radius / phi,  0 ],          // vertex 13
// [  0,  -radius / phi, -r ],          // vertex 14
// //
//     // bottom pentagon (y = -a)

//   [ -radius,  -a,  0 ],
//   [  -x1, -a,  z1 ],
//   [  -x2, -a,  z2 ],
//   [  -x2, -a, -z2 ],
//   [  -x1, -a, -z1 ],

// ];
    // Add 12 face centers (indices 20-31)
    const faces = [
      [0, 1, 2, 3, 4],     // top face

      [1, 0, 5, 12, 6],
      [2, 1, 6, 11, 7],   // middle faces
      [3, 2, 7, 10, 8],
      [4, 3, 8, 14, 9],
      [0, 4, 9, 13, 5],   // bottom faces
[17, 16, 11, 6, 12],
[16, 15, 10, 7, 11],
[15, 19, 14, 8, 10],
[19, 18, 13, 9, 14],
[18, 17, 12, 5, 13],

      [15, 16, 17, 18, 19], // bottom face
    ];

    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      let x = 0, y = 0, z = 0;
      for (const vertIndex of face) {
        x += this.verts[vertIndex][0];
        y += this.verts[vertIndex][1];
        z += this.verts[vertIndex][2];
      }
      this.verts.push([x / 5, y / 5, z / 5]);
    }

    let ci = this.verts.length - faces.length;
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