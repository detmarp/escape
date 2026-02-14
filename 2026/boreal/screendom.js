export default class ScreenDom {
  constructor(parent = document.body, params = {}) {
    this.parent = parent;
    this.params = params;
    this.root = this._render();
    this.parent.appendChild(this.root);
    this._running = false;
    this._rafId = null;
    this._frame = 0;
  }

  init() {
    this._running = true;
    this._loop();
  }

  term() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    if (this.root) {
      this.root.style.background = '';
    }
  }

  _loop() {
    if (!this._running) return;
    this._frame++;
    this.root.style.background = (this._frame % 2 === 0) ? 'red' : 'yellow';
    this._rafId = requestAnimationFrame(() => this._loop());
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
    title.textContent = 'dom screen';
    title.style.marginBottom = '2em';
    root.appendChild(title);

    root.appendChild(this._panel('< main', () => goto && goto('main')));

    return root;
  }
}
