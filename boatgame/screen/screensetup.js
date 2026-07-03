import SetupSurface from '../setupsurface.js';
import Boreal from '../../2026/boreal/boreal.js';
import Ux2 from '../ux2.js';
import Celest from '../../2026/celest/celest.js';
import ShipGame from '../shipgame.js';
import BotA from '../bota.js';
import NodeTree from '../nodetree.js';
import Setup from '../actor/setup.js';
import Timer from '../actor/timer.js';
import DemoPlayerA from '../actor/demoplayera.js';
import DemoPlayerB from '../actor/demoplayerb.js';
import BotSetup from '../botsetup.js';
import ShipBoard from '../shipboard.js';

export default class ScreenSetup {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
    this.canPlay = true;
    this.fastDemo = params.program.settings.fastDemo;
    this.debug = true;
    this.onePlayer = params.program.settings.onePlayerDemo;
    this.paused = false;
    this.seedBase = Math.floor(Date.now() % 1000000);
    this.seedIndex = 0;
    this.seed = this.seedBase + this.seedIndex;
  }

  init() {
    ScreenSetup.count++;

    this.params.program.setFullBleedBackground();

    this.celest = new Celest(this.parent, 360, 640);
    this.celest.init();

    this.celest.inner.style.backgroundColor = '#fdb4';

    this.ux = new Ux2(this.celest.inner);

    this._makeHeader();
    this._makeFooter();

    this.bottom = this.ux.div({
      parent: this.celest.inner,
      size: [360, 480],
      position: [0, 30],
    });

    this.surface = new SetupSurface(this.bottom, {
      onclick: () => this.params.program.goto('main')
    });

    this.surface.init();

    this.nodeTree = new NodeTree({
      canvas: this.surface.canvas,
    });
    if (this.params.program.settings.fastClock) {
      this.nodeTree.debugSpeed = 40;
    }

    this._newGame();
    this._refresh();

    this._select(0);
  }

  work(dt, time, frame) {
    this.surface.update(dt, time, frame);

    this.nodeTree.update();
  }

  _makeHeader() {
    this.header = this.ux.header({
      parent: this.celest.inner,
      buttons: [
        {
          text: '🏠',
          onClick: () => this.params.program.goto('home'),
        },
        {
          text: 'Prev',
          onClick: () => this._select(-1),
        },
        {
          text: 'Next',
          onClick: () => this._select(1),
        },
        {
          text: `${this.seedIndex}`,
        },
      ],
    });

    this.label = this.header.querySelectorAll('button')[3] || null;
  }

  _makeFooter() {
    this.footer = this.ux.div({
      size: [360, 60],
      position: [0, 540],
      //border: `#222`,
    });
    this.playRect = this.ux.homeText({
      parent: this.footer,
      size: [360, 60],
      position: [0, 0],
      text: 'Play',
      onclick: this.canPlay ? () => this.params.program.goto('game') : null,
    });

    if (!this.canPlay) {
      this.playRect.style.color = '#bbb8';
      this.playRect.style.pointerEvents = 'none';
    }
  }

  _select(delta) {
    this.seedIndex = Math.max(0, this.seedIndex + delta);
    this.seed = this.seedBase + this.seedIndex;

    let bot = new BotSetup({}, this.seed);
    this.ships = bot.makeShips();
    let board = new ShipBoard();
    board.data.ships = this.ships;
    board.rebuildExtra();
    this.params.program.makeGameFromBoard(
      this.params.program.getRules(),
      board
    );

    // can we insert the ships into the this.surface table or whatever so they draw?
    this.table.board.data.ships = this.ships;
    this.table.arenas[0]._refreshShips(this.ships);

    this._refreshFooter();
  }

  _start() {
  }

  _refreshFooter() {
    if (this.label) {
      this.label.textContent = `${this.seedIndex}`;
    }
  }

  _refresh() {
    this.nodeTree.clear();
    this.table = new Setup(this.game, {
    });
    this.nodeTree.addActor(this.table);
    this._refreshFooter();
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