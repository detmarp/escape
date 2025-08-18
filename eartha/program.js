import Dax from '../dax/dax.js';
import Ob1 from './ob1.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this.makePage();
  }

  makePage() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.margin = '0';
    container.style.padding = '0';
    container.style.overflow = 'hidden';

    this.canvas1 = document.createElement('canvas');
    this.canvas1.style.width = '100%';
    this.canvas1.style.height = '100%';
    this.canvas1.style.display = 'block';
    container.appendChild(this.canvas1);

    const updateCanvasSize = () => {
      this.canvas1.width = container.clientWidth;
      this.canvas1.height = container.clientHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    this.parent.appendChild(container);

    this.dax = new Dax(this.canvas1);
    this.setupScene();
    this.dax.start();
    this.dax.startOrbitControls();
  }

  setupScene() {
    this.dax.ez.nextColor(0xffffff);
    this.dax.ez.add("ball");
    this.dax.ez.add("groundgrid");

    var mesh = new Ob1().build();
    this.dax.scene.add(mesh);
  }
}