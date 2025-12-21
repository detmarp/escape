export default class UxElement {
  constructor(parent) {
    this.parent = parent;
  }

  box(params) {
    const div = document.createElement('div');
    this._setCommon(div, params);

    // By default, let pointer events pass through
    div.style.pointerEvents = 'none';

    if (typeof params.onclick === 'function') {
      div.style.pointerEvents = 'auto';
      div.onclick = params.onclick;
    }

    if (typeof params.onpointerdown === 'function') {
      div.style.pointerEvents = 'auto';
      div.onpointerdown = params.onpointerdown;
    }

    let parent = params.parent || this.parent;
    if (parent) {
      parent.appendChild(div);
    }
    return div;
  }

  pegArea(params) {
    params = {...params};
    params.rect = [
      params.position[0],
      params.position[1],
      160,
      420
    ];
    params.backgroundColor = 'lightgray';
    let div = this.box(params);
    return div;
  }

  topText(params) {
    params = {...params};
    let div = this.box(params);
    div.style.textAlign = 'center';
    div.style.fontSize = 'calc(var(--scale) * 24px)';
    div.style.fontWeight = 'bold';
    div.style.pointerEvents = 'none';
    return div;
  }

  button(params) {
    params = {...params};
    params.sizxe = [100, 100];
    params.backgroundColor = 'lightgray';
    params.borderColor = 'gray';
    params.borderRadius = 50;
    let div = this.box(params);
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.textAlign = 'center';
    div.style.fontSize = 'calc(var(--scale) * 70px)';
    div.style.fontWeight = 'bold';
    return div;
  }

  disk(params) {
    params = {...params};
    params.rect = [
      params.position[0],
      params.position[1],
      120,
      20,
    ];
    params.backgroundColor = 'orange';
    let index = params.index || 0;
    let n = params.n || 10;
    let width = 60 + Math.round((index + 1) * (160 - 60) / n);
    params.borderColor = 'black';
    let div = this.box(params);

    // let inner = this.box({
    //   size: [width, 20],
    //   parent: div,
    //   backgroundColor: 'orange',
    // });
    return div;
  }

  _setSize(elem, params) {
    params = params || {};
    let rect = [];
    // Build a rect from
    //   params.rect OR
    //   params.size & params.position OR
    //   params.size & params.center

    if (Array.isArray(params.rect)) {
      rect = [...params.rect];
    } else {
      let size = (Array.isArray(params.size) ? params.size : [100, 100]);
      let position;
      if (Array.isArray(params.center)) {
        position = [
          params.center[0] - size[0] / 2,
          params.center[1] - size[1] / 2
        ];
      } else if (Array.isArray(params.position)) {
        position = params.position;
      } else {
        position = [0, 0];
      }
      rect = [position[0], position[1], size[0], size[1]];
    }

    elem.style.position = 'absolute';
    elem.style.left = `calc(var(--scale) * ${rect[0]}px)`;
    elem.style.top = `calc(var(--scale) * ${rect[1]}px)`;
    elem.style.width = `calc(var(--scale) * ${rect[2]}px)`;
    elem.style.height = `calc(var(--scale) * ${rect[3]}px)`;
  }

  _setCommon(elem, params) {
    this._setSize(elem, params);

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
      elem.style.borderRadius = `calc(var(--scale) * ${params.borderRadius}px)`;
    }
    // Set background color from params
    if (params.backgroundColor) {
      elem.style.backgroundColor = params.backgroundColor;
    }
    // Set text content if params.text is provided
    if (typeof params.text === 'string') {
      elem.textContent = params.text;
      elem.style.userSelect = 'none';
      elem.style.whiteSpace = 'pre-wrap';
    }
  }
}