import SetupSurface from '../setupsurface.js';
import Boreal from '../../boreal/boreal.js';
import Ux2 from '../ux2.js';
import Celest from '../../celest/celest.js';
import ShipGame from '../shipgame.js';
import BotA from '../bota.js';
import NodeTree from '../nodetree.js';
import Setup from '../actor/setup.js';
import Timer from '../actor/timer.js';
import DemoPlayerA from '../actor/demoplayera.js';
import DemoPlayerB from '../actor/demoplayerb.js';
import BotSetup from '../botsetup.js';

export default class ScreenSetup {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
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
      onhome: () => this.params.program.goto('home')
    });
  }

  _makeFooter() {
    this.footer = this.ux.div({
      size: [360, 30],
      position: [0, 540],
      border: `#222`,
    });
    let prev = this.ux.div({
      type: 'button',
      parent: this.footer,
      text: 'Previous',
      onclick: () => this._select(-1),
    });
    let next = this.ux.div({
      type: 'button',
      parent: this.footer,
      text: 'Next',
      onclick: () => this._select(1),
    });
    let play = this.ux.div({
      type: 'button',
      parent: this.footer,
      text: 'Play',
      onclick: () => this.params.program.goto('game'),
    });
    this.label = this.ux.div({
      type: 'button',
      parent: this.footer,
      text: '',
    });
  }

  _select(delta) {
    this.seedIndex = Math.max(0, this.seedIndex + delta);
    this.seed = this.seedBase + this.seedIndex;

    let bot = new BotSetup({}, this.seed);
    this.ships = bot.makeShips();
    console.log(`sss seed ${this.seed} ships: ${JSON.stringify(this.ships)}`);

    // can we insert the ships into the this.surface table or whatever so they draw?
    this.table.board.data.ships = this.ships;
    this.table.arenas[0]._refreshShips(this.ships);

    this._refreshFooter();
  }

  _start() {
  }

  _refreshFooter() {
    this.label.textContent = `${this.seedIndex}`;
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