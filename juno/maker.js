export default class Maker {
  constructor(THREE) {
    this.THREE = THREE;
  }

  testOne() {
    const THREE = this.THREE;
    // Create geometry: bumpy sphere
    const radius = 2;
    const detail = 3; // ~128 faces
    const geometry = new THREE.IcosahedronGeometry(radius, detail);
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

  testTwo() {
    // Icosahedron base vertices and faces
    const t = (1 + Math.sqrt(5)) / 2;
    const baseVerts = [
      [-1,  t,  0], [ 1,  t,  0], [-1, -t,  0], [ 1, -t,  0],
      [ 0, -1,  t], [ 0,  1,  t], [ 0, -1, -t], [ 0,  1, -t],
      [ t,  0, -1], [ t,  0,  1], [-t,  0, -1], [-t,  0,  1]
    ];
    // Normalize and scale
    const radius = 2;
    const verts = baseVerts.map(v => {
      const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
      let x = v[0]/len*radius, y = v[1]/len*radius, z = v[2]/len*radius;
      const bump = 0.3 * (Math.sin(x * 2.7) + Math.cos(y * 2.3) + Math.sin(z * 3.1));
      return [x + bump * x / radius, y + bump * y / radius, z + bump * z / radius];
    });
    // Faces (polys) as vertex indices
    const polys = [
      [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
      [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
      [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
      [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
    ];
    return { verts, polys };
  }

  make(verts, polys) {
    const THREE = this.THREE;
    // Create geometry from verts and polys
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (const v of verts) {
      positions.push(...v);
    }
    const indices = [];
    for (const poly of polys) {
      indices.push(...poly);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    // Pastel color
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
    // Edges
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
