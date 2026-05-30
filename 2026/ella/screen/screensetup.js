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

export default class ScreenSetup {
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
  }

  term() {
  }

  _nextTurn() {
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
    this.surface.update(dt, time, frame);

    this._nextTurn();

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
    });
    let label = this.ux.div({
      type: 'button',
      parent: this.footer,
      text: '[number]',
    });
    let next = this.ux.div({
      type: 'button',
      parent: this.footer,
      text: 'Next',
    });
    let play = this.ux.div({
      type: 'button',
      parent: this.footer,
      text: 'Play',
      onclick: () => this.params.program.goto('game'),
    });
  }

  _start() {
  }

  _refresh() {
    this.nodeTree.clear();
    this.table = new Setup(this.game, {
    });
    this.nodeTree.addActor(this.table);
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