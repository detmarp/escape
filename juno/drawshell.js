//import Shape from "./shape.js";
import Vector from "./vector.js";
import Dax from "../dax/dax.js";

// Helper class to help render the shell
export default class DrawShell {
  constructor(shell, dax) {
    this.shell = shell;
    this.dax = dax;

    this.colors = {
      poly: [
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

  // Make the threejs scene object
  makeObject() {
    const group = new Dax.THREE.Group();
    this.group = group;

    this._triangulate();
    this._make3d();

    return group;
  }

  // Add markers
  addMarkers() {
    for (let i = 0; i < this.shell.shape.verts.length; i++) {
      const vert = this.shell.shape.verts[i];
      this.dax.ez.nextColor(this._pentColor(i));
      this.dax.ez.nextSize(0.2);
      this.dax.ez.add("ball");
      this.dax.ez.position(...vert);
    }

    for (let i = 0; i < this.shell.shape.polys.length; i++) {
      const pent = this.shell.shape.polys[i];
      const center = this.shell.getPolyCenter(pent);
      this.dax.ez.nextColor(this._pentColor(i));
      this.dax.ez.nextSize(0.35); // Larger ball
      this.dax.ez.add("ball");
      this.dax.ez.position(...center);
    }
  }

  _pentColor(i) {
    return this.colors.poly[i % this.colors.poly.length];
  }

  _triangulate() {
    this.polyTris = [];
    this.hexTris = [];
    // Pentagon triangles
    for (const pent of this.shell.shape.polys) {
      const pentIndex = this.shell.shape.polys.indexOf(pent);
      for (let i = 1; i < pent.length - 1; i++) {
        this.polyTris.push([pent[0], pent[i], pent[i + 1], pentIndex]);
      }
    }

    // Hexagon triangles
    if (this.shell.shape.hexes) {
      for (const hex of this.shell.shape.hexes) {
        const hexIndex = this.shell.shape.hexes.indexOf(hex);
        for (let i = 1; i < hex.length - 1; i++) {
          this.hexTris.push([hex[0], hex[i], hex[i + 1], hexIndex]);
        }
      }
    }
  }

  _make3d() {
    // Sync vertices before creating geometry
    this.syncVertices();

    // Build a map: id -> array of poly indexes
    const idMap = new Map();
    for (let i = 0; i < this.shell.shape.polys.length; i++) {
      const info = this.shell.shape.info[i];
      const id = (info && info.id !== undefined) ? info.id : 0;
      if (!idMap.has(id)) idMap.set(id, []);
      idMap.get(id).push(i);
    }

    // For each id, build a mesh
    let colorCount = this.colors.poly.length;
    let meshIdx = 0;
    for (const [id, polyIndexes] of idMap.entries()) {
      // Triangulate all polys with this id
      let tris = [];
      for (const polyIdx of polyIndexes) {
        const poly = this.shell.shape.polys[polyIdx];
        for (let i = 1; i < poly.length - 1; i++) {
          tris.push([poly[0], poly[i], poly[i + 1]]);
        }
      }
      // Build index array
      const indices = new Uint16Array(tris.length * 3);
      for (let i = 0; i < tris.length; i++) {
        indices[i * 3 + 0] = tris[i][0];
        indices[i * 3 + 1] = tris[i][1];
        indices[i * 3 + 2] = tris[i][2];
      }
      // Geometry
      const geometry = new Dax.THREE.BufferGeometry();
      geometry.setAttribute('position', new Dax.THREE.BufferAttribute(this.vertices, 3));
      geometry.setIndex(new Dax.THREE.BufferAttribute(indices, 1));
      geometry.computeVertexNormals();

      // Color: hash id to pick from colors.poly
      let hash = typeof id === "string" ? [...id].reduce((a, c) => a + c.charCodeAt(0), 0) : id;
      let color = this.colors.poly[Math.abs(hash) % colorCount];

      // Front face
      const frontMaterial = new Dax.THREE.MeshLambertMaterial({ color, side: Dax.THREE.FrontSide });
      const frontMesh = new Dax.THREE.Mesh(geometry, frontMaterial);
      this.group.add(frontMesh);

      // Back face (white)
      const backMaterial = new Dax.THREE.MeshLambertMaterial({ color: 0xffffff, side: Dax.THREE.BackSide });
      const backMesh = new Dax.THREE.Mesh(geometry, backMaterial);
      this.group.add(backMesh);

      meshIdx += 2;
    }
  }

  _createPentGeometry() {
    // Use the master vertex array
    const vertices = this.vertices;
    // Build the index array from pentTris
    const indices = new Uint16Array(this.polyTris.length * 3);

    for (let i = 0; i < this.polyTris.length; i++) {
      const tri = this.polyTris[i];
      for (let j = 0; j < 3; j++) {
        indices[i * 3 + j] = tri[j];
      }
    }

    const geometry = new Dax.THREE.BufferGeometry();
    geometry.setAttribute('position', new Dax.THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new Dax.THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    // Front face (green)
    const frontMaterial = new Dax.THREE.MeshLambertMaterial({ color: 0x00ff00, side: Dax.THREE.FrontSide });
    const frontMesh = new Dax.THREE.Mesh(geometry, frontMaterial);
    this.group.add(frontMesh);

    // Back face (white)
    const backMaterial = new Dax.THREE.MeshLambertMaterial({ color: 0xffffff, side: Dax.THREE.BackSide });
    const backMesh = new Dax.THREE.Mesh(geometry, backMaterial);
    this.group.add(backMesh);
  }

  _createHexGeometry() {
    // Use the master vertex array
    const vertices = this.vertices;
    // Build the index array from hexTris
    const indices = new Uint16Array(this.hexTris.length * 3);

    for (let i = 0; i < this.hexTris.length; i++) {
      const tri = this.hexTris[i];
      for (let j = 0; j < 3; j++) {
        indices[i * 3 + j] = tri[j];
      }
    }

    const geometry = new Dax.THREE.BufferGeometry();
    geometry.setAttribute('position', new Dax.THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new Dax.THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    const material = new Dax.THREE.MeshLambertMaterial({ color: 0x0088ff }); // Different color
    const mesh = new Dax.THREE.Mesh(geometry, material);
    this.group.add(mesh);

    const backMaterial = new Dax.THREE.MeshLambertMaterial({ color: 0xffffff, side: Dax.THREE.BackSide });
    const backMesh = new Dax.THREE.Mesh(geometry, backMaterial);
    this.group.add(backMesh);
  }

  _getEdgeCenter(pent, i) {
    const v1 = this.shell.shape.verts[pent[i]];
    const v2 = this.shell.shape.verts[pent[(i + 1) % pent.length]];
    return Vector.add(v1, v2).map(coord => coord / 2);
  }

  updateGeometry() {
    // Sync vertices to latest positions
    this.syncVertices();

    // Update pent geometry
    const pentFrontGeometry = this.group.children[0].geometry;
    const pentBackGeometry = this.group.children[1].geometry;
    pentFrontGeometry.attributes.position.array.set(this.vertices);
    pentBackGeometry.attributes.position.array.set(this.vertices);
    pentFrontGeometry.attributes.position.needsUpdate = true;
    pentBackGeometry.attributes.position.needsUpdate = true;
    pentFrontGeometry.computeVertexNormals();
    pentBackGeometry.computeVertexNormals();
    pentFrontGeometry.computeBoundingSphere();
    pentBackGeometry.computeBoundingSphere();

    // If hex geometry exists, update it too
    if (this.group.children.length > 3) {
      const hexFrontGeometry = this.group.children[2].geometry;
      const hexBackGeometry = this.group.children[3].geometry;
      hexFrontGeometry.attributes.position.array.set(this.vertices);
      hexBackGeometry.attributes.position.array.set(this.vertices);
      hexFrontGeometry.attributes.position.needsUpdate = true;
      hexBackGeometry.attributes.position.needsUpdate = true;
      hexFrontGeometry.computeVertexNormals();
      hexBackGeometry.computeVertexNormals();
      hexFrontGeometry.computeBoundingSphere();
      hexBackGeometry.computeBoundingSphere();
    }
  }

  syncVertices() {
    // Create a flat Float32Array of all vertex positions
    this.vertices = new Float32Array(this.shell.shape.verts.length * 3);
    for (let i = 0; i < this.shell.shape.verts.length; i++) {
      const vert = this.shell.shape.verts[i];
      this.vertices[i * 3 + 0] = vert[0];
      this.vertices[i * 3 + 1] = vert[1];
      this.vertices[i * 3 + 2] = vert[2];
    }
  }
}