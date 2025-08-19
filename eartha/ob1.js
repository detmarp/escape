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

    // Golden ratio and radius
    const phi = (1 + Math.sqrt(5)) / 2;
    const radius = 1;

    // Create proper pentagon vertices for top face
    const topY = phi / Math.sqrt(3) * radius;

    this.verts = [
      // Top pentagon (y = +phi) - proper pentagon in XZ plane
      [ radius * Math.cos(0 * 2 * Math.PI / 5), topY, radius * Math.sin(0 * 2 * Math.PI / 5)],
      [ radius * Math.cos(1 * 2 * Math.PI / 5), topY, radius * Math.sin(1 * 2 * Math.PI / 5)],
      [ radius * Math.cos(2 * 2 * Math.PI / 5), topY, radius * Math.sin(2 * 2 * Math.PI / 5)],
      [ radius * Math.cos(3 * 2 * Math.PI / 5), topY, radius * Math.sin(3 * 2 * Math.PI / 5)],
      [ radius * Math.cos(4 * 2 * Math.PI / 5), topY, radius * Math.sin(4 * 2 * Math.PI / 5)],

      // Upper ring
      [ phi * radius,  1/phi * radius,  phi * radius],
      [ 1/phi * radius,  1/phi * radius,  -phi * radius],
      [ -1/phi * radius,  1/phi * radius,  -phi * radius],
      [ -phi * radius,  1/phi * radius,  phi * radius],
      [ 0 * radius,  1/phi * radius,  -1 * radius],

      // Lower ring
      [ phi * radius,  -1/phi * radius,  phi * radius],
      [ 1/phi * radius,  -1/phi * radius,  -phi * radius],
      [ -1/phi * radius,  -1/phi * radius,  -phi * radius],
      [ -phi * radius,  -1/phi * radius,  phi * radius],
      [ 0 * radius,  -1/phi * radius,  -1 * radius],

      // Bottom pentagon (y = -topY) - rotated 36° (π/5) from top pentagon
      [ radius * Math.cos(0 * 2 * Math.PI / 5 + Math.PI / 5), -topY, radius * Math.sin(0 * 2 * Math.PI / 5 + Math.PI / 5)],
      [ radius * Math.cos(1 * 2 * Math.PI / 5 + Math.PI / 5), -topY, radius * Math.sin(1 * 2 * Math.PI / 5 + Math.PI / 5)],
      [ radius * Math.cos(2 * 2 * Math.PI / 5 + Math.PI / 5), -topY, radius * Math.sin(2 * 2 * Math.PI / 5 + Math.PI / 5)],
      [ radius * Math.cos(3 * 2 * Math.PI / 5 + Math.PI / 5), -topY, radius * Math.sin(3 * 2 * Math.PI / 5 + Math.PI / 5)],
      [ radius * Math.cos(4 * 2 * Math.PI / 5 + Math.PI / 5), -topY, radius * Math.sin(4 * 2 * Math.PI / 5 + Math.PI / 5)]
    ];

    // Add 12 face centers (indices 20-31)
    const faces = [
      [0, 1, 2, 3, 4],     // top face
      [15, 16, 17, 18, 19], // bottom face
      // ... other 10 side faces would go here
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

    // Create triangles for north face and south face
    const northFace = [0, 1, 2, 3, 4];
    const northCenter = 20; // First face center

    for (let i = 0; i < 5; i++) {
      this.tris.push([
        northCenter,
        northFace[(i + 1) % 5],
        northFace[i],
      ]);
    }

    const southFace = [15, 16, 17, 18, 19];
    const southCenter = 21; // Second face center

    for (let i = 0; i < 5; i++) {
      this.tris.push([
        southCenter,
        southFace[i],
        southFace[(i + 1) % 5],
      ]);
    }

    console.log(`Created ${this.verts.length} vertices and ${this.tris.length} triangles`);
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