export default class TinyHand {
  constructor() {
    // cards[]
    // byCategory[], obj of category word to card object
    // resourceDeck - origininal array of resource cards, shuffled
    // pinkChoices - array of 2 pink cards.

    // let drawPile = this.shuffle([
    //   'wood', 'brick', 'wheat', 'stone', 'glass',
    //   'wood', 'brick', 'wheat', 'stone', 'glass',
    //   'wood', 'brick', 'wheat', 'stone', 'glass',
    //   ]);
    // this.resources = {
    //   drawPile: drawPile.slice(3),
    //   row: drawPile.slice(0, 3),
    //   picked: null,
    // };


  }

  lookupCardCode(name) {
    return null;
  }

  lookupResourceCode(name) {
    return null;
    // Returns a resource string, or null
    // name can be a full name, or a resource code letter
    const resources = this.hand.resourceList;
    if (resources.includes(name)) {
      // found exact name
      return name;
    }
    // lookup by letter code
    return this.hand.resourceMap[name];
  }
}
