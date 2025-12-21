export default class View {
  constructor(parent, paxi) {
    this.parent = parent;
    this.paxi = paxi;
    this.n = 0;
    this._redraw();
  }

  work() {
    this.n++;
    this.textElem.textContent = `Frame: ${this.n}, Moves: ${this.paxi.hanoi.moves}/${this.paxi.hanoi.goal}, Game Over: ${this.paxi.hanoi.gameOver ? 'Yes' : 'No'}`;

    if (this.paxi && this.paxi.hanoi && Array.isArray(this.paxi.hanoi.pegs)) {
      for (let i = 0; i < 3; i++) {
        this._drawRow(this.pegLines[i], i);
      }
    }
  }

  _drawRow(element, i) {
    const peg = this.paxi.hanoi.pegs[i];
    let text = 'Peg ' + (i + 1) + ': ';
    if (this.paxi.selected === i && peg.length > 0) {
      const arr = peg.slice(0, -1);
      text += arr.join(', ');
      if (arr.length > 0) text += ', ';
      text += '-- ' + peg[peg.length - 1];
    } else {
      text += peg.join(', ');
    }
    element.textContent = text;
  }

  _redraw() {
    this.parent.innerHTML = '';
    this._makePegs();
    this._makeControls();
    this._makeInfo();
  }

  _makeInfo() {
    this.textElem = document.createElement('div');
    this.textElem.textContent = '';
    this.parent.appendChild(this.textElem);
  }

  _makePegs() {
    this.pegLines = [];
    this.tapBtns = [];
    for (let i = 0; i < 3; i++) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '0.5em';

      const btn = document.createElement('button');
      btn.textContent = 'Tap ' + (i + 1);
      btn.onclick = () => {
        this._onTap(i);
      };
      row.appendChild(btn);
      this.tapBtns.push(btn);

      const line = document.createElement('div');
      line.textContent = '';
      row.appendChild(line);
      this.pegLines.push(line);

      this.parent.appendChild(row);
    }
  }

  _makeControls() {
    this.controlsRow = document.createElement('div');
    this.controlsRow.style.display = 'flex';
    this.controlsRow.style.gap = '0.5em';

    this.plusBtn = document.createElement('button');
    this.plusBtn.textContent = '-';
    this.plusBtn.onclick = () => {
      this._onResize(-1);
    };
    this.controlsRow.appendChild(this.plusBtn);

    this.minusBtn = document.createElement('button');
    this.minusBtn.textContent = '+';
    this.minusBtn.onclick = () => {
      this._onResize(1);
    };
    this.controlsRow.appendChild(this.minusBtn);

    this.restartBtn = document.createElement('button');
    this.restartBtn.textContent = 'Restart';
    this.restartBtn.onclick = () => {
      this._onReset();
    };
    this.controlsRow.appendChild(this.restartBtn);

    this.parent.appendChild(this.controlsRow);
  }

  _onResize(delta) {
    this.paxi.onSetSize(this.paxi.hanoi.size + delta);
  }

  _onReset() {
    if (this.paxi && typeof this.paxi.onNewGame === 'function') {
      this.paxi.onNewGame();
    }
  }

  _onTap(peg) {
    this.paxi.onTap(peg);
  }

}