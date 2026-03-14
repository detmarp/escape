import Ux2 from './ux2.js';
import Celest from './celest.js';

export default class MainLayout {
  constructor(parent = document.body, delegate) {
    this.size = [360, 640];

    this.parent = parent;
    this.ux = new Ux2();
    this.delegate = delegate;

    this.celest = new Celest(this.parent, this.size[0], this.size[1]);
    this.celest.init();

    this.outer = this._div({
      parent: this.celest.inner
    });

    let heights = {
      gap: 2,
      buttonGap: 4,
      sectionGap: 12,
      header: 16,
      status: 40,
      dice: 85,
      history: 100
    };
    heights.buttons = this.size[1] - heights.header - heights.status - heights.dice - heights.history - (4 * heights.gap);

    let y = 0;
    this._makeHeader(y, heights.header);
    y += heights.header + heights.gap;
    this._makeStatus(y, heights.status);
    y += heights.status + heights.gap;
    this._makeDice(y, heights.dice);
    y += heights.dice + heights.gap;
    this._makeHistory(this.size[1] - heights.history, heights.history);
    this._makeButtons(y, heights.buttons, heights.gap, heights.sectionGap, heights.buttonGap);
  }

  updateScore(score, options = {}) {
  }

  updateSlot(i, label, value, state) {
    const button = this.buttons?.[i];
    if (!button) return;

    button.append(`${label}\n${value}\n${state}`);
    button.style.whiteSpace = 'pre-line';
   }

  _makeHeader(y, height) {
    this.header = this._div({
      wireframe: true,
      parent: this.outer,
      position: [0, y],
      size: [this.size[0], height]
    });
  }

  _makeStatus(y, height) {
    // Score area
    this.status = this._div({
      border: '#0d0',
      radius: 8,
      text: '0',
      parent: this.outer,
      position: [0, y],
      size: [this.size[0], height]
    });
  }

  _makeDice(y, height) {
    // Dice and Roll button
    this.dice = this.ux.section({
      parent: this.outer,
      border: '#0d0',
      radius: 8,
      position: [0, y],
      size: [this.size[0], height]
    });
    this.dice.dice = this.ux.div({
      parent: this.dice,
      text: '0 0 0 0 0',
      fill: true,
    });
    let tempHolds = this.ux.div({
      parent: this.dice,
      position: [0, 30],
      size: [200, 50],
      background: '#ddd',
    });
    for (let i = 0; i < 5; i++) {
      this.ux.div({
        parent: tempHolds,
        type: 'button',
        text: `Hold ${i + 1}`,
        onclick: () => this.delegate.onHold(i),
      });
    }
    this.ux.div({
      parent: this.dice,
      type: 'button',
      text: 'Roll',
      position: [240, 10],
      size: [80, 30],
      onclick: () => this.delegate.onRoll(),
    });
  }

  _makeHistory(y, height) {
    this.history = this._div({
      wireframe: true,
      parent: this.outer,
      position: [0, y],
      size: [this.size[0], height]
    });
  }

  _makeButtons(y, buttonsHeight, gap, sectionGap, buttonGap) {
    this.buttonArea = this._div({
      wireframe: true,
      parent: this.outer,
      position: [0, y],
      size: [this.size[0], buttonsHeight]
    });

    this.buttons = [];

    let cols = 3;
    let buttonWidth = (this.size[0] - 2 * buttonGap - (cols - 1) * buttonGap) / cols;
    let baseButtonHeight = (buttonsHeight - 5 * buttonGap - 2 * sectionGap) / 6;

    for (let i = 0; i < 18; i++) {
      let col = i % 3;
      let x = buttonGap + col * (buttonWidth + buttonGap);

      let row = Math.floor(i / 3);
      let buttonY = row * (baseButtonHeight + buttonGap);
      if (i >= 6) buttonY += sectionGap;   // Extra gap after first 6
      if (i >= 13) buttonY += sectionGap;  // Extra gap for buttons 13+

      let button = this._button({
        parent: this.buttonArea,
        type: 'button',
        position: [x, buttonY],
        size: [buttonWidth, baseButtonHeight],
        text: `Btn ${i + 1}`,
        left: `left text`,
        right: `right text`,
        slotType: i === 0 ? 'green' : undefined,
      });
      this.buttons.push(button);
    }
  }

  _div(params) {
    let div = this.ux.div(params);
    if (params.wireframe) this.ux.wireframe(div);
    return div;
  }

  _button(params) {
    let button = this.ux.slot(params);
    return button;
  }
}