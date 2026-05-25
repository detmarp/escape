import Ux from './ux.js';

export default class Ux2 extends Ux {
  section(params = {}) {
    let div = this.div(params);
    return div;
  }

  cornerInfo(params = {}) {
    params.text ||= 'INFO';
    let div = this.div(params);

    Object.assign(div.style, {
      position: 'absolute',
      top: '0',
      right: '0',
      left: 'auto',
      width: 'auto',
      height: 'auto',
      background: 'none',
      whiteSpace: 'pre',
      textAlign: 'right',
    });

    div.update = (params = {}) => {
      if (params.text !== undefined) {
        div.textContent = params.text;
      }
    };

    div.update(params);

    return div;
  }

  hr(params = {}) {
    let hr = this.div({
      ...params,
      type: 'hr'
    });

    Object.assign(hr.style, {
      border: '1px solid #ccc',
      margin: '0',
      width: '100%',
      height: '1px'
    });

    return hr;
  }

  header(params = {}) {
    let p = {
      size: [360, 30],
      position: [0, 0],
      background: `#ccc`,
      ...params,
    };
    let div = this.div(p);

    // if we pass in a button[] then override with that; more than one if nneded. array of {} with text: onCLick
    if (params.buttons) {
      params.buttons.forEach((btnParams, index) => {
        this.button2({
          parent: div,
          size: [40, 28],
          position: [1 + index * 41, 1],
          text: btnParams.text,
          onclick: btnParams.onClick,
        });
      });
    }
    else {
      let homeButton = this.button2({
        parent: div,
        size: [40, 28],
        position: [1, 1],
        text: '🏠',
        onclick: () => {
          if (params.onhome) {
            params.onhome();
          }
        }
      });
    }

    return div;
  }

  text2(params = {}) {
    const { size = [100, 20], position = [0, 0], ...restParams } = params;

    let div = this.div({
      ...restParams,
      type: 'div'
    });

    // Apply logical positioning and sizing using Celest CSS variables
    Object.assign(div.style, {
      position: 'absolute',
      left: `calc(${position[0]} * var(--logic-w, 1px))`,
      top: `calc(${position[1]} * var(--logic-h, 1px))`,
      width: `calc(${size[0]} * var(--logic-w, 1px))`,
      height: `calc(${size[1]} * var(--logic-h, 1px))`,
      fontSize: `calc(12 * var(--logic-h, 1px))`,
      lineHeight: `calc(14 * var(--logic-h, 1px))`,
      overflow: 'hidden',
      textAlign: 'left',
      verticalAlign: 'top',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    });

    return div;
  }

  button2(params = {}) {
    let outer = this.div({
      parent: params.parent,
      type: 'div'
    });

    Object.assign(outer.style, {
      position: 'absolute',
      left: `calc(${params.position[0]} * var(--logic-w, 1px))`,
      top: `calc(${params.position[1]} * var(--logic-h, 1px))`,
      width: `calc(${params.size[0]} * var(--logic-w, 1px))`,
      height: `calc(${params.size[1]} * var(--logic-h, 1px))`
    });

    let inner = this.div({
      parent: outer,
      type: 'button',
      text: params.text,
    });

    Object.assign(inner.style, {
      position: 'absolute',
      left: `calc(1 * var(--logic-w, 1px))`,
      top: `calc(1 * var(--logic-h, 1px))`,
      width: `calc(${params.size[0] - 2} * var(--logic-w, 1px))`,
      height: `calc(${params.size[1] - 2} * var(--logic-h, 1px))`,
      border: `calc(1 * var(--logic-h, 1px)) solid #000`,
      borderRadius: `calc(4 * var(--logic-h, 1px))`,
      backgroundColor: '#ccf',
      color: '#0e222b',
      fontSize: `calc(12 * var(--logic-h, 1px))`,
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      margin: '0',
      padding: '0',
      overflow: 'hidden'
    });

    if (params.onclick) {
      inner.onclick = params.onclick;
    }

    return outer;
  }

  toggle(params = {}) {
    let button = this.div({
      parent: params.parent,
      type: 'button',
    });

    button.update = (value) => {
      button.textContent = `${params.label}: ${value ? 'ON' : 'OFF'}`;
    };

    button.update(params.value);

    if (params.onclick) {
      button.onclick = params.onclick;
    }

    return button;
  }

}
