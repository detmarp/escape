import Dax from './dax.js';

export default class DaxEngine {
  constructor(dax) {
    this.dax = dax;
    this.time = 0;
    this.dt = 1/60;
    this.startTime = null;
    this.isRunning = false;
  }

  init(canvas) {
    this.canvas = canvas;
    this.initThree();
  }

  start() {
    this.isRunning = true;
    this.gameLoop();
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.work();
    this.draw();

    requestAnimationFrame(() => this.gameLoop());
  }

  work() {
    const now = performance.now();
    if (this.startTime === null) {
      this.startTime = now;
      this.time = 0;
      this.lastTime = 0;
    } else {
      const newTime = (now - this.startTime) / 1000;
      this.dt = newTime - this.time;
      this.time = newTime;
    }
  }

  draw() {
    this.resizeView();
    this.renderer.render(this.threeScene, this.camera);
  }

  resizeView() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.renderer.setSize(this.canvas.width, this.canvas.height, false);
    let aspect = this.canvas.width / this.canvas.height;
    let fov = aspect < 1 ? 60 : 60 / aspect;
    this.camera.aspect = aspect;
    this.camera.fov = fov;
    console.log('aspect:', this.camera.aspect, 'fov:', this.camera.fov);
    this.camera.updateProjectionMatrix();
  }

  initThree() {
    this.threeScene = new Dax.THREE.Scene();
    this.camera = new Dax.THREE.PerspectiveCamera(
      60,
      this.canvas.width / this.canvas.height,
      0.1,
      1000
    );
    this.renderer = new Dax.THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.resizeView();

    this.threeScene.background = new Dax.THREE.Color(0x404080);

    this.camera.position.y = 3;
    this.camera.position.z = 8;
    this.camera.lookAt(0, 1, 0);

    const ambientLight = new Dax.THREE.AmbientLight(0x404040, 1);
    this.threeScene.add(ambientLight);

    const directionalLight = new Dax.THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.threeScene.add(directionalLight);
  }
}
