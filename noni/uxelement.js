export default class UxElement {
  constructor(container) {
    this.container = container;
  }

  testFill(parent, params = {}) {
    parent ||= this.container;
    let div = this._div(parent);
    let radius = params.radius || 0;

    div.style.width = '100%';
    div.style.height = '100%';
    let hue = Math.random() * 360;
    let dark = (hue >= 210 || hue <= 35);
    div.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    div.style.border = '1px solid grey';
    if (radius) {
      div.style.borderRadius = `${radius}px`;
    }
    div.style.color = dark ? 'white' : 'black';
    div.style.display = 'flex';
    div.style.alignItems = 'flex-start';
    div.style.justifyContent = 'flex-start';
    div.style.padding = '8px';
    div.style.boxSizing = 'border-box';
    div.style.whiteSpace = 'pre-wrap';
    div.update = function() {
      this.textContent = [
        `${this.offsetWidth} x ${this.offsetHeight}`,
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        `${parent.aspect?.toFixed(3) ?? parent.aspect}`,
        `${parent.aspect *600}`,
      ].join('\n');
    };

    div.update();
    return div;
  }

  box(parent, params = {}) {
    let div = this._div(parent);
    div.style.position = 'relative';
    this._size(div, params);
    this._colors(div, params);
    this._packing(div, params);
    if (params.text) {
      div.textContent = params.text;
    }
    return div;
  }

  text(parent, params = {}) {
    let div = this._div(parent);
    div.textContent = params.text || '';
    return div;
  }

  button(parent, params = {}) {
    let div = document.createElement('button');
    parent ||= this.container;
    parent.appendChild(div);
    div.className = 'button';
    div.textContent = params.text || 'Button';
    div.onclick = params.onClick || (() => {});
    return div;
  }

  _size(div, params = {}) {
    let fill = params.fill || false;
    if (fill) {
      div.style.width = '100%';
      div.style.height = '100%';
    }
  }

  _div(parent) {
    let div = document.createElement('div');
    parent ||= this.container;
    parent.appendChild(div);
    return div;
  }

  _colors(div, params = {}) {
    if (params.background) {
      div.style.backgroundColor = params.background;
    }
    if (params.border) {
      div.style.border = `${params.borderWidth || 1}px solid ${params.border}`;
    }
    if (params.radius) {
      div.style.borderRadius = `${params.radius}px`;
    }
    if (params.textColor) {
      div.style.color = params.textColor;
    }
  }

  _packing(div, params = {}) {
    let row = params.row || false;
    if (row) {
      div.style.display = 'flex';
      div.style.flexDirection = 'row';
      div.style.alignItems = 'flex-start';
      div.style.justifyContent = 'flex-start';
      div.style.flexWrap = 'nowrap';
      div.style.overflow = 'hidden';

      // Make children shrink if needed
      Array.from(div.children).forEach(child => {
        child.style.flexShrink = '1';
        child.style.minWidth = '0';
      });
    } else {
      div.style.display = 'flex';
      div.style.flexDirection = 'column';
      div.style.alignItems = 'flex-start';
      div.style.justifyContent = 'flex-start';
    }
  }
}
