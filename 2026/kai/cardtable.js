
class Random {
  constructor(seed) {
    seed ??= Date.now()
    this.seed = Math.floor(Math.abs(seed));
  }

  next(n) {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return Math.floor(this.seed / 233280 * n);
  }
}


export default class CardTable {
  static FACE = Object.freeze({
    UP: 'faceup',
    DOWN: 'facedown',
    PRIVATE: 'private',
  })

  constructor(cardList) {
    this.id = 0;
    this.cardSource = cardList || [];
    this._createTable();
  }

  addGroup(name) {
    let group = {
      name,
      cards: [],
    };
    this.groups[name] = group;
    return group;
  }

  _createTable() {
    this.cardPile = [];
    for (let c of this.cardSource) {
      let card = {
        id: this.id++,
        source: c,
        name: c.name ?? `card${this.id}`,
        face: CardTable.FACE.DOWN,
      }
      this.cardPile.push(card);
    }

    this.groups = {};
    let groupName = 'deck';
    this.addGroup(groupName);

    for (let c of this.cardPile) {
      this.move(c, groupName);
    }
  }

  move(card, groupName, face) {
    if (card.groupName === groupName) {
      return;
    }
    let destGroup = this.groups[groupName] || this.addGroup(groupName);
    let oldGroup = this.groups[card.groupName];
    if (oldGroup) {
      let index = oldGroup.cards.indexOf(card);
      if (index !== -1) {
        oldGroup.cards.splice(index, 1);
      }
    }
    card.groupName = groupName;
    if (face !== undefined) {
      card.face = face;
    }
    destGroup.cards.push(card);
  }

  returnAll(groupName = 'deck') {
    for (let c of this.cardPile) {
      this.move(c, groupName, CardTable.FACE.DOWN);
    }
  }

  summaryString() {
    let lines = [];
    for (let groupName in this.groups) {
      let group = this.groups[groupName];
      lines.push(`${groupName}: ${group.cards.length} cards`);
      for (let c of group.cards) {
        if (c.groupName == groupName) {
          lines.push(`  ${c.name}, ${c.face}, ${c.groupName}`);
        }
      }
    }
    return lines.join('\n');
  }
}