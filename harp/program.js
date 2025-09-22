import AppCanvas from './app-canvas.js';
import AppScene from './app-scene.js';
import AppUI from './app-ui.js';
import AppContainer from './app-container.js';
import HarpScene from './harp-scene.js';
import HarpUI from './harp-ui.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this.container = new AppContainer(this.parent, this, this._onResize.bind(this));
    this.container.run();

    this.canvas = new AppCanvas(this.container.div, this);
    this.canvas.run();

    this.ui = new AppUI(this.container.div, this);
    this.ui.run();

    this.scene = new AppScene(this.canvas.canvas, this);
    this.scene.run();

    this.harpScene = new HarpScene(this.scene, this);
    this.harpScene.run();

    this.harpUI = new HarpUI(this.ui, this);
    this.harpUI.run();

    this._onResize();
  }

  _onResize() {
    if (this.canvas) {
      this.canvas.resize();
      if (this.harpUI && typeof this.harpUI.updateInfo === 'function') {
        this.harpUI.updateInfo();
      }
    }
  }
}