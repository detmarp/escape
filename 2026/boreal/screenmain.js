import Boreal from './boreal.js';

export default class ScreenMain {
  constructor(parent = document.body, params = {}) {
    this.parent = parent;
    this.params = params;
    this.previewScreens = [];
    this.root = this._render();
    this.parent.appendChild(this.root);
  }

  init() {
    for (const screen of this.previewScreens) {
      if (typeof screen.init === 'function') {
        screen.init();
      }
    }
  }

  term() {
    for (const screen of this.previewScreens) {
      if (typeof screen.term === 'function') {
        screen.term();
      }
    }
  }

  _panel(name, config, onClick) {
    const panel = this._makeLayer0();
    const preview = this._makeLayer1(panel);
    const baseParams = { program: this.params.program };
    const previewParams = { ...baseParams, ...(config.params || {}), nooverlay: true };
    console.log(`Preview for ${name}:`, previewParams);
    const screenInstance = new config.class(preview, previewParams);
    this.previewScreens.push(screenInstance);
    this._makeLayer2(panel, onClick);
    return panel;
  }

  _makeLayer0() {
    // Layer 0: Parent container (sets size)
    const panel = document.createElement('div');
    panel.style.width = '90%';
    panel.style.maxWidth = '95vw';
    panel.style.height = '150px';
    panel.style.border = '1px solid #bbb';
    panel.style.position = 'relative';
    panel.style.overflow = 'hidden';
    panel.style.background = '#fafafa';
    return panel;
  }

  _makeLayer1(parent) {
    // Layer 1: Preview container (matches parent bounds)
    const preview = document.createElement('div');
    preview.style.position = 'absolute';
    preview.style.top = '0';
    preview.style.left = '0';
    preview.style.width = '100%';
    preview.style.height = '100%';
    preview.style.pointerEvents = 'none';
    parent.appendChild(preview);
    return preview;
  }

  _makeLayer2(parent, onClick) {
    // Layer 2: Overlay button (catches clicks)
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.cursor = 'pointer';
    overlay.style.background = 'transparent';
    if (onClick) overlay.onclick = onClick;
    parent.appendChild(overlay);
    return overlay;
  }

  _render() {
    const root = document.createElement('div');

    root.style.textAlign = 'left';
    root.style.padding = '2em';
    root.style.boxSizing = 'border-box';

    root.appendChild(this._element('h1', 'Boreal Screens'));

    const screens = this.params.program.screens;
    for (const [name, config] of Object.entries(screens)) {
      if (name !== 'main') {
        root.appendChild(this._panel(name, config, () => this.params.program.goto(name)));
      }
    }

    return root;
  }

  _element(type = 'div', text = null) {
    const el = document.createElement(type);
    if (text !== null) {
      el.textContent = text;
      el.style.whiteSpace = 'pre-wrap';
    }
    return el;
  }

  _button(label, onClick = null) {
    let button = this._element('button', label);
    if (onClick) button.onclick = onClick;
    return button;
  }
}