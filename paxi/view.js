import UxElement from './uxelement.js';

/*
  View is the visual representation of the game.
  Injected with Paxi ux manager and parent DOM element
*/
export default class View {
  constructor(parent, paxi) {
    this.parent = parent;
    this.parent.innerHTML = '';

    this.background = document.createElement('div');
    this.overlay = document.createElement('div');
    // Style parent to allow absolute positioning inside
    this.parent.style.position = 'relative';

    // Style background for absolute positioning
    this.background.style.position = 'absolute';
    this.background.style.top = '0';
    this.background.style.left = '0';
    this.background.style.width = '100%';
    this.background.style.height = '100%';
    this.background.style.pointerEvents = 'none'; // Let overlay handle events

    // Style overlay for normal flow, but overlapping background
    this.overlay.style.position = 'relative';
    this.overlay.style.zIndex = '1';

    // Add both to parent, background first
    this.parent.appendChild(this.background);
    this.parent.appendChild(this.overlay);

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
    this.overlay.innerHTML = '';
    this._makePegs();
    this._makeControls();
    this._makeInfo();

    this.uxe = new UxElement(this.background);
    this.uxe.box({
      rect: [0, 0, 500, 500],
      borderColor: 'green',
    });
    this.uxe.box({
      rect: [100, 100, 200, 200],
      borderColor: 'orange',
    });
  }

  _makeInfo() {
    this.textElem = document.createElement('div');
    this.textElem.textContent = '';
    this.overlay.appendChild(this.textElem);
  }

  _makePegs() {
    this.uxe = new UxElement(this.background);
    for (let i = 0; i < 3; i++) {
      let x = 20 + i * (160 + 10);
      this.uxe.pegArea({
        position: [x, 100],
        onClick: () => this._onTap(i),
      });
    }

    this.pegLines = [];
    for (let i = 0; i < 3; i++) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '0.5em';

      const line = document.createElement('div');
      line.textContent = '';
      row.appendChild(line);
      this.pegLines.push(line);

      this.overlay.appendChild(row);
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

    this.overlay.appendChild(this.controlsRow);
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