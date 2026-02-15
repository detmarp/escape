import Astra from '../astra/astra.js';
import screenMain from './screenmain.js';
import screenDom from './screendom.js';
import screenHtml from './screenhtml.js';
import screenCanvas from './screencanvas.js';
import screenThreed from './screenthreed.js';

export default class Program {
  screens = {
    'main': { class: screenMain, params: { hello: 'there' } },
    'html2': { class: screenHtml, params: { nostyle: true } },
    'html': { class: screenHtml, },
    'dom': { class: screenDom, params: { astra: true, } },
    'canvas': { class: screenCanvas, params: { astra: true, } },
    'threed': { class: screenThreed, params: { astra: true, } },
  };

  constructor(root = document.body) {
    this.root = root;
    this.current = null;
  }

  run() {
    this.goto('main');
  }

  goto(name) {
    const baseParams = {
      program: this,
    };
    const screen = this.screens[name];
    if (screen) {
      const params = { ...baseParams, ...(screen.params || {}) };
      this._gotoScreen(screen.class, params);
    }
  }

  _gotoScreen(className, params) {
    if (this.current) {
      if (typeof this.current.term === 'function') {
        this.current.term();
      }
      this.current = null;
    }

    // Clean up Astra if it exists
    if (this.astra) {
      this.astra.reset();
      this.astra = null;
    }

    this.root.innerHTML = '';

    // Always create a screenRoot div
    const screenRoot = document.createElement('div');
    screenRoot.style.width = '100%';
    screenRoot.style.height = '100%';
    this.root.appendChild(screenRoot);

    // Apply Astra if requested
    if (params.astra) {
      this.astra = new Astra('Screen');
      this.astra.setFixedFullscreen();
    }

    this.current = new className(screenRoot, params);
    if (typeof this.current.init === 'function') {
      this.current.init();
    }
  }
}
