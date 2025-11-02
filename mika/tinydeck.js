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
    this.random = new TinyRandom(seed);
    let hand = new TinyHand();
    hand.seed = seed;
    hand.cards = [];
    hand.pinks = [];
    for (const categoryItem of this.categoryList) {
      if (categoryItem.category === 'pink') {
        hand.pinks = this.random.sample(categoryItem.cards, 2);
      } else {
        const chosen = this.random.choose(categoryItem.cards);
        if (chosen) {
          hand.cards.push(chosen);
        }
      }
    }
    hand.cards.push(this.random.choose(hand.pinks));
    hand.resources = this.random.shuffle([...this.resourceList, ...this.resourceList, ...this.resourceList]);
    return hand;
  }

  handFromRandom() {
    let seed = Math.floor(Math.random() * 900000) + 100000;
    return this.handFromSeed(seed);
  }

  handFromSaveData(saveData) {
  }

  _ingest(cardData) {
    let tempMap = {};
    for (const card of cardData) {
      tempMap[card.short] = card;
    }

    let sortedKeys = Object.keys(tempMap).sort();
    let result = [];
    for (let i = 0; i < sortedKeys.length; i++) {
      let card = tempMap[sortedKeys[i]];
      card.id = i;
      result.push(card);
    }

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
    return this.categories.map(category => {
      const categoryCards = Object.values(this.categoryMap[category]);
      categoryCards.sort((a, b) => a.id - b.id);
      return {
        category: category,
        cards: categoryCards
      };
    });
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
        resources: hand.resources,
      };
      console.log(`  ${JSON.stringify(info)}:`);
    }
  }
}