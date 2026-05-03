import Boreal from '../../boreal/boreal.js';
import Ux2 from '../ux2.js';

export default class ScreenSettings {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
    this.ux = new Ux2(this.parent);
  }

  init() {
    ScreenSettings.count++;
    new Boreal(this.parent);

    this.ux.div({
      type: 'h1',
      text: 'Settings'
    });

    let buttonStack = this.ux.stack({gap: 4});

    this.ux.div({
      parent: buttonStack,
      type: 'button',
      text: 'main',
      onclick: () => this.params.program.goto('main')
    });

    this._makeRules(buttonStack);
    this._makeSystem(buttonStack);
    this._makeDebug(buttonStack);

    this.info = this.ux.cornerInfo({
      parent: this.parent,
    });
  }

  term() {}

  _makeRules(parent) {
    this.ux.hr({
      parent: parent
    });

    this.ux.div({
      parent: parent,
      type: 'h2',
      text: 'Rules',
    });

    this._addToggle(parent, 'Allow Diagonal', 'allowDiagonal');
    this._addToggle(parent, 'Allow Adjacent', 'allowAdjacent');
    this._addToggle(parent, 'Go Again After Hit', 'continueAfterHit');
  }

  _makeSystem(parent) {
    this.ux.hr({
      parent: parent
    });
    this.ux.div({
      parent: parent,
      type: 'h2',
      text: 'System',
    });
    this._addToggle(parent, 'One-player demo', 'onePlayerDemo');
    this.ux.div({
      parent: parent,
      type: 'button',
      text: 'reset',
      onclick: () => this.reset()
    });
  }

  _makeDebug(parent) {
    this.ux.hr({
      parent: parent
    });
    this.ux.div({
      parent: parent,
      type: 'h2',
      text: 'Debug',
    });
    this.ux.div({
      parent: parent,
      type: 'button',
      text: 'add history',
      onclick: () => this.addHistory()
    });
    this.ux.div({
      parent: parent,
      type: 'button',
      text: 'clear settings',
      onclick: () => this.clearSettings()
    });

    this.ux.div({
      parent: parent,
      type: 'button',
      text: 'clear history',
      onclick: () => this.clearHistory()
    });

    this.settingsText = this.ux.div({
      parent: parent,
      type: 'div',
      text: ''
    });
    this.settingsText.style.fontFamily = 'monospace';
    this.settingsText.style.wordWrap = 'break-word';
    this.settingsText.style.whiteSpace = 'pre-wrap';
    this.settingsText.style.overflowWrap = 'break-word';
    this.settingsText.style.wordBreak = 'break-word';

    this.historyContainer = this.ux.div({
      type: 'div'
    });

  }

  _addToggle(parent, label, settingKey) {
    let current = !!this.params.program.settings[settingKey];

    let toggle = this.ux.toggle({
      parent: parent,
      label: label,
      value: current,
      onclick: () => {
        if (!this.params.program.settings) {
          this.params.program.settings = {};
        }
        let currentValue = !!this.params.program.settings[settingKey];
        this.params.program.settings[settingKey] = !currentValue;
        this.params.program.save();
        toggle.update(!currentValue);
      }
    });

    return toggle;
  }

  addHistory() {
    if (!this.params.program.history) {
      this.params.program.history = {};
    }
    const timestamp = Date.now();
    this.params.program.history[`entry_${timestamp}`] = {
      timestamp,
      action: 'manual_add',
      screen: 'settings'
    };
    this.params.program.save();
  }

  reset() {
    // Reset both settings and history
    this.params.program.reset();
  }

  clearSettings() {
    this.params.program.settings = {};
    this.params.program.save();
  }

  clearHistory() {
    this.params.program.history = {};
    this.params.program.save();
  }

  updateDisplay() {
    // Update settings display
    const settingsJson = JSON.stringify(this.params.program.settings || {});
    this.settingsText.textContent = `Settings: ${settingsJson}`;

    // Clear and update history display
    this.historyContainer.innerHTML = '';

    if (this.params.program.history) {
      Object.entries(this.params.program.history).forEach(([key, value]) => {
        const historyLine = document.createElement('div');
        historyLine.textContent = `${key}: ${JSON.stringify(value)}`;
        historyLine.style.fontFamily = 'monospace';
        this.historyContainer.appendChild(historyLine);
      });
    }
  }

  work(dt, time, frame) {
    this.updateDisplay();

    this.info.update({
      text: [
        `count: ${ScreenSettings.count}`,
        `frame: ${frame}`,
        `time: ${time.toFixed(3)}`,
        `dt: ${dt.toFixed(3)}`
      ].join('\n')
    });
  }
}