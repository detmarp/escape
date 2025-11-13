import Pieces from './pieces.js';
import TinyBot from './tinybot.js';
import UxElement from './uxelement.js';
import Meeples from './meeples.js';

export default class ScreenMain {
  constructor(program) {
    this.program = program;
    this.tiny = program.tiny;
    this.container = program.container;
    this.parent = this.container.inner;
    this.uxe = new UxElement(this.parent);
    this.editMode = false;
  }

  run() {
    this._rebuild();
  }

  _rebuild() {
    // Keep the tiny game state, but rebuild the screen
    this.parent.innerHTML = '';
    this.box = this.uxe.box(this.parent, {
      fill: true,
      row: false,
      background: '#b0c0d0',
    });

    this.pieces = new Pieces(this.parent, this);

    this._makeHeader();
    this._makeBoardArea();
    this._makeControls();
    this._makeBins();
    this._makeCards();
    this._makePieces();

    this._updateResourceBin();

    this._refresh();
  }

  _makeHeader() {
    let header = this.uxe.box(this.box, {
      rect: [0, 0, 540, 48],
      border: '#000000',
      row: true,
    });
    this.uxe.button(header, {
      text: '<',
      onClick: () => { this.program.goto.to('main'); },
    });
    this.uxe.text(header, { text: 'Game', });
    this.uxe.text(header, { text: 'Score: 0', });
    this.uxe.text(header, { text: 'game id', });

  }

  _makeBoardArea() {
    let boardRow = this.uxe.box(this.box, {
      rect: [0, 54, 540, 400],
      row: true,
    });
    this.infoArea = this.uxe.box(boardRow, {
      rect: [8, 0, 54, 400],
      border: '#000000',
    });
    this.infoArea.style.display = 'flex';
    this.infoArea.style.flexDirection = 'column';
    this.infoArea.style.alignItems = 'center';
    this.infoArea.style.gap = `${4 * this.uxe.scale}px`;
    if (true) {
      this.editButton = this.uxe.box(this.infoArea, {
        size: [48, 40],
        border: '#000000',
        radius: 4,
        text: 'Edit\noff',
      });
    }

    let board = this.uxe.box(boardRow, {
      rect: [70, 0, 400, 400],
      //border: '#000000',
    });
    let scoreArea = this.uxe.box(boardRow, {
      rect: [478, 0, 54, 400],
      border: '#000000',
      text: 'score',
    });
  }

  _makeControls() {
    let y = 464;
    this.controlRow = this.uxe.box(this.box, {
      rect: [0, y, 540, 48],
      border: '#000000',
      row: true,
    });
    this._refreshControls();
  }

  _refreshControls() {
    this.controlRow.innerHTML = '';
    this.uxe.button(this.controlRow, { text: 'Bot', onClick: () => {
      let bot = new TinyBot(this.tiny);
      bot.makeMove();
      this._rebuild();
    }});
    if (this.tiny.command.undos.length > 0) {
      this.uxe.button(this.controlRow, { text: 'Undo', onClick: () => {
        this.tiny.command.undo();
        this._rebuild();
      }});
    }
    if (this.tiny.pending) {
      this.uxe.button(this.controlRow, { text: 'End turn', onClick: () => {
        this.tiny.command.do('endturn');
        this._updateResourceBin();
        this._updatePiecesOnBoard();
        this._refresh();
      }});
    }
  }

  _makeBins() {
    // spots for the board
    let start = [70, 54];
    let size = [100, 100];
    this.cellSpots = [];
    for (let i = 0; i < 16; i++) {
      let col = i % 4;
      let row = Math.floor(i / 4);
      let x = start[0] + col * size[0];
      let y = start[1] + row * size[1];
      let spot = this.pieces.addSpot([x, y, size[0], size[1]]);
      spot.cellIndex = i;
      this.cellSpots.push(spot);
    }

    let y = 464 + 48 + 8;
    let controls = this.uxe.box(this.box, {
      rect: [0, y, 540, 224],
      border: '#000000',
      row: true,
    });

    let controlsY = 464 + 48 + 8;
    this.resourceBin = this.pieces.addSpot([0, controlsY, 240, 224]);
    this.resourceBin.autoreturn = true;
    this.buildingBin = this.pieces.addSpot([240, controlsY, 300, 224]);
    this.buildingBin.autoreturn = true;
  }

  _makeCards() {
    let y = 464 + 48 + 8 + 224 + 8
    let cardArea = this.uxe.box(this.box, {
      rect: [0, y, 540, 208],
      border: '#000000',
    });

    this.uxe.text(cardArea, {
      text: this.program.tiny ? `${JSON.stringify(Object.keys(this.program.tiny))}` : 'null',
    });
  }

