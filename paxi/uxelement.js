export default class UxElement {
  constructor(parent) {
    this.parent = parent;
  }

  box(params) {
    const div = document.createElement('div');
    this._setCommon(div, params);

    // By default, let pointer events pass through
    div.style.pointerEvents = 'none';

    // If onClick is provided, enable pointer events and attach handler
    if (typeof params.onClick === 'function') {
      div.style.pointerEvents = 'auto';
      div.onclick = params.onClick;
    }

    if (this.parent) {
      this.parent.appendChild(div);
    }
    return div;
  }

  pegArea(params) {
    params = {...params};
    params.rect = [
      params.position[0],
      params.position[1],
      160,
      320
    ];
    params.backgroundColor = 'lightgray';
    let div = this.box(params);
    return div;
  }

  _setCommon(elem, params) {
    params = params || {};
    let rect = [];
    if (Array.isArray(params.rect)) {
      rect = [...params.rect];
    } else {
      let size = (Array.isArray(params.size) ? params.size : [100, 100]);
      let position = (Array.isArray(params.position) ? params.position : [0, 0]);
      rect = [position[0], position[1], size[0], size[1]];
    }

    elem.style.position = 'absolute';
    elem.style.left = `calc(var(--scale) * ${rect[0]}px)`;
    elem.style.top = `calc(var(--scale) * ${rect[1]}px)`;
    elem.style.width = `calc(var(--scale) * ${rect[2]}px)`;
    elem.style.height = `calc(var(--scale) * ${rect[3]}px)`;

    // Set border color, width, and rounded corners from params
    if (params.borderColor) {
      elem.style.borderColor = params.borderColor;
      elem.style.borderStyle = 'solid';
    }
    if (params.borderWidth) {
      elem.style.borderWidth = typeof params.borderWidth === 'number'
      ? `calc(var(--scale) * ${params.borderWidth})`
      : params.borderWidth;
      elem.style.borderStyle = 'solid';
    }
    if (params.borderRadius) {
      elem.style.borderRadius = typeof params.borderRadius === 'number'
      ? `calc(var(--scale) * ${params.borderRadius})`
      : params.borderRadius;
    }
    // Set background color from params
    if (params.backgroundColor) {
      elem.style.backgroundColor = params.backgroundColor;
    }
  }
}