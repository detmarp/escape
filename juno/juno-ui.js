export default class JunoUi {
  constructor(parent, program) {
    this.parent = parent;
    this.program = program;
  }

  run() {
    this._style();
    this.container = document.createElement('div');
    this.container.className = 'juno-container';
    Object.assign(this.container.style, this.styles['juno-container']);
    this.parent.appendChild(this.container);
    this.setup();
  }

  _style() {
    this.styles = {
      'juno-container': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        minHeight: '100vh',
        maxHeight: '100vh',
        fontFamily: 'sans-serif',
        fontSize: '1.25em',
        color: '#222',
        background: '#fff',
        boxSizing: 'border-box',
        padding: '0',
        margin: '0',
        zIndex: 10,
        overflowY: 'auto',
        outline: 'none',
        border: 'none',
        WebkitOverflowScrolling: 'touch'
      },
      'juno-top': {
        padding: '18px 0 0 18px',
        textAlign: 'left',
        width: '100%'
      },
      'juno-hello': {
        fontWeight: '500',
        fontSize: '1.3em',
        marginBottom: '8px'
      },
      'juno-hr': {
        border: 'none',
        borderTop: '1px solid #eee',
        margin: '8px 0 12px 0',
        height: '1px',
        background: 'none'
      },
      'juno-bottom': {
        padding: '0 0 0 18px',
        textAlign: 'left',
        width: '100%'
      }
    };
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = '#fff';
  }

  setup() {
    const topDiv = document.createElement('div');
    topDiv.className = 'juno-top';
    Object.assign(topDiv.style, this.styles['juno-top']);

    const newGameBtn = document.createElement('button');
    newGameBtn.textContent = 'New game';
    newGameBtn.className = 'juno-newgame';
    newGameBtn.style.fontSize = '1em';
    newGameBtn.style.padding = '8px 18px';
    newGameBtn.style.marginBottom = '8px';
    newGameBtn.style.borderRadius = '4px';
    newGameBtn.style.border = '1.5px solid #444';
    newGameBtn.style.background = '#fff';
    newGameBtn.style.color = '#222';
    newGameBtn.style.cursor = 'pointer';
    newGameBtn.style.outline = 'none';
    newGameBtn.style.userSelect = 'none';
    newGameBtn.style.touchAction = 'manipulation';
    newGameBtn.addEventListener('click', e => { e.preventDefault(); this._onNewgame(); });
    newGameBtn.addEventListener('touchstart', e => { e.preventDefault(); });
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
    this.program.newGame();
    this._makeBottom();
  }

  _makeTotalRow() {
    const state = this.program.fiver.state;
    const row = document.createElement('div');
    let status = state.gameOver ? 'Game over' : `Turn #${state.turn}`;
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
      btn.style.marginTop = '6px';
      btn.style.padding = '4px 10px';
      btn.style.borderRadius = '4px';
      btn.style.border = '1px solid #888';
      btn.style.background = '#f8f8f8';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '1em';
      btn.style.touchAction = 'manipulation';
      btn.addEventListener('click', e => { e.preventDefault(); this._onToggle(i); });
      btn.addEventListener('touchstart', e => { e.preventDefault(); });

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

    const rollBtn = document.createElement('button');
    if (this.program.fiver.state.roll === 3) {
      rollBtn.textContent = 'Roll';
      rollBtn.disabled = true;
    } else {
      rollBtn.textContent = `Roll ${this.program.fiver.state.roll + 1} / 3`;
      rollBtn.disabled = false;
    }
    rollBtn.style.padding = '8px 18px';
    rollBtn.style.borderRadius = '4px';
    rollBtn.style.border = '1.5px solid #444';
    rollBtn.style.background = '#fff';
    rollBtn.style.color = '#222';
    rollBtn.style.cursor = 'pointer';
    rollBtn.style.fontSize = '1em';
    rollBtn.style.touchAction = 'manipulation';
    rollBtn.addEventListener('click', e => { e.preventDefault(); this._onRoll(); });
    rollBtn.addEventListener('touchstart', e => { e.preventDefault(); });
    row.appendChild(rollBtn);

    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Accept';
    acceptBtn.style.padding = '8px 18px';
    acceptBtn.style.borderRadius = '4px';
    acceptBtn.style.border = '1.5px solid #444';
    acceptBtn.style.background = '#fff';
    acceptBtn.style.color = '#222';
    acceptBtn.style.cursor = 'pointer';
    acceptBtn.style.fontSize = '1em';
    acceptBtn.style.touchAction = 'manipulation';
    acceptBtn.addEventListener('click', e => { e.preventDefault(); this._onAccept(); });
    acceptBtn.addEventListener('touchstart', e => { e.preventDefault(); });
    row.appendChild(acceptBtn);

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
      btn.style.padding = '4px 12px';
      btn.style.borderRadius = '4px';
      btn.style.border = '1px solid #888';
      btn.style.background = '#f8f8f8';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '1em';
      btn.style.touchAction = 'manipulation';
      btn.addEventListener('click', e => {
        e.preventDefault();
        if (i === state.selectedLine) {
          state.selectedLine = null;
        } else {
          state.selectedLine = i;
        }
        this._makeBottom();
      });
      btn.addEventListener('touchstart', e => { e.preventDefault(); });
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
    this._makeBottom();
  }

  _onRoll() {
    this.program.fiver.doRoll();
    this.program.fiver.doPreviews();
    this.program.fiver.doAutoSelect();
    this._makeBottom();
  }

  _onAccept() {
    this.program.fiver.doAccept();
    this._makeBottom();
  }
}
