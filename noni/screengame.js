import Pieces from './pieces.js';
import UxElement from './uxelement.js';

export default class ScreenMain {
  constructor(program) {
    this.program = program;
    this.container = program.container;
    this.parent = this.container.inner;
    this.uxe = new UxElement(this.parent);
  }

  run() {
    this.update();
  }

  update() {
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
      //border: '#00ff00',
    });
    let infoArea = this.uxe.box(boardRow, {
      rect: [8, 0, 54, 400],

      border: '#000000',
      text: 'info',
    });
    let board = this.uxe.box(boardRow, {
      rect: [70, 0, 400, 400],
      border: '#000000',
      text: 'board',
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
    this.uxe.button(controlRow, { text: 'Button 1' });
    this.uxe.button(controlRow, { text: 'Button 2' });
    this.uxe.button(controlRow, { text: 'Button 3' });
    this.uxe.button(controlRow, { text: 'Button 4' });
  }

  _makeBins() {
    let y = 464 + 48 + 8;
    let controls = this.uxe.box(this.box, {
      rect: [0, y, 540, 224],
      border: '#000000',
      row: true,
    });

    let controlsY = 464 + 48 + 8;
    this.pieces.addSpot([0, controlsY, 180, 224]);
    this.pieces.addSpot([180, controlsY, 100, 224]);
    this.pieces.addSpot([280, controlsY, 260, 224]);

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
    // First row: 5 pieces distributed across 600px width
    let y1 = 800;
    for (let i = 0; i < 5; i++) {
      let x = (600 / 5) * i + (600 / 5 - 80) / 2; // Center each piece in its slot
      this.pieces.addPiece([x, y1, 80, 80]);
    }
    // Second row: 8 pieces distributed across 600px width
    let y2 = 850;
    for (let i = 0; i < 8; i++) {
      let x = (600 / 8) * i + (600 / 8 - 80) / 2; // Center each piece in its slot
      this.pieces.addPiece([x, y2, 80, 80]);
    }

    // spots for the board
    let start = [70, 54];
    let size = [100, 100];
    for (let i = 0; i < 16; i++) {
      let col = i % 4;
      let row = Math.floor(i / 4);
      let x = start[0] + col * size[0];
      let y = start[1] + row * size[1];
      this.pieces.addSpot([x, y, size[0], size[1]]);
    }
  }

  onFinger(action, pos, pos2) {
    this.pieces.onFinger(action, pos, pos2);
  }
}
