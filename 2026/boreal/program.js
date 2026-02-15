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
    this.root.innerHTML = '';
    this.current = new className(this.root, params);
    if (typeof this.current.init === 'function') {
      this.current.init();
    }
  }
}
