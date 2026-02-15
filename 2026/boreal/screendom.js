import Boreal from './boreal.js';

export default class ScreenDom {
  constructor(parent = document.body, params = {}) {
    this.parent = parent;
    this.params = params;
    this.root = this._render();
    this.parent.appendChild(this.root);
    this._rafId = null;
    this._frame = 0;
  }

  init() {
    this._loop();
  }

  term() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    if (this.root) {
      this.root.style.background = '';
    }
  }

  _loop() {
    this._frame++;

    // Update info display
    if (this.infoDiv) {
      const rect = this.root.getBoundingClientRect();
      const size = `Size: ${Math.round(rect.width)}, ${Math.round(rect.height)}`;
      const frame = `Frame: ${this._frame}`;
      this.infoDiv.textContent = `${size}\n${frame}`;
    }

    this._rafId = requestAnimationFrame(() => this._loop());
  }

  _div0() {
    const div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.position = 'relative';
    return div;
  }

  _div1(parent) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '2px';
    div.style.left = '2px';
    div.style.right = '2px';
    div.style.bottom = '2px';
    div.style.background = '#e0e0e0';
    div.style.border = '1px solid #666';
    div.style.borderRadius = '4px';
    div.style.boxSizing = 'border-box';

    // Info text div
    this.infoDiv = document.createElement('div');
    this.infoDiv.style.position = 'absolute';
    this.infoDiv.style.top = '8px';
    this.infoDiv.style.right = '8px';
    this.infoDiv.style.fontFamily = 'monospace';
    this.infoDiv.style.fontSize = '12px';
    this.infoDiv.style.lineHeight = '1.2';
    this.infoDiv.style.whiteSpace = 'pre';
    this.infoDiv.style.textAlign = 'right';
    div.appendChild(this.infoDiv);

    parent.appendChild(div);
    return div;
  }

  _div2(parent) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.boxSizing = 'border-box';

    new Boreal(div);

    if (!this.params.demomode) {
      const homeButton = document.createElement('button');
      homeButton.textContent = '< Home';
      homeButton.onclick = () => this.params.program && this.params.program.goto('main');
      div.appendChild(homeButton);
    }

    parent.appendChild(div);
    return div;
  }

  _render() {
    const root = this._div0();
    this._div1(root);
    this._div2(root);
    return root;
  }
}
