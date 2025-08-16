export default class DaxEzMesh {
  static id = 0;

  constructor(THREE) {
    this.THREE = THREE;
    this.defaultColor = 0xbbccdd;
  }

  canMake(name) {
    const badNames = ["canMake", "constructor", "make"];

    if (badNames.includes(name)) {
      return false;
    }
    return this[name] && typeof this[name] === 'function';
  }

  make(name) {
    if (this.canMake(name)) {
      const obj = this[name]();
      if (obj) {
        obj.name = name + DaxEzMesh.id++;
      }
      this.lastObject = obj;
      return obj;
    }
  }

  cube() {
    const geometry = new this.THREE.BoxGeometry(1, 1, 1);
    const material = new this.THREE.MeshStandardMaterial({ color: this.defaultColor });
    const mesh = new this.THREE.Mesh(geometry, material);
    return mesh;
  }

  error() {
    const geometry = new this.THREE.BoxGeometry(1, 1, 1);
    const material = new this.THREE.MeshStandardMaterial({ color: 0xff00ff });
    const mesh = new this.THREE.Mesh(geometry, material);
    return mesh;
  }
}
