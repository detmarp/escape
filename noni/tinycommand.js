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

  do(commands, isUndo=false) {
    let groups = this.parser.groups(commands);
    this.actionUndos = [];
    groups.forEach(group => {
      let action = this.toAction(group);
      this._doAction(action, isUndo);
    });
    if (this.actionUndos.length > 0) {
      // concatenate undo parts into one undo command
      this.undos.push(this.actionUndos.join(','));
    }
  }

  _doAction(action, isUndo) {
    if (!isUndo) {
      // Save undo action, which might be part of a larger sequence
      let ua = this._makeUndo(action);
      if (ua) {
        this.actionUndos.push(ua);
      }
    }

    let debug = {
      undo: `${JSON.stringify(this.undos)}`,
      state: `${this.tiny.state}`,
      pending: `${this.tiny.pending == null ? 'null' : 'not null'}`,
    };
    //console.log(`ccc DEBUG: ${JSON.stringify(debug)}`);

    if (action.verb === 'resource') {
      let resource = action.params[0];
      let cellIndex = action.params[1];
      this.tiny.doResource(cellIndex, resource);
    }
    else if (action.verb === 'unresource') {
      let cellIndex = action.params[0];
      this.tiny.board.cells[cellIndex].resource = null;
      this.tiny.pending = null;
    }
    else if (action.verb === 'endturn') {
      this.tiny.endTurn();
      this.undos = [];
    }
  }

  toAction(command) {
    let action = {
      verb: command[0],
      params: [],
    };
    for (let i = 1; i < command.length; i++) {
      let value = command[i];
      try {
        value = JSON.parse(value);
      } catch (e) {
      }
      action.params.push(value);
    }
    return action;
  }

  _makeUndo(action) {
    if (action.verb === 'resource') {
      let cellIndex = action.params[1];
      return `unresource ${cellIndex}`;
    }
    return null;
  }
}
