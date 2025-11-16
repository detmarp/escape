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
    this.actionUndos = [];
    let tokens = this.parser.tokenize(commands);

    if (tokens.length == 0) {
      yield { action: 'error', error: 'empty' };
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
      yield {
        action: 'resource',
        resource: resource,
        cellIndex: cellIndex,
      };
      return;
    }

    if (verb === 'endturn') {
      if (tokens.length != 1) {
        yield* this._syntaxError(tokens);
        return;
      }
      this.undos = [];
      yield { action: 'clearundo' };
      let poolAction = this.tiny.updateHandResources();
      if (poolAction) {
        yield poolAction;
      }
      this.tiny.endTurn();
      yield { action: 'endturn' };
      return;
    }

    if (verb === 'setup') {
      if (tokens.length != 1) {
        yield* this._syntaxError(tokens);
        return;
      }
      yield* this._setup();
      return;
    }

    yield { action: 'error', error: `unknown: ${verb}` };
  }

  *_syntaxError(tokens) {
    yield { action: 'error', error: 'syntax' };
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
        yield {
          action: 'setupresource',
          resource: cell.resource,
          index: cell.index
        };
      }
      if (cell.building) {
        yield {
          action: 'setupbuilding',
          building: cell.building,
          index: cell.index
        };
      }
    }
    for (let resource of this.tiny.hand.resources.row) {
      yield {
        action: 'setuppool',
        resource: resource,
      };
    }
  }
}
