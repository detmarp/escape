import Astra from '../astra/astra.js';

class ScreenThreed {
  constructor(parent = document.body, params = {}) {
    this.parent = parent;
    this.params = params;
    this.root = this._render();
    this.parent.appendChild(this.root);
  }

  init() {
    if (!this.params.demomode) {
      this.astra = new Astra('3D Screen');
      this.astra.setFixedFullscreen();
    }
  }

  term() {
    if (this.astra) {
      this.astra.reset();
      this.astra = null;
    }
  }

  _panel(label, onClick) {
    const panel = document.createElement('div');
    panel.style.width = '400px';
    panel.style.maxWidth = '95vw';
    panel.style.height = '100px';
    panel.style.border = '1px solid #bbb';
    panel.style.background = '#fafafa';
    panel.textContent = label;
    if (onClick) panel.onclick = onClick;
    return panel;
  }

  _render() {
    const root = document.createElement('div');
    root.style.textAlign = 'left';
    root.style.margin = '2em 0 0 2em';

    const title = document.createElement('h2');
    title.textContent = '3d screen';
    title.style.marginBottom = '2em';
    root.appendChild(title);

    root.appendChild(this._panel('< main', () => this.params.program && this.params.program.goto('main')));

    return root;
  }
}

export default ScreenThreed;
