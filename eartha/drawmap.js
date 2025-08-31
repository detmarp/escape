import Vector from "./vector.js";
import Dax from "../dax/dax.js";

// Helper class to help render the shell
export default class DrawMap {
  constructor(dax) {
    this.dax = dax;
  }

  // Make the threejs scene object
  makeObject(shell) {
    const group = new Dax.THREE.Group();

    // Load the texture
    const textureLoader = new Dax.THREE.TextureLoader();
    const texture = textureLoader.load("../cira/earth-400x200.png");

    // Set up texture to only show rows 100-299 (middle stripe)
    // The image is 400x200, so v=0 is top, v=1 is bottom.
    // Rows 100-299 are v=0.5 to v=1.495, but v must be in [0,1].
    // So, v=100/200=0.5 to v=299/200=1.495, but clamp to [0,1].
    // Actually, rows 100 to 199 are v=0.5 to v=1.0 (middle half).
    // We'll use v=0.5 to v=1.0 for the middle stripe.

    texture.wrapS = Dax.THREE.ClampToEdgeWrapping;
    texture.wrapT = Dax.THREE.ClampToEdgeWrapping;
    //texture.repeat.set(1, 0.5); // Only half the image vertically
    //texture.offset.set(0, 0.5); // Start at halfway down

    // Rectangle geometry
    this.rectWidth = 20;
    this.rectHeight = 10;
    this.z = -20;
    this.y = 6;

    const rectGeometry = new Dax.THREE.PlaneGeometry(this.rectWidth, this.rectHeight);
    const rectMaterial = new Dax.THREE.MeshBasicMaterial({ map: texture, side: Dax.THREE.DoubleSide });
    const rectMesh = new Dax.THREE.Mesh(rectGeometry, rectMaterial);
    rectMesh.position.set(0, this.y, this.z + 0.02); // Slightly above the outline
    group.add(rectMesh);

    this.group = group;
    // Make a rectangle outline, w 20, h 10, at z = -10, positioned a little above ground

    const rectPoints = [
      [-this.rectWidth / 2, this.y + -this.rectHeight / 2, this.z],
      [this.rectWidth / 2, this.y + -this.rectHeight / 2, this.z],
      [this.rectWidth / 2, this.y + this.rectHeight / 2, this.z],
      [-this.rectWidth / 2, this.y + this.rectHeight / 2, this.z],
      [-this.rectWidth / 2, this.y + -this.rectHeight / 2, this.z], // close the loop
    ];

    //const rectGeometry = new Dax.THREE.BufferGeometry().setFromPoints(
    //  rectPoints.map(p => new Dax.THREE.Vector3(...p))
    //);
    //const rectMaterial = new Dax.THREE.LineBasicMaterial({ color: 0x00ff00 });
    //const rectLine = new Dax.THREE.Line(rectGeometry, rectMaterial);
    //group.add(rectLine);

    for (const pos of shell.shape.verts) {
      this._addPoly(pos, 0.1);
    }
    // Draw green markers for each pentagon center
    for (const pent of shell.shape.pents) {
      const center = shell.getPolyCenter(pent);
      this._addPoly(center, 1.8, 0x00ff00);
    }

    // Draw blue markers for each hexagon center (if hexes exist)
    if (shell.shape.hexes) {
      for (const hex of shell.shape.hexes) {
      const center = shell.getPolyCenter(hex);
      this._addPoly(center, 1.8, 0x0022ff);
      }
    }
    return group;
  }

  _addPoly(position, size, color=0xffffff) {
    const { lat, lon } = this._toLatLong(position);
    // Map lat [-1,1] to rectHeight, lon [-1,1] to rectWidth
    const x = ((lon + 1) / 2) * this.rectWidth - this.rectWidth / 2;
    const y = ((lat + 1) / 2) * this.rectHeight - this.rectHeight / 2 + this.y;
    const z = this.z;

    //const circleGeometry = new Dax.THREE.CircleGeometry(size / 2, 32);
    //const circleMaterial = new Dax.THREE.MeshBasicMaterial({ color: color || 0xffffff });
    const circleGeometry = new Dax.THREE.CircleGeometry(size / 2, 32);
    // Remove the center vertex to make it just an outline
    circleGeometry.deleteAttribute('normal');
    circleGeometry.deleteAttribute('uv');
    // Convert geometry to outline
    const edges = new Dax.THREE.EdgesGeometry(circleGeometry);
    const circleMaterial = new Dax.THREE.LineBasicMaterial({ color: color || 0xffffff });
    const circle = new Dax.THREE.LineSegments(edges, circleMaterial);
    circle.position.set(x, y, z + 0.1); // Slightly above the rect
    this.group.add(circle);
  }

_toLatLong(position) {
  const [x, y, z] = position;
  const length = Math.sqrt(x * x + y * y + z * z);
  const nx = x / length;
  const ny = y / length;
  const nz = z / length;

  // Latitude: arcsin(ny), Longitude: atan2(nz, nx)
  const lat = Math.asin(ny) / (Math.PI / 2); // [-1, 1]
  const lon = Math.atan2(nz, nx) / Math.PI;  // [-1, 1]

  return { lat, lon };
  }

