import TinyDeck from './tinydeck.js';
import Tiny from './tiny.js';
import TinyRandom from './tinyrandom.js';
import TinyHand from './tinyhand.js';

// 🔴🟠🟡🟢🔵⚫⚪🟣
// 🟥🟧🟨🟩🟦⬛⬜🟪
// ❤️🧡💛💚💙🖤🤍💜
// 💶🪙💰
// 🪙🟥🟧🟨🟩🟦⬛⬜🟪

export default class TinyFactory {
  constructor() {
    this._initialized = false;
    this._cardData = null;
    this._deck = null;
  }

  async initialize() {
    if (this._initialized) {
      console.warn('TinyFactory already initialized');
      return;
    }

    const dataFiles = [
      'tinydata_red.json',
      'tinydata_orange.json',
      'tinydata_yellow.json',
      'tinydata_green.json',
      'tinydata_blue.json',
      'tinydata_black.json',
      'tinydata_gray.json',
      'tinydata_pink.json',
    ];

    // Resolve paths relative to this module's location
    const baseUrl = new URL('.', import.meta.url);

    const loadPromises = dataFiles.map(async (filename) => {
      const url = new URL(filename, baseUrl);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load card data from ${filename}`);
      }
      return response.json();
    });
    const allData = await Promise.all(loadPromises);
    this._cardData = allData.flat();

    this.deck = new TinyDeck(this._cardData);

    // Create deck structure directly from card data
    this._deck = {
      cards: this._cardData,
      map: new Map(this._cardData.map(card => [card.short, card]))
    };

    this._initialized = true;
  }

  tinyFromPregame(pregame) {
    pregame = this.normalizePregame(pregame ?? {});

    let hand = new TinyHand();
    hand.seed = pregame.gameseed;
    hand.cards = pregame.deck.map(short => this._deck.map.get(short)).filter(card => card);
    hand.pinks = pregame.pinks.map(short => this._deck.map.get(short)).filter(card => card);
    hand.resourceDeck = pregame.pool;
    hand.resources = {
      row: hand.resourceDeck.slice(0, 3),
      drawPile: hand.resourceDeck.slice(3),
      picked: null,
    };
    this.deck._makeMaps(hand);

    let tiny = new Tiny(hand);

    tiny.gameSeed = hand.seed;
    tiny.timeStamp = pregame.timestamp;

    pregame.cells.forEach((cell, i) => {
      cell.forEach(c => {
        let building = tiny.hand.categoryMap[c];
        if (building) {
          tiny.board.cells[i].building = building;
        }
        else {
          if (tiny.hand.resourceList.includes(c)) {
            tiny.board.cells[i].resource = c;
          }
        }
      });
    });

    tiny._refresh();

    return tiny;
  }

  tinyFromRandom() {
    let hand = this.deck.handFromRandom();
    let tiny = new Tiny(hand);
    return tiny;
  }

  tinyFromSeed(seed) {
    let hand = this.deck.handFromSeed(seed);
    let tiny = new Tiny(hand);
    return tiny;
  }

  tinyFromSaveData(saveData) {
    // can return null if invalid
    console.log(`ttt ${JSON.stringify(saveData)}`);

    let hand = this.deck.handFromSaveData(saveData);
    let tiny = new Tiny(hand);

    tiny.gameSeed = parseInt(saveData.gameseed, 10);
    tiny.timeStamp = parseInt(saveData.timeStamp, 10) || 0;
    tiny.started = saveData.started;
    tiny.gameOver = saveData.gameOver;
    tiny.specials = saveData.specials || [];

    saveData.cells.forEach((cell, i) => {
      cell.forEach(contents => {
        let building = tiny.hand.categoryMap[contents];
        if (building) {
          tiny.board.cells[i].building = building;
        }
        else {
          building = tiny.hand.shortMap[contents];
          if (building) {
            tiny.board.cells[i].building = building;
          }
          else {
            let resource = tiny.hand.resourceMap[contents];
            if (resource) {
              tiny.board.cells[i].resource = resource;
            }
            else if (tiny.hand.resourceList.includes(contents)) {
              tiny.board.cells[i].resource = contents;
            }
          }
        }
      });
    });

    // if (obj.resources) {
    //   instance.resources = obj.resources;
    // }

    // instance._refresh();
    tiny._refresh();

    return tiny;
  }

  normalizePregame(pregame = {}) {
    let result = {};
    result.autostart = !!pregame.autostart;
    result.cells = this.normalizeCells(pregame.savegame?.cells);
    result.gameseed = typeof pregame.savegame?.gameseed === 'number' ?
      Math.floor(pregame.savegame?.gameseed) :
      (pregame.gameseed ?? 0);
    let random = new TinyRandom(result.gameseed);
    let [deck, pinks] = this.normalizeDeck(pregame.savegame?.deck, random);
    result.deck = deck;
    result.pinks = pinks;
    result.pool = this.normalizePool(pregame.savegame?.pool, random);
    result.timestamp = pregame.savegame?.timestamp ?? Date.now();
    return result;
  }

  normalizeCells(cells) {
    let result = [];
    if (!Array.isArray(cells)) {
      // Not an array, create 16 empty arrays
      for (let i = 0; i < 16; i++) result.push([]);
      return result;
    }
    for (let i = 0; i < 16; i++) {
      let cell = cells[i];
      if (Array.isArray(cell)) {
        // Only keep string elements
        result.push(cell.filter(x => typeof x === 'string'));
      } else {
        result.push([]);
      }
    }
    return result;
  }

  normalizeDeck(deck, random) {
    // return [[8],[2]] - shortnames including pink, and pink[2] shortnames
    // assume deck is array of 8 shortnames.
    let [defaultDeck, defaultPinks] = this.deck.makeShuffledDeck(random);
    let defaultCards = [...defaultDeck];
    defaultCards.push(defaultPinks[0]);
    // Make a map of default fallback cards, randomly
    let defaultMap = {};
    defaultCards.forEach(short => {
      let card = this._deck.map.get(short);
      defaultMap[card.category] = card.short;
    });
    // make a map of provided deck
    let map = {};
    if (deck) {
      deck.forEach(shortname => {
        const card = this._deck.map.get(shortname);
        if (card) {
          map[card.category] = card.short;
        }
      });
    }
    // Fill in any gaps
    Object.keys(defaultMap).forEach(category => {
      if (!map[category]) {
        map[category] = defaultMap[category];
      }
    });
    return [Object.values(map), defaultPinks];
  }

  normalizePool(pool, random) {
    let defaultPool = random.shuffle([
      ...this.deck.resourceList,
      ...this.deck.resourceList,
      ...this.deck.resourceList,
    ]);
    let result = pool ?? [];
    return [...result, ...defaultPool].slice(0, 15);
  }

  tinyToSaveData(tiny) {
    let cells = [];
    tiny.board.cells.forEach(cell => {
      let c = [];
      if (cell.building) {
        c.push(cell.building.category);
      }
      else if (cell.resource) {
        c.push(cell.resource);
      }
      cells.push(c);
    });

    let gameseed = tiny.gameSeed || 0;
    let timestamp = tiny.timeStamp || Date.now();
    let state = this.state;
    let [row, draw] = tiny._findRotatedResources();
    let pool = row.concat(draw);
    let deck = tiny.hand.cards.map(card => card.short);
    let score = tiny.score.displayScore;

    let data = {
      gameseed,
      timestamp,
      state,
      cells,
      pool,
      deck,
      score,
    };

    return data;
  }


  getDeck() {
    if (!this._initialized) {
      throw new Error('TinyFactory not initialized. Call initialize() first.');
    }
    return this._deck;
  }

  /**
   * Get the card data array
   */
  getCardData() {
    if (!this._initialized) {
      throw new Error('TinyFactory not initialized. Call initialize() first.');
    }
    return this._cardData;
  }

  /**
   * Create a new Tiny game instance
   * @param {number} seed - Optional game seed
   * @param {object} rules - Optional game rules
   */
  createTiny(seed, rules) {
    if (!this._initialized) {
      throw new Error('TinyFactory not initialized. Call initialize() first.');
    }

    // Dynamically import Tiny to avoid circular dependencies
    // This will be resolved at runtime
    return import('./tiny.js').then(module => {
      const Tiny = module.default;
      // Pass the shared deck to Tiny constructor
      return new Tiny(seed, rules, this._deck);
    });
  }
}
