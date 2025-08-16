import Dax from '../dax/dax.js';

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
  }

  setupScene() {
    this.dax.ez.add("cube");
    this.dax.ez.position(0, 0.5, 0);

    this.dax.ez.add("cube");
    this.dax.ez.position(2, 0.5, 0);

    this.dax.ez.add("tree");
    this.dax.ez.position(3, 0.5, 0);

    var list = [
      ["tree", 0, 0.5, -10],
      ["tree", -2, 0.5, -10],
      ["tree", -4, 0.5, -10],
      ["tree", 0, 0.5, -12],
      ["tree", -2, 0.5, -12],
      ["tree", -4, 0.5, -12],
    ];
    for (let item of list) {
      this.dax.ez.add(item[0]);
      this.dax.ez.position(item[1], item[2], item[3]);
    }

    this.dax.ez.add("groundgrid");
  }
}