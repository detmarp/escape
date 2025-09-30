import * as three from '../threejs/build/three.module.js';
import {OrbitControls} from '../threejs/examples/jsm/controls/OrbitControls.js';
import DaxJunk from './daxjunk.js';
import DaxEz from './daxez.js';
import DaxEngine from './daxengine.js';

/// Dax is a easy three.js wrapper, that you init with a canvas
export default class Dax {
  static THREE = three;

  constructor(canvas) {
    this.THREE = this.constructor.THREE; // Instance property
    this.canvas = canvas;
    this.initThree();

    this.engine = new DaxEngine(this);
    this.ez = new DaxEz(this);
    this.junk = new DaxJunk();
    this.frame = 0;
  }

  init(canvas) {
    this.canvas = canvas;
  }

  start() {
    this.isRunning = true;
    this._gameLoop();
  }

  resetCamera() {
    this.camera.position.set(0, 10, 10);
    this.camera.lookAt(0, 5, 0);
    if (this.controls) {
      this.controls.target.set(0, 5, 0);
      this.controls.update();
      this.controls.enableDamping = false;
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.velocity = new this.THREE.Vector3(0, 0, 0);
      this.controls.angularVelocity = new this.THREE.Vector3(0, 0, 0);
    }
  }

  startOrbitControls() {
    try {
      this.controls = new OrbitControls(this.camera, this.canvas);
      this.resetCamera();
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

    if (this.onWork) {
      this.onWork(this.dt, this.time, this.frame);
    }

    if (this.controls) {
      this.controls.update();
    }
  }

  draw() {
    this.frame++;
    this.resizeView();

    if (this.onDraw) {
      this.onDraw(this.dt, this.time, this.frame);
    }

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

    this.resetCamera();

    // Low ambient, medium blue
    const ambientLight = new this.constructor.THREE.AmbientLight(0x667788, 1.0);
    this.scene.add(ambientLight);

    // Overhead sky blue directional
    const skyLight = new this.constructor.THREE.DirectionalLight(0xddeeff, 1.2);
    skyLight.position.set(0, 20, 0);
    this.scene.add(skyLight);

    // Distant sun, white/yellow, for specular
    const sunLight = new this.constructor.THREE.DirectionalLight(0xffeedd, 1.5);
    sunLight.position.set(10, 20, 20);
    this.scene.add(sunLight);
  }
}