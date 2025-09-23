export default class Maker {
  constructor(THREE) {
    this.THREE = THREE;
  }

  testOne() {
    const THREE = this.THREE;
    // Create geometry: bumpy sphere
    const radius = 2;
    const detail = 3; // ~128 faces
    const geometry = new this.THREE.IcosahedronGeometry(radius, detail);
    // Bump vertices
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const v = [
        geometry.attributes.position.getX(i),
        geometry.attributes.position.getY(i),
        geometry.attributes.position.getZ(i)
      ];
      const bump = 0.3 * (Math.sin(v[0] * 2.7) + Math.cos(v[1] * 2.3) + Math.sin(v[2] * 3.1));
      geometry.attributes.position.setXYZ(i,
        v[0] + bump * v[0] / radius,
        v[1] + bump * v[1] / radius,
        v[2] + bump * v[2] / radius
      );
    }
    geometry.computeVertexNormals();
    // Use a single pastel material for the mesh
    const pastelColors = [
      0xffc1cc, 0xffe4b5, 0xfff8dc, 0xe0ffff, 0xc1ffc1, 0xd1c1ff, 0xffd1fa, 0xc1e1ff, 0xfaffc1, 0xc1ffd7
    ];
    const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
    const material = new THREE.MeshLambertMaterial({
      color,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });
    const mesh = new THREE.Mesh(geometry, material);
    // Create edges with polygonOffset
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      linewidth: 2
    });
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    // Group mesh and edges
    const group = new THREE.Group();
    group.add(mesh);
    group.add(edgeLines);
    return group;
  }
}
