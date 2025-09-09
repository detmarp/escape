import Dax from '../dax/dax.js';
import DrawShell from './drawshell.js';
import Shell from './shell.js';
import Shape12 from './shape12.js';
import DrawMap from './drawmap.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this.makePage();
    this.makeOverlay();
    this.start();
  }

  start() {
  this.dax = new Dax(this.canvas1);
  this.setupScene();
  this.dax.start();
  this.dax.startOrbitControls();
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

    this.overlay = document.createElement('div');
    this.overlay.style.position = 'absolute';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.zIndex = '10';
    this.overlay.style.pointerEvents = 'auto';
    this.overlay.style.padding = '12px';
    this.overlay.style.background = 'rgba(255,255,255,0.0)';
    container.appendChild(this.overlay);
  }

  makeOverlay() {
    this.overlay.innerHTML = '';

    const stepBtn = document.createElement('button');
    stepBtn.textContent = 'Step';
    stepBtn.style.fontSize = '18px';
    stepBtn.style.padding = '12px 24px';
    stepBtn.style.minHeight = '48px';
    stepBtn.style.minWidth = '80px';
    stepBtn.style.border = '2px solid #333';
    stepBtn.style.borderRadius = '8px';
    stepBtn.style.backgroundColor = '#f0f0f0';
    stepBtn.style.cursor = 'pointer';
    stepBtn.style.touchAction = 'manipulation';
    stepBtn.style.transition = 'all 0.1s ease';  // Add smooth transitions

    // Add hover/active effects manually
    stepBtn.onmouseenter = () => {
      stepBtn.style.backgroundColor = '#e0e0e0';
      stepBtn.style.transform = 'scale(1.05)';
    };
    stepBtn.onmouseleave = () => {
      stepBtn.style.backgroundColor = '#f0f0f0';
      stepBtn.style.transform = 'scale(1)';
    };
    stepBtn.onmousedown = () => {
      stepBtn.style.backgroundColor = '#d0d0d0';
      stepBtn.style.transform = 'scale(0.95)';
    };
    stepBtn.onmouseup = () => {
      stepBtn.style.backgroundColor = '#e0e0e0';
      stepBtn.style.transform = 'scale(1.05)';
    };

    stepBtn.onclick = function() {
      this.shell.normalize(1);
      this.draw.updateGeometry();
    }.bind(this);

    this.overlay.appendChild(stepBtn);
  }

  setupScene() {
    this.radius = 1;
    this.shape = new Shape12(this.radius);
    this.shell = new Shell(this.shape);
    //this.shell.subdivide32();
    this.shell.subdivide();
    this.shell.normalize(10);

    //this.dax.ez.add("groundgrid");

    this.draw = new DrawShell(this.shell, this.dax);

    let obj = this.draw.makeObject();
    this.dax.scene.add(obj);

    this.draw.addMarkers();

    const map = new DrawMap(this.dax);
    obj = map.makeObject(this.shell);
    this.dax.scene.add(obj);
  }
}