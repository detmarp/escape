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
    div.style.position = 'absolute';
    if (params.clickthrough) {
      div.style.pointerEvents = 'none';
    }
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

  headerInfo(parent, params = {}) {
    let el = this._headerElement(parent, params);
    el.style.border = `calc(var(--scale) * 1px) solid #afafafff`;
    el.style.borderRadius = `calc(var(--scale) * 4px)`;
    el.style.padding = `0 calc(var(--scale) * 8px)`;
    el.style.height = '75%';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.background = '#fdfaf1ff';
    return el;
  }

  headerButton(parent, params = {}) {
    let el = this._headerElement(parent, params);
    el.onclick = params.onClick || (() => {});
    el.style.border = `calc(var(--scale) * 3px) solid #554524ff`;
    el.style.borderRadius = `calc(var(--scale) * 8px)`;
    el.style.padding = `0 calc(var(--scale) * 8px)`;
    el.style.height = '85%';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.background = '#fff7d1ff';
    el.style.color = '#35312fff';
    el.style.userSelect = 'none';
    el.style.webkitUserSelect = 'none';
    el.style.touchAction = 'manipulation';
    el.style.pointerEvents = 'auto';
    el.setAttribute('role', 'button');
    return el;
  }

  _headerElement(parent, params = {}) {
    let e = document.createElement(params.onClick ? 'button' : 'div');
    parent.appendChild(e);
    e.style.display = 'flex';
    e.style.alignItems = 'center';
    if (params.text) {
      e.textContent = params.text;
    }
    e.style.height = '100%';
    return e;
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

    if (params.onLeftClick) {
      let left = this.headerButton(div, {
        text: '<🏠',
        onClick: params.onLeftClick
      });
    }
    if (params.streak != null) {
      let streak = this.headerInfo(div, {
        text: `🏆 ${params.streak}`
      });
    }
    if (params.text) {
      let center = this.headerInfo(div, {
        text: params.text
      });
    }
    if (params.score != null) {
      let s = this.headerInfo(div, {
        text: `Score ${params.score}`
      });
      div.score = s;
    }
    if (params.info) {
      let info = this.headerInfo(div, {
        text: params.info
      });
      info.style.color = this.color.infoColor;
    }
    if (params.onRightClick) {
      let right = this.headerButton(div, {
        text: '⚙️',
        onClick: params.onRightClick
      });
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

  bin(parent, params = {}) {
    params = {
      ...params,
      //background: '#c0bdb8ff',
      //border: '#8f8b86ff',
      borderWidth: 1,
    };
    let div = this.box(parent, params);

    let [w, h] = params.rect.slice(2,4);
    let rect1 = [2, 2, w - 4, h - 4];
    let layer1 = this.box(div, {
      rect: rect1,
      border: '#554e49ff',
      borderWidth: 2,
      radius: 8,
    });
    layer1.style.background = 'linear-gradient(135deg, #585653 20%, #a0978d 100%)';

    let rect2 = [6, 6, w - 12, h - 12];
    let layer2 = this.box(div, {
      rect: rect2,
      border: '#534d47ff',
      borderWidth: 2,
      radius: 8,
    });
    layer2.style.background = 'linear-gradient(135deg, #b6b1acff 30%, #dfdbd9ff 100%)';

    return div;
  }

  cell(parent, params = {}) {
    params = Object.assign({}, params);
    params.background = '#b38056ff';

    let div = this.box(parent, params);
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.textAlign = 'center';

    // layer on some effects
    let layer1 = this.box(div, {
      rect: [2, 2, 96, 96],
      radius: 8,
    });
    layer1.style.background = 'linear-gradient(135deg, #66cc66 60%, #72d872ff 100%)';

    // add the sub-elements
    let text = this.box(div, {
      rect: [0, 0, 100, 100],
      textColor: '#ff0000',
      text: 'x',
    });
    text.style.display = 'flex';
    text.style.alignItems = 'center';
    text.style.justifyContent = 'center';
    text.style.fontSize = '5em';
    text.style.textAlign = 'center';
    div.text = text;
    let current = this.box(div, {
      rect: [0, 0, 100, 100],
      border: '#ffffff',
      borderWidth: 1,
      radius: 4,
    });
    div.current = current;

    let building = this.box(div, {
      rect: [4, 4, 92, 92],
      border: '#ffff00',
      borderWidth: 5,
      radius: 4,
    });
    div.building = building;

    let plan = this.box(div, {
      rect: [6, 6, 88, 88],
      border: '#00ff00',
      borderWidth: 5,
      radius: 4,
    });
    div.plan = plan;

    let target = this.box(div, {
      rect: [30, 30, 40, 40],
      background: '#00ff00',
      radius: 20,
    });
    div.target = target;

    div.update = (params = {}) => {
      // turn on/off elements
      // selected: bool; building: color; plan: color; target: bool; x:bool
      div.text.textContent = params.x ? 'x' : '';

      div.current.style.display = params.selected ? '' : 'none';

      div.building.style.display = params.building ? '' : 'none';
      div.building.style.borderColor = params.building;

      div.plan.style.display = params.plan ? '' : 'none';
      div.plan.style.borderColor = params.plan;

      div.target.style.display = params.target ? '' : 'none';
    };

    div.update(params);
    return div;
  }

}
