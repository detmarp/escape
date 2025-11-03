import Icons from './icons.js';
import UiParts from './uiparts.js';

export default class UiGame {
  constructor(parent, program) {
    this.parent = parent;
    this.program = program;
    this.hand = this.program.tiny.hand;
    this.render();
  }

  render() {
    this.parent.innerHTML = '';

    this._addHeader('Pre game');
    this._addButton('< Main', this._onExit);
    this._addText(`Game Seed: ${this.program.tiny.gameSeed}`);
    this._addButton('Play', this._onPlay);

    // First row: 2 cards
    if (this.hand.pinks) {
      const row1 = document.createElement('div');
      row1.style.display = 'flex';
      row1.style.gap = '0.5em';
      row1.style.marginBottom = '0.5em';
      this.parent.appendChild(row1);
      this.hand.pinks.forEach((card, i) => {
        row1.appendChild(this._makeCard(card, () => { this._choose(i); }, this.chosen === i));
      });
    }

    const row2 = document.createElement('div');
    row2.style.display = 'flex';
    row2.style.gap = '0.5em';
    row2.style.marginBottom = '0.5em';
    this.parent.appendChild(row2);
    this.hand.cards.forEach((card, i) => {
      row2.appendChild(this._makeCard(card));
    });
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

  _choose(i) {
    this.chosen = i;
    this.render();
  }

  _makeCard(card, onPick, picked) {
    const outer = document.createElement('div');

    if (typeof onPick === 'function') {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = picked || false;
      checkbox.addEventListener('change', () => onPick(card));
      outer.appendChild(checkbox);
    }

    let color = (new UiParts()).getMeeple(card.category).color;

    //outer.style.width = '8em';
    //outer.style.height = '12em';
    outer.style.display = 'flex';
    outer.style.alignItems = 'center';
    outer.style.justifyContent = 'center';
    //outer.style.flexShrink = '0';
    outer.style.border = `3px solid ${color}`;

    const inner = document.createElement('div');
    inner.style.width = 'calc(100% - .2em)';
    inner.style.height = 'calc(100% - .2em)';
    inner.style.border = '1px solid black';
    inner.style.padding = '0.5em';

    let name = card.name;
    let category = card.category;
    let text = card.text;
    let shape = (new Icons()).makePattern(card.shape);
    shape.style.width = '3em';
    shape.style.height = '3em';

    const nameEl = document.createElement('div');
    nameEl.textContent = name;
    nameEl.style.fontWeight = 'bold';
    inner.appendChild(nameEl);

    const categoryEl = document.createElement('div');
    categoryEl.textContent = category;
    inner.appendChild(categoryEl);

    inner.appendChild(shape);

    const textEl = document.createElement('div');
    textEl.textContent = text;
    inner.appendChild(textEl);

    outer.appendChild(inner);
    return outer;
  }
}