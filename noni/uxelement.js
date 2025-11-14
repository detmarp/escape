export default class UxElement {
  constructor(container) {
    this.container = container;
    this.color = {
      border: '#000000',
      background: '#ffffff',
      text: '#000000',
      headerBorder: '#ce9852ff',
      headerBackground: '#fcd8a4ff',
      headerText: '#35312fff',
      infoColor: '#666666',
    };
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
    div.style.whiteSpace = 'pre-wrap';
    div.onclick = params.onClick || (() => {});
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

  headerBar(parent, params = {}) {
    // retuned element has a .update(params) method
    let p2 = Object.assign({}, params);
    p2.rect ||= [0, 0, 540, 48];
    p2.background ||= this.color.headerBackground;
    p2.row ||= true;
    p2.text = '';

    let div = this.box(parent, p2);
    div.style.display = 'flex';
    div.style.flexDirection = 'row';
    div.style.alignItems = 'center';
    div.style.borderBottom = `calc(var(--scale) * 2px) solid ${this.color.headerBorder}`;
    div.style.paddingLeft = `calc(${0.5 * 16} * var(--scale) * 1px)`;
    div.style.columnGap = `calc(${1 * 16} * var(--scale) * 1px)`;
    div.style.fontSize = `calc(1.4 * 16 * var(--scale) * 1px)`;

    function el(text, button) {
      let e = document.createElement(button ? 'button' : 'div');
      div.appendChild(e);
      e.style.display = 'flex';
      e.style.alignItems = 'center';
      if (text) {
        e.textContent = text;
      }
      e.style.height = '100%';
      return e;
    }
    function styleInfo(el) {
      el.style.border = `calc(var(--scale) * 1px) solid #afafafff`;
      el.style.borderRadius = `calc(var(--scale) * 4px)`;
      el.style.padding = `0 calc(var(--scale) * 8px)`;
      el.style.height = '75%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.background = '#fdfaf1ff';
    }
    function styleButton(el) {
      el.style.border = `calc(var(--scale) * 3px) solid #554524ff`;
      el.style.borderRadius = `calc(var(--scale) * 8px)`;
      el.style.padding = `0 calc(var(--scale) * 8px)`;
      el.style.height = '85%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.background = '#fff7d1ff';
      el.style.color = '#35312fff';
    }

    if (params.onLeftClick) {
      let left = el('<🏠', true);
      left.onclick = params.onLeftClick;
      styleButton(left);
    }
    if (params.streak != null) {
      let streak = el(`🏆 ${params.streak}`);
      styleInfo(streak);
    }
    if (params.text) {
      let center = el(params.text);
    }
    if (params.score != null) {
      let s = el();
      styleInfo(s);
      div.score = s;
    }
    if (params.info) {
      let info = el(params.info);
      info.style.color = this.color.infoColor;
    }
    if (params.onRightClick) {
      let right = el('⚙️', true);
      right.onclick = params.onRightClick;
      right.setAttribute('role', 'button');
      styleButton(right);
    }

    div.update = (newParams = {}) => {
      if (newParams.score != null && div.score) {
        div.score.textContent = `Score ${newParams.score}`;
      }
    };
    div.update(params);

    return div
  }

  _size(div, params = {}) {
    let fill = params.fill || false;
    if (fill) {
      div.style.width = '100%';
      div.style.height = '100%';
    }
    if (params.rect) {
      // rect is [x, y, w, h] in logical units
      let rect = params.rect;
      div.style.position = 'absolute';
      div.style.left = `calc(var(--scale) * ${rect[0]}px)`;
      div.style.top = `calc(var(--scale) * ${rect[1]}px)`;
      div.style.width = `calc(var(--scale) * ${rect[2]}px)`;
      div.style.height = `calc(var(--scale) * ${rect[3]}px)`;
    }
    else if (params.size) {
      // size is [w, h] in logical units
      let size = params.size;
      div.style.width = `calc(var(--scale) * ${size[0]}px)`;
      div.style.height = `calc(var(--scale) * ${size[1]}px)`;
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
      div.style.border = `calc(var(--scale) * ${params.borderWidth || 1}px) solid ${params.border}`;
    }
    if (params.radius) {
      div.style.borderRadius = `calc(var(--scale) * ${params.radius}px)`;
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
