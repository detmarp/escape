import UxElement from './uxelement.js';
import Tweener from './tweener.js';

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

    this.tweener = new Tweener();
    this.tweener.debug = true;

    this.paxi = paxi;
    this.n = 0;
    this.tweenDuration = 0.30;

    this._setup();
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

    this.tweener.work();

    if (this.paxiChunks) {
      let chunk = this.paxiChunks.next();
      if (chunk.done) {
        this.paxiChunks = null;
        this.paused = false;
      }
      else {
        this._doChunk(chunk.value);
      }
    }
  }

  _doChunk(chunk) {
    if (chunk.action) {
      let func = `_onAction_${chunk.action}`;
      if (typeof this[func] === 'function') {
        this[func](chunk);
        return;
      }
      this._onAction_error(`No such action: ${func}`);
      return;
    }
    this._onAction_error(chunk);
  }

  _onAction_error(chunk) {
    console.log(`Error action: ${JSON.stringify(chunk)}`);
  }

  _onAction_move(chunk) {
    let from = chunk.fromPeg;
    let to = chunk.toPeg;
    let diskIndex = this.paxi.hanoi.pegs[to][this.paxi.hanoi.pegs[to].length - 1];
    let y = this.paxi.hanoi.pegs[to].length - 1;
    let fromPosition = this._getPosition(from, y - 1, true);
    let toPosition = this._getPosition(to, y, false);
    this.tweener.add(this.disks[diskIndex], {
      duration: this.tweenDuration,
      from: fromPosition,
      to: toPosition,
      easing: 'linear',
      ufx: (v) => Math.max(0, Math.min(1, v * 2)),
      ufy: (v) => {
        if (v < 0.5) {
          // anticipation undershoot
          const V = v * 2;
          const s = 4.0;
          return 0.5 * (V * V * ((s + 1) * V - s));
        }
        const V = (v - 0.5) * 2;
        if (V < 0.75) {
          return 0.5 + 0.888 * V * V;
        }
        // bounce
        return 1.0 - 2.4 * (V - 0.75) * (1.0 - V);
      },
    });
  }

  _onAction_select(chunk) {
    let peg = chunk.peg;
    let diskIndex = this.paxi.hanoi.pegs[peg][this.paxi.hanoi.pegs[peg].length - 1];
    let y = this.paxi.hanoi.pegs[peg].length - 1;
    let fromPosition = this._getPosition(peg, y, false);
    let toPosition = this._getPosition(peg, y, true);
    this.tweener.add(this.disks[diskIndex], {
      duration: this.tweenDuration,
      from: fromPosition,
      to: toPosition,
      easing: 'overshootOut',
    });
  }

  _onAction_deselect(chunk) {
    let peg = chunk.peg;
    let diskIndex = this.paxi.hanoi.pegs[peg][this.paxi.hanoi.pegs[peg].length - 1];
    let y = this.paxi.hanoi.pegs[peg].length - 1;
    let fromPosition = this._getPosition(peg, y, true);
    let toPosition = this._getPosition(peg, y, false);
    this.tweener.add(this.disks[diskIndex], {
      duration: this.tweenDuration,
      from: fromPosition,
      to: toPosition,
      easing: 'easeOutBounce',
    });
  }

  _setup() {
    this.uxe = new UxElement(this.background);

    this.overlay.innerHTML = '';
    this._makePegs();
    this._makeControls();
    this._makeInfo();
  }

  _getPosition(peg, height, selected) {
    let cx = 100 + 170 * peg;
    let cy = 400 - 30 * height;
    if (selected) {
      cy = 100;
    }
    return [cx, cy];
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

    this.disks = [];
    let n = this.paxi.hanoi.size;
    for (let pegIndex = 0; pegIndex < 3; pegIndex++) {
      const peg = this.paxi.hanoi.pegs[pegIndex];
      for (let y = 0; y < peg.length; y++) {
        let i = peg[y];
        let position = this._getPosition(pegIndex, y, false);
        const disk = this.uxe.disk({
          position,
          index: i,
          n,
        });
        this.disks[i] = disk;
      }
    }
  }

  _makeControls() {
    let button1 = this.uxe.button({
      position: [140, 640],
      centered: true,
      onclick: () => this._onResize(-1),
      text: '-',
    });
    this.overlay.appendChild(button1);
    let button2 = this.uxe.button({
      position: [260, 640],
      centered: true,
      onclick: () => this._onResize(1),
      text: '+',
    });
    this.overlay.appendChild(button2);
    let button3 = this.uxe.button({
      position: [380, 640],
      centered: true,
      onclick: () => this._onReset(),
      text: '↺',
    });
    this.overlay.appendChild(button3);
  }

  _onResize(delta) {
    this.paxi.systemSize(this.paxi.hanoi.size + delta);
  }

  _onReset() {
    this.paxi.systemNewGame();
  }

  _onTap(peg) {
    this._doPaxiCommand('tap', { peg });
  }

  _doPaxiCommand(command, params) {
    this.paxiChunks = this.paxi.doCommand(command, params);
    this.paused = true;
  }
}