  _triangulate() {
    this.pentTris = [];
    this.hexTris = [];

    // Pentagon triangles
    for (const pent of this.shell.shape.pents) {
      const pentIndex = this.shell.shape.pents.indexOf(pent);
      for (let i = 1; i < pent.length - 1; i++) {
        this.pentTris.push([pent[0], pent[i], pent[i + 1], pentIndex]);
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
    // Create pentagon geometry
    this._createPentGeometry();

    // Create hex geometry if hexes exist
    if (this.hexTris.length > 0) {
      this._createHexGeometry();
    }
  }

  _createPentGeometry() {
    const vertices = new Float32Array(this.pentTris.length * 9);
    const indices = new Uint16Array(this.pentTris.length * 3);

    for (let i = 0; i < this.pentTris.length; i++) {
      const tri = this.pentTris[i];
      const pentIndex = tri[3]; // 4th element is pentagon index

      for (let j = 0; j < 3; j++) {
        const vert = this.shell.shape.verts[tri[j]];
        vertices[i * 9 + j * 3 + 0] = vert[0];
        vertices[i * 9 + j * 3 + 1] = vert[1];
        vertices[i * 9 + j * 3 + 2] = vert[2];
        indices[i * 3 + j] = i * 3 + j;
      }
    }

    const geometry = new Dax.THREE.BufferGeometry();
    geometry.setAttribute('position', new Dax.THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new Dax.THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    const material = new Dax.THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const mesh = new Dax.THREE.Mesh(geometry, material);
    this.group.add(mesh);
  }

  _createHexGeometry() {
    const vertices = new Float32Array(this.hexTris.length * 9);
    const indices = new Uint16Array(this.hexTris.length * 3);

    for (let i = 0; i < this.hexTris.length; i++) {
      const tri = this.hexTris[i];
      const hexIndex = tri[3]; // 4th element is hex index

      for (let j = 0; j < 3; j++) {
        const vert = this.shell.shape.verts[tri[j]];
        vertices[i * 9 + j * 3 + 0] = vert[0];
        vertices[i * 9 + j * 3 + 1] = vert[1];
        vertices[i * 9 + j * 3 + 2] = vert[2];
        indices[i * 3 + j] = i * 3 + j;
      }
    }

    const geometry = new Dax.THREE.BufferGeometry();
    geometry.setAttribute('position', new Dax.THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new Dax.THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    const material = new Dax.THREE.MeshLambertMaterial({ color: 0x0088ff }); // Different color
    const mesh = new Dax.THREE.Mesh(geometry, material);
    this.group.add(mesh);
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
    // Draw a white ball at the last two vertex positions
    this.dax.ez.nextColor(0xffffff);
    this.dax.ez.nextSize(0.3);
    this.dax.ez.add("ball");
    this.dax.ez.position(...this.shell.shape.verts[this.shell.shape.verts.length - 1]);
    this.dax.ez.nextColor(0xffffff);
    this.dax.ez.nextSize(0.3);
    this.dax.ez.add("ball");
    this.dax.ez.position(...this.shell.shape.verts[this.shell.shape.verts.length - 2]);
    return group;
  }

  _getEdgeCenter(pent, i) {
    const v1 = this.shell.shape.verts[pent[i]];
    const v2 = this.shell.shape.verts[pent[(i + 1) % pent.length]];
    return Vector.add(v1, v2).map(coord => coord / 2);
  }

  updateGeometry() {
    // Update the vertices array with new vertex positions
    for (let i = 0; i < this.tris.length; i++) {
      const tri = this.tris[i];
      for (let j = 0; j < 3; j++) {
        const vert = this.shell.shape.verts[tri[j]];
        this.vertices[i * 9 + j * 3 + 0] = vert[0];
        this.vertices[i * 9 + j * 3 + 1] = vert[1];
        this.vertices[i * 9 + j * 3 + 2] = vert[2];
      }
    }

    // Tell THREE.js the geometry has changed
    const geometry = this.group.children[0].geometry; // Get geometry from first mesh
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals(); // Recalculate lighting
    geometry.computeBoundingSphere(); // Recalculate bounds
  }
}