import Dax from './dax.js';
import DaxEzMesh from './daxezmesh.js';

export default class DaxEz {
  constructor(dax) {
    this.dax = dax;
    this.ezMesh = new DaxEzMesh(dax.constructor.THREE);
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

    if (this.ezMesh.canMake(name)) {
      let thing = this.ezMesh.make(name);
      this.lastObject = thing;
      this.dax.scene.add(thing);
    } else {
      let thing = this.ezMesh.make('error');
      this.lastObject = thing;
      this.dax.scene.add(thing);
    }
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

    const directionalLight = new THREE.DirectionalLight(0x00ffa0, 2);
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
