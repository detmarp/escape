import Ux from './ux.js';

export default class Ux2 extends Ux {
  section(params = {}) {
    let div = this.div(params);
    return div;
  }

  slot(params = {}) {
    let p = {
      ...params,
      type: 'button',
      //background: '#d88',
      radius: 8,
      //borderWidth: 1,
      //border: '#0f0',
    };

    console.log(`qqq slot params: ${JSON.stringify(p)}`);
    let button = this.div(p);
    button.style.borderRadius = this._scaledSize(8);

    button.update = (params = {}) => {
      // Handle text updates
      if (params.left !== undefined) {
        button.leftText.textContent = params.left;
      }
      if (params.right !== undefined) {
        button.rightText.textContent = params.right;
      }

      // Handle slotType styling
      if (params.slotType === 'green') {
        button.style.backgroundColor = '#0a8';
        button.style.border = '4px solid #065';
      } else if (params.slotType !== undefined) {
        // Default/other slotType
        button.style.backgroundColor = '#ddd';
        button.style.border = '1px solid #999';
      }

      // Legacy background support
      if (params.background) button.style.backgroundColor = params.background;
    }

    // Create text divs
    const [buttonWidth, buttonHeight] = params.size || [80, 80];
    const [buttonX, buttonY] = params.position || [0, 0];

    button.leftText = this.div({
      parent: button,
      position: [0, 0],
      size: [buttonWidth * 0.6, buttonHeight],
    });

    button.rightText = this.div({
      parent: button,
      position: [buttonWidth * 0.6, 0],
      size: [buttonWidth * 0.4, buttonHeight],
    });

    button.update(params);

    return button;
  }
}
