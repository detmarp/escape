export default class UiGame {
  constructor(parent, program) {
    this.parent = parent;
    this.program = program;
    // Track selected indices
    this.selectedCell = null;
    this.selectedResource = null;
    this.render();
  }

  render() {
    this.parent.innerHTML = '';

    this._addHeader('Game board');
    this._addButton('< Main', this._onExit);
    this._addText(`Game Seed: ${this.program.tiny.gameSeed}`);
    this._addButton('Refresh', this._onRefresh);
    this._addButton('Click', this._onBoop);
    this._makeGrid(this.parent);
    this._makeResourceRow(this.parent);
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

  _onRefresh() {
    this.render();
  }

  _onBoop() {
    const iso = new Date().toISOString().replace(/\.\d{3}Z$/, '').replace('T', '-');
    console.log('bbb boop', iso);
  }

  _makeGrid(parent) {
    // Create container and inject local styles so we don't touch global CSS
    const container = document.createElement('div');
    container.className = 'mika-grid-container';

    // Grid element
    const grid = document.createElement('div');
    grid.className = 'mika-grid';

    // Create 4x4 cells
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        let i = r * 4 + c;
        const cell = this._makeCell(i);
        grid.appendChild(cell);
      }
    }

    container.appendChild(grid);
    parent.appendChild(container);

    // Inject styles if not already present
    if (!document.getElementById('mika-grid-styles')) {
      const style = document.createElement('style');
      style.id = 'mika-grid-styles';
      style.textContent = `
        .mika-grid-container { display:flex; justify-content:center; margin-top:12px; }
  .mika-grid { display: grid; grid-template-columns: repeat(4, 4em); grid-auto-rows: 4em; gap: 1px; }
        .mika-cell { background: #fff; border: 1px solid #ccc; box-sizing: border-box; display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .mika-cell:active { background: #f0f8ff; }
      `;
      document.head.appendChild(style);
    }
  }

  _makeCell(index) {
    const cell = document.createElement('div');
    cell.className = 'mika-cell';
    cell.textContent = index;
    cell.index = index;
    cell.addEventListener('click', (e) => {
      this._onCellClick(index, e);
    });
    if (this.selectedCell === index) {
      cell.style.border = '3px solid #000';
    } else {
      cell.style.border = '';
    }
    return cell;
  }

  _makeResource(parent) {
  }

  _makeResourceRow(parent) {
    const container = document.createElement('div');
    container.className = 'mika-resource-row-container';

    const row = document.createElement('div');
    row.className = 'mika-resource-row';

    for (let i = 0; i < 5; i++) {
      const r = document.createElement('div');
      r.className = 'mika-resource';
      r.dataset.index = i;
      r.textContent = '';
      if (this.selectedResource === i) {
        r.style.border = '3px solid #000';
      }
      r.addEventListener('click', (e) => this._onResourceClick(i, e));
      row.appendChild(r);
    }

    container.appendChild(row);
    parent.appendChild(container);

    if (!document.getElementById('mika-resource-styles')) {
      const style = document.createElement('style');
      style.id = 'mika-resource-styles';
      style.textContent = `
        .mika-resource-row-container { display:flex; justify-content:center; margin-top:12px; }
        .mika-resource-row { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
  .mika-resource { width:4em; height:4em; border:1px solid #ccc; box-sizing:border-box; display:flex; align-items:center; justify-content:center; cursor:pointer; background:#fff; border-radius:6px; }
        .mika-resource:active { background:#f5faff; }
      `;
      document.head.appendChild(style);
    }
  }

  _onResourceClick(index, e) {
    console.log('resource click', index);
    this.selectedResource = index;
    this.render();
  }

  _onCellClick(index, e) {
    // Dummy handler for now
    console.log('cell click', index);
    this.selectedCell = index;
    this.render();
  }
}