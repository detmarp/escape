import Boreal from '../boreal/boreal.js';
import Ux2 from './ux2.js';

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

    this.ux.hr({
      parent: buttonStack
    });

    this.ux.hr({
      parent: buttonStack
    });

    this.ux.div({
      parent: buttonStack,
      type: 'button',
      text: 'add history',
      onclick: () => this.addHistory()
    });

    this.ux.div({
      parent: buttonStack,
      type: 'button',
      text: 'reset',
      onclick: () => this.reset()
    });

    this.ux.div({
      parent: buttonStack,
      type: 'button',
      text: 'clear settings',
      onclick: () => this.clearSettings()
    });

    this.ux.div({
      parent: buttonStack,
      type: 'button',
      text: 'clear history',
      onclick: () => this.clearHistory()
    });

    this.settingsText = this.ux.div({
      type: 'div',
      text: ''
    });
    this.settingsText.style.fontFamily = 'monospace';

    this.historyContainer = this.ux.div({
      type: 'div'
    });

    this.info = this.ux.cornerInfo({
      parent: this.parent,
    });

  }

  term() {}

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
    this.params.program.settings = {};
    this.params.program.history = {};
    this.params.program.save();
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