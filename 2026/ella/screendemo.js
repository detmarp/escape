import EllaBoard from './ellaboard.js';
import Boreal from '../boreal/boreal.js';
import Ux2 from './ux2.js';
import Celest from '../celest/celest.js';
import WorkTree from './worktree.js';
import DrawShip from './drawship.js';
import DrawX from './drawx.js';
import ShipGame from './shipgame.js';
import BotA from './bota.js';
import NodeTree from './nodetree.js';
import Table from './actor/table.js';

export default class ScreenDemo {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
    this._newGame();
  }

  init() {
    ScreenDemo.count++;

    this.celest = new Celest(this.parent, 360, 640);
    this.celest.init();

    this.celest.outer.style.backgroundColor = '#456';
    this.celest.inner.style.backgroundColor = '#fdb';

    this.workTree = new WorkTree();

    this.ux = new Ux2(this.celest.inner);

    this._makeHeader();
    this._makeFooter();

    this.bottom = this.ux.div({
      parent: this.celest.inner,
      size: [360, 580],
      position: [0, 60],
    });

    this.board = new EllaBoard(this.bottom, {
      onclick: () => this.params.program.goto('main')
    });

    this.board.init();

    this.nodeTree = new NodeTree({
      canvas: this.board.canvas,
    });
    this.table = new Table();
    this.nodeTree.addActor(this.table, null);

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

    if (this.game.gameOver) {
      this._setState('gameover');
      return;
    }

    let player = this.game.turn;
    let other = 1 - player;
    let bot = new BotA(this.game, player);

    if (!this.game.boards[other].cursor) {
      bot.startTurn();
      bot.setTarget();
      this.game.boards[other]._update();
    }
    else if (this.game.boards[other].cursor) {
      let position = this.game.boards[other].cursor;
      this.game.boards[other].cursor = null;
      this.game.shoot(other, position);
      this.game.boards[other]._update();
    }
  }

  work(dt, time, frame) {
    this.board.update(dt, time, frame);

    this._nextTurn();

    this.workTree.call('work', dt, time, frame);

    let touch;
    while ((touch = this.board.getTouch()) !== null) {
      this._doTouch(touch);
    }

    this.workTree.call('draw', this.board.ctx);

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
      this.capture = this.workTree.find(t.position);
    }
    else if (t.action == 'end') {
      this.capture = null;
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
    this.ux.button2({
      size: [40,28],
      position: [0, 1],
      parent: this.footer,
      text: 'Run',
    });
    this.ux.button2({
      size: [40,28],
      position: [40, 1],
      parent: this.footer,
      text: 'Pause',
    });
    this.ux.button2({
      size: [40,28],
      position: [80, 1],
      parent: this.footer,
      text: 'Step',
    });
    this.ux.button2({
      size: [40,28],
      position: [120, 1],
      parent: this.footer,
      text: 'Undo',
    });
    this.ux.button2({
      size: [40,28],
      position: [160, 1],
      parent: this.footer,
      text: 'Restart',
      onclick: () => this._onRestart(),
    });
  }

  _setState(state) {
    if (this.state !== state) {
      this.state = state;
      this.stateTime = Date.now();
    }
  }

  _stateAge(state = null) {
    if (state && this.state !== state) {
      return 0;
    }
    if (!this.stateTime) return 0;
    return (Date.now() - this.stateTime) / 1000;
  }

  _onRestart() {
    this._newGame();
    this._refresh();
  }

  _refresh() {
    this.workTree.clear();

    let gridStart0 = { position: [20, 20], };
    let gridStart1 = { position: [60, 300], };

    this.workTree.add(null, gridStart0);
    this.workTree.add(null, gridStart1);

    let grid0 = new DrawShip(this.game.boards[0]);
    this.workTree.add(gridStart0, grid0);

    let x = new DrawX();
    this.workTree.add(gridStart0, x);

    let grid1 = new DrawShip(this.game.boards[1]);
    this.workTree.add(gridStart1, grid1);

    this._setState('start');
  }

  _newGame() {
    this.game = new ShipGame();

    let bot0 = new BotA(this.game, 0);
    let bot1 = new BotA(this.game, 1);
    bot0.placeShips();
    bot1.placeShips();
  }
}