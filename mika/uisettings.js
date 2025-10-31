export default class UiSettings {
  constructor(parent, program) {
    this.parent = parent;
    this.program = program;

    this._render();
  }

  _render() {
    this.parent.innerHTML = '';

    this._addHeader('Settings ⚙');
    this._addButton('< Main', this._onExit);
    this._addText('System');
    this._addSettingsToggle('Show quick start', 'quickstart');
    this._addSettingsToggle('Auto-continue last game', 'autocontinue');
    this._addText('In-game');
    this._addSettingsToggle('Allow edit mode', 'editmode');
    this._addSettingsToggle('Preview resources', 'previewresources');
  }

  _addText(text) {
    const p = document.createElement('p');
    p.textContent = text;
    this.parent.appendChild(p);
  }

  _addHeader(text) {
    const h = document.createElement('h1');
    h.textContent = text;
    this.parent.appendChild(h);
    return h;
  }

  _addButton(label, onClick) {
    const button = document.createElement('button');
    button.textContent = label;
    if (typeof onClick === 'function') {
      button.addEventListener('click', onClick.bind(this));
    }
    this.parent.appendChild(button);
    return button;
  }

  _addSettingsToggle(label, key) {
    // Read current value from program.saveData.data (safe access)
    const current = !!this.program.saveData.data[key];
    const checkbox = this._addCheckbox(label, current, (checked) => {
      this.program.saveData.data[key] = !!checked;
      this.program.save();
      this._render();
    });
    return checkbox;
  }

  _addCheckbox(label, checked, onChange) {
    const container = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;
    checkbox.id = `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;
    checkbox.addEventListener('change', (e) => {
      if (typeof onChange === 'function') {
        onChange(e.target.checked);
      }
    });

    const labelElement = document.createElement('label');
    labelElement.htmlFor = checkbox.id;
    labelElement.textContent = label;

    container.appendChild(checkbox);
    container.appendChild(labelElement);
    this.parent.appendChild(container);
    return checkbox;
  }

  _onExit() {
    this.program.gotoMode('main');
  }
}
