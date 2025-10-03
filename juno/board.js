export default class Board {
  constructor(parent) {
    this.parent = parent;
    this.container = document.createElement('div');
    parent.appendChild(this.container);

    this._setup();

    this._resize();
    window.addEventListener('resize', () => this._resize());
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

    // Use flex layout to avoid height overflow and keep spacing
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.justifyContent = 'flex-start';
    this.container.style.alignItems = 'stretch';

    // Helper to create a section
    const createSection = (flex, marginBottom) => {
      const section = document.createElement('div');
      section.style.flex = flex;
      section.style.marginBottom = marginBottom;
      section.style.boxSizing = 'border-box';
      section.style.padding = '8px';
      section.style.background = '#fff';
      section.style.borderRadius = '6px';
      section.style.border = '1px solid #ccc';
      return section;
    };

    // Add 4 stacked elements: top, dice, scores, bottom
    const heights = [2, 3, 12, 2];
    this.top = createSection(heights[0], '6px');
    this.container.appendChild(this.top);
    this.dice = createSection(heights[1], '6px');
    this.container.appendChild(this.dice);
    this.scores = createSection(heights[2], '6px');
    this.container.appendChild(this.scores);
    this.bottom = createSection(heights[3], '0');
    this.container.appendChild(this.bottom);

    this.setTop('0', 'New game', () => { console.log('New game'); });
    this.setDice(
      [1, 2, 3, 4, 5],
      [false, false, false, false, false],
      (i) => { console.log('Toggle die', i); },
      'Roll',
      () => { console.log('Roll dice'); }
    );
    this._setBoard();
    ///
    this.container.innerHTML = '';
    this._addSlice(this.container, 2);
    this._addSlice(this.container, 3);
    this._addSlice(this.container, 12);
    this._addSlice(this.container, 2);
  }

  setTop(text, label, onClick) {
    let top = this.top;
    top.innerHTML = '';
    top.style.position = 'relative';
    top.style.overflow = 'hidden';

    // Centered text (fills parent, not squished)
    const textDiv = document.createElement('div');
    textDiv.textContent = text;
    textDiv.style.position = 'absolute';
    textDiv.style.left = '0';
    textDiv.style.right = '0';
    textDiv.style.top = '0';
    textDiv.style.bottom = '0';
    textDiv.style.display = 'flex';
    textDiv.style.justifyContent = 'center';
    textDiv.style.alignItems = 'center';
    textDiv.style.fontSize = 'calc(var(--board-size) * 0.08)';
    textDiv.style.fontWeight = 'bold';
    textDiv.style.overflow = 'hidden';
    this._applyStyles(textDiv, ['clean', 'pastel']);
    top.appendChild(textDiv);

    // Right-justified button (absolute)
    const button = document.createElement('button');
    button.textContent = label;
    button.onclick = onClick;
    button.style.position = 'absolute';
    button.style.right = '4%';
    button.style.top = '50%';
    button.style.transform = 'translateY(-50%)';
    button.style.height = 'calc(var(--board-size) * 0.07)';
    button.style.width = 'calc(var(--board-size) * 0.20)';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.fontSize = 'calc(var(--board-size) * 0.04)';
    button.style.padding = '0';
    button.style.cursor = 'pointer';
    button.style.overflow = 'hidden';
    top.appendChild(button);
  }

  setDice(values, holds, onToggle, label, onClick) {
    const dice = this.dice;
    dice.innerHTML = '';
    dice.style.position = 'relative';
    dice.style.overflow = 'hidden';

    // Dice row container
    const diceRow = document.createElement('div');
    diceRow.style.display = 'flex';
    diceRow.style.alignItems = 'center';
    diceRow.style.height = '100%';
    diceRow.style.width = '80%';
    diceRow.style.position = 'absolute';
    diceRow.style.left = '0';
    diceRow.style.top = '0';
    diceRow.style.bottom = '0';

    // Add 5 dice boxes
    for (let i = 0; i < 5; i++) {
      const box = document.createElement('div');
      box.style.flex = '0 0 17%';
      box.style.height = '90%';
      box.style.margin = '0 2px';
      box.style.border = '2px solid #888';
      box.style.borderRadius = '8px';
      box.style.background = '#f9f9f9';
      box.style.display = 'flex';
      box.style.alignItems = 'center';
      box.style.justifyContent = 'center';
      box.style.cursor = 'pointer';
      box.style.fontSize = 'calc(var(--board-size) * 0.05)';
      box.onclick = () => onToggle(i);
      diceRow.appendChild(box);
    }
    dice.appendChild(diceRow);

    // Right-justified button (absolute)
    const button = document.createElement('button');
    button.textContent = label;
    button.onclick = onClick;
    button.style.position = 'absolute';
    button.style.right = '4%';
    button.style.top = '50%';
    button.style.transform = 'translateY(-50%)';
    button.style.height = 'calc(var(--board-size) * 0.07)';
    button.style.width = 'calc(var(--board-size) * 0.20)';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.fontSize = 'calc(var(--board-size) * 0.04)';
    button.style.padding = '0';
    button.style.cursor = 'pointer';
    button.style.overflow = 'hidden';
    dice.appendChild(button);
  }

  _setBoard() {
    // Clear scores section
    this.scores.innerHTML = '';
    this.scores.style.position = 'relative';
    this.scores.style.overflow = 'hidden';
    this.scores.style.display = 'grid';
    this.scores.style.gridTemplateColumns = 'repeat(3, 1fr)';
    this.scores.style.gridTemplateRows = 'repeat(6, 1fr)';
    this.scores.style.gap = '6px';

    this.cells = [];
    for (let i = 0; i < 18; i++) {
      const cell = document.createElement('div');
      this.scores.appendChild(cell);
      this.cells.push(cell);
      this.setCell(i, '', '', null, null);
    }
  }

  setCell(i, text, value, onClick, style) {
    let cell = this.cells[i];
    cell.innerHTML = '';
    cell.style.display = 'flex';
    cell.style.flexDirection = 'row';
    cell.style.alignItems = 'center';
    cell.style.justifyContent = 'space-between';
    cell.style.padding = 'calc(var(--board-size) * 0.01) calc(var(--board-size) * 0.02)';
    cell.style.height = '100%';
    cell.style.boxSizing = 'border-box';
    cell.style.border = '1px solid #bbb';
    cell.style.borderRadius = '6px';
    cell.style.background = '#f7f7f7';

    // Left text (can be 2 lines)
    const textDiv = document.createElement('div');
    textDiv.textContent = text;
    textDiv.style.flex = '1';
    textDiv.style.textAlign = 'left';
    textDiv.style.fontSize = 'calc(var(--board-size) * 0.025)';
    textDiv.style.lineHeight = '1.1';
    textDiv.style.overflow = 'hidden';
    textDiv.style.whiteSpace = 'pre-line';
    cell.appendChild(textDiv);

    // Right value (large, right justified)
    const valueDiv = document.createElement('div');
    valueDiv.textContent = value;
    valueDiv.style.flex = '0 0 auto';
    valueDiv.style.textAlign = 'right';
    valueDiv.style.fontSize = 'calc(var(--board-size) * 0.04)';
    valueDiv.style.fontWeight = 'bold';
    valueDiv.style.marginLeft = 'calc(var(--board-size) * 0.01)';
    cell.appendChild(valueDiv);

    // Clickable (if onClick provided)
    if (onClick) {
      cell.style.cursor = 'pointer';
      cell.onclick = onClick;
    } else {
      cell.style.cursor = 'default';
      cell.onclick = null;
    }

    // Custom style (if any)
    if (style) {
      for (let key in style) {
        cell.style[key] = style[key];
      }
    }
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
      }
    });
  }
}