import CardTable from "./cardtable.js";

class Random {
  constructor(seed) {
    seed ??= Date.now()
    this.seed = Math.floor(Math.abs(seed));
  }

  next(n) {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return Math.floor(this.seed / 233280 * n);
  }

  shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = this.next(i + 1);
      [list[i], list[j]] = [list[j], list[i]];
    }
  }
}

export default class Letters {
  constructor(params = {}, data) {
    this._id = 0;
    this._init(params, data);
  }

  _init(params = {}, data = {}) {
    this.data = { ...data || {} };
    this.data.playerCount = params.playerCount ?? 3;
    this.data.players =
      Array.from({ length: this.data.playerCount }, () => (
        { tokens: 0 }
      ));
    this.cardTypes = {
      guard: {
        card: { name: 'Guard', rank: 1, suit: 'guard' },
        rules: { needOther: true, needCard: true },
      },
      priest: {
        card: { name: 'Priest', rank: 2, suit: 'priest' },
        rules: { needOther: true },
      },
      baron: {
        card: { name: 'Baron', rank: 3, suit: 'baron' },
        rules: { needOther: true },
      },
      handmaid: {
        card: { name: 'Handmaid', rank: 4, suit: 'handmaid' },
        rules: { },
      },
      prince: {
        card: { name: 'Prince', rank: 5, suit: 'prince' },
        rules: { needAny: true },
      },
      king: {
        card: { name: 'King', rank: 6, suit: 'king' },
        rules: { needOther: true },
      },
      countess: {
        card: { name: 'Countess', rank: 7, suit: 'countess' },
        rules: { },
      },
      princess: {
        card: { name: 'Princess', rank: 8, suit: 'princess' },
        rules: { },
      },
    };
    let deckSetup = [
      { type: 'guard', count: 5 },
      { type: 'priest', count: 2 },
      { type: 'baron', count: 2 },
      { type: 'handmaid', count: 2 },
      { type: 'prince', count: 2 },
      { type: 'king', count: 1 },
      { type: 'countess', count: 1 },
      { type: 'princess', count: 1 },
    ];
    let list = [];
    for (let setup of deckSetup) {
      for (let i = 0; i < setup.count; i++) {
        list.push({ ...this.cardTypes[setup.type].card });
      }
    }

    this.cardTable = new CardTable(list);
    this.cardTable.addGroup('discard');
    for (let i = 0; i < this.data.playerCount; i++) {
      this.cardTable.addGroup(`player${i}`);
      this.cardTable.addGroup(`display${i}`);
      this.cardTable.addGroup(`discard${i}`);
    }
  }

  static createFromSave(data = {}) {
    let params = {};
    let instance = new Letters(params, data);
    return instance;
  }

  static createDefault(params = {}) {
    let instance = new Letters(params, {});
    //instance.data.awaitMode = true;

    return instance;
  }

  start() {
  }

  enqueueCommand(command) {
    this.command = command;
  }

  isGameOver() {
    return this.data.gameOver;
  }

  findNextDealer() {
    // If dealer action is pending, then return that action
    if (this.data.gameOver) {
      return;
    }
    if (this.data.round == null) {
      // Start the first round, or the next round
      return {
        verb: `round`
      };
    }
    if (!this.data.round.shuffled) {
      // Shuffle
      return {
        verb: `shuffle`
      };
    }
    if (this.data.round.burnt < this.data.round.toBurn) {
      // Burn the top card (or 4 for 2 player)
      return {
        verb: `burn`
      };
    }
    if (this.data.round.dealt < this.data.playerCount) {
      // Deal cards to players
      return {
        verb: `deal`,
        a: this.data.round.dealt,
      };
    }
    if (this.data.round.turn == null) {
      // Set the first player's turn
      return {
        verb: `turn`,
        a: 0,
      };
    }
  }

  findPlayerSelections(playerIndex, cardType) {
    let suit = this.cardTypes[cardType]?.card?.suit;
    let selections = { };
    let indexes = Array.from({ length: this.data.playerCount }, (_, i) => i);
    let anyPlayers = indexes.filter(i => !this.data.player?.[i]?.out);
    let otherPlayers = anyPlayers.filter(i => i !== playerIndex);
    let cards = Object.keys(this.cardTypes).filter(name => name !== 'guard');

    let rules = this.cardTypes[cardType]?.rules ?? {};

    if (rules.needOther && otherPlayers.length > 0) {
      selections.pickPlayer = otherPlayers;
    }
    if (rules.needAny && anyPlayers.length > 0) {
      // includes self
      selections.pickPlayer = anyPlayers;
    }
    if (rules.needCard) {
      selections.pickCard = cards;
    }

    return selections;
  }

  *update(command) {
    command ??= this.command;
    this.command = null;

    if (command) {
      yield* this._doCommand(command);
    }
    else {
      if (!this.data.awaitMode) {
        // normally we try the next dealer action
        let pendingDealerAction = this.findNextDealer();
        if (pendingDealerAction) {
          yield* this._doAction(pendingDealerAction);
        }
      }
    }
  }

  hasPlayerCard(playerIndex, cardSuit) {
    let hand = this.cardTable.groups[`player${playerIndex}`]?.cards;
    return hand?.some(card => card.source.suit === cardSuit);
  }

  *_doCommand(command) {
    let func = `_command_${command.verb}`;
    yield {
      verb: `command`,
      command: command,
    };
    if (typeof this[func] === 'function') {
      yield* this[func](command);
    }
    else {
      yield {
        verb: `error`,
        command: command,
      };
    }
  }

  *_command_shuffle(command) {
    let deckCards = this.cardTable.groups['deck']?.cards;
    if (deckCards) {
      let rng = new Random();
      rng.shuffle(deckCards);
    }
    yield 'shuffled the deck';
  }

  *_command_dealer(command) {
    let action = this.findNextDealer();
    yield* this._doAction(action);
  }

  *_command_dealXXX(command) {
    let playerGroup = `player${command.a}`
    let deckCards = this.cardTable.groups['deck']?.cards
    if (deckCards && deckCards.length > 0) {
      let card = deckCards[0]
      this.cardTable.move(card, playerGroup)
      yield `dealt a card to ${playerGroup}`
    }
  }

  *_command_pickup(command) {
    // hard move all non-deck cards back to deck, as facedown
    for (let groupName in this.cardTable.groups) {
      if (groupName !== 'deck') {
        let group = this.cardTable.groups[groupName];
        while (group.cards.length > 0) {
          let card = group.cards[0];
          this.cardTable.move(card, 'deck');
          yield `moved ${card.name} from ${groupName} to deck`;
        }
      }
    }
  }

  *_command_draw(command) {
    let playerGroup = `player${command.a}`
    let deckCards = this.cardTable.groups['deck']?.cards
    if (deckCards && deckCards.length > 0) {
      let card = deckCards[0]
      let action = {
        verb: 'deal',
        a: command.a,
      };
      yield* this._doAction(action);
    }
  }

  *_command_play(command) {
    // This is not the full game rules, but let's move any display card in to discard, for this player, then put this card faceup as display. then bump up the 'turn' to the next player; yield do_action()s to do this
    let playerGroup = `player${command.player}`;
    let displayGroup = `display${command.player}`;
    let discardGroup = `discard${command.player}`;

    // Move any display cards to discard
    let displayCards = this.cardTable.groups[displayGroup]?.cards ?? [];
    while (displayCards.length > 0) {
      let card = displayCards[0];
      this.cardTable.move(card, discardGroup, CardTable.FACE.UP);
      yield `moved ${card.name} from ${displayGroup} to ${discardGroup}`;
    }

    console.log(`ppp _command_play: ${JSON.stringify(command)}`);

    // Move the played card from player's hand to display
    let handCards = this.cardTable.groups[playerGroup]?.cards ?? [];
    let card = handCards[command.cardIndex];
    this.cardTable.move(card, displayGroup, CardTable.FACE.UP);
    yield `moved ${card.name} from ${playerGroup} to ${displayGroup}`;

    console.log(`ppp ${JSON.stringify(command)}`);

    switch (command.suit) {
      case 'guard':
        // Guess other player's card, if correct they're out
        if (this.hasPlayerCard(command.toPlayer, command.guessSuit)) {
          // Chosen player has card, reveal and go out
          yield *this._doAction({
            verb: 'move',
            from: `player${command.toPlayer}`,
            to: `display${command.toPlayer}`,
            face: CardTable.FACE.UP,
          });
          yield *this._doAction({
            verb: 'out',
            player: command.toPlayer,
          });
        }
        else {
          // Bad guess
          yield *this._doAction({
            verb: 'no',
            player: command.toPlayer,
            suit: command.guessSuit,
          });
        }
        break;
      case 'priest':
        // peek at other player's card
        yield *this._doAction({
          verb: 'reveal',
          from: command.toPlayer,
          to: command.player,
        });
        break;
      case 'baron':
        // Compare hands, lower hand is out
        let guesserCard = this.cardTable.groups[`player${command.player}`]?.cards[0];
        let otherCard = this.cardTable.groups[`player${command.toPlayer}`]?.cards[0];
        if (guesserCard && otherCard) {
          let otherHigher = otherCard.value - guesserCard.value;
          if (otherHigher == 0) {
            // Tie, nothing
            yield *this._doAction({
              verb: 'tie',
              players: [command.player, command.toPlayer],
            });
            break;
          }
          let out = otherHigher > 0 ? command.player : command.toPlayer;
          if (otherHigher < 0) {
            yield *this._doAction({
              verb: 'move',
              from: `player${out}`,
              to: `display${out}`,
              face: CardTable.FACE.UP,
            });
          }
          yield *this._doAction({
            verb: 'out',
            player: out,
          });
        }
        break;
      case 'handmaid':
        yield *this._doAction({
          verb: 'protected',
          player: command.player,
        });
        break;
      case 'prince':
        // Handle prince card logic here
        break;
      case 'king':
        // Handle king card logic here
        break;
      case 'countess':
        // Handle countess card logic here
        break;
      case 'princess':
        // Handle princess card logic here
        break;
    }

    // Advance the turn to the next player
    yield *this._doAction({
      verb: 'turn',
      a: (this.data.round.turn + 1) % this.data.playerCount,
    });
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

  _action_round(action) {
    // Start the next round
    this.data.roundNumber = (this.data.roundNumber ?? 0) + 1;
    this.data.round = {
      number: this.data.roundNumber,
      starter: 0,
      toBurn: 1,
      burnt: 0,
      dealt: 0,
      shuffled: false,
    };
  }

  _action_shuffle(action) {
    let deckCards = this.cardTable.groups['deck']?.cards;
    if (deckCards) {
      let rng = new Random();
      rng.shuffle(deckCards);
      this.data.round.shuffled = true;
    }
  }

  _action_burn(action) {
    let deckCards = this.cardTable.groups['deck']?.cards;
    if (deckCards && deckCards.length > 0) {
      let card = deckCards[0];
      let face = this.data.round.burnt < 1 ? CardTable.FACE.DOWN : CardTable.FACE.UP;
      this.cardTable.move(card, 'discard', face);
      this.data.round.burnt += 1;
    }
  }

  _action_deal(action) {
    let playerGroup = `player${action.a}`;
    let deckCards = this.cardTable.groups['deck']?.cards;
    if (deckCards && deckCards.length > 0) {
      let card = deckCards[0];
      this.cardTable.move(card, playerGroup, CardTable.FACE.PRIVATE);
      this.data.round.dealt += 1;
    }
  }

  _action_turn(action) {
    // set this player as the the current player
    this.data.round.turn = action.a;
  }
}
