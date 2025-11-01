export default class TinySpecial {
  constructor(tiny) {
    this.tiny = tiny;
    this.specials = [];
    this.specialId = 0;
  }

  doSpecial(id, params) {
    if (this.tiny.gameOver) {
      return;
    }

    // find the special with this id, set it as active, optionally merge params, and remove it from the list
    const idx = this.specials.findIndex(s => s && s.id === id);
    if (idx === -1) return;
    let special = this.specials[idx];

    if (!special.permanent) {
      this.specials.splice(idx, 1);
    }

    if (special.name === 'addResource') {
      console.log(`this.tiny.board.cells[${special.cell}].resource =`, params.resource);
      this.tiny.board.cells[special.cell].resource = params.resource;
      // Add the second special
      if (special.special) {
        this.addSpecial(special.special, { resource: params.resource });
      }
    }

    if (special.name === 'replaceBuilding') {
      const cellIdx = params.cell;
      let card = this.tiny.cardMap[params.building];
      this.tiny.board.cells[cellIdx].building = card;
      this.tiny.board.cells[cellIdx].resource = null;
      if (card.special) {
        this.addSpecial(card.special, { cell: cellIdx });
      }
    }

    if (special.name === 'swapResource') {
      const cellIdx = params.cell;
      const newResource = params.resource;
      this.tiny.board.cells[cellIdx].resource = newResource;
    }
  }

  addSpecial(special, params) {
    if (this.tiny.gameOver) {
      return;
    }

    let count = special.count || 1;
    for (let i = 0; i < count; i++) {
      let s = Object.assign({}, special);
      s.id = this.specialId++;
      if (params) {
        Object.assign(s, params);
      }
      this.specials.push(s);
    }
  }
}
