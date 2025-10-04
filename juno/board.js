export default class Board {
  constructor(parent) {
    this.parent = parent;
    this.container = document.createElement('div');
    parent.appendChild(this.container);

    this._setup();

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  setTop(text, label, onClick) {
    if (this.top && this.top.center && this.top.right) {
      this.top.center.textContent = text;
      this.top.right.textContent = label;
      this.top.right.onclick = onClick || null;
      this.top.right.style.cursor = onClick ? 'pointer' : 'default';
    }
  }

  setDice(values, holds, onToggle, label, onClick) {
    if (this.dice && this.dice.dice) {
      for (let i = 0; i < 5; i++) {
        this.dice.dice[i].textContent = `value:${values[i]}, hold:${holds[i]}`;
        this.dice.dice[i].onclick = onToggle ? () => onToggle(i) : null;
        this.dice.dice[i].style.cursor = 'pointer';
      }
      this.dice.right.textContent = label;
      this.dice.right.onclick = onClick || null;
      this.dice.right.style.cursor = onClick ? 'pointer' : 'default';
    }
  }

  setCell(i, text, value, onClick, style) {
    if (this.scores && this.scores.cells && this.scores.cells[i]) {
      const cell = this.scores.cells[i];
      cell.textContent = `${text}: ${value}, ${style}`;
      cell.onclick = onClick || null;
    }
  }

  _resize() {
    const pad = 4;
    const size = Math.min(window.innerWidth, window.innerHeight) - 2 * pad - 4;
    this.size = size;
    this.container.style.width = size + 'px';
    this.container.style.height = size + 'px';
    this.container.style.setProperty('--board-size', size + 'px');
  }

  _addSlice(parent, flex) {
    const slice = document.createElement('div');
    slice.style.width = '100%';
    slice.style.flex = flex;
    parent.appendChild(slice);
    this._applyStyles(slice, ['clean', 'pastel']);
    return slice;
  }

  _setup() {
    this.container.style.position = 'absolute';
    this.container.style.left = '50%';
    this.container.style.top = '0';
    this.container.style.transform = 'translateX(-50%)';

    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.justifyContent = 'flex-start';
    this.container.style.alignItems = 'stretch';
    this.container.innerHTML = '';
    this.top = this._addSlice(this.container, 2);
    this.dice = this._addSlice(this.container, 3);
    this.scores = this._addSlice(this.container, 12);
    this.bottom = this._addSlice(this.container, 2);

    [this.top.center, this.top.right] = this._topParts(this.top);

    [this.dice.dice, this.dice.right] = this._diceParts(this.dice);

    this.scores.cells = this._cells(this.scores)
  }

  _topParts(parent) {
    parent.style.position = 'relative';
    parent.style.overflow = 'hidden';

    const center = document.createElement('div');
    center.style.position = 'absolute';
    center.style.left = '25%';
    center.style.top = '0';
    center.style.width = '50%';
    center.style.height = '100%';
    center.style.maxHeight = 'calc(100% - 2px)';
    center.style.boxSizing = 'border-box';
    center.textContent = '000';
    parent.appendChild(center);

    const right = document.createElement('button');
    right.style.position = 'absolute';
    right.style.right = '0';
    right.style.top = '0';
    right.style.width = '20%';
    right.style.height = '100%';
    right.style.maxHeight = 'calc(100% - 2px)';
    right.style.boxSizing = 'border-box';
    parent.appendChild(right);

    this._applyStyles(center, ['clean', 'pastel', 'margin']);
    this._applyStyles(right, ['clean', 'pastel', 'margin']);

    return [center, right];
  }

  _diceParts(parent) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.boxSizing = 'border-box';
    parent.appendChild(container);

    const dice = [];
    for (let i = 0; i < 5; i++) {
      const die = document.createElement('div');
      die.style.flex = '15';
      die.style.height = 'calc(100% - 2px)';
      die.style.boxSizing = 'border-box';
      // Placeholder for text and onclick, to be set later
      container.appendChild(die);
      this._applyStyles(die, ['clean', 'pastel', 'margin']);
      dice.push(die);
    }

    const spacer = document.createElement('div');
    spacer.style.flex = '5';
    spacer.style.height = '100%';
    spacer.style.boxSizing = 'border-box';
    container.appendChild(spacer);
    this._applyStyles(spacer, ['margin']);

    const right = document.createElement('button');
    right.style.flex = '20';
    right.style.height = 'calc(100% - 2px)';
    right.style.boxSizing = 'border-box';
    container.appendChild(right);
    this._applyStyles(right, ['clean', 'pastel', 'margin']);

    return [dice, right];
  }

  _cells(parent) {
    const cells = [];
    parent.style.display = 'grid';
    parent.style.gridTemplateColumns = 'repeat(3, 1fr)';
    parent.style.gridTemplateRows = 'repeat(6, 1fr)';
    for (let i = 0; i < 18; i++) {
      const cell = document.createElement('div');
      parent.appendChild(cell);
      this._applyStyles(cell, ['clean', 'pastel', 'margin']);
      cells.push(cell);
    }
    return cells;
  }

  _rightContainer(parent) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.boxSizing = 'border-box';
    parent.appendChild(container);
    const left = document.createElement('div');
    left.style.height = '100%';
    container.appendChild(left);
    const right = document.createElement('div');
    right.style.height = 'calc(100% - 4px)';
    container.appendChild(right);

    left.style.flex = '6';
    right.style.flex = '1';

    this._applyStyles(right, ['clean', 'pastel', 'margin']);
    return right;
  }

  _applyStyles(element, style) {
    const styles = Array.isArray(style) ? style : [style];
    styles.forEach(s => {
      switch (s.toLowerCase().trim()) {
      case 'clean':
        element.style.padding = '0';
        element.style.margin = '0';
        element.style.border = '1px solid #333';
        element.style.backgroundColor = '#eee';
        break;
      case 'pastel':
        element.style.backgroundColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 85%)`;
        break;
      case 'margin':
       element.style.margin = '1px';
        break;
      }
    });
  }
}