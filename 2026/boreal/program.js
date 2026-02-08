import Astra from '../astra/astra.js';
import screenMain from './screenmain.js';
import screenDom from './screendom.js';
import screenCanvas from './screencanvas.js';
import screenThreed from './screenthreed.js';

export default class Program {
  constructor(root = document.body) {
    this.root = root;
    this.current = null;
  }

  run() {
    this.goto('main');
  }

  goto(screen) {
    let params = {
      goto: this.goto.bind(this),
    };
    if (screen == 'main') {
      this.root.innerHTML = '';
      const mainScreen = new screenMain(this.root, params);
    }
    else if (screen == 'dom') {
      this.root.innerHTML = '';
      const domScreen = new screenDom(this.root, params);
      domScreen.init();
    }
    else if (screen == 'canvas') {
      this.root.innerHTML = '';
      const canvasScreen = new screenCanvas(this.root, params);
    }
    else if (screen == 'threed') {
      this.root.innerHTML = '';
      const threedScreen = new screenThreed(this.root, params);
    }
  }
}

// Example usage
new Astra('Boreal').setFixedFullscreen();
const app = new Program();
app.run();
