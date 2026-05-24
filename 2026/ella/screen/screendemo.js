import EllaBoard from '../ellaboard.js';
import Boreal from '../../boreal/boreal.js';
import Ux2 from '../ux2.js';
import Celest from '../../celest/celest.js';
import ShipGame from '../shipgame.js';
import BotA from '../bota.js';
import NodeTree from '../nodetree.js';
import Table from '../actor/table.js';
import Timer from '../actor/timer.js';
import DemoPlayerA from '../actor/demoplayera.js';
import DemoPlayerB from '../actor/demoplayerb.js';

export default class ScreenDemo {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
    this.fastDemo = params.program.settings.fastDemo;
    this.debug = true;
    this.onePlayer = params.program.settings.onePlayerDemo;
    this.paused = false;
  }

  init() {
    ScreenDemo.count++;

    this.celest = new Celest(this.parent, 360, 640);
    this.celest.init();

    this.celest.outer.style.backgroundColor = '#456';
    this.celest.inner.style.backgroundColor = '#fdb';

    this.ux = new Ux2(this.celest.inner);

    this._makeHeader();
    //this._makeFooter();

    this.bottom = this.ux.div({
      parent: this.celest.inner,
      size: [360, 610],
      position: [0, 30],
    });

    this.board = new EllaBoard(this.bottom, {
      onclick: () => this.params.program.goto('main')
    });

    this.board.init();

    this.nodeTree = new NodeTree({
      canvas: this.board.canvas,
    });
    if (this.params.program.settings.fastClock) {
      this.nodeTree.debugSpeed = 40;
    }

    this._newGame();
    this._refresh();
  }

  term() {
    if (this.board) {
      this.board.term();
    }
  }

  _nextTurn() {
    if (this._stateAge('gameover') > 2) {
      this._onRestart();
      return;
    }

    if (this.game) {
      if (this.game.gameOver) {
        if (!this.gameOver) {
          this._setState('gameover');
          this.gameOver = true;
          this.table.setWinner(this.game.winner);
        }
        return;
      }

      let player = this.onePlayer ? 1 : this.game.turn;
      let other = 1 - player;

      if (!this.player) {
        let onDone = () => {
          this.player = null;
        };
        this.player = this.fastDemo ?
          new DemoPlayerB(this.game, player, onDone) :
          new DemoPlayerA(this.game, player, onDone);

        this.player.setPaused(this.paused);

        this.nodeTree.addActor(this.player);
      }
    }
  }

  setPaused(paused = null) {
    if (paused === null) {
      paused = !this.paused;
    }
    this.paused = paused;
    if (this.player) {
      this.player.setPaused(paused);
    }
    this._refreshFooter();
  }

  work(dt, time, frame) {
    this.board.update(dt, time, frame);

    this._nextTurn();

    let touch;
    while ((touch = this.board.getTouch()) !== null) {
      this._doTouch(touch);
    }

    this.nodeTree.update();
  }

  _doTouch(touch) {
    let t = { ...touch };

    if (t.position) {
      t.position = [
        Math.floor(t.position[0] / this.board.scale),
        Math.floor(t.position[1] / this.board.scale),
      ];
    }

    if (t.start) {
      t.start = [
        Math.floor(t.start[0] / this.board.scale),
        Math.floor(t.start[1] / this.board.scale),
      ];
    }


    if (t.action == 'down') {
    }
    else if (t.action == 'end') {
    }
    if (this.capture) {
      console.log(`ddd Touch: ${JSON.stringify(t)}`);
    }
  }

  _makeHeader() {
    this.header = this.ux.header({
      parent: this.celest.inner,
      onhome: () => this.params.program.goto('main')
    });
  }

  _makeFooter() {
    this.footer = this.ux.div({
      size: [360, 30],
      position: [0, 30],
      border: `#222`,
    });
    this._refreshFooter();
  }

  _refreshFooter() {
    this.footer.innerHTML = '';

    let buttons = [];
    buttons.push({
      text: 'Step',
      onclick: () => this._onStep(),
    });
    buttons.push({
      text: 'Restart',
      onclick: () => this._onRestart(),
    });
    if (this.paused) {
      buttons.push({
        text: 'Run',
        onclick: () => this._onRun(),
      });
    }
    // add buttons
    let size = [55, 26];
    let position = [2, 2];
    for (let b of buttons) {
      this.ux.button2({
        size,
        position,
        parent: this.footer,
        text: b.text,
        onclick: b.onclick,
      });
      position[0] += size[0] + 2;
    }
  }

  _setState(state) {
    if (this.state !== state) {
      this.state = state;
      this.stateTime = Date.now();
      this.params.program.history = {
        current: this.game.toObject(),
      };
      this.params.program.save();
    }
  }

  _stateAge(state = null) {
    if (state && this.state !== state) {
      return 0;
    }
    if (!this.stateTime) return 0;
    return (Date.now() - this.stateTime) / 1000;
  }

  _onRun() {
    this.setPaused(false);
  }

  _onStep() {
    this.setPaused(true);
    if (this.player) {
      this.player.doStep();
    }
    this._refreshFooter();
  }

  _onRestart() {
    console.log('sss2 restart');
    this.player = null;
    this.gameOver = false;

    this._newGame();
    this._refresh();
  }

  _refresh() {
    this.nodeTree.clear();
    this.table = new Table(this.game, {
      playerA: "Player 1's fleet",
      playerB: "Player 2's fleet",
    });
    this.nodeTree.addActor(this.table);

    this._setState('start');
  }

  _newGame() {
    this.game = new ShipGame({
      rules: this.params.program.getRules(),
    });

    let bot0 = new BotA(this.game, 0);
    let bot1 = new BotA(this.game, 1);
    bot0.placeShips();
    bot1.placeShips();
  }
}