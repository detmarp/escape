import Ux from './ux.js';
import Celest from './celest.js';

export default class MainLayout {
  constructor(parent = document.body, params = {}) {
    this.size = [360, 640];

    this.parent = parent;
    this.ux = new Ux();

    this.celest = new Celest(this.parent, this.size[0], this.size[1]);
    this.celest.init();

    this.outer = this._div({
      parent: this.celest.inner
    });

    let heights = {
      gap: 2,
      buttonGap: 4,
      sectionGap: 8,
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

  _makeHeader(y, height) {
    this.header = this._div({
      parent: this.outer,
      position: [0, y],
      size: [this.size[0], height]
    });
  }

  _makeStatus(y, height) {
    this.status = this._div({
      parent: this.outer,
      position: [0, y],
      size: [this.size[0], height]
    });
  }

  _makeDice(y, height) {
    this.dice = this._div({
      parent: this.outer,
      position: [0, y],
      size: [this.size[0], height]
    });
  }

  _makeHistory(y, height) {
    this.history = this._div({
      parent: this.outer,
      position: [0, y],
      size: [this.size[0], height]
    });
  }

  _makeButtons(y, buttonsHeight, gap, sectionGap, buttonGap) {
    this.buttonArea = this._div({
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
        position: [x, buttonY],
        size: [buttonWidth, baseButtonHeight]
      });
      this.buttons.push(button);
    }
  }

  _div(params) {
    let div = this.ux.div(params);
    this.ux.wireframe(div);
    return div;
  }

  _button(params) {
    let button = this.ux.div(params);
    this.ux.wireframe(button);
    return button;
  }
}