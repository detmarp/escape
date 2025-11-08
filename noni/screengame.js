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

    this._makeHeader();
    //this._makeBoardArea();
    //this._makeControls();
    //this._makeCards();
    this._makePieces();
  }

  _makeHeader() {
    let header = this.uxe.box(this.box, {
      border: '#000000',
    });
    this.uxe.text(header, { text: 'Game', });
    this.uxe.button(header, {
      text: 'Main',
      onClick: () => { this.program.goto.to('main'); },
    });

  }

  _makeBoardArea() {
    let boardRow = this.uxe.box(this.box, {
      row: true,
      border: '#000000',
    });
    let board = this.uxe.box(boardRow, {
      border: '#000000',
      text: 'board',
    });
    let scoreArea = this.uxe.box(boardRow, {
      border: '#000000',
      text: 'score',
    });
  }

  _makeControls() {
    let controls = this.uxe.box(this.box, {
      border: '#000000',
      text: 'controls',
      row: true,
    });
    let box1 = this.uxe.box(controls, {
      border: '#000000',
      text: 'box1',
    });
    let box2 = this.uxe.box(controls, {
      border: '#000000',
      text: 'box2',
    });
    let box3 = this.uxe.box(controls, {
      border: '#000000',
      text: 'box3',
    });
  }

  _makeCards() {
    let cardArea = this.uxe.box(this.box, {
      border: '#000000',
    });

    this.uxe.text(cardArea, {
      text: this.program.tiny ? `${JSON.stringify(Object.keys(this.program.tiny))}` : 'null',
    });
  }

  _makePieces() {
    this.pieces = new Pieces(this.parent);
    this.pieces.addPiece();
    this.pieces.addPiece();
    this.pieces.addPiece();
    this.pieces.addPiece();
  }
}
