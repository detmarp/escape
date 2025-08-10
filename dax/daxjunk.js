export default class DaxJunk {
  constructor() {
    this.items = [];
  }

  add(item) {
    this.items.push(item);
  }

  remove(item) {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  list() {
    return [...this.items];
  }

  clear() {
    this.items = [];
  }

  async justDoIt(canvas) {
    // Load Three.js from a simple CDN
    const THREE = await import('https://unpkg.com/three@0.160.0/build/three.module.js');

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x404080); // Midnight blue background

    const camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setSize(canvas.width, canvas.height);

    // Create a cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff }); // Brighter green
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Deep blue ambient light
    const ambientLight = new THREE.AmbientLight(0x4488dd, 0.3); // Deep blue ambient
    scene.add(ambientLight);

    // Bright yellow directional light
    const directionalLight = new THREE.DirectionalLight(0xffffa0, 2); // Bright yellow
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Move camera back a bit
    camera.position.z = 4;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();
  }
}