/// Simple geomtry maker. polys and edges.
export default class GeoOne {
  constructor(THREE) {
    this.THREE = THREE;
  }

  // Make a object, given verts, and lists of indexes
  make(verts, polys) {
    const THREE = this.THREE;
    // Create geometry from verts and polys
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const indices = [];
    let vertIndex = 0;
    for (const poly of polys) {
      if (poly.length < 3) continue; // skip degenerate
      // Compute face normal for the poly (using first three verts)
      const v0 = verts[poly[0]];
      const v1 = verts[poly[1]];
      const v2 = verts[poly[2]];
      const ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2];
      const bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2];
      const nx = ay * bz - az * by;
      const ny = az * bx - ax * bz;
      const nz = ax * by - ay * bx;
      // Normalize
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      const normal = [nx / len, ny / len, nz / len];
      // Triangulate poly (fan method)
      for (let i = 1; i < poly.length - 1; i++) {
        const tri = [poly[0], poly[i], poly[i + 1]];
        for (const idx of tri) {
          positions.push(...verts[idx]);
          normals.push(...normal);
        }
        indices.push(vertIndex, vertIndex + 1, vertIndex + 2);
        vertIndex += 3;
      }
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setIndex(indices);
    // Very light blue-gray color
    const color = 0xeaf6ff;
    const material = new THREE.MeshPhongMaterial({
      color,
      specular: 0xffffff,      // bright specular
      shininess: 10,           // broad highlight
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      flatShading: false // smooth shading, but normals are per-poly
    });
    const mesh = new THREE.Mesh(geometry, material);
    // Add dark red backside with same material properties except color and side
    const backMaterial = new THREE.MeshPhongMaterial({
      color: 0xbb44bb,
      specular: 0xffffff,
      shininess: 10,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      flatShading: false,
      side: THREE.BackSide
    });
    const backMesh = new THREE.Mesh(geometry, backMaterial);
    // Edges: only original poly outlines
    const edgePositions = [];
    for (const poly of polys) {
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        edgePositions.push(...verts[a], ...verts[b]);
      }
    }
    const edgeGeometry = new THREE.BufferGeometry();
    edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      linewidth: 2
    });
    const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    // Group mesh and edges
    const group = new THREE.Group();
    group.add(mesh);
    group.add(backMesh);
    group.add(edgeLines);
    return group;
  }
}
