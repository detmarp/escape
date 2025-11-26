import TinyRandom from './tinyrandom.js';
import TinyHand from './tinyhand.js';

export default class TinyDeck {
  constructor(cardData) {
    this.cards = this._ingest(cardData);
    this.categoryMap = this._makeCategoryMap();
    this.categories = Object.keys(this.categoryMap).sort();
    this.categoryList = this._makeCategoryList();
    this.resourceList = ['brick', 'glass', 'stone', 'wheat', 'wood'];
    this.resourceMap = { r: 'brick', c: 'glass', g: 'stone', y: 'wheat', b: 'wood' };
  }

  handFromSeed(seed) {
    let random = new TinyRandom(seed);
    let hand = new TinyHand();
    hand.seed = seed;
    hand.cards = [];
    hand.pinks = [];
    for (const categoryItem of this.categoryList) {
      if (categoryItem.category === 'pink') {
        hand.pinks = random.sample(categoryItem.cards, 2);
      } else {
        const chosen = random.choose(categoryItem.cards);
        if (chosen) {
          hand.cards.push(chosen);
        }
      }
    }
    hand.cards.push(random.choose(hand.pinks));
    hand.resourceDeck = random.shuffle([...this.resourceList, ...this.resourceList, ...this.resourceList]);
    hand.resources = {
      row: hand.resourceDeck.slice(0, 3),
      drawPile: hand.resourceDeck.slice(3),
      picked: null,
    };
    this._makeMaps(hand);

    return hand;
  }

  _makeMaps(hand) {
    hand.categoryMap = {};
    for (const card of hand.cards) {
      hand.categoryMap[card.category] = card;
    }
    hand.shortMap = {};
    for (const card of hand.cards) {
      hand.shortMap[card.short] = card;
    }
    hand.resourceList = this.resourceList;
    hand.resourceMap = this.resourceMap;
    hand.deck = this;
    hand.deckHash = this.hash;
  }

  handFromRandom() {
    let seed = Math.floor(Math.random() * 900000) + 100000;
    return this.handFromSeed(seed);
  }

  handFromSaveData(saveData) {
    // Try to reconstruct hand from savedata
    let seed = saveData.gameSeed || 0;
    // frist, roll from seed
    let hand = this.handFromSeed(seed);

    // Now try to overwrite with save data
    if (saveData.deck) {
      //TODO detmar
    }

    this._makeMaps(hand);

    return hand;
  }

  _ingest(cardData) {
    this.shortMap = {};
    for (const card of cardData) {
      this.shortMap[card.short] = card;
    }

    // hash of the available deck
    let sortedKeys = Object.keys(this.shortMap).sort();
    let result = [];
    let appended = '';
    for (let i = 0; i < sortedKeys.length; i++) {
      let card = this.shortMap[sortedKeys[i]];
      card.id = i;
      result.push(card);
      appended += `${card.short}|`;
    }
    this.hash = this._simpleHash(appended);

    return result;
  }

  _makeCategoryMap() {
    let map = {};
    for (const card of this.cards) {
      if (!map[card.category]) {
        map[card.category] = {};
      }
      map[card.category][card.short] = card;
    }
    return map;
  }

  _makeCategoryList() {
    // Array of { category, cards: [...] }
    let list = this.categories.map(category => {
      const categoryCards = Object.values(this.categoryMap[category]);
      categoryCards.sort((a, b) => a.id - b.id);
      return {
        category: category,
        cards: categoryCards
      };
    });

    // add a 1 of 3 label to each card
    list.forEach((category, c) => {
      category.cards.forEach((card, i) => {
        card.categoryIndex = c;
        card.inCategoryIndex = i;
      });
    });

    return list;
  }

  _simpleHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return hash >>> 0;
  }

  _debugDump() {
    console.log('TinyDeck Debug Dump:');
    console.log('Card count:', this.cards.length);
    console.log(`Categories: ${JSON.stringify(this.categories)}`);
    console.log('CategoryMap:');
    Object.keys(this.categoryMap).forEach(key => {
      console.log(`  ${key}: ${Object.keys(this.categoryMap[key]).length}`);
    });
    console.log('CategoryList:');
    this.categoryList.forEach(item => {
      console.log(`  ${item.category}: [${item.cards.map(c => `{${c.short},${c.id}}`).join(', ')}]`);
    });
    console.log('ResourceList:', JSON.stringify(this.resourceList));
    console.log('ResourceMap:', JSON.stringify(this.resourceMap));
    console.log('Test hands:');
    for (let i = 0; i < 3; i++) {
      let hand = this.handFromRandom();
      let info = {
        seed: hand.seed,
        cards: hand.cards.map(c => [c.short, c.category]),
        pinks: hand.pinks.map(c => c.short),
        resourceDeck: hand.resourceDeck,
        resources: hand.resources,
      };
      console.log(`  ${JSON.stringify(info)}:`);
    }
  }
}