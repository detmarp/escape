// Ux is a set of div-formatting functions.
export default class Ux {
  static id = 0;
  static nextHue = 0;

  div(params = {}) {
    let parent = params.parent || document.body;
    let elementType = params.type || 'div';
    let div = document.createElement(elementType);
    parent.append(div);
    div.style.userSelect = 'none';
    this._setId(div, params);
    this._setSize(div, params);
    if (params.text) div.append(params.text)
    this._setColor(div, params);
    this._setBorder(div, params);
    if (params.onclick) {
      div.addEventListener('click', params.onclick);
    }
    return div;
  }

  wireframe(parent = null, params = {}) {
    parent ||= params.parent || document.body;
    let div = this.div({...params, parent});

    const layer = (parent, color) => this.div({
      parent,
      prefix: 'wireframe',
      background: this._nextPastel(),
      border: color,
      fill:true,
    });


    let inner1 = layer(div, '#000');
    let inner2 = layer(inner1, '#fff');
    let inner3 = layer(inner2, '#000');
    inner3.append(inner3.id);

    return div;
  }

  _setId(el, params = {}) {
    let id = Ux.id++;
    el.id = params.id || `${params.prefix || 'ux'}-${id}`;
  }

  _setSize(el, params = {}) {
    if (params.fill) {
      this._fillParent(el);
    } else if (params.size || params.position) {
      this._absolutePosition(el, params);
    }
  }

  _fillParent(el) {
    el.style.position = 'absolute';
    el.style.inset = '0';
  }

  _absolutePosition(el, params) {
    let [w, h] = params.size || [80, 80];
    let [x, y] = params.position || [0, 0];

    Object.assign(el.style, {
      position: 'absolute',
      width: this._scaledSize(w),
      height: this._scaledSize(h, '--logic-h'),
      left: this._scaledSize(x),
      top: this._scaledSize(y, '--logic-h')
    });
  }

  _setColor(el, params = {}) {
    if (params.background) el.style.backgroundColor = params.background;
    if (params.color) el.style.color = params.color;
  }

  _setBorder(el, params = {}) {
    // make a border, but as a child div so it doesn't mess with sibling layout margins
    // use: border (color), radius that uses the calc sizing, and borderwidth
    if (!params.border && !params.borderWidth && !params.radius) return;

    const borderDiv = document.createElement('div');
    this._setId(borderDiv, {prefix: 'border', parent: el});
    el.append(borderDiv);

    Object.assign(borderDiv.style, {
      position: 'absolute',
      inset: '0',
      pointerEvents: 'none',
      boxSizing: 'border-box'
    });

    if (params.border) {
      const width = params.borderWidth || 1;
      const color = params.border; // border is just the color string
      borderDiv.style.border = `${this._scaledSize(width)} solid ${color}`;
    } else if (params.borderWidth) {
      const width = params.borderWidth;
      const color = params.border || '#0f0';
      borderDiv.style.border = `${this._scaledSize(width)} solid ${color}`;
    }

    if (params.radius) {
      borderDiv.style.borderRadius = this._scaledSize(params.radius);
    }
  }

  _nextPastel() {
    let hue = Math.round(((Ux.nextHue++ * 13) % 256 * 360 / 256 + 0) % 360);
    return `hsl(${hue}, 50%, 80%)`;
  }

  _scaledSize(x, variable = '--logic-w') {
    return `calc(${x} * var(${variable}))`;
  }
}