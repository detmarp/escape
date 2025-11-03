import TinyDeck from './tinydeck.js';
import Tiny from './tiny.js';

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
      'tinydatared.json',
      'tinydataorange.json',
      'tinydatayellow.json',
      'tinydatagreen.json',
      'tinydatablue.json',
      'tinydatablack.json',
      'tinydatagray.json',
      'tinydatapink.json',
    ];
    const loadPromises = dataFiles.map(async (filename) => {
      const response = await fetch(filename);
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
    console.log('');
    console.log('-X-X-X-X-X-X- ttt');
    console.log(`${JSON.stringify(saveData)}`);

    let hand = this.deck.handFromSaveData(saveData);
    let tiny = new Tiny(hand);

    tiny.gameSeed = parseInt(saveData.gameSeed, 10);
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

  tinyToSaveData(tiny) {
    let cells = [];
    tiny.board.cells.forEach(cell => {
      let c = [];
      if (cell.building) {
        c.push(cell.building.category);
      }
      if (cell.resource) {
        c.push(cell.resource);
      }
      cells.push(c);
    });

    let data = {
      gameSeed: tiny.hand.seed,
      timeStamp: tiny.timeStamp,
      started: tiny.started,
      gameOver: tiny.gameOver,
      cells,
      specials: tiny.special.specials || undefined,
      points: tiny.score.displayScore,
      resources: tiny.hand.resources,
      deckHash: tiny.hand.deckHash,
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
