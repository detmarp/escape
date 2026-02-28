export default class Ux {
  static id = 0;
  static nextHue = 0;

  div(params = {}) {
    let parent = params.parent || document.body;
    let div = document.createElement('div');
    parent.appendChild(div);
    this._setId(div, params);
    this._setSize(div, params);
    this._setColor(div, params);
    return div;
  }

  _setId(el, params = {}) {
    let id = Ux.id++;
    el.id = params.id || `${params.prefix || 'ux'}-${id}`;
  }

  _setSize(el, params = {}) {
    if (!params.size && !params.position) {
      this._fillParent(el);
    } else {
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
      width: `calc(${w} * var(--logic-w))`,
      height: `calc(${h} * var(--logic-h))`,
      left: `calc(${x} * var(--logic-w))`,
      top: `calc(${y} * var(--logic-h))`
    });
  }

  _setColor(el, params = {}) {
    if (params.background) el.style.backgroundColor = params.background;
    if (params.border) el.style.border = params.border;
    if (params.color) el.style.color = params.color;
    if (params.text) el.textContent = params.text;
  }

  _nextPastel() {
    let hue = Math.round((Ux.nextHue++ * 37) % 256 * 360 / 256);
    return `hsl(${hue}, 45%, 85%)`;
  }

  wireframe(parent = null, params = {}) {
    parent ||= params.parent || document.body;
    let div = this.div({...params, parent});

    const layer = (parent) => this.div({
      parent,
      prefix: 'wireframe',
      background: this._nextPastel(),
      border: '1px solid rgba(0,0,0,0.3)'
    });

    let inner1 = layer(div);
    let inner2 = layer(inner1);
    let inner3 = layer(inner2);
    inner3.textContent = inner3.id;

    return div;
  }
}