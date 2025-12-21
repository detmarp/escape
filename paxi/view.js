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

    if (this.paxi && this.paxi.hanoi && Array.isArray(this.paxi.hanoi.pegs)) {
      for (let i = 0; i < 3; i++) {
        this._drawRow(this.pegLines[i], i);
      }
    }

    let moves = `Moves: ${this.paxi.hanoi.moves} / ${this.paxi.hanoi.goal}`;
    this.bottomText.textContent = moves;

    if (this.paxi.hanoi.gameOver) {
      let perfect = (this.paxi.hanoi.moves === this.paxi.hanoi.goal);
      let text = perfect ? 'Perfect!' : 'Solved!';
      this.topText.textContent = `${text}`;
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
    this.uxe = new UxElement(this.background);

    this.overlay.innerHTML = '';
    this._makePegs();
    this._makeControls();
    this._makeInfo();
  }

  _makeInfo() {
    this.topText = this.uxe.topText({
      position: [20, 20],
      size: [460, 40],
      text: '',
    });

    this.bottomText = this.uxe.topText({
      position: [20, 440],
      size: [500, 40],
      text: '',
    });
  }

  _makePegs() {
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
    let button1 = this.uxe.button({
      position: [60, 560],
      onClick: () => this._onResize(-1),
      text: '-',
    });
    this.overlay.appendChild(button1);
    let button2 = this.uxe.button({
      position: [210, 560],
      onClick: () => this._onResize(1),
      text: '+',
    });
    this.overlay.appendChild(button2);
    let button3 = this.uxe.button({
      position: [360, 560],
      onClick: () => this._onReset(),
      text: 'Restart',
    });
    this.overlay.appendChild(button3);
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