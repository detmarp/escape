export default class UiMain {
  constructor(parent, program) {
    this.parent = parent;
    this.program = program;
    this.render();
  }

  render() {
    this.parent.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = 'Main';
    this.parent.appendChild(title);

    const startButton = document.createElement('button');
    startButton.textContent = 'New game';
    startButton.addEventListener('click', () => {
      this.program.newGame();
      this.program.gotoMode('pregame');
    });
    this.parent.appendChild(startButton);

    this._addButton('Quickstart', this._onQuickstart);

    const settingsButton = document.createElement('button');
    settingsButton.textContent = 'Settings';
    settingsButton.addEventListener('click', () => {
      this.program.gotoMode('settings');
    });
    this.parent.appendChild(settingsButton);
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

  _onQuickstart() {
    this.program.newGame();
    this.program.gotoMode('gameboard');
  }
}