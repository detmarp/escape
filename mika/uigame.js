export default class UiGame {
  constructor(parent, program) {
    this.parent = parent;
    this.program = program;
    this.selectedCell = null;
    this.selectedResource = null;
    this.selectedCard = null;
    this.render();
  }

  render() {
    this.parent.innerHTML = '';

    this.canAcceptResource = false;
    this.canAcceptCard = false;

    this._addHeader('Game board');
    this._addButton('< Main', this._onExit);
    this._addText(`Game Seed: ${this.program.tiny.gameSeed}`);
    this._makeGrid(this.parent);
    this._makeResourceRow(this.parent);

    if (this.canAcceptResource) {
      this._addButton('Accept', this._onAcceptResource);
    }

    this._makeCardRow(this.parent);

    if (this.canAcceptCard) {
      this._addButton('Accept', this._onAcceptCard);
    }
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
  .mika-cell { background: #fff; border: 1px solid #ccc; box-sizing: border-box; display:flex; align-items:flex-start; justify-content:flex-start; cursor:pointer; padding:6px; text-align:left; white-space:pre-wrap; overflow:hidden; line-height: 1.0; }
        .mika-cell:active { background: #f0f8ff; }
      `;
      document.head.appendChild(style);
    }
  }

  _makeCell(index) {
    const cell = document.createElement('div');
    cell.className = 'mika-cell';
    cell.textContent = this._getCellText(index);
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

    // Try to get resources from the program; fall back to 5 placeholders
    let resources = null;
    if (this.program && this.program.tiny && typeof this.program.tiny.getResources === 'function') {
      try {
        resources = this.program.tiny.getResources();
      } catch (err) {
        resources = null;
      }
    }

    const count = Array.isArray(resources) && resources.length > 0 ? resources.length : 5;

    for (let i = 0; i < count; i++) {
      const r = document.createElement('div');
      r.className = 'mika-resource';
      r.dataset.index = i;

      const item = resources && resources[i];
      // Choose a display label: prefer name/label/type, then a count or index
      let label = '';
      if (item) {
        if (typeof item === 'string' || typeof item === 'number') label = String(item);
        else label = item.name || item.label || item.type || (item.count != null ? String(item.count) : '');
      }
      r.textContent = label;
      if (label && label.length > 6) r.title = label; // long labels as tooltip

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
  .mika-resource { width:4em; height:2em; border:1px solid #ccc; box-sizing:border-box; display:flex; align-items:center; justify-content:center; cursor:pointer; background:#fff; border-radius:6px; }
        .mika-resource:active { background:#f5faff; }
      `;
      document.head.appendChild(style);
    }
  }

  _makeCardRow(parent) {
    const container = document.createElement('div');
    container.className = 'mika-card-row-container';

    const row = document.createElement('div');
    row.className = 'mika-card-row';

    let cards = this.program.tiny.getHand();
    for (let i = 0; i < cards.length; i++) {
      const c = document.createElement('div');
      c.className = 'mika-card';
      c.dataset.index = i;

      const item = cards && cards[i];
      let label = '';
      if (item) {
        if (typeof item === 'string' || typeof item === 'number') label = String(item);
        else label = item.short || item.title || item.type || (item.count != null ? String(item.count) : '');
      }
      c.textContent = label;
      if (label && label.length > 12) c.title = label;

      if (this.selectedCard === i) {
        c.style.border = '3px solid #000';
      }
      c.addEventListener('click', (e) => this._onCardClick(i, e));
      row.appendChild(c);
    }

    container.appendChild(row);
    parent.appendChild(container);

    if (!document.getElementById('mika-card-styles')) {
      const style = document.createElement('style');
      style.id = 'mika-card-styles';
      style.textContent = `
        .mika-card-row-container { display:flex; justify-content:center; margin-top:12px; }
        .mika-card-row { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
  .mika-card { min-width:4em; height:2em; border:1px solid #ccc; box-sizing:border-box; display:flex; align-items:center; justify-content:center; cursor:pointer; background:#fff; border-radius:6px; padding:6px; }
        .mika-card:active { background:#f5faff; }
      `;
      document.head.appendChild(style);
    }
  }

  _getCellText(index) {
    const lines = [String(index)];

    let r = this.program.tiny.board.cells[index].resource;
    if (r) {
      lines.push(r);
    }

    let b = this.program.tiny.board.cells[index].building;
    if (b) {
      lines.push(b.short);
    }

    if (index == this.selectedCell) {
      if (this.selectedResource != null) {
        let resource = this.program.tiny.getResources()[this.selectedResource];
        lines.push(`${resource}`);
        this.canAcceptResource = {
          cell: this.selectedCell,
          resourceIndex: this.selectedResource,
          resource: resource,
        };
      }

      if (this.selectedCard != null) {
        let card = this.program.tiny.getHand()[this.selectedCard];
        let cardLabel = this._getCardText(this.selectedCard);
        lines.push(`${cardLabel}`);
        this.canAcceptCard = {
          cell: this.selectedCell,
          cardIndex: this.selectedCard,
          card: card,
        };
      }
    }

    return lines.join('\n');
  }

  _getCardText(index) {
    const cards = this.program.tiny.getHand();
    const item = cards && cards[index];
    return item.short;
  }

  _onResourceClick(index, e) {
    console.log('resource click', index);
    this.selectedResource = index;
    this.selectedCard = null;
    this.render();
  }

  _onCellClick(index, e) {
    // Dummy handler for now
    console.log('cell click', index);
    this.selectedCell = index;
    this.render();
  }

  _onCardClick(index, e) {
    console.log('card click', index);
    this.selectedCard = index;
    this.selectedResource = null;
    this.render();
  }

  _onAcceptResource() {
    this.program.tiny.doPlace(this.canAcceptResource.cell, this.canAcceptResource.resource);
    this._clearSelections();
    this.render();
  }

  _onAcceptCard() {
    this.program.tiny.doCard(this.canAcceptCard.cell, this.canAcceptCard.card);
    this._clearSelections();
    this.render();
  }

  _clearSelections() {
    this.canAcceptResource = null;
    this.canAcceptCard = null;
    this.selectedCell = null;
    this.selectedResource = null;
    this.selectedCard = null;
  }
}