import TinyRandom from './tinyrandom.js';

export default class TinyBot {
  constructor(tiny) {
    this.tiny = tiny;
    this.random = new TinyRandom();
  }

  makeMove() {
    if (this.tiny.gameOver) {
      return;
    }

    let placements = this.tiny.getBuildingPlacements();
    if (placements.length > 0) {
      let placement = this.random.choose(placements);
      let cell = this.random.choose(placement.resourceIndexes);
      this.tiny.doCard(cell, placement);
      return;
    }

    if (this.tiny.pending) {
      this.tiny.endTurn();
      return;
    }

    let moves = this.tiny.canDoResource();
    if (moves && moves.length > 0) {
      let can = this.random.choose(moves);
      this.tiny.doResource(can.position, can.resource);
      return;
    }
  }
}
