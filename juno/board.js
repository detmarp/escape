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
        //this.dice.dice[i].textContent = `value:${values[i]}, hold:${holds[i]}`;
        const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        let value = values[i] !== undefined ? faces[values[i] - 1] : '';
        let hold = holds[i];
        this.dice.dice[i].textContent = value
        this.dice.dice[i].onclick = onToggle ? () => onToggle(i) : null;
        this.dice.dice[i].style.cursor = 'pointer';
        var style = [hold ? 'diehold' : 'die'];
        //style.push('nogrow');
        this._applyStyles(this.dice.dice[i], style);
      }
      this.dice.right.textContent = label;
      this.dice.right.onclick = onClick || null;
      this.dice.right.style.cursor = onClick ? 'pointer' : 'default';
    }
  }

  setCell(i, text, value, onClick, style) {
    if (this.scores && this.scores.cells && this.scores.cells[i]) {
      const cell = this.scores.cells[i];
      if (cell.left && cell.right) {
        cell.left.textContent = `${text}`;
        cell.right.textContent = value;
      } else {
        cell.textContent = `${text}: ${value}, ${style}`;
      }
      cell.onclick = onClick || null;
      let rightStyle = ['cellright'];
      let cellStyle = ['cellused']; // used, 3
      if (style == 4) {
        cellStyle = ['cellinfo', 'cell'];
        rightStyle.push('infotext');
      }
      else if (style == 2) {
        cellStyle = 'cellselected';
      }
      else if (style == 'unused') {
        cellStyle = ['cellavailable', 'cell'];
        rightStyle.push('option');
      }
      else if (style == 'preroll-available') {
        cellStyle = 'white';
      }
      else if (style == 0) {
        cellStyle = 'cellnone';
      }
      else if (style == 'selected') {
        cellStyle = ['cell-selected', 'cell-round'];
      }
      else if (style == 'start') {
        cellStyle = ['cell-white', 'cell-square'];
      }
      else if (style == 'info') {
        cellStyle = ['cell-info', 'cell-square'];
        rightStyle.push('infotext');
      }
      else if (style == 'used') {
        cellStyle = ['cell-used', 'cell-square'];
      }

      this._applyStyles(cell, cellStyle);
      this._applyStyles(cell.left, ['cellleft']);
      this._applyStyles(cell.right, rightStyle);
    }
  }

  _resize() {
    const pad = 4;
    const size = Math.min(window.innerWidth, window.innerHeight) - 2 * pad - 4;
    this.size = size;
    this.container.style.width = size + 'px';
    this.container.style.height = size + 'px';
    this.container.style.setProperty('--board-size', size + 'px');
    this.container.style.setProperty('--size120', size/120 + 'px');
  }

  _addSlice(parent, flex) {
    const slice = document.createElement('div');
    slice.style.width = '100%';
    slice.style.flex = flex;
    parent.appendChild(slice);
    //this._applyStyles(slice, ['clean', 'pastel']);
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

    this.bottom.textContent = '';
    // Set up grid for 3 columns, 4 rows
    this.bottom.style.display = 'grid';
    this.bottom.style.gridTemplateColumns = 'repeat(3, 1fr)';
    this.bottom.style.gridTemplateRows = 'repeat(3, 1fr)';
    // Add 12 elements, sample text, column-major order, explicit placement
    for (let i = 0; i < 9; i++) {
      const col = Math.floor(i / 3) + 1;
      const row = (i % 3) + 1;
      const line = document.createElement('div');
      line.style.gridColumn = col;
      line.style.gridRow = row;
      this.bottom.appendChild(line);
    }
    this._applyStyles(this.bottom, ['clean', 'stats']);
  }

  setStats(text, index) {
    const stat = this.bottom.children[index];
    if (stat) {
      stat.textContent = text;
    }
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

    this._applyStyles(center, 'topscore');
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
      //this._applyStyles(die, ['clean', 'pastel', 'margin']);
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
    //parent.style.gap = '2px'; // 2px spacing between cells
    for (let i = 0; i < 18; i++) {
      const cell = document.createElement('div');
      cell.style.display = 'flex';
      cell.style.flexDirection = 'row';
      cell.style.width = 'calc(100% - 4px)';
      cell.style.height = 'calc(100% - 4px)';
      cell.style.boxSizing = 'border-box' ;

      let parts = [];
      for (let j = 0; j < 2; j++) {
        const part = document.createElement('div');
        part.style.flex = j ? 2 : 3;
        part.style.height = 'calc(100% - 2px)';
        part.style.pointerEvents = 'none'; // Prevent part from accepting pointer events
        cell.appendChild(part);
        parts.push(part);
        //this._applyStyles(part, ['clean', 'pastel', 'margin']);
      }

      cell.left = parts[0];
      cell.right = parts[1];

      parent.appendChild(cell);
      //this._applyStyles(cell, ['clean', 'pastel', 'margin']);
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
      case 'cellleft':
        element.style.fontSize = 'calc(var(--board-size) * 0.03)';
        element.style.overflow = 'hidden';
        element.style.whiteSpace = 'pre-line'; // allow wrapping and linebreaks
        element.style.wordBreak = 'break-word';
        element.style.height = '100%';
        element.style.maxHeight = '100%';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'flex-start';
        element.style.padding = '4px';
        break;
      case 'cellright':
        element.style.fontSize = 'calc(var(--board-size) * 0.06)';
        element.style.overflow = 'hidden';
        element.style.whiteSpace = 'normal'; // allow wrapping
        element.style.wordBreak = 'break-word';
        element.style.height = '100%';
        element.style.maxHeight = '100%';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'flex-end';
        element.style.marginRight = '4px';
        element.style.color = '#111';
        break;
      case 'cellnone':
        element.style.border = '2px solid #333';
        element.style.borderRadius = '4px';
        element.style.backgroundColor = '#eee';
        element.style.color = '#222';
        element.style.margin = '2px';
        break;
      case 'cellavailable':
        element.style.border = '2px solid #333';
        element.style.borderRadius = '4px';
        element.style.backgroundColor = '#efe';
        element.style.color = '#222';
        element.style.margin = '2px';
        break;
      case 'cellselected':
        element.style.border = '2px solid #333';
        element.style.borderRadius = '4px';
        element.style.backgroundColor = '#2d2';
        element.style.color = '#131';
        element.style.margin = '2px';
        break;
      case 'cell':
        element.style.borderRadius = '15% / 50%';
        element.style.padding = 'calc(var(--board-size) * 0.01)';
        break;
      case 'cell-white':
        element.style.border = '2px solid #333';
        element.style.borderRadius = '4px';
        element.style.backgroundColor = '#fff';
        element.style.color = '#111';
        element.style.margin = '2px';
        break;
      case 'cell-selected':
        element.style.border = '2px solid #333';
        element.style.borderRadius = '4px';
        element.style.backgroundColor = '#7bd';
        element.style.color = '#003';
        element.style.margin = '2px';
        break;
      case 'cell-round':
        element.style.borderRadius = '15% / 50%';
        element.style.padding = 'calc(var(--board-size) * 0.01)';
        break;
      case 'cell-square':
        element.style.borderRadius = '4% / 12%';
        element.style.padding = 'calc(var(--board-size) * 0.01)';
        break;
      case 'cell-used':
        element.style.border = '2px solid #333';
        element.style.borderRadius = '4px';
        element.style.backgroundColor = '#ddd';
        element.style.color = '#111';
        element.style.margin = '2px';
        element.style.borderRadius = '15%';
        break;
      case 'cell-info':
        element.style.border = '2px solid #333';
        element.style.borderRadius = '4px';
        element.style.backgroundColor = '#222';
        element.style.color = '#eee';
        element.style.margin = '2px';
        break;
      case 'option':
        element.style.color = '#0b0';
        break;
      case 'infotext':
        element.style.color = '#eee';
        break;
      case 'topscore':
        element.style.color = '#222';
        element.style.fontSize = 'calc(var(--board-size) * 0.1)';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        break;
      case 'die':
        element.style.color = '#222';
        element.style.fontSize = 'calc(var(--size120) * 15)';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.backgroundColor = '#fff';
        element.style.borderRadius = 0;
        element.style.padding = '14px';
        break;
      case 'diehold':
        element.style.color = '#222';
        element.style.fontSize = 'calc(var(--size120) * 15)';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.backgroundColor = '#2b2';
        element.style.borderRadius = '50% / 60%';
        break;
      case 'stats':
        element.style.color = '#222';
        element.style.fontSize = 'calc(var(--board-size) * 0.02)';
        element.style.fontFamily = 'monospace';
        element.style.display = 'grid';
        element.style.gridTemplateColumns = 'repeat(3, 1fr)';
        element.style.gridAutoFlow = 'column';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.padding = 'calc(var(--board-size) * 0.01)';
        element.style.whiteSpace = 'pre';
        break;
      case 'nogrow':
        element.style.overflow = 'hidden';
        element.style.width = element.style.width || '100%';
        element.style.height = element.style.height || '100%';
        element.style.boxSizing = 'border-box';
        break;
      }
    });
  }
}