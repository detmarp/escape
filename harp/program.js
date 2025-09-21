import Dax from '../dax/dax.js';
import AppCanvas from './app-canvas.js';
import AppScene from './app-scene.js';
import AppControls from './app-controls.js';
import AppUI from './app-ui.js';
import AppContainer from './app-container.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
    //this.scene = new AppScene(this.canvas, this);
    //this.controls = new AppControls(this.canvas, this);
    //this.dax = new Dax(this.canvas.canvas);
  }

  run() {
    this.container = new AppContainer(this.parent, this, this._onResize.bind(this));
    this.container.run();

    this.canvas = new AppCanvas(this.container.div, this);
    this.canvas.run();

    this.ui = new AppUI(this.container.div, this);
    this.ui.run();

    this.info = this.ui.text();
    this._updateInfo();

    this._onResize();
  }

  _onResize() {
    if (this.canvas) {
      this.canvas.resize();
      this._updateInfo();
    }

    console.log('Window dimensions:', window.innerWidth, window.innerHeight);
    if (this.canvas && this.canvas.canvas) {
      console.log('Canvas dimensions:', this.canvas.canvas.width, this.canvas.canvas.height);
    }
  }

  _updateInfo() {
    if (this.info) {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const canvasW = this.canvas?.canvas?.width ?? 0;
      const canvasH = this.canvas?.canvas?.height ?? 0;
      this.info.textContent =
        `Window:\n  ${winW} x ${winH}\n` +
        `Canvas:\n  ${canvasW} x ${canvasH}`;
      this.info.style.whiteSpace = 'pre'; // Preserve newlines
    }
  }
}