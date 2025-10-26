import uiGame from './uigame.js';

export default class UiGame {
  constructor(parent, program) {
    this.parent = parent;
    this.program = program;
    this.render();
  }

  render() {
    this.parent.innerHTML = '';

    this._addHeader('Pre game');
    this._addButton('< Main', this._onExit);
    this._addText(`Game Seed: ${this.program.tiny.gameSeed}`);
    this._addButton('Play', this._onPlay);
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

  _onExit() {
    this.program.gotoMode('main');
  }

  _onPlay() {
    this.program.gotoMode('gameboard');
  }
}