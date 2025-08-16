import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import DaxJunk from './daxjunk.js';
import DaxEz from './daxez.js';
import DaxEngine from './daxengine.js';

export default class Dax {
  static THREE = THREE;

  constructor(canvas) {
    this.canvas = canvas;
    this.initThree();

    this.engine = new DaxEngine(this);
    this.ez = new DaxEz(this);
    this.junk = new DaxJunk();
  }

  init(canvas) {
    this.canvas = canvas;
  }

  start() {
    this.isRunning = true;
    this._gameLoop();
  }

  _gameLoop() {
    if (!this.isRunning) return;

    this.work();
    this.draw();

    requestAnimationFrame(() => this._gameLoop());
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
    this.renderer.render(this.scene, this.camera);
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
    this.scene = new this.constructor.THREE.Scene();
    this.camera = new this.constructor.THREE.PerspectiveCamera(
      60,
      this.canvas.width / this.canvas.height,
      0.1,
      1000
    );
    this.renderer = new this.constructor.THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.resizeView();

    this.scene.background = new this.constructor.THREE.Color(0x404080);

    this.camera.position.x = -2;
    this.camera.position.y = 5;
    this.camera.position.z = 10;
    this.camera.lookAt(0, 1, 0);

    const ambientLight = new this.constructor.THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);

    const directionalLight = new this.constructor.THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 15, 5);
    this.scene.add(directionalLight);
  }
}