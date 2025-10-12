import Board from './board.js';

export default class JunoUi {
  constructor(parent, program) {
    this.parent = parent;
    this.program = program;
  }

  run() {
    this.board = new Board(this.parent);
    this.program.newGame();
    // Set clean behavior at the top board level for mobile and text selection
    if (this.board.container) {
      this.board.container.style.userSelect = 'none';
      this.board.container.style.touchAction = 'manipulation';
    }
    //this.setup();
    this._refresh();
  }

  _refresh() {
    this.board.setTop(
      `${this.program.fiver.state.grandTotal}`,
      'New game',
      () => { this._onNewgame(); }
    );
    let rollText;
    let rollClick;
    if (this.program.fiver.canRoll()) {
      rollText = `Roll ${this.program.fiver.state.roll + 1} / 3`;
      rollClick = () => this._onRoll();
    } else if (this.program.fiver.state.selectedLine !== null) {
      rollText = 'Accept';
      rollClick = () => this._onAccept();
    }
    this.board.setDice(
      this.program.fiver.state.dice,
      this.program.fiver.state.hold,
      (index) => { this._onToggle(index); },
      rollText,
      rollClick
    );
    for (let i = 0; i < 18; i++) {
      this._setCell(i);
    }
  }

  _setCell(i) {
    let text = [
      'ONEs',
      'TWOs',
      'THREEs',
      'FOURs',
      'FIVEs',
      'SIXes',
      'Three of a kind',
      'Four of a kind',
      'Full House',
      'Small Straight',
      'Large Straight',
      'FIVER',
      'CHANCE',
      'Upper bonus',
      'Upper total',
      'FIVER bonus',
      'Lower total',
      'Upper trend',
    ][i] || '?';
    let value = '?';
    let style = 'info';
    let onClick = null;
    if (i < 13) {
      let line = this.program.fiver.state.lines[i];
      let preview = this.program.fiver.state.preview ? this.program.fiver.state.preview[i] : null;
      value = line != null ? line : (preview != null ? preview : '');

      if (this.program.fiver.state.selectedLine === i) {
        style = 'selected';
      } else if (line != null) {
        style = 'used';
      } else if (this.program.fiver.state.isCanSelect()) {
        style = 'unused';
      }
      else {
        style = 'start';
      }
      // if (this.program.fiver.state.mode == this.program.fiver.state.modes.PRE_GAME) {
      //   style = 'start';
      // } else if (this.program.fiver.state.selectedLine === i) {
      //   style = 'selected';
      // } else if (line != null) {
      //   style = 'used';
      // }
      // else if (this.program.fiver.state.selectedLine === null) {
      //   style = 'start';
      // }
      // unused - "can select"
      // start - not "can select"
      // selected - is selected
      // used - line has points
      onClick = () => { this._onSelect(i); };
    }
    else if (i === 13) {
      value = this.program.fiver.state.upperBonus || 0;
      style = 'used';
    }
    else if (i === 14) {
      value = this.program.fiver.state.upperTotal || 0;
    }
    else if (i === 15) {
      value = this.program.fiver.state.fiverBonus || 0;
      style = 'used';
    }
    else if (i === 16) {
      value = this.program.fiver.state.lowerTotal || 0;
    }
    else if (i === 17) {
      const trend = this.program.fiver.state.trend;
      if (trend == null) {
        value = '';
      } else {
        value = (trend > 0 ? '+' : '') + trend;
      }
    }
    this.board.setCell(i, text, value, onClick, style);
  }

  setup() {
    // Top div with New Game button
    const topDiv = document.createElement('div');
    topDiv.className = 'juno-top';
    Object.assign(topDiv.style, this.styles['juno-top']);

    const newGameBtn = document.createElement('button');
    newGameBtn.textContent = 'New game';
    newGameBtn.onclick = () => this._onNewgame();
    topDiv.appendChild(newGameBtn);

    const hr = document.createElement('hr');
    hr.className = 'juno-hr';
    Object.assign(hr.style, this.styles['juno-hr']);
    topDiv.appendChild(hr);
    this.container.appendChild(topDiv);
    this.bottomDiv = document.createElement('div');
    this.bottomDiv.className = 'juno-bottom';
    Object.assign(this.bottomDiv.style, this.styles['juno-bottom']);
    this.container.appendChild(this.bottomDiv);
    this._makeBottom();

    // Mouse drag scroll for desktop
    let isDragging = false, startY = 0, scrollTop = 0;
    this.container.addEventListener('mousedown', e => {
      isDragging = true;
      startY = e.clientY;
      scrollTop = this.container.scrollTop;
      this.container.style.cursor = 'grab';
    });
    window.addEventListener('mousemove', e => {
      if (isDragging) {
        this.container.scrollTop = scrollTop - (e.clientY - startY);
      }
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      this.container.style.cursor = '';
    });
  }

  _makeBottom() {
    this.bottomDiv.innerHTML = '';
    if (!this.program.fiver) {
      return;
    }
    const txt = document.createElement('div');
    let totalRow = this._makeTotalRow();
    this.bottomDiv.appendChild(totalRow);
    let diceRow = this._makeDiceRow();
    this.bottomDiv.appendChild(diceRow);
    this.bottomDiv.appendChild(this._makeRollRow());
    this.bottomDiv.appendChild(this._makeLines());
    this.bottomDiv.appendChild(this._makeTotals());
  }

