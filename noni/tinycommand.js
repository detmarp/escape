import TinyParser from './tinyparser.js';

export default class TinyCommand {
  constructor(tiny) {
    this.tiny = tiny;
    this.parser = new TinyParser();
    this.undos = [];
  }

  undo() {
    let lastUndo = this.undos.pop();
    if (lastUndo) {
      this.do(lastUndo, true);
    }
  }

  *do(commands, isUndo=false) {
    if (this.tiny._logCommands) {
      console.log(`ttt TinyCommand do: ${commands}`);
    }
    this.actionUndos = [];
    let tokens = this.parser.tokenize(commands);

    if (tokens.length == 0) {
      yield* this._yieldData({ action: 'error', error: 'empty' });
      return;
    }

    let verb = tokens[0].string;

    if (verb === 'resource') {
      if (tokens.length != 3 || tokens[2].number == null) {
        yield* this._syntaxError(tokens);
        return;
      }
      let resource = tokens[1].string;
      let cellIndex = tokens[2].number;
      this.tiny.doResource(cellIndex, resource);
      yield* this._yieldData({
        action: 'resource',
        resource: resource,
        cellIndex: cellIndex,
      });
      yield* this._checkPlacements();
      yield* this._checkScores();
      return;
    }

    if (verb == 'building') {
      if (tokens.length < 4 || tokens[2].number == null) {
        yield* this._syntaxError(tokens);
        return;
      }
      // create a placement struct
      let index = tokens[2].number;
      let category = tokens[1].string;
      let placement = {
        placementIndexes: tokens.slice(3).map(t => t.number),
        card: this.tiny.hand.cards.find(card => card.category === category),
      };
      this.tiny.doCard(index, placement);
      for (let c of placement.placementIndexes) {
        yield* this._yieldData({
          action: 'unresource',
          cellIndex: c,
        });
      }
      yield* this._yieldData({
        action: 'building',
        building: category,
        index: index,
      });
      yield* this._checkPlacements();
      yield* this._checkScores();
      return;
    }

    if (verb === 'endturn') {
      if (tokens.length != 1) {
        yield* this._syntaxError(tokens);
        return;
      }
      this.undos = [];
      yield* this._yieldData({ action: 'clearundo' });
      let poolAction = this.tiny.updateHandResources();
      if (poolAction) {
        yield* this._yieldData(poolAction);
      }
      this.tiny.endTurn();
      yield* this._yieldData({ action: 'endturn' });
      return;
    }

    if (verb === 'setup') {
      if (tokens.length != 1) {
        yield* this._syntaxError(tokens);
        return;
      }
      yield* this._setup();
      yield* this._checkPlacements();
      yield* this._checkScores();
      return;
    }

    if (verb == 'undo') {
      if (tokens.length != 3) {
        yield* this._syntaxError(tokens);
        return;
      }
      let type = tokens[1].string;;
      let cellIndex = tokens[2].number;
      yield* this._undo(cellIndex, type);
      return;
    }

    yield* this._yieldData({ action: 'error', error: `unknown: ${verb}` });
  }

  *_syntaxError(tokens) {
    yield* this._yieldData({ action: 'error', error: 'syntax' });
  }

  *_checkPlacements() {
    yield* this._yieldData({ action: 'checkplacements' });
  }

  *_checkScores() {
    yield* this._yieldData({ action: 'checkscores' });
  }

  *_undo(cellIndex, type) {
    if (!this.tiny.canUndo(cellIndex, type)) {
      yield* this._yieldData({ action: 'error', error: 'cannot undo' });
      return;
    }
    if (type === 'resource') {
      let resource = this.tiny.board.cells[cellIndex].resource;
      if (resource) {
        this.tiny.board.cells[cellIndex].resource = null;
        this.tiny.pending = null;
        yield* this._yieldData({ action: 'unresource', cellIndex: cellIndex, type: type, resource: resource });
      }
    }
  }

  _makeUndo(action) {
    if (action.verb === 'resource') {
      let cellIndex = action.params[1];
      return `unresource ${cellIndex}`;
    }
    return null;
  }

  *_setup() {
    for (let cell of this.tiny.board.cells) {
      if (cell.resource) {
        yield* this._yieldData({
          action: 'setupresource',
          resource: cell.resource,
          index: cell.index
        });
      }
      if (cell.building) {
        yield* this._yieldData({
          action: 'setupbuilding',
          building: cell.building,
          index: cell.index
        });
      }
    }
    for (let resource of this.tiny.hand.resources.row) {
      yield* this._yieldData({
        action: 'setuppool',
        resource: resource,
      });
    }
  }

  *_yieldData(data) {
    if (this.tiny._logActions) {
      console.log(`ttt TinyCommand action: ${JSON.stringify(data)}`);
    }
    yield data;
  }
}
