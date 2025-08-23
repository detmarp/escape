import Shape from "./shape.js";
import Vector from "./vector.js";
import Dax from "../dax/dax.js";

// Helper class to help render the shell
export default class DrawShell {
  constructor(shell, dax) {
    this.shell = shell;
    this.dax = dax;

    this.colors = {
      pent: [
        0xf078a0, // rgb(240,120,160) - Pink
        0xe63c3c, // rgb(230,60,60) - Soft Red
        0xe66e28, // rgb(230,110,40) - Warm Orange
        0xdcaa28, // rgb(220,170,40) - Muted Yellow
        0xa0c83c, // rgb(160,200,60) - Yellow-Green
        0x3ca03c, // rgb(60,160,60) - True Green
        0x3caa96, // rgb(60,170,150) - Teal
        0x46aadc, // rgb(70,170,220) - Baby Blue
        0x4682c8, // rgb(70,130,200) - Soft Blue
        0x6e5abe, // rgb(110,90,190) - Muted Indigo
        0xa050b4, // rgb(160,80,180) - Violet
        0x8c6450, // rgb(140,100,80) - Soft Brown
      ]
    };
  }

  _pentColor(i) {
    return this.colors.pent[i % this.colors.pent.length];
  }

  _triangulate() {
    this.shell.shape.tris = [];

    for (const pent of this.shell.shape.pents) {
      for (let i = 1; i < pent.length - 1; i++) {
        this.shell.shape.tris.push([pent[0], pent[i], pent[i + 1]]);
      }
    }
  }

  make3d() {
    this._triangulate();

    this.shell.shape.pents.forEach((pent, i) => {
      // Mark pentagon center
      const color = this._pentColor(i);
      this.dax.ez.nextColor(color);
      this.dax.ez.nextSize(0.25);
      this.dax.ez.add("ball");
      const [x, y, z] = this.shell.getPolyCenter(pent);
      this.dax.ez.position(x, y, z);
    });

    this.shell.shape.pents.forEach((pent, i) => {
      var info = Shape.getPentInfo(pent);
      for (let j = 0; j < pent.length; j++) {
        // Mark poly edge with neighbor
        let neighbor = this.shell.pentInfo[i].neighbors[j];
        const edgeCenter = this._getEdgeCenter(pent, j);
        this.dax.ez.nextColor(this._pentColor(neighbor));
        this.dax.ez.nextSize(0.15);
        this.dax.ez.add("ball");
        this.dax.ez.position(...edgeCenter);
      }
    });

    const group = new Dax.THREE.Group();
    this.group = group;

    this.vertices = new Float32Array(this.shell.shape.tris.length * 9);
    this.indices = new Uint16Array(this.shell.shape.tris.length * 3);

    for (let i = 0; i < this.shell.shape.tris.length; i++) {
      const tri = this.shell.shape.tris[i];
      for (let j = 0; j < 3; j++) {
        const vert = this.shell.shape.verts[tri[j]];
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

  _getEdgeCenter(pent, i) {
    const v1 = this.shell.shape.verts[pent[i]];
    const v2 = this.shell.shape.verts[pent[(i + 1) % pent.length]];
    return Vector.add(v1, v2).map(coord => coord / 2);
  }
}