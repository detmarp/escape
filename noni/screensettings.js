import UxElement from './uxelement.js';

export default class ScreenMain {
  constructor(program) {
    this.program = program;
    this.container = program.container;
    this.parent = this.container.inner;
    this.uxe = new UxElement(this.parent);
  }

  run() {
    this.update();
  }

  update() {
    this.parent.innerHTML = '';

    this.box = this.uxe.box(this.parent, {
      fill: true,
      row: false,
      radius: this.container.u(20),
      background: '#eeeeee',
      border: '#000000',
    });

    this._text('Settings ⚙');

    this.uxe.button(this.box, {
      text: '< Main',
      onClick: () => { this._onExit(); },
    });
    this._text('System');
    this._addSettingsToggle('Auto-continue last game', 'autocontinue');
    this._addSettingsToggle('Show quick start', 'quickstart');
    this._addSettingsToggle('Automatic quick start', 'autoquickstart');
    this._text('In-game');
    this._addSettingsToggle('Allow edit mode', 'editmode');
    this._addSettingsToggle('Preview resources', 'previewresources');
    this._text('Misc');
    this._addSettingsToggle('Show bot button', 'botbutton');
    this._addSettingsToggle('Log SaveData', 'logsavedata');
    this._text('Data');
    this.uxe.button(this.box, {
      text: 'Clear game history',
      onClick: () => {
        this._clearOnlyHistory();
      },
    });
    this.uxe.button(this.box, {
      text: 'Clear *ALL* saved data',
      onClick: () => {
        this._clearData();
      },
    });

  }

  _text(text) {
    this.uxe.text(this.box, {
      text: text,
    });
  }

  _onExit() {
    this.program.goto.to('main');
  }

  _clearData() {
    this.program.saveData._debugClear();
    this.program.save();
    this.update();
  }

  _clearOnlyHistory() {
    this.program.saveData.load();
    this.program.saveData.data.history = [];
    this.program.save();
    this.update();
  }

    _addSettingsToggle(label, key) {
    // Read current value from program.saveData.data (safe access)
    const current = !!this.program.saveData.data[key];
    const checkbox = this._addCheckbox(label, current, (checked) => {
      this.program.saveData.data[key] = !!checked;
      this.program.save();
      this.update();
    });
    return checkbox;
  }

  _addCheckbox(label, checked, onChange) {
    const container = document.createElement('div');
    this.box.appendChild(container);

    const checkbox = document.createElement('input');
    container.appendChild(checkbox);

    checkbox.type = 'checkbox';
    checkbox.checked = checked;
    checkbox.id = `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;
    checkbox.addEventListener('change', (e) => {
      if (typeof onChange === 'function') {
        onChange(e.target.checked);
      }
    });

    const labelElement = document.createElement('label');
    container.appendChild(labelElement);

    labelElement.htmlFor = checkbox.id;
    labelElement.textContent = label;
    return checkbox;
  }

}
