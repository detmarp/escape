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

}
