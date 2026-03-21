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

      let background = '#ddd';
      let border = `${this._scaledSize(1)} solid #999`;

      switch (params.slotType) {
        case 'ready':
          background = '#4a8';
          border = `${this._scaledSize(2)} solid #295`;
          break;
        case 'selected':
          background = '#fa4';
          border = `${this._scaledSize(3)} solid #c82`;
          break;
        case 'info':
          background = '#aaa';
          border = `${this._scaledSize(1)} solid #666`;
          break;
        case 'used':
          background = '#888';
          border = `${this._scaledSize(1)} solid #555`;
          break;
        default:
          break;
      }

      button.style.backgroundColor = background;
      button.style.border = border;

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

    // Style the left text
    button.leftText.style.fontSize = this._scaledSize(18);
    button.leftText.style.display = 'flex';
    button.leftText.style.alignItems = 'center';
    button.leftText.style.justifyContent = 'flex-start';
    button.leftText.style.textAlign = 'left';
    button.leftText.style.padding = this._scaledSize(4);
    button.leftText.style.boxSizing = 'border-box';
    button.leftText.style.wordWrap = 'break-word';
    button.leftText.style.overflow = 'hidden';

    button.rightText = this.div({
      parent: button,
      position: [buttonWidth * 0.6, 0],
      size: [buttonWidth * 0.4, buttonHeight],
    });

    // Style the right text
    button.rightText.style.fontSize = this._scaledSize(28);
    button.rightText.style.display = 'flex';
    button.rightText.style.alignItems = 'center';
    button.rightText.style.justifyContent = 'flex-end';
    button.rightText.style.textAlign = 'right';
    button.rightText.style.padding = this._scaledSize(4);
    button.rightText.style.boxSizing = 'border-box';
    button.rightText.style.wordWrap = 'break-word';
    button.rightText.style.overflow = 'hidden';

    button.update(params);

    return button;
  }

  die(params = {}) {
    let p = {
      ...params,
      type: 'button',
      size: [40, 55],
      radius: 6,
    };

    let button = this.div(p);
    button.style.borderRadius = this._scaledSize(6);
    button.style.cursor = 'pointer';

    button.update = (params = {}) => {
      const value = params.value;
      const state = params.state || 'normal'; // normal, held, rolling, blank

      // Handle visibility and content for unrolled dice
      if (value === undefined || value === null) {
        button.style.visibility = 'hidden';
        return;
      } else {
        button.style.visibility = 'visible';
      }

      // Set die value text
      button.valueText.textContent = value.toString();

      // Set colors and borders based on state
      let background = '#f0f0f0'; // Light gray default
      let border = `${this._scaledSize(1)} solid #ccc`;

      switch (state) {
        case 'held':
          background = '#d4edda'; // Light green for held
          border = `${this._scaledSize(3)} solid #28a745`; // Thick green border
          break;
        case 'rolling':
          background = '#fff3cd'; // Light yellow for rolling
          border = `${this._scaledSize(2)} solid #ffc107`; // Medium yellow border
          break;
        case 'normal':
        default:
          // Keep defaults
          break;
      }

      button.style.backgroundColor = background;
      button.style.border = border;
    };

    // Create text element for die value
    button.valueText = this.div({
      parent: button,
      position: [0, 0],
      size: [40, 55],
    });

    // Style the value text
    button.valueText.style.fontSize = this._scaledSize(24);
    button.valueText.style.fontWeight = 'bold';
    button.valueText.style.display = 'flex';
    button.valueText.style.alignItems = 'center';
    button.valueText.style.justifyContent = 'center';
    button.valueText.style.textAlign = 'center';
    button.valueText.style.pointerEvents = 'none'; // Let clicks pass through

    // Initialize with params
    button.update(params);

    return button;
  }
}
