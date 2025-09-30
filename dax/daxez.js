import Dax from './dax.js';
import DaxEzMesh from './daxezmesh.js';

export default class DaxEz {
  constructor(dax) {
    this.dax = dax;
    this.ezMesh = new DaxEzMesh(dax.constructor.THREE);
    this.params = {};
  }

  nextCrayon(i) {
    const colors = [
      0xf078a0, // rgb(240,120,160) - Pink
      0xe63c3c, // rgb(230,60,60) - Soft Red
      0xe66e28, // rgb(230,110,40) - Warm Orange
      0xdcaa28, // rgb(220,170,40) - Muted Yellow
      0xa0c83c, // rgb(160,200,60) - Yellow-Green
      0x3ca03c, // rgb(60,160,60) - True Green
      0x3caa96, // rgb(60,170,150) - Teal
      0x46aadc, // rgb(70,170,220) - Baby Blue
      0x4682c8, // rgb(70,130,200) - Soft Blue
      0x6e5abe, // rgb(110,90,190) - Muted Indigo
      0xa050b4, // rgb(160,80,180) - Violet
      0x8c6450, // rgb(140,100,80) - Soft Brown
    ];
    this.params.nextColor = colors[i % colors.length];
  }


  nextColor(color) {
    this.params.nextColor = color;
  }

  nextSize(size) {
    this.params.nextSize = size;
  }

  _getParam(name, defaultValue) {
    if (this.params[name] !== undefined) {
      const value = this.params[name];
      delete this.params[name];
      return value;
    }
    return defaultValue;
  }

  add(name) {
    if (name === "cubex") {
      const geometry = new Dax.THREE.BoxGeometry(1, 1, 1);
      const material = new Dax.THREE.MeshStandardMaterial({ color: 0x00ff00 });
      const cube = new Dax.THREE.Mesh(geometry, material);
      cube.name = "cube";
      this.dax.scene.add(cube);
      this.lastObject = cube;
      return;
    } else if (name === "groundgrid") {
      const grid = new Dax.THREE.GridHelper(10, 10);
      this.dax.scene.add(grid);
      return;
    }

    this.ezMesh.params.color = this._getParam('nextColor', 0xffffff);
    this.ezMesh.params.size = this._getParam('nextSize', 1);

    if (this.ezMesh.canMake(name)) {
      let thing = this.ezMesh.make(name);
      this.lastObject = thing;
      this.dax.scene.add(thing);
    } else {
      let thing = this.ezMesh.make('error');
      this.lastObject = thing;
      this.dax.scene.add(thing);
    }

    this.params = {};
  }

  position(x, y, z) {
    if (this.lastObject) {
      this.lastObject.position.set(x, y, z);
    }
  }

  async justDoIt(canvas) {
    const THREE = await import('https://unpkg.com/three@0.160.0/build/three.module.js');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x404080);

    const camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setSize(canvas.width, canvas.height);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const ambientLight = new THREE.AmbientLight(0x4488dd, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 4;

    function animate() {
      requestAnimationFrame(animate);

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();
  }

  async doIt2(canvas) {
    this.dax = new Dax(canvas);

    //const ambient = new Dax.Thing("ambient");
    //const directional = new Dax.Thing("directional");
    //const cube = new Dax.Thing("cube");

    // Add them to the scene
    //this.dax.engine.scene.add(ambient);
    //this.dax.engine.scene.add(directional);
    //this.dax.engine.scene.add(cube);
    //this.dax.engine.scene.background = 0x404080;

    // Start the engine
    this.dax.start();
  }
}
