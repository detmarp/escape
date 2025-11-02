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

    // First row: 2 cards
    const row1 = document.createElement('div');
    row1.style.display = 'flex';
    row1.style.gap = '0.5em';
    row1.style.marginBottom = '0.5em';
    row1.appendChild(this._makeCard({}));
    row1.appendChild(this._makeCard({}));
    this.parent.appendChild(row1);

    // Second row: 4 cards
    const row2 = document.createElement('div');
    row2.style.display = 'flex';
    row2.style.gap = '0.5em';
    row2.style.marginBottom = '0.5em';
    row2.appendChild(this._makeCard({}));
    row2.appendChild(this._makeCard({}));
    row2.appendChild(this._makeCard({}));
    row2.appendChild(this._makeCard({}));
    this.parent.appendChild(row2);

    // Third row: 3 cards
    const row3 = document.createElement('div');
    row3.style.display = 'flex';
    row3.style.gap = '0.5em';
    row3.appendChild(this._makeCard({}));
    row3.appendChild(this._makeCard({}));
    row3.appendChild(this._makeCard({}));
    this.parent.appendChild(row3);
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

  _makeCard(card) {
    const outer = document.createElement('div');
    outer.style.width = '8em';
    outer.style.height = '12em';
    outer.style.display = 'flex';
    outer.style.alignItems = 'center';
    outer.style.justifyContent = 'center';
    outer.style.flexShrink = '0';
    outer.style.border = '3px solid gray';

    const inner = document.createElement('div');
    inner.style.width = 'calc(100% - .2em)';
    inner.style.height = 'calc(100% - .2em)';
    inner.style.border = '1px solid black';
    inner.style.display = 'flex';
    inner.style.alignItems = 'center';
    inner.style.justifyContent = 'center';
    inner.textContent = 'I am a card';

    outer.appendChild(inner);
    return outer;
  }
}