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
    this.parent.innerHTML = '';
    this.box = this.uxe.box(this.parent, {
      fill: true,
      row: false,
      background: '#b0c0d0',
    });

    this.pieces = new Pieces(this.parent);

    this._makeHeader();
    this._makeBoardArea();
    this._makeControls();
    this._makeBins();
    this._makeCards();
    this._makePieces();

    this.refresh();
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
        text: 'Edit',
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
    let controlRow = this.uxe.box(this.box, {
      rect: [0, y, 540, 48],
      border: '#000000',
      row: true,
    });
    this.uxe.button(controlRow, { text: 'Button 1', onClick: () => {
      let bot = new TinyBot(this.tiny);
      bot.makeMove();
      this.refresh();
    }});
    this.uxe.button(controlRow, { text: 'Button 2' });
    this.uxe.button(controlRow, { text: 'Button 3' });
    this.uxe.button(controlRow, { text: 'Button 4' });
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
    this.buildingBin = this.pieces.addSpot([240, controlsY, 300, 224]);
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

  _makePieces() {
    let meeples = new Meeples();

    // 5 pieces randomly in resourceBin
    let resources = this.program.factory.deck.resourceList;
    for (let resource of resources) {
      let meeple = meeples.getMeeple(resource);
      let params = {
        color: meeple.color,
        textColor: meeple.textColor,
      };
      this.pieces.newPiece(this.resourceBin.id, params);
    }

    // 8 pieces randomly in buildingBin
    let buildings = this.program.factory.deck.categories;
    for (let building of buildings) {
      let meeple = meeples.getMeeple(building);
      let params = {
        color: meeple.color,
        textColor: meeple.textColor,
      };
      this.pieces.newPiece(this.buildingBin.id, params);
    }
  }

  refresh() {
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
}
