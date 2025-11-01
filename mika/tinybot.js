export default class TinyBot {
  constructor(tiny) {
    this.tiny = tiny;
  }

  _random(range) {
    return Math.floor(Math.random() * range);
  }

  _randomChoose(list) {
    return list[this._random(list.length)];
  }

  makeMove() {
    if (this.tiny.gameOver) {
      return;
    }

    let placements = this.tiny.getBuildingPlacements();
    if (placements.length > 0) {
      let placement = placements[this._random(placements.length)];
      let cell = this._randomChoose(placement.resourceIndexes);
      this.tiny.doCard(cell, placement);
      return;
    }

    if (this.tiny.doneResource) {
      this.tiny.endTurn();
      return;
    }

    let moves = this.tiny.canDoResource();
    if (moves && moves.length > 0) {
      let can = this._randomChoose(moves);
      this.tiny.doResource(can.position, can.resource);
      return;
    }
  }
}