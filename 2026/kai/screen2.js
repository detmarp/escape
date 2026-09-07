import Ux from './ux.js';
import Letters from './letters.js';

export default class Screen2 {
  static count = 0;

  constructor(parent, program, params = {}) {
    this.parent = parent;
    this.program = program;
    this.params = params;
    this.setup = {
      playerCount: 3,
    };
    this.select = {
      a: 0,
      b: 0,
      c: 0,
    };
    this.names = [
      'Rosalind', 'Lysander', 'Celeste', 'Thorne', 'Amara', 'Caspian',
      'Seraphine', 'Dorian', 'Isolde', 'Percival', 'Elara', 'Tristan',
      'Ophelia', 'Lucian', 'Viola', 'Aurelia', 'Finnian', 'Corbin',
      'Mirabel', 'Evander', 'Saffron', 'Gideon',
    ];
  }

  init() {
    this._createGame(this.params.gameData);
    this.now = performance.now();
    this.lastFrameTime = this.now;
    this.parent.innerHTML = '';
    this.div = Ux.screen2({
      parent: this.parent,
      text: 'Screen2',
    });

    this.header = Ux.header2({
      parent: this.div,
      buttons: [
        { text: 'Save', onClick: () => this._save() },
        { text: 'New game', onClick: () => this._restart({}) },
        { text: 'A', onClick: () => {
          console.log('Button A clicked');
        }},
        { text: 'B', onClick: () => {
          console.log('Button B clicked');
        }},
        { text: 'Load test 1', onClick: () => this._restart(
          {
            id: 11,
            data: {
              test: 1,
              buildings: [
                { type: 'hq', level: 0, id: 1 },
              ],
              pending: [
                {
                  'event': { 'event': 'upgrade', 'buildingId': 1, },
                  'time': -5000
                },
              ],
            },
          })
        },
        { text: 'Load test 2', onClick: () => this._restart(
          {
            id: 22,
            data: {
              test: 2,
              buildings: [
                { type: 'hq', level: 1 },
                { type: 'launchpad', level: 2 },
              ],
            },
          })
        },
        { text: 'Restart', onClick: () => this._restart(this.game.data) },
        { text: 'Delete and restart', onClick: () => {
          this.program._deleteSaved();
          this._restart({});
        }},
      ],
    });

    Ux.hr({ parent: this.div });
    this.table = Ux.box1({
      parent: this.div,
    });

    this._buildTable();
    Ux.hr({ parent: this.div });

    this.saveArea = Ux.text1({
      parent: this.div,
    });
    this._updateSaveArea();

    this._save();
    this.lastFrameTime = performance.now();
    this.frame = 0;
    this.loop();
  }

