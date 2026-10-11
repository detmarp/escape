import CardTable from "./cardtable2.js";
import Rules from "./letters2rules.js";
import MyRandom from "./myrandom.js";

export default class Letters2 {
  constructor(params, data) {
    // Typically inited with params or data, but not both
    if (data) {
      data = Letters2._normalizeData(data);
    }
    this._id = 0;
    this._init(params, data);
  }

  _init(params = {}, data = {}) {
    this.rules = new Rules();
    params = Letters2._normalizeParams(params);
    data = Letters2._normalizeData(data);

    this.data = { ...data || {} };

    this.random = new MyRandom(params.seed);

    // Set up the table
    this.data.gameOver = false;
    this.data.playerCount = params.playerCount;
    this.data.players = Array.from({ length: params.playerCount }, (_, i) => {
      return {
        index: i,
        out: false,
      };
    });
    this.data.firstTurn = params.firstTurn;
    // Set up the cards
    this.cardTable = new CardTable(this.rules.data.deck);
    this.cardTable.addGroup(`discard`);
    for (let i = 0; i < this.data.playerCount; i++) {
      this.cardTable.addGroup(`player`, i);
      this.cardTable.addGroup(`discard`, i);
    }

    // all set up, not dealth the first round yet
    this._gotoState('init');
  }

  static _normalizeParams(params = {}) {
    params = { ...params || {} };
    params.playerCount ??= 3;
    params.firstTurn ??= 0;
    return params;
  }

  static _normalizeData(data = {}) {
    data = { ...data || {} };
    // .playerCount
    // .players[], player index is 0-based
    // .cards - some kind of summary of exact card table state
    // .gameOver
    // .round - round number, 0 before starting
    // .firstTurn - index for starting player
    return data;
  }

  static createFromSave(data = {}) {
    let instance = new Letters2(undefined, data);
    return instance;
  }

  static createDefault() {
    let instance = new Letters2({});
    return instance;
  }

  getSave() {
    let saveData = Letters2._normalizeData(this.data);
    saveData.tag = 'This is the save for letters2';
    return saveData;
  }

  _gotoState(state) {
    console.log(`lll0 _gotoState ${state}`);
    switch (state) {
      case 'init':
        break;
      case 'dealing':
        break;
      case 'ready':
        break;
      default:
        console.warn(`lll1 _gotoState: Unknown state: ${state}`);
        return;
    }
    this.state = state;
  }

  enqueueCommand(command) {
    this.pending ??= {};
    this.pending.command = command;
  }

  *update(command) {
    command ??= this.pending?.command;

    if (command) {
      yield* this._doCommand(command);
    }

    this.pending = {};
  }

  isGameOver() {
    return this.data.gameOver;
  }

  *_doCommand(command) {
    let func = `_command_${command.verb}`;
    yield {
      verb: `command`,
      command: command,
    };
    if (typeof this[func] === 'function') {
      console.log(`lll3 generating from ${func}`);
      yield* this[func](command);
    }
    else {
      yield {
        verb: `error`,
        command: command,
      };
    }
  }

  canDeal() {
    return this.state === 'init' || this.state === 'roundover';
  }

  *_recallCards() {
    // any card not in deck, move to deck
    for (let card of this.cardTable.index) {
      if (card.groupName !== 'deck') {
        yield* this._doAction({
          verb: 'movecard',
          cardId: card.id,
          to: 'deck'
        });
      }
    }
  }

  *_shuffle() {
    // reorder all cards in deck
    let deck = this.cardTable.groups['deck'];
    // for n = deck.cards.length - 1; n > 0; n-- {
    for (let n = deck.cards.length - 1; n > 0; n--) {
      const i = this.random.next(n - 1);
      yield* this._doAction({
        verb: 'movecard',
        cardId: i,
        to: 'deck'
      });
    }
  }

  *_deal() {
    for (let i = 0; i < this.data.players.length; i++) {
      let id = this.cardTable.groups['deck'].cards[0].id;
      yield* this._doAction({
        verb: 'movecard',
        to: `player`,
        toNumber: i,
        cardId: id,
        face: CardTable.FACE.PRIVATE,
      });
    }
  }

  *_command_deal(command) {
    console.log(`lll4 _command_deal`);
    if (!this.canDeal()) {
      yield* this._error(`Cannot deal in the current state: ${this.state}`);
      return;
    }
    this._gotoState('dealing');
    yield* this._recallCards();
    yield* this._shuffle();
    yield* this._deal();
    yield* this._doAction({
      verb: 'round',
    });
  }

  *_error(text) {
    yield {
      verb: 'error',
      text: text,
    };
  }

  *_doAction(action) {
    let func = `_action_${action.verb}`;
    if (typeof this[func] === 'function') {
      this[func](action);
      yield action;
    }
    else {
      yield {
        verb: `error`,
        action: action,
      };
    }
  }

  _action_movecard(action) {
    action.face ??= CardTable.FACE.DOWN;

    let [fromGroupName, fromIndex] = this.cardTable._find(action.cardId);
    this.cardTable.move(action.cardId, action.face, action.to, action.toNumber);

    action.from = fromGroupName;
  }

  _action_round(action) {
    // start the next round
    this.data.round ??= {
      number: 0,
      turn: this.data.firstTurn,
    };
    this.data.round.number++;
    this._gotoState('ready');
  }
}