  _onNewgame() {
    const state = this.program.fiver.state;
    if (!state.isGameOver()) {
      const result = window.confirm('Quit current game?\n\nPress OK to quit, or Cancel to continue playing.');
      if (!result) {
        return;
      }
    }
    this.program.newGame();
    this._refresh();
  }

  _makeTotalRow() {
    const state = this.program.fiver.state;
    const row = document.createElement('div');
    let status = state.isGameOver() ? 'Game over' : `Turn #${state.turn}`;
    row.textContent = `Total: ${state.grandTotal}, ${status}`;
    return row;
  }

  _makeDiceRow() {
    const state = this.program.fiver.state;
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '12px';
    row.style.marginTop = '18px';

    for (let i = 0; i < 5; i++) {
      const cell = document.createElement('div');
      cell.style.display = 'flex';
      cell.style.flexDirection = 'column';
      cell.style.alignItems = 'center';
      cell.style.width = '48px';

      const valueDiv = document.createElement('div');
      valueDiv.style.height = '32px';
      valueDiv.style.display = 'flex';
      valueDiv.style.alignItems = 'center';
      valueDiv.style.justifyContent = 'center';
      valueDiv.style.fontSize = '1.4em';
      valueDiv.textContent = state.dice[i] == null ? '' : state.dice[i];

      const btn = document.createElement('button');
      btn.textContent = (state.hold && state.hold[i]) ? 'HOLD' : '-';
      btn.onclick = () => this._onToggle(i);
      cell.appendChild(valueDiv);
      cell.appendChild(btn);
      row.appendChild(cell);
    }

    return row;
  }


  _makeRollRow() {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '12px';
    row.style.marginTop = '18px';

    const actionBtn = document.createElement('button');
    if (this.program.fiver.canRoll()) {
      actionBtn.textContent = `Roll ${this.program.fiver.state.roll + 1} / 3`;
      actionBtn.disabled = false;
      actionBtn.onclick = () => this._onRoll();
    } else if (this.program.fiver.canAccept()) {
      actionBtn.textContent = 'Accept';
      actionBtn.disabled = false;
      actionBtn.onclick = () => this._onAccept();
    } else {
      actionBtn.textContent = '';
      actionBtn.disabled = true;
      actionBtn.onclick = null;
    }
    row.appendChild(actionBtn);
    return row;
  }

  _makeLines() {
    const state = this.program.fiver.state;
    const categories = state.categories;
    const lines = document.createElement('div');
    lines.style.display = 'flex';
    lines.style.flexDirection = 'column';
    lines.style.gap = '8px';
    const categoryKeys = categories ? Object.keys(categories) : [];
    for (let i = 0; i < state.lines.length; i++) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '16px';

      // Value
      const value = document.createElement('div');
      value.textContent = '- ' + (state.lines[i] == null ? '' : state.lines[i]);
      value.style.width = '48px';
      row.appendChild(value);

      // Preview
      const preview = document.createElement('div');
      preview.textContent = '- ' + (state.preview && state.preview[i] != null ? state.preview[i] : '');
      preview.style.width = '48px';
      row.appendChild(preview);

      // Select button
      const btn = document.createElement('button');
      btn.textContent = (i === state.selectedLine) ? 'Selected' : '-';
      btn.onclick = () => this._onSelect(i);
      row.appendChild(btn);

      // Label (category key) at the end, left justified
      const label = document.createElement('div');
      label.textContent = categoryKeys[i] || `Line ${i + 1}`;
      label.style.width = 'auto';
      label.style.textAlign = 'left';
      label.style.fontWeight = '500';
      row.appendChild(label);

      lines.appendChild(row);
    }
    return lines;
  }

  _makeTotals() {
    const state = this.program.fiver.state;
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.flexDirection = 'column';
    row.style.gap = '4px';

    const upperBonus = document.createElement('div');
    upperBonus.textContent = `Upper Bonus: ${state.upperBonus}`;
    row.appendChild(upperBonus);

    const upperTotal = document.createElement('div');
    upperTotal.textContent = `Upper Total: ${state.upperTotal}`;
    row.appendChild(upperTotal);

    const fiverBonus = document.createElement('div');
    fiverBonus.textContent = `Fiver Bonus: ${state.fiverBonus}`;
    row.appendChild(fiverBonus);

    const lowerTotal = document.createElement('div');
    lowerTotal.textContent = `Lower Total: ${state.lowerTotal}`;
    row.appendChild(lowerTotal);

    const grandTotal = document.createElement('div');
    grandTotal.textContent = `Grand Total: ${state.grandTotal}`;
    row.appendChild(grandTotal);

    return row;
  }

  _onToggle(index) {
    const state = this.program.fiver.state;
    if (state.dice[index] == null) return;
    if (!state.hold) return;
    state.hold[index] = !state.hold[index];
    this._refresh();
  }

  _onRoll() {
    this.program.fiver.doRoll();
    this.program.fiver.doPreviews();
    //this.program.fiver.doAutoSelect();
    this._refresh();
  }

  _onAccept() {
    this.program.fiver.doAccept();
    this._refresh();
  }

  _onSelect(index) {
    const state = this.program.fiver.state;
    if (state.roll === 0 || state.isGameOver() || state.lines[index] != null) {
      return;
    }
    this.program.fiver.doSelect(index);
    this._refresh();
  }
}
