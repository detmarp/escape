import Dax from '../dax/dax.js';

export default class Ob1 {
  constructor() {
    this.vertices = new Float32Array(20 * 3);
    this.indices = new Uint16Array(20 * 3);
  }

  build() {
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

    const group = new Dax.THREE.Group();

    const frontMaterial = new Dax.THREE.MeshBasicMaterial({ color: 0x00ff00, side: Dax.THREE.FrontSide });
    const frontMesh = new Dax.THREE.Mesh(geometry, frontMaterial);
    group.add(frontMesh);

    const backMaterial = new Dax.THREE.MeshBasicMaterial({ color: 0x444444, side: Dax.THREE.BackSide });
    const backMesh = new Dax.THREE.Mesh(geometry, backMaterial);
    group.add(backMesh);

    const wireframeMaterial = new Dax.THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
    const wireframeMesh = new Dax.THREE.Mesh(geometry, wireframeMaterial);
    group.add(wireframeMesh);

    return group;
  }
}