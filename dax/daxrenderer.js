export default class DaxRenderer {
  constructor() {
    this.THREE = null;
  }

  async init(canvas) {
    this.THREE = await import('https://unpkg.com/three@0.160.0/build/three.module.js');
    this.canvas = canvas;
    this.renderer = new this.THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(this.canvas.width, this.canvas.height);

    this.camera = new this.THREE.PerspectiveCamera(
      75,
      this.canvas.width / this.canvas.height,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    this.scene = new this.THREE.Scene();
  }

  render(scene) {
    if (!this.THREE) return;

    if (scene.background) {
      this.scene.background = new this.THREE.Color('cyan');
    }
    // scene
    if (scene.things.some(thing => thing.label === "ambient")) {
      if (!this.ambientLight) {
      this.ambientLight = new this.THREE.AmbientLight(0xffffff, 1);
      if (this.scene) {
        this.scene.add(this.ambientLight);
      } else {
        this.scene = new this.THREE.Scene();
        this.scene.add(this.ambientLight);
      }
      }
    }
    if (this.firstTime === undefined) {
      this.firstTime = true;
      if (scene.things.some(thing => thing.label === "directional")) {
        if (!this.directionalLight) {
          this.directionalLight = new this.THREE.DirectionalLight(0xffffff, 0.8);
          this.directionalLight.position.set(5, 10, 7.5);
          this.scene.add(this.directionalLight);
        }
      }
      if (scene.things.some(thing => thing.label === "cube")) {
        if (!this.cube) {
          const geometry = new this.THREE.BoxGeometry();
          const material = new this.THREE.MeshLambertMaterial({ color: 0xffffff });
          this.cube = new this.THREE.Mesh(geometry, material);
          this.scene.add(this.cube);
        }
      }
    }
    const cubeObj = scene.find("cube");
    if (cubeObj) {
      if (cubeObj && typeof cubeObj.yrot === "number") {
        this.cube.rotation.y = cubeObj.yrot;
      }
    }

    this.renderer.render(this.scene, this.camera);

    scene.things.forEach(thing => {
      this._renderThing(thing);
    });
  }

  _renderThing(thing) {
  }
}
