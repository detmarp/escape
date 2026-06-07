import EllaBoard from '../ellaboard.js';
import Boreal from '../../boreal/boreal.js';
import Ux2 from '../ux2.js';
import Celest from '../../celest/celest.js';
import ShipGame from '../shipgame.js';
import NodeTree from '../nodetree.js';
import Table from '../actor/table.js';
import Timer from '../actor/timer.js';
import DemoPlayerA from '../actor/demoplayera.js';
import DemoPlayerB from '../actor/demoplayerb.js';
import FingerPoll from '../fingerpoll.js';
import Mytouch from '../mytouch.js';
import HumanPlayer from '../actor/humanplayer.js';

export default class ScreenGame {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
    this.fastDemo = params.program.settings.fastDemo;
    this.debug = true;
    this.onePlayer = params.program.settings.onePlayerDemo;
    this.paused = false;
    this.fingerPoll = new FingerPoll();
    this.mytouch = null;
    // this.dragCircle removed
    this.dragEmitter = null;
    this.debugButtons = true;
  }

  init() {
    ScreenGame.count++;

    this.params.program.setFullBleedBackground();

    this.celest = new Celest(this.parent, 360, 640);
    this.celest.init();

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
      onclick: () => this.params.program.goto('home')
    });

    this.board.init();

    // Pair Mytouch with FingerPoll
    this.mytouch = new Mytouch(this.board.canvas, (touches, type) => {
      this.fingerPoll.onMyTouchEvent(touches, type);
    });

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
      this.otherPlayer = 1 - player;

      if (!this.player) {
        let asHuman = this.params.program.settings.twoHumans || (player === 1);
        let onDone = () => {
          this.player = null;
        };
        let onChange = () => {
          this._save();
        }
        if (asHuman) {
          this.player = new HumanPlayer(this.game, player, onDone, onChange);
        }
        else {
          if (this.fastDemo) {
            this.player = new DemoPlayerB(this.game, player, onDone, onChange);
          }
          else {
            this.player = new DemoPlayerA(this.game, player, onDone, onChange);
          }
          this.player.setPaused(this.paused);
        }

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

    // Poll fingerPoll for events, update dragEmitter actor, and log
    let event;
    while ((event = this.fingerPoll.getNext()) !== null) {
      console.log('FingerPoll event:', event);
      const arenaPos = this.table.arenaPositions[this.otherPlayer];
      const scale = this.board && this.board.scale ? this.board.scale : 1;
      const fx = this.table && this.table.fx ? this.table.fx : null;
      let canvasPosition = [0, 0];
      let arenaPosition = [0, 0];
      let boardPosition = [0,0];
      if (event.position) {
        canvasPosition = [
          event.position[0] / scale,
          event.position[1] / scale
        ];
        arenaPosition = [
          canvasPosition[0] - arenaPos[0],
          canvasPosition[1] - arenaPos[1],
        ];
        boardPosition = [
          Math.floor(arenaPosition[0] / 24),
          Math.floor(arenaPosition[1] / 24),
        ];
      }
      if (event.action === 'down') {
        if (!this.dragEmitter && fx && fx.partA) {
          this.dragEmitter = fx.partA.spawnPrefab('dragbase', {
            x: canvasPosition[0],
            y: canvasPosition[1],
          });
        }
      } else if (event.action === 'drag') {
        if (this.dragEmitter) {
          this.dragEmitter.x = canvasPosition[0];
          this.dragEmitter.y = canvasPosition[1];
        }
      } else if (event.action === 'end') {
        if (this.dragEmitter) {
          this.dragEmitter.kill = true;
          this.dragEmitter = null;
        }
      }

      if (this.player && this.player.onTouch) {
        this.player.onTouch({
          x: boardPosition[0],
          y: boardPosition[1],
          cx: arenaPosition[0],
          cy: arenaPosition[1],
          action: event.action,
        });
      }
    }

    this.nodeTree.update();
  }
  // draw(ctx) no longer needed; DragCircle actor handles its own drawing

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
      buttons: [ {
          text: '🏠',
          onClick: () => this.params.program.goto('home'),
        },
/*
        {
          text: this.paused ? 'Run' : 'Pause',
          onClick: () => {},
        },
        {
          text: 'Restart',
          onClick: () => {},
        },
*/
      ],
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
      this._save();
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
      playerA: "Computer's fleet",
      playerB: "Your fleet",
      hidden: [0],
    });
    this.nodeTree.addActor(this.table);

    this._setState('start');
  }

  _newGame() {
    this.params.program.restoreOrNewGame();
    this.game = this.params.program.game;
  }

  _save() {
      this.params.program.history = {
        current: this.game.toObject(),
      };
      this.params.program.save();
  }
}
