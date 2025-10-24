import Icons from './icons.js';
import UiParts from './uiparts.js';

export default class UiGame {
  constructor(parent, program) {
    this.parent = parent;
    this.program = program;
    this.upParts = new UiParts(this.program.tiny);

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
    this._addText(`Game Seed: ${this.program.tiny.gameSeed}`);
    this._addButton('< Main', this._onExit);
    this._makeGrid(this.parent);

    if (this.program.tiny.doneResource && !this.program.tiny.full) {
      this._addButton('End turn', this._onEndTurn);
    }

    this._makeResourceRow(this.parent);

    if (this.canAcceptResource) {
      this._addButton('Accept', this._onAcceptResource);
    }

    this._makeCardRow(this.parent);

    if (this.canAcceptCard) {
      this._addButton('Accept', this._onAcceptCard);
    }

    if (this.selectedCard != null) {
      this._makeCard(this.parent, this.program.tiny.getHand()[this.selectedCard]);
    }

    // convert a CSS size (e.g. "2em", "24px", "1.5rem") to pixels relative to an element
    function cssSizeToPx(size, relativeTo) {
      if (typeof size === 'number') return size;
      const tmp = document.createElement('div');
      tmp.style.position = 'absolute';
      tmp.style.visibility = 'hidden';
      tmp.style.height = '0';
      tmp.style.width = size;
      (document.body).appendChild(tmp);
      const px = parseFloat(getComputedStyle(tmp).width) || 0;
      tmp.parentNode.removeChild(tmp);
      return Math.round(px);
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
    // Replace textual content with icons for building/resource when present
    const cellText = this._getCellText(index);
    // container for icons
    const iconContainer = document.createElement('div');
    iconContainer.style.display = 'flex';
    iconContainer.style.flexDirection = 'column';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.width = '100%';
    iconContainer.style.height = '100%';

    const cellObj = this.program.tiny.board.cells[index];
    const building = cellObj && cellObj.building;
    const resource = cellObj && cellObj.resource;

    const icons = new Icons();
    // building (house) if present
    if (building) {
      const bColor = this.upParts.getMeeple(building.category).color;
      const house = icons.makeHouse(bColor);
      house.style.width = '60%';
      house.style.height = '60%';
      iconContainer.appendChild(house);
    }
    // resource (cube) if present
    if (resource) {
      const rColor = (this.upParts && typeof this.upParts.getMeeple === 'function') ? (this.upParts.getMeeple(resource).color || '#ccc') : '#ccc';
      const cube = icons.makeCube(rColor);
      cube.style.width = '50%';
      cube.style.height = '50%';
      iconContainer.appendChild(cube);
    }

    // fallback: if no icons were added, show the old text as title for discoverability
    if (iconContainer.childElementCount === 0) {
      cell.textContent = '';
      cell.title = cellText;
    } else {
      cell.appendChild(iconContainer);
      cell.title = cellText;
    }
    cell.addEventListener('click', (e) => {
      this._onCellClick(index, e);
    });
    if (this.selectedCell === index) {
      cell.style.border = '3px solid #000';
    } else {
      cell.style.border = '';
    }

    // mark cell as usable if tiny reports it as a resource-target cell
    let resourceCells = this.program.tiny.getResourceCells();
    if (this.selectedResource != null &&
      Object.prototype.hasOwnProperty.call(resourceCells, index)
    ) {
      cell.classList.add('usable-button');
    }

    if (this.selectedCard != null) {
      var placements = this.program.tiny.getBuildingPlacements();
      let usable = false;
      if (Array.isArray(placements) && this.selectedCard != null) {
        const selected = this.program.tiny.getHand()[this.selectedCard];
        const selCat = selected && selected.category ? String(selected.category) : null;
        if (selCat != null) {
          for (let p of placements) {
            if (!p) continue;
            const pCat = p.card && p.card.category ? String(p.card.category) : null;
            if (pCat !== selCat) continue;

            // support placements.cells as array or as an object/map
            if (Array.isArray(p.cells)) {
              if (p.cells.indexOf(index) !== -1) { usable = true; break; }
            } else if (p.cells && Object.prototype.hasOwnProperty.call(p.cells, index)) {
              usable = true;
              break;
            }
          }
        }
      }

      if (usable) {
        cell.classList.add('usable-button');
      }
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

    const icons = new Icons();
    for (let i = 0; i < count; i++) {
      const r = document.createElement('div');
      if (this.program.tiny.doneResource) {
        r.className = 'mika-resource';
      } else {
        r.className = 'mika-resource usable-button';
      }
      r.dataset.index = i;

      const item = resources && resources[i];
      // Choose a display label: prefer name/label/type, then a count or index
      let label = '';
      if (item) {
        if (typeof item === 'string' || typeof item === 'number') label = String(item);
        else label = item.name || item.label || item.type || (item.count != null ? String(item.count) : '');
      }
      // create an SVG icon to fill the resource slot instead of plain text
      const iconColor = this.upParts.getMeeple(item).color;
      const svgIcon = icons.makeCube(iconColor);
      // make the svg scale to the container
      svgIcon.style.width = '100%';
      svgIcon.style.height = '90%';
      r.appendChild(svgIcon);
      if (label && label.length > 6) r.title = label; // keep long labels as tooltip

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

    const icons = new Icons();
    let cards = this.program.tiny.getHand();
    // simple mapping from category to color; extend as needed
    const categoryColor = {
      attack: '#e55353',
      defend: '#5b8cff',
      resource: '#4bbf73',
      magic: '#b86bff',
      default: '#cccccc',
    };

    for (let i = 0; i < cards.length; i++) {
      const c = document.createElement('div');
      c.className = 'mika-card-button';
      c.dataset.index = i;

      const item = cards && cards[i];
      let label = '';
      if (item) {
        if (typeof item === 'string' || typeof item === 'number') label = String(item);
        else label = item.short || item.title || item.type || (item.count != null ? String(item.count) : '');
      }
      // create an SVG icon based on the card.category and insert it instead of text
      const cat = item && item.category ? String(item.category).toLowerCase() : 'default';
      const iconColor = this.upParts.getMeeple(item.category).color;
      const svgIcon = icons.makeHouse(iconColor);
      svgIcon.style.width = '100%';
      svgIcon.style.height = '100%';
      // clear any text and append the icon
      c.textContent = '';
      c.appendChild(svgIcon);
      if (label && label.length > 12) c.title = label;

      if (this.selectedCard === i) {
        c.style.border = '3px solid #000';
      }
      c.addEventListener('click', (e) => this._onCardClick(i, e));

      var placements = this.program.tiny.getBuildingPlacements();
      let usable = false;
      const itmCat = item && item.category ? String(item.category) : null;
      if (itmCat && Array.isArray(placements)) {
        for (let p of placements) {
          if (!p || !p.card) continue;
          const pCat = p.card.category ? String(p.card.category) : null;
          if (pCat === itmCat) { usable = true; break; }
        }
      } else if (itmCat && placements && typeof placements === 'object') {
        for (let k in placements) {
          if (!Object.prototype.hasOwnProperty.call(placements, k)) continue;
          const p = placements[k];
          if (!p || !p.card) continue;
          const pCat = p.card.category ? String(p.card.category) : null;
          if (pCat === itmCat) { usable = true; break; }
        }
      }
      if (usable) c.classList.add('usable-button');

      row.appendChild(c);
    }

    container.appendChild(row);
    parent.appendChild(container);

    if (!document.getElementById('mika-card-styles')) {
      const style = document.createElement('style');
      style.id = 'mika-card-styles';
      style.textContent = `
  .mika-card-row-container { display:flex; justify-content:flex-start; margin-top:12px; }
  .mika-card-row { display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-start; align-content:flex-start; }
  .mika-card-button { min-width:4em; height:2em; border:1px solid #ccc; box-sizing:border-box; display:flex; align-items:center; justify-content:center; cursor:pointer; background:#fff; border-radius:6px; padding:6px; }
        .mika-card-button:active { background:#f5faff; }
  #mika-root .mika-card { width:15em; max-width:17em; border:1px solid #ccc; box-sizing:border-box; background:#fff; border-radius:6px; padding:12px; margin-top:12px; white-space:pre-wrap; overflow-wrap:break-word; word-break:break-word; font-family: monospace, ui-monospace, 'SFMono-Regular', Menlo, 'Roboto Mono', 'Segoe UI Mono', 'Ubuntu Mono'; }
      `;
      document.head.appendChild(style);
    }
  }

  _makeCard(parent, card) {
    // Create a rectangular card element (15em wide) and fill with JSON text
    const c = document.createElement('div');
    c.className = 'mika-card';

    // add some vertically stacked elements
    // row with "hello" on the left and a house icon right-justified
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.width = '100%';
    row.style.marginBottom = '8px';

    const left = document.createElement('div');
    left.textContent = 'hello';
    row.appendChild(left);

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    right.style.justifyContent = 'flex-end';

    const icons = new Icons();
    const iconColor = this.upParts.getMeeple(card.category).color;
    const houseIcon = icons.makeHouse(iconColor);
    houseIcon.style.width = '1em';
    houseIcon.style.height = '1em';
    right.appendChild(houseIcon);

    row.appendChild(right);
    c.appendChild(row);

    // pattern button
    // create a 4em square clickable div containing the SVG from icons.makePattern()
    try {
      const patternBtn = document.createElement('div');
      // sizing and visual
      patternBtn.style.width = '4em';
      patternBtn.style.height = '4em';
      patternBtn.style.boxSizing = 'border-box';
      patternBtn.style.border = '1px solid #000';
      // make the button a block element and center it horizontally
      patternBtn.style.display = 'block';
      patternBtn.style.overflow = 'hidden';
      patternBtn.style.cursor = 'pointer';
      patternBtn.style.margin = '8px auto';

      // get the svg from icons.makePattern()
      const patternSvg = icons.makePattern(card.shape);
      if (patternSvg) {
        // make svg fill the div
        patternSvg.style.width = '100%';
        patternSvg.style.height = '100%';
        patternSvg.style.display = 'block';
        patternBtn.appendChild(patternSvg);
      }

      // click handler
      patternBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        console.log('click');
      });

      // insert the button into the card (under the header row, before JSON)
      c.appendChild(patternBtn);
    } catch (err) {
      // defensive: if anything goes wrong, don't break the rest of the card rendering
      console.warn('failed to create pattern button', err);
    }

    // JSON
    const jsonDiv = document.createElement('div');
    jsonDiv.textContent = JSON.stringify(card, null, 2);
    jsonDiv.style.fontFamily = "monospace, ui-monospace, 'SFMono-Regular', Menlo, 'Roboto Mono', 'Segoe UI Mono', 'Ubuntu Mono'";
    jsonDiv.style.whiteSpace = 'pre-wrap';
    jsonDiv.style.wordBreak = 'break-word';
    jsonDiv.style.overflow = 'visible';
    jsonDiv.style.width = '100%';
    c.appendChild(jsonDiv);

    // ensure multi-line JSON wraps nicely
    c.style.whiteSpace = 'pre-wrap';
    c.style.wordBreak = 'break-word';
    parent.appendChild(c);
    return c;
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
        if (this.program.tiny.canDoResource(index, resource)) {
          lines.push(`${resource}`);
          this.canAcceptResource = {
            cell: this.selectedCell,
            resourceIndex: this.selectedResource,
            resource: resource,
          };
        }
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
    if (this.program.tiny.doneResource) {
      return;
    }
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
    this.program.tiny.doResource(this.canAcceptResource.cell, this.canAcceptResource.resource);
    this._clearSelections();
    this.render();
    this.program.saveCurrent();
  }

  _onAcceptCard() {
    this.program.tiny.doCard(this.canAcceptCard.cell, this.canAcceptCard.card);
    this._clearSelections();
    this.render();
    this.program.saveCurrent();
  }

  _onEndTurn() {
    this.program.tiny.endTurn();
    this._clearSelections();
    this.render();
    this.program.saveCurrent();
  }

  _clearSelections() {
    this.canAcceptResource = null;
    this.canAcceptCard = null;
    this.selectedCell = null;
    this.selectedResource = null;
    this.selectedCard = null;
  }
}