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
    let tiny = new Tiny();
    return tiny;
  }

  tinyFromSeed(seed) {
    let tiny = new Tiny();
    return tiny;
  }

  tinyFromSavedata(saveData) {
    let tiny = new Tiny();
    return tiny;
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

  /**
   * Reset the factory (useful for testing)
   */
  reset() {
    this._initialized = false;
    this._cardData = null;
    this._deck = null;
  }
}