  _getResourcePool() {
    //let resources = this.program.factory.deck.resourceList;
    let resources = this.tiny.getResources();
    return resources;
  }

  _makePieces() {
    let meeples = new Meeples();

    // 8 pieces randomly in buildingBin
    let buildings = this.program.factory.deck.categories;
    for (let building of buildings) {
      let meeple = meeples.getMeeple(building);
      let params = {
        color: meeple.color,
        textColor: meeple.textColor,
      };
      let piece = this.pieces.newPiece(this.buildingBin.id, params);
      piece.building = meeple;
    }

    // resources on board
    this.tiny.board.cells.forEach((cell, i) => {
      if (cell.resource) {
        let meeple = meeples.getMeeple(cell.resource);
        let params = {
          color: meeple.color,
          textColor: meeple.textColor,
        };
        let piece = this.pieces.newPiece(this.cellSpots[i].id, params);
        piece.resource = meeple.name;
      }
    });
  }

  _updatePiecesOnBoard() {
    // If there are currently no undos, then fix any pieces in a cell.
    if (this.tiny.command.undos.length === 0) {
      for (let piece of this.pieces.pieces) {
        if (piece.spot && piece.spot.cellIndex != null) {
            piece.nopickup = true;
            console.log('www 000');
        } else {
          piece.nopickup = false;
            console.log('www 111');
        }
      }
    }
  }

  _updateResourceBin() {
    let resources = this._getResourcePool();
    let binResources = [];
    this.resourceBin.pieces.forEach(piece => {
      if (piece.resource) {
        binResources.push(piece.resource);
      }
    });
    console.log(`rrr 0 Updating resource bin...${JSON.stringify(resources)}, ${JSON.stringify(binResources)}`);
    // One-to-one match: remove matched items from binResources copy
    let binCopy = [...binResources];
    let newResources = [];
    for (let resource of resources) {
      const idx = binCopy.indexOf(resource);
      if (idx !== -1) {
        binCopy.splice(idx, 1);
      } else {
        newResources.push(resource);
      }
    }
    console.log(`rrr Updating resource bin. New resources: ${JSON.stringify(newResources)}`);
    // Now newResources contains only those not matched in binResources
    let meeples = new Meeples();
    for (let resource of newResources) {
      let meeple = meeples.getMeeple(resource);
      let params = {
        color: meeple.color,
        textColor: meeple.textColor,
      };
      let piece = this.pieces.newPiece(this.resourceBin.id, params);
      piece.resource = meeple.name;
    }
  }

  _refresh() {

    this._refreshControls();

    // refresh display text
    for (let i = 0; i < 16; i++) {
      let cell = this.tiny.board.cells[i];
      let parts = [];
      if (cell.building) {
        parts.push(cell.building);
      }
      if (cell.resource) {
        parts.push(cell.resource);
      }
      let text = parts.join('\n');
      this.cellSpots[i].innerText = text;
    }
  }

  onFinger(action, pos, pos2) {
    this.pieces.onFinger(action, pos, pos2);
  }

  _setEditMode(editMode) {
    this.editMode = editMode;
  }

  // Piece delegate methods
  canPieceDrop(piece, spot) {
    if (!spot || spot.cellIndex == null) {
      return;
    }
    if (this.tiny.pending) {
      return;
    }
    let cell = this.tiny.board.cells[spot.cellIndex];
    if (cell.resource || cell.building) {
      return;
    }
    // Can drop building if cell is empty
    if (piece.resource) {
      return true;
    }
  }

  onPieceTap(piece) {
    //console.log('onPieceTap:', piece.id);
    this._refresh()
  }

  onPieceDragStart(piece) {
    if (piece.fromSpot && piece.fromSpot.cellIndex != null && this.tiny.pending) {
      // this is a little indirect, but the idea is to undo the pending resource placement
      this.tiny.command.undo();
      // Also fake the home spot as the resource bin
      piece.fromSpot = this.resourceBin;
    }
    this._refresh()
  }

  onPieceDrop(piece, spot) {
    console.log('ddd onPieceDrop:', piece.id, spot ? spot.id : 'null');
    if (spot && spot.cellIndex != null) {
      if (piece.resource) {
        let command = `resource ${piece.resource} ${spot.cellIndex}`;
        this.tiny.command.do(command);
      }
    }
    this._refresh()
  }

  onPieceKill(piece) {
    //console.log('onPieceKill:', piece.id);
    this._refresh()
  }
}
