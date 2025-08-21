export default class DaxEzMesh {
  static id = 0;

  constructor(THREE) {
    this.THREE = THREE;
    this.defaultColor = 0xbbccdd;
    this.params = {};
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
    const material = this._material();
    const mesh = new this.THREE.Mesh(geometry, material);
    return mesh;
  }

  ball() {
    const geometry = new this.THREE.SphereGeometry(0.5, 10, 10);
    const material = this._material();
    const mesh = new this.THREE.Mesh(geometry, material);
    return mesh;
  }

  teapot() {
    const geometry = new this.THREE.CylinderGeometry(0.3, 0.5, 0.8, 8);
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

  _color() {
    return this.params.color ?? this.defaultColor;
  }

  _material(color) {
    return new this.THREE.MeshStandardMaterial({
      color: color ?? this._color()
    });
  }

}
