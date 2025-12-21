import UxElement from './uxelement.js';
import Part1 from './part1.js';

/*
  View is the visual representation of the game.
  Injected with Paxi ux manager and parent DOM element
*/
export default class View {
  constructor(parent, paxi) {
    this.parent = parent;
    this.parent.innerHTML = '';
    this.parent.style.position = 'relative';

    this.background = document.createElement('div');
    this.parent.appendChild(this.background);
    this.background.style.position = 'absolute';
    this.background.style.top = '0';
    this.background.style.left = '0';
    this.background.style.width = '100%';
    this.background.style.height = '100%';
    this.background.style.pointerEvents = 'none'; // Let overlay handle events

    this.overlay = document.createElement('div');
    this.parent.appendChild(this.overlay);
    this.overlay.style.position = 'relative';
    this.overlay.style.zIndex = '1';

    this.fx = document.createElement('div');
    this.parent.appendChild(this.fx);
    this.fx.id = 'fx';
    this.fx.style.position = 'absolute';
    this.fx.style.top = '0';
    this.fx.style.left = '0';
    this.fx.style.width = '100%';
    this.fx.style.height = '100%';
    this.fx.style.pointerEvents = 'none';
    //this.part1 = new Part1(this.fx, '--scale');

    this.paxi = paxi;
    this.n = 0;

    this._redraw();
  }

  work() {
    this.n++;

    let moves = `Moves: ${this.paxi.hanoi.moves} / ${this.paxi.hanoi.goal}`;
    this.bottomText.textContent = moves;

    if (this.paxi.hanoi.gameOver) {
      let perfect = (this.paxi.hanoi.moves === this.paxi.hanoi.goal);
      let text = perfect ? 'Perfect!' : 'Solved!';
      this.topText.textContent = `${text}`;
    }

    //this.part1.work();
  }

  _update() {
    let diskInfo = [];
    for (let pegIndex = 0; pegIndex < 3; pegIndex++) {
      const peg = this.paxi.hanoi.pegs[pegIndex];
      for (let i = 0; i < peg.length; i++) {
        diskInfo.push({
          peg: pegIndex,
          selected: (this.paxi.selected === pegIndex && i === peg.length - 1),
          i: peg[i],
          y: i,
        });
      }
    }
    // Position each disk according to diskInfo
    for (let i = 0; i < diskInfo.length; i++) {
      const info = diskInfo[i];
      let cx = 100 + 170 * info.peg;
      let cy = 400 - 30 * info.y;
      const w = 60 + 100 * (info.i) / this.paxi.hanoi.size;
      const h = 20;
      const n = this.paxi.hanoi.size;
      if (info.selected) {
        cy = 100;
      }
      if (this.disks[i]) {
        let params = {
          size: [w, h],
          center: [cx, cy],
        };
        this.uxe._setSize(this.disks[i], params);
        console.log(`${JSON.stringify(params)}, ${JSON.stringify(info)}`);
      }
    }
  }

  _redraw() {
    this.uxe = new UxElement(this.background);

    this.overlay.innerHTML = '';
    this._makePegs();
    this._makeControls();
    this._makeInfo();

    this._update();
  }

  _makeInfo() {
    this.topText = this.uxe.topText({
      position: [20, 20],
      size: [460, 40],
      text: '',
    });

    this.bottomText = this.uxe.topText({
      position: [20, 540],
      size: [500, 40],
      text: '',
    });
  }

  _makePegs() {
    for (let i = 0; i < 3; i++) {
      let x = 20 + i * (160 + 10);
      this.uxe.pegArea({
        position: [x, 100],
        onpointerdown: () => this._onTap(i),
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

    this.disks = [];
    let n = this.paxi.hanoi.size;
    for (let i = 0; i < n; i++) {
      const disk = this.uxe.disk({
        position: [200, 300 - i * 30],
        index: i,
        n,
      });
      this.disks.push(disk);
    }
  }

  _makeControls() {
    let button1 = this.uxe.button({
      center: [140, 640],
      onclick: () => this._onResize(-1),
      text: '-',
    });
    this.overlay.appendChild(button1);
    let button2 = this.uxe.button({
      center: [260, 640],
      onclick: () => this._onResize(1),
      text: '+',
    });
    this.overlay.appendChild(button2);
    let button3 = this.uxe.button({
      center: [380, 640],
      onclick: () => this._onReset(),
      text: '↺',
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
    this._update();
  }

}