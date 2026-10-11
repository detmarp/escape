/*
  Card table is a simple deck and dealer system
  Constructed from an input array of optional values: { id, name, rank, suit }
  A top level Item is made with a copy of each input card, held in .index
  There is a map of .groups{}, with a default group['deck']
  Groups are named with a string and optional number
*/
export default class CardTable2 {
  static FACE = Object.freeze({
    UP: 'faceup',
    DOWN: 'facedown',
    PRIVATE: 'private',
  })

  constructor(sourceList) {
    this.id = 0;
    this.source = [ ...(sourceList || []) ];
    this._createIndex();
    this._createDeck();
  }

  addGroup(name, number) {
    // find or add group
    let nameString = this.getNameString(name, number);
    if (this.groups[nameString]) {
      return this.groups[nameString];
    }
    let group = {
      name: nameString,
      cards: [],
    };
    this.groups[nameString] = group;
    return group;
  }

  getNameString(name, number) {
    return number !== undefined ? `${name}.${number}` : String(name);
  }

  _createIndex() {
    this.index = this.source.map((c, i) => {
      const copy = c != null && typeof c === 'object' ? { ...c } : { source: c };
      copy.id ??= i;
      copy.name ??= `card.${i}`;
      copy.suit ??= 'unknown';
      copy.rank ??= 'unknown';
      return {
        id: i,
        source: copy,
        name: copy.name,
        face: CardTable2.FACE.DOWN,
      };
    });
  }

  _createDeck() {
    this.groups = {};
    this.addGroup('deck');
    for (let card of this.index) {
      card.groupName = 'deck';
      card.face = CardTable2.FACE.DOWN;
      this.groups['deck'].cards.push(card);
    }
  }

  move(cardId, face, name, number) {
    let [fromGroupName, fromIndex] = this._find(cardId);
    let card = this.index[cardId];
    let fromGroup = this.groups[fromGroupName];
    let toGroup = this.addGroup(name, number);
    if (fromIndex !== -1) {
      fromGroup.cards.splice(fromIndex, 1);
    }
    card.groupName = toGroup.name;
    if (face !== undefined) {
      card.face = face;
    }
    toGroup.cards.push(card);
    return card;
  }

  _find(cardId) {
    // return [groupname, index]
    let card = this.index[cardId];
    if (!card) {
      return [null, -1];
    }
    let groupName = card.groupName;
    let group = this.groups[groupName];
    let index = group ? group.cards.indexOf(card) : -1;
    return [groupName, index];
  }
}