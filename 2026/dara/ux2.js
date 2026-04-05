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
    const { size = [80, 30], position = [0, 0], ...restParams } = params;

    let button = this.div({
      ...restParams,
      type: 'button'
    });

    // Apply logical positioning and sizing using Celest CSS variables
    Object.assign(button.style, {
      position: 'absolute',
      left: `calc(${position[0]} * var(--logic-w, 1px))`,
      top: `calc(${position[1]} * var(--logic-h, 1px))`,
      width: `calc(${size[0]} * var(--logic-w, 1px))`,
      height: `calc(${size[1]} * var(--logic-h, 1px))`,
      fontSize: `calc(12 * var(--logic-h, 1px))`,
      lineHeight: `calc(${size[1]} * var(--logic-h, 1px))`,
      borderRadius: `calc(${Math.min(4, size[1] * 0.15)} * var(--logic-h, 1px))`,
      border: `calc(1 * var(--logic-h, 1px)) solid #ccc`,
      padding: `calc(${size[1] * 0.1} * var(--logic-h, 1px)) calc(${size[0] * 0.1} * var(--logic-w, 1px))`,
      margin: '0',
      boxSizing: 'border-box',
      cursor: 'pointer',
      textAlign: 'center',
      overflow: 'hidden'
    });

    return button;
  }

}
