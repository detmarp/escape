/**
 * TinyFactory - Singleton factory for managing card data and Tiny game instances
 *
 * This class loads card data once and provides it to all Tiny game instances.
 * It acts as a central data store that can be initialized from JSON files.
 *
 * Usage:
 *   // Initialize once when your app starts
 *   await TinyFactory.initialize();
 *
 *   // Later, create Tiny instances that reference the shared data
 *   const game1 = TinyFactory.createTiny();
 *   const game2 = TinyFactory.createTiny(123456);
 */

//import TinyDeck from './tinydeck.js';

class TinyFactory {
  constructor() {
    this._initialized = false;
    this._cardData = null;
    this._deck = null;
  }

  /**
   * Initialize the factory with card data
   * Loads card data from multiple JSON files and combines them
   */
  async initialize() {
    if (this._initialized) {
      console.warn('TinyFactory already initialized');
      return;
    }

    // List of JSON files to load
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

    // Load all JSON files
    const loadPromises = dataFiles.map(async (filename) => {
      const response = await fetch(filename);
      if (!response.ok) {
        throw new Error(`Failed to load card data from ${filename}`);
      }
      return response.json();
    });

    // Wait for all files to load
    const allData = await Promise.all(loadPromises);

    // Combine all arrays into one
    this._cardData = allData.flat();

    // Create deck structure directly from card data
    this._deck = {
      cards: this._cardData,
      map: new Map(this._cardData.map(card => [card.short, card]))
    };

    this._initialized = true;

    // Register this factory with Tiny so new Tiny() instances can use it
    const { default: Tiny } = await import('./tiny.js');
    Tiny.setFactory(this);
  }

  /**
   * Check if factory is initialized
   */
  isInitialized() {
    return this._initialized;
  }

  /**
   * Get the shared deck instance
   */
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

    // Also clear the factory reference in Tiny
    import('./tiny.js').then(module => {
      const Tiny = module.default;
      Tiny.setFactory(null);
    });
  }
}

// Export singleton instance
const instance = new TinyFactory();
export default instance;
