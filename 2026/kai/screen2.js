import Ux from './ux.js';
import Letters from './letters.js';
import Letters2 from './letters2.js';

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
      playerIndex: null,
      suitName: null,
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
    Screen2.count++;
  }

  init() {
    console.log(`iii init screen2`);
    this._gotoState('init');
  }

  _onInit() {
    console.log(`iii _onInit screen2 ${JSON.stringify(this.params)}`);
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
        { text: 'Load test 1', onClick: () => this._restart(
          {
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

    this.program.gameSetupData ??= {};
    this.gameSetupBox = Ux.box1({ parent: this.div });
    this._gameSetup();

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

  _gotoState(state) {
    console.log(`ggg0 _gotoState ${state}`);
    switch (state) {
      case 'init':
        this._onInit();
        break;
      case 'underway':
        break;
      case 'gameover':
        break;
      default:
        console.warn(`ggg1 _gotoState: Unknown state: ${state}`);
        return;
    }
    this.state = state;
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
        console.log(`sss0 FROM game update: ${JSON.stringify(result.value)}`)

        if (result.value.verb === 'no') {
          this.gameMessage(`Player did not have card, ${JSON.stringify(result.value)}`);
        }

        if (result.value.verb === 'turn') {
          //this.gameMessage(`Starting new turn`);
        }
      }
    }

    if (!this.gen2) {
      this.gen2 = this.letters2.update();
    }
    this.result2 = this.gen2?.next();
    if (this.result2.done) {
      this.gen2 = null;
      this.result2 = null;
    }
    else {
      dirty = true;
      console.log(`sss1 FROM letters2 update: ${JSON.stringify(this.result2.value)}`);
    }

    if (dirty) {
      this._buildTable();
    }
  }

  draw() {
    this._updateScreen();
  }

  gameMessage(text) {
    this.currentMessage = text;
    this.messageDiv.innerText = this.currentMessage;
  }

  _buildTable() {
    this.table.innerHTML = '';

    let t2 = `Dealer`;
    t2 += `\nDeck: ${this._infoGroup('deck')}`;
    t2 += `\nDiscard: ${this._infoGroup('discard')}`;
    let x = Ux.text1({
      parent: this.table,
      text: t2,
    });

    for (let i = 0; i < this.players.length; i++) {
      let choose = (!this.letters.data.gameOver && (i == this.letters.data.round.turn));

      this._buildPlayer(i, this.table, choose);
    }
    this.messageDiv = Ux.text1({
      parent: this.table,
      text: this.currentMessage,
    });

    // debug info for 2nd version
    let debug2 = [
      `l2 data: ${JSON.stringify(this.letters2.data)}`,
      `l2 state: ${this.letters2.state}`,
      `r2: ${JSON.stringify(this.result2)}`,
    ];
    // show the deck
    let makeHand = (cards) => {
      let list = [];
      for (let card of cards) {
        list.push(`[${card.name} ${card.face}]`);
      }
      return `[${list.join(' ')}]`;
    }
    debug2.push(`Cards`);
    for (const [k,v] of Object.entries(this.letters2.cardTable.groups)) {
      debug2.push(`  ${k}: ${makeHand(v.cards)}`);
    }

    debug2.push(`qwer`);
    debug2 = debug2.join('\n');

    Ux.text1({
      parent: this.table,
      text: `Debug2:\n${debug2}\nInfo:\n${this._debugInfo()}\n${JSON.stringify(this.letters.data)}`,
    });

    this._gameSetup();
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
    let topText = `Player ${p}`;
    let playerData = this.letters.data.players[p];
    if (playerData.out) {
      topText += ` - Out`;
    }
    let div = Ux.box1({
      parent: parent,
      text: topText,
    });
    let bgColors = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'];// short table of pastel easter egg colors
    div.style.backgroundColor = bgColors[p % bgColors.length];

    if (this.letters2.canDeal() && p == this.letters2.data.firstTurn) {
      Ux.div({
        parent: div,
      });
      Ux.button({
        parent: div,
        text: `Deal`,
        onclick: () => {
          this.letters2.enqueueCommand({
            verb: 'deal',
            a: p,
          });
        },
      });
    }
    if (choose) {
      let hand = this._group('player', p);

      let selections;

      if (this.selectedHandCardIndex != null) {
        let card = hand.cards[this.selectedHandCardIndex];
        selections = this.letters.findPlayerSelections(p, card.source.suit);
      }

      console.log(`ggg 0`);
      if (hand?.cards.length < 2) {
      console.log(`ggg 1`);
        Ux.div({parent: div, text: `\n`, }); // linebreak
        // Draw
        console.log(`ggg 2`);
        Ux.button({
          parent: div,
          text: `Draw`,
          onclick: () => {
            this.selectedHandCardIndex = null;
            this.letters.enqueueCommand({
              verb: 'draw',
              a: p,
            });
          },
        });
      }
      else {
        Ux.div({parent: div, text: `\n`, }); // linebreak
        // select one of the cards
        for (let i = 0; i < hand.cards.length; i++) {
          let card = hand.cards[i];
          let text = `${card.name}`;
          let selected = this.selectedHandCardIndex == i;
          this._turnSelectionButton(
            div,
            text,
            () => {
              this.selectedHandCardIndex = i;
              this._buildTable();
            },
            selected
          );
        }
        if (this._readyToPlayCard(p, this.selectedHandCardIndex, this.select)) {
          Ux.div({parent: div, text: `\n`, }); // linebreak
          let button = Ux.button({
            parent: div,
            text: `Play ${hand.cards[this.selectedHandCardIndex].name} `,
            onclick: () => {
              let command = {
                player: p,
                cardIndex: this.selectedHandCardIndex,
                suit: hand.cards[this.selectedHandCardIndex].source.suit,
                verb: 'play',
              };
              if (this.select.playerIndex != null) {
                command.toPlayer = this.select.playerIndex;
              }
              if (this.select.suitName != null) {
                command.guessSuit = this.select.suitName;
              }
              this.letters.enqueueCommand(command);
              this.selectedHandCardIndex = null;
            },
          });
          button.style.backgroundColor = 'darkgreen';
        }
      }

      if (selections) {
        if (selections.pickPlayer) {
          Ux.div({parent: div, text: `\n`, }); // linebreak
          for (let i of selections.pickPlayer) {
            this._turnSelectionButton(
              div,
              `Player ${i}`,
              () => {
                this.select.playerIndex = i;
                this._buildTable();
              },
              this.select.playerIndex == i
            );
          }
        }
        if (selections.pickCard) {
          Ux.div({parent: div, text: `\n`, }); // linebreak
          for (let suit of selections.pickCard) {
            this._turnSelectionButton(
              div,
              `${suit}`,
              () => {
                this.select.suitName = suit;
                this._buildTable();
              },
              this.select.suitName == suit
            );
          }
        }
      }
    }

    let text = ``;
    text += `Hand: ${this._infoGroup('player', p)} ${JSON.stringify(playerData.value)} ${JSON.stringify(playerData.Discardvalue)}`;
    text += `\nShow: ${this._infoGroup('display', p)}`;
    text += `\nDiscard: ${this._infoGroup('discard', p)}`;
    let x = Ux.text1({
      parent: div,
      text: text,
    });
    x.style.backgroundColor = '#ffdd0022';
  }

  _turnSelectionButton(parent, text, callback, selected) {
    if (selected) {
      text = `[${text}]`;
    }

    let button = Ux.button({
      parent: parent,
      text: text,
      onclick: () => {
        callback();
      },
    });

    if (selected) {
      button.style.backgroundColor = 'darkcyan';
    }
  }

  _readyToPlayCard(playerIndex, cardIndex, selectedValues) {
    if (cardIndex == null) {
      return false;
    }

    let hand = this._group('player', playerIndex);
    let card = hand.cards[cardIndex];
    let suit = card?.source?.suit;
    let selections = this.letters.findPlayerSelections(playerIndex, suit);

    if (selections.pickPlayer) {
      if (!selections.pickPlayer?.includes(selectedValues.playerIndex)) {
        return false;
      }
    }

    if (selections.pickCard) {
      if (!selections.pickCard?.includes(selectedValues.suitName)) {
        return false;
      }
    }

    return true;
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

    this.letters2 = Letters2.createFromSave(data);
  }

  _createDefaultGame() {
    let params = {
      playerCount: this.program.gameSetupData?.playerCount,
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
      data2: this.letters2?.getSave(),
    };
    this.program.persist.data.current = saveGame;
    this.program.save();
    this._updateSaveArea();
  }

  _debugInfo() {
    if (this.letters.isGameOver()) {
      return `Game Over`;
    }
    let turn = this.letters.data.round?.turn;
    if (turn != null) {
      let info = `Turn: ${turn}`;
      if (this.selectedHandCardIndex != null) {
        let hand = this._group('player', turn);
        let card = hand.cards[this.selectedHandCardIndex];
        let suit = card?.source?.suit;
        info += `\n  Selected: ${this.selectedHandCardIndex} ${card?.name} (${suit})`;
        info += `\n  ${JSON.stringify(this.letters.findPlayerSelections(turn, card?.source?.suit))}`;
      }
      return info;
    }
  }

  _updateSaveArea() {
    this.saveArea.textContent = `${JSON.stringify(this.program.persist.data)}`;
  }

  _gameSetup() {
    let box = this.gameSetupBox;
    box.innerHTML = '';
    Ux.div({ parent: box, text: "Game Setup" });
    let players = Ux.div({ parent: box });
    for (let i = 2; i <= 5; i++) {
      let p = Ux.button({
        parent: players,
        text: `${i} players`,
        onclick: () => {
          this.program.gameSetupData.playerCount = i;
          this._gameSetup();
        }
      });
      if (i === this.program.gameSetupData.playerCount) {
        p.style.backgroundColor = 'orange';
      }
    }

    Ux.hr({ parent: box });

    let roundUnderway = this.letters.data.round?.number > 0 && !this.letters.data.gameOver;
    if (roundUnderway) {
      let debugEndButton = (p) => {
        Ux.button({
          parent: box,
          text: `Winner: ${p}`,
          onclick: () => {
            this.letters.enqueueCommand({
              verb: 'debugendround',
              winner: p,
            });
          }
        });
      };
      debugEndButton();
      let tweakDiv = Ux.div({ parent: box });
      for (let i = 0; i < this.letters.data.playerCount; i++) {
        debugEndButton(i);
      }
    }
  }

}