  term() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  loop() {
    const now = Date.now();
    let dt = (now - this.lastFrameTime) / 1000;
    if (dt > 0.01) {
      dt = Math.min(dt, 0.2);
      this.lastFrameTime = now;
      this.work(now, dt);
      this.draw();
    }
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  work(now, dt) {
    // Update the current time and delta time for the screen
    this.frame++;
    this.now = now;
    this.dt = dt;
    const gen = this.letters.update()
    var dirty;
    if (gen) {
      while (true) {
        const result = gen.next()
        if (result.done) {
          break
        }
        dirty = true;
        console.log(`rrr ${JSON.stringify(result.value)}`)
      }
    }
    if (dirty) {
      this._buildTable();
    }
  }

  draw() {
    this._updateScreen();
  }

  _buildTable() {
    this.table.innerHTML = '';
    Ux.button({
      parent: this.table,
      text: 'Shuffle',
      onclick: () => {
        this.letters.enqueueCommand({
          verb: 'shuffle',
        });
      },
    });
    Ux.button({
      parent: this.table,
      text: 'A',
      onclick: () => {
        this.select.a = ((this.select.a ?? 0) + 1) % this.setup.playerCount;
        this._buildTable();
      },
    });
    Ux.div({
      parent: this.table,
      text: `A=${this.select.a}`,
      display: 'inline-block',
    });
    Ux.button({
      parent: this.table,
      text: 'B',
      onclick: () => {
        this.select.b = ((this.select.b ?? 0) + 1) % this.setup.playerCount;
        this._buildTable();
      },
    });
    Ux.div({
      parent: this.table,
      text: `B=${this.select.b}`,
      display: 'inline-block',
    }).style.marginRight = '8px';
    Ux.button({
      parent: this.table,
      text: 'C',
      onclick: () => {
        this.select.c = this.select.c ? 0 : 1;
        this._buildTable();
      },
    });
    Ux.div({
      parent: this.table,
      text: `C=${this.select.c}`,
      display: 'inline-block',
    });
    Ux.button({
      parent: this.table,
      text: 'Deal',
      onclick: () => {
        this.letters.enqueueCommand({
          verb: 'deal',
          a: this.select.a,
        });
      },
    });
    Ux.button({
      parent: this.table,
      text: 'Pickup',
      onclick: () => {
        this.letters.enqueueCommand({
          verb: 'pickup',
        });
      },
    });
    Ux.button({
      parent: this.table,
      text: 'Play',
      onclick: () => {
        this.letters.enqueueCommand({
          verb: 'play',
          a: this.select.a,
          c: this.select.c,
        });
      },
    });
    Ux.button({
      parent: this.table,
      text: 'Discard',
      onclick: () => {
        this.letters.enqueueCommand({
          verb: 'discard',
          a: this.select.a,
          c: this.select.c,
        });
      },
    });
    Ux.button({
      parent: this.table,
      text: 'Move',
      onclick: () => {
        this.letters.enqueueCommand({
          verb: 'move',
          a: this.select.a,
        });
      },
    });

    let t2 = `Dealer`;
    t2 += `\nDeck: ${this._infoGroup('deck')}`;
    t2 += `\nDiscard: ${this._infoGroup('discard')}`;
    let x = Ux.text1({
      parent: this.table,
      text: t2,
    });

    let nextDealerAction = this.letters.findNextDealer();

    for (let i = 0; i < this.players.length; i++) {
      let choose = (!nextDealerAction && !this.letters.data.gameOver && (i == this.letters.data.round.turn));

      this._buildPlayer(i, this.table, choose);
    }
    Ux.text1({
      parent: this.table,
      text: `Info:\n${this._debugInfo()}\n${JSON.stringify(this.letters.data)}`,
    });

    if (nextDealerAction) {
      // There is a pending dealer action
      // For testing / await mode, show a button
      Ux.button({
        parent: this.table,
        text: `Dealer - ${nextDealerAction.verb}`,
        onclick: () => {
          this.letters.enqueueCommand({
            verb: 'dealer',
          });
        },
      });
      Ux.text1({
        parent: this.table,
        text: `${JSON.stringify(nextDealerAction)}`,
      });
    }
  }

  _group(name, i) {
    if (i != null) {
      name += i;
    }
    let g = this.letters.cardTable.groups[name];
    return g;
  }

  _infoGroup(name, i) {
    let g = this._group(name, i);
    let list = [];
    if (g) {
      for (let card of g.cards) {
        list.push(`[${card.name} ${card.face}]`);
      }
    }
    return list.join(' ');
  }

  _buildPlayer(p, parent, choose) {
    let div = Ux.box1({
      parent: parent,
      text: `Player ${p}`,
    });
    if (choose) {
      let hand = this._group('player', p);
      if (hand?.cards.length < 2) {
        // Draw
        Ux.button({
          parent: div,
          text: `Draw`,
          onclick: () => {
            this.selected = null;
            this.letters.enqueueCommand({
              verb: 'draw',
              a: p,
            });
          },
        });
      }
      else {
        // select one of the cards
        for (let i = 0; i < hand.cards.length; i++) {
          let card = hand.cards[i];
          let text = (this.selected == i) ?
            `<Selected ${card.name}>` :
            `Select ${card.name}`;
          Ux.button({
            parent: div,
            text: text,
            onclick: () => {
              this.selected = i;
              this._buildTable();
            },
          });
        }
        if (this.selected != null) {
          Ux.button({
            parent: div,
            text: `Play ${hand.cards[this.selected].name} `,
            onclick: () => {
              this.letters.enqueueCommand({
                verb: 'play',
                a: p,
                c: this.selected,
              });
              this.selected = null;
            },
          });
        }
      }
    }
    let text = ``;
    text += `Hand: ${this._infoGroup('player', p)}`;
    text += `\nShow: ${this._infoGroup('display', p)}`;
    text += `\nDiscard: ${this._infoGroup('discard', p)}`;
    let x = Ux.text1({
      parent: div,
      text: text,
    });
  }

  _updateScreen() {
    let params = {
      frame: this.frame,
      dt: this.dt,
      now: this.now,
      count: Screen2.count,
    };
    this.header.redraw(params);
  }

  _restart(gameData = null) {
    this.program.gameData = gameData;
    this.program.gotoScene();
  }

  _createGame(gameData) {
    if (true ||!gameData || Object.keys(gameData).length == 0) {
      gameData = this._createDefaultGame();
    }

    gameData = this._normalizeGameData(gameData);

    let params = {};
    let data = gameData;
    this.game = Letters.createFromSave(data);
    this.game.start();
  }

  _createDefaultGame() {
    let params = {
      playerCount: 3,
    };

    this.letters = Letters.createDefault(params);

    this.players = [];
    for (let i = 0; i < this.letters.data.playerCount; i++) {
      let p = {
        id: i,
        name: `Player ${i}`,
        handName: `player${i}`,
        displayName: `display${i}`,
        discardName: `discard${i}`,
      };
      this.players.push(p);
    }

    this.dealer = {
      deckName: 'deck',
      discardName: 'discard',
      marker: 0,
    };

    this.current = {
    };
  }

  _normalizeGameData(data) {
    data = { ... data };
    return data;
  }

  _save() {
    let data = {};//{ ... this.game.data ?? {}};
    this.program.persist.data ||= {};
    let saveGame = {
      id: this.game?._id,
      data,
    };
    this.program.persist.data.current = saveGame;
    this.program.save();
    this._updateSaveArea();
  }

  _debugInfo() {
    if (this.letters.isGameOver()) {
      return `Game Over`;
    }
    if (this.letters.findNextDealer()) {
      return "Dealer action pending";
    }
    let turn = this.letters.data.round?.turn;
    if (turn != null) {
      let info = `Turn: ${turn}`;
      if (this.selected != null) {
        let hand = this._group('player', turn);
        let card = hand.cards[this.selected];
        let suit = card?.source?.suit;
        info += `\n  Selected: ${this.selected} ${card?.name} (${suit})`;
        info += `\n  ${JSON.stringify(this.letters.findPlayerSelections(turn, card?.source?.suit))}`;
      }
      return info;
    }
  }

  _updateSaveArea() {
    this.saveArea.textContent = `${JSON.stringify(this.program.persist.data)}`;
  }

}
