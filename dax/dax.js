import * as three from '../threejs/build/three.module.js';
import {OrbitControls} from '../threejs/examples/jsm/controls/OrbitControls.js';
import DaxJunk from './daxjunk.js';
import DaxEz from './daxez.js';
import DaxEngine from './daxengine.js';

/// Dax is a easy three.js wrapper, that you init with a canvas
export default class Dax {
  static THREE = three;

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

  startOrbitControls() {
    try {
      this.controls = new OrbitControls(this.camera, this.canvas);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.target.set(0, 1, 0);
    } catch (error) {
      console.error('OrbitControls error:', error);
      console.error('Stack trace:', error.stack);
    }
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

    if (this.controls) {
      this.controls.update();
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

    const ambientLight = new this.constructor.THREE.AmbientLight(0x8888aa, 1);
    this.scene.add(ambientLight);

    const directionalLight = new this.constructor.THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 15, 5);
    this.scene.add(directionalLight);
  }
}