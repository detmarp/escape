export default class UxElement {
  constructor(parent) {
    this.parent = parent;
  }

  box(params) {
    const div = document.createElement('div');
    this._noZoom(div);
    this._setCommon(div, params);

    // By default, let pointer events pass through
    div.style.pointerEvents = 'none';

    if (typeof params.onclick === 'function') {
      div.style.pointerEvents = 'auto';
      div.style.touchAction = 'manipulation';
      div.style.userSelect = 'none';
      div.style.webkitUserSelect = 'none';
      div.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        params.onclick(e);
      };
    }

    if (typeof params.onpointerdown === 'function') {
      div.style.pointerEvents = 'auto';
      div.style.touchAction = 'manipulation';
      div.style.userSelect = 'none';
      div.style.webkitUserSelect = 'none';
      div.onpointerdown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        params.onpointerdown(e);
      };
      // Also prevent double-tap zoom on touchend for Safari
      div.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) e.preventDefault();
      }, { passive: false });
    }

    div.update = (params) => {
      this._updateRect(div, params);
    };

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
    params.centered = true;
    let index = params.index || 0;
    let n = params.n || 10;
    let w = 40 + 110 * index / n;
    params.size = [w, 20];

    //params.backgroundColor = 'red';
    params.backgroundColor = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'][index % 7];
    params.borderColor = 'black';

    let div = this.box(params);

    return div;
  }

  _updateRect(elem, params) {
    params = params || {};
    let rect = [];
    // Build a rect from
    //   params.rect OR
    //   params.size & params.position

    elem.mydata ||= {};
    elem.mydata.centered = (params.centered != null) ? params.centered : elem.mydata.centered;

    if (Array.isArray(params.rect)) {
      rect = [...params.rect];
    } else {
      let size = Array.isArray(params.size) ? params.size :
        (elem.mydata.size ?? [100, 100]);
        //([50,20] ?? [100, 100]);
      let position;
      if (Array.isArray(params.position)) {
        position = params.position;
      } else {
        position = elem.mydata.position || [0, 0];
      }
      let topleft = elem.mydata.centered ?
        [ position[0] - size[0] / 2, position[1] - size[1] / 2 ] :
        position;
      rect = [topleft[0], topleft[1], size[0], size[1]];
    }

    elem.mydata.rect = rect;
    elem.mydata.size = [rect[2], rect[3]];
    elem.mydata.position = elem.mydata.centered ?
      [rect[0] + rect[2] / 2, rect[1] + rect[3] / 2] :
      [rect[0], rect[1]];

    elem.style.position = 'absolute';
    elem.style.left = `calc(var(--scale) * ${rect[0]}px)`;
    elem.style.top = `calc(var(--scale) * ${rect[1]}px)`;
    elem.style.width = `calc(var(--scale) * ${rect[2]}px)`;
    elem.style.height = `calc(var(--scale) * ${rect[3]}px)`;
  }

  _setCommon(elem, params) {
    this._updateRect(elem, params);

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

  _noZoom(el) {
    el.addEventListener('gesturestart', e => e.preventDefault());
    el.addEventListener('gesturechange', e => e.preventDefault());
    el.addEventListener('gestureend', e => e.preventDefault());
    el.addEventListener('touchstart', e => {
      if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
    el.addEventListener('dblclick', e => e.preventDefault());
  }
}