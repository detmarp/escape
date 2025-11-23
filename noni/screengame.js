import Pieces from './pieces.js';
import TinyBot from './tinybot.js';
import UxElement from './uxelement.js';
import Swatches from './swatches.js';
import Meeples from './meeples.js';
import Markers from './markers.js';
import Party from './party.js';

export default class ScreenGame {
  constructor(program) {
    this.program = program;
    this.tiny = program.tiny;
    this.container = program.container;
    this.parent = this.container.inner;
    this.uxe = new UxElement(this.parent);
    this.editMode = false;
    this.meeples = new Meeples(this.parent);
    this.current = {};


    this.markers = new Markers(this);
  }

  deubgPrint() {
    let m = {
      current: Object.keys(this.current),
      dragging: this.dragging ? Object.keys(this.dragging) : null,
      last: this.current.last ? Object.keys(this.current.last) : null,
    };
    console.log(`ccc0 ${JSON.stringify(m)}`);
  }

  run() {
    this._rebuild();

    this._doTinyCommand('setup');
  }

  work() {
    if (this.actions) {
      let next = this.actions.next();
      if (next.done) {
        this.actions = null;
        this.pauseInput = false;
      }
      else {
        this._processCoreAction(next.value);
      }
      this._refresh();
    }

    if (! this.tiny.pending) {
      this._refreshControls(); // detmar ddd
    }

    this.markers.debugDraw(this.layer2);

    if (this.cellsDirty) {
      for (let i = 0; i < 16; i++) {
        let cell = this.cells[i];
        cell.element.update(cell.uxParams);
      }
      this.cellsDirty = false;
    }

    let scale = this.program.container.scale;
    this.party.draw(Date.now(), scale);
  }

  _doTinyCommand(command) {
    this.pauseInput = true;
    this.actions = this.tiny.command.do(command);
  }

  _processCoreAction(action) {
    // Process core action from tiny command
    console.log(`aaa Action: ${JSON.stringify(action)}`);
    let handler = this[`_action_${action.action}`];
    if (handler) {
      handler.call(this, action);
    }
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
    this._makeParticles();

    this._refresh();
  }

  _makeHeader() {
    let header = this.uxe.headerBar(this.box, {
      onLeftClick: () => { this.program.goto.to('main'); },
      streak: 0,
      score: 22,
    });
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


    this.layer2 = this.uxe.box(this.parent, {
      rect: [0, 0, 540, 960],
    });
    this.layer2.style.pointerEvents = 'none';

    this.boardMarkers = this.uxe.box(this.parent, {
      rect: [70, 54, 400, 400],
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
    // buttons
    this.controlRow.innerHTML = '';
    this.uxe.button(this.controlRow, { text: 'Bot', onClick: () => {
      let bot = new TinyBot(this.tiny);
      bot.makeMove();
      this._rebuild();
    }});
    if (this.tiny.command.undos.length > 0) {
      this.uxe.button(this.controlRow, { text: 'Undo', onClick: () => {
        this._doTinyCommand('undo');
        this._rebuild();
      }});
    }
    if (this.tiny.pending) {
      this.uxe.button(this.controlRow, { text: 'End turn', onClick: () => {
        this._doTinyCommand('endturn');
        this._updatePiecesOnBoard();
      }});
    }

    // placement marker
    //this.boardMarkers.innerHTML = '';
    if (this.tiny.buildingPlacements && this.tiny.buildingPlacements.length > 0) {
      this.placementIndex ||= 0;
      let placement = this.tiny.buildingPlacements[this.placementIndex];
      placement.resourceIndexes.forEach(i => {
        let rect = [i % 4 * 100, Math.floor(i / 4) * 100, 100, 100];
        let marker = this.uxe.box(this.boardMarkers, {
          rect: rect,
          border: '#0000ff',
          borderWidth: 3,
          radius: 20,
        });
      });
      // draw targets
    }
  }

  _setCellUx(cellIndex, param, value) {
    let cell = this.cells[cellIndex];
    cell.uxParams[param] = value;
    this.cellsDirty = true;
  }

  _setCellParams(cellIndex, params) {
    let cell = this.cells[cellIndex];
    cell.uxParams = params;
    this.cellsDirty = true;
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

    this.cells = [];
    for (let i = 0; i < 16; i++) {
      let rect = [ (i % 4) * 100, Math.floor(i / 4) * 100, 100, 100];
      let cell = this.uxe.cell(
        this.boardMarkers,
        {
          rect: rect,
          index: i,
        }
      );

      let boardRect = [70 + rect[0], 54 + rect[1], rect[2], rect[3]];
      let marker = this.markers.add({rect: boardRect, fixed: true,});
      marker.cellIndex = i;

      this.cells[i] = {
        element: cell,
        marker: marker,
        uxParams: {},
      }
    }

    let y = 464 + 48 + 8;
    let controls = this.uxe.box(this.box, {
      rect: [0, y, 540, 224],
      border: '#000000',
      row: true,
    });

    let controlsY = 464 + 48 + 8;
    this.resourceBin = this.pieces.addSpot([0, controlsY, 240, 224]);
    this.resourceBin2 = this.meeples.add({
      rect: [0, controlsY, 240, 224]
    });
    this.resourceBin2.rect = [0, controlsY, 240, 224];
    this.resourceBinMarker = this.markers.add({rect: this.resourceBin.rect, fixed: true,});
    this.resourceBin.autoreturn = true;
    this.buildingBin = this.pieces.addSpot([240, controlsY, 300, 224]);
    this.buildingBinMarker = this.markers.add({rect: this.buildingBin.rect, fixed: true,});
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
    let swatch = new Swatches();

    // 8 pieces randomly in buildingBin
    let categories = this.program.factory.deck.categories;
    for (let category of categories) {
      let meeple = swatch.getSwatch(category);
      let params = {
        color: meeple.color,
        textColor: meeple.textColor,
      };
      let piece = this.pieces.newPiece(this.buildingBin.id, params);
this.markers.add({size: [...piece.size], position: [...piece.position]});
      piece.meeple = meeple;
      piece.category = category;
    }

    // resources on board
    this.tiny.board.cells.forEach((cell, i) => {
      if (cell.resource) {
        let meeple = swatch.getSwatch(cell.resource);
        let params = {
          color: meeple.color,
          textColor: meeple.textColor,
        };
        let piece = this.pieces.newPiece(this.cellSpots[i].id, params);
this.markers.add({size: [...piece.size], position: [...piece.position]});
        piece.resource = meeple.name;
      }
    });
  }

  _makeParticles() {
    this.particles = this.uxe.box(this.parent, {
      rect: [0, 0, 540, 960],
      clickthrough: true,
    });
    this.party = new Party(this.particles);
  }

  _updatePiecesOnBoard() {
    // If there are currently no undos, then fix any pieces in a cell.
    if (this.tiny.command.undos.length === 0) {
      for (let piece of this.pieces.pieces) {
        if (piece.spot && piece.spot.cellIndex != null) {
            piece.nopickup = true;
        } else {
          piece.nopickup = false;
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
    // Now newResources contains only those not matched in binResources
    let swatch = new Swatches();
    for (let resource of newResources) {
      let meeple = swatch.getSwatch(resource);
      let params = {
        color: meeple.color,
        textColor: meeple.textColor,
      };
      let piece = this.pieces.newPiece(this.resourceBin.id, params);
this.markers.add({size: [...piece.size], position: [...piece.position]});
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
    this.markers.onFinger(action, pos);
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

  onSpotTap(spot) {
    let hint = {};
    if (spot.cellIndex != null) {
      hint.cellIndex = spot.cellIndex;
    }
    this._highlightPlacement(hint
    );
  }

  onPieceTap(piece) {
    let hint = {};
    if (piece.spot) {
      if (piece.spot == this.buildingBin) {
        hint.category = piece.category;
      }
      else if (piece.spot.cellIndex != null) {
        hint.cellIndex = piece.spot.cellIndex;
      }
    }
    this._highlightPlacement(hint);
    this._refresh()
  }

  onPieceDragStart(piece) {
    if (piece.fromSpot && piece.fromSpot.cellIndex != null && this.tiny.pending) {
      // this is a little indirect, but the idea is to undo the pending resource placement
      this._doTinyCommand('undo');
      // Also fake the home spot as the resource bin
      piece.fromSpot = this.resourceBin;
    }
    this._highlightPlacement();
    this._refresh()
  }

  onPieceDrop(piece, spot) {
    if (spot && spot.cellIndex != null) {
      if (piece.resource) {
        let command = `resource ${piece.resource} ${spot.cellIndex}`;
        this._doTinyCommand(command);
      }
    }
    this._refresh()
  }

  onPieceKill(piece) {
    //console.log('onPieceKill:', piece.id);
    this._refresh()
  }

  _action_updatepool(action) {
    let swatch = new Swatches();
    let s = swatch.getSwatch(action.resource);
    let params = {
      color: s.color,
      textColor: s.textColor,
    };
    let rect = this.markers.getDestinationRect(
      this.resourceBin2,
      null,
      [80, 80]
    );
    let marker = this.markers.add({
      rect: rect,
    });
    let meeple = this.meeples.add({
      name: action.resource,
      rect: rect,
    });
    meeple.marker = marker;
  }

  _action_setuppool(action) {
    this._action_updatepool(action);
  }

  _action_resource(action) {
    if (this.current.last && this.current.last.meeple) {
      const meeple = this.current.last.meeple;
      if (meeple.marker) {
        let rect = this.markers.getDestinationRect(
          this.cells[action.cellIndex].marker,
          meeple.marker.rect
        );
        this.markers.setRect(meeple.marker, rect);
        this.meeples.sendToRect(meeple, rect);
      }
    }
  }

  _action_checkplacements() {
    this._highlightPlacement();
  }

  _highlightPlacement(nextHint) {
    // Choose a placement index to highlight
    console.log(`ppp time to check placements ${JSON.stringify(nextHint)}`);
    this.placementIndex ||= 0;

    if (nextHint) {
      // The hint will help us to cycle through placements
      let list = [];
      this.tiny.buildingPlacements.forEach((placement, i) => {
        let match =
          (nextHint.cellIndex != null && placement.resourceIndexes.includes(nextHint.cellIndex)) ||
          (nextHint.category && placement.card && nextHint.category === placement.card.category);

        if (match) {
          list.push(i);
        }
      });
      let listIndex = list.indexOf(this.placementIndex);
      if (listIndex >= 0) {
        listIndex = (listIndex + 1) % list.length;
      }
      else {
        (listIndex = 0);
      }
      this.placementIndex = list[listIndex];
    }
  }


  onMarkersHover(info) {
    ///console.log(`ggg onMarkersHover ${Object.keys(info)}`);
  }

  onMarkersTap(info) {
    console.log(`ggg onMarkersTap ${Object.keys(info)}`);
    let meeple = this.meeples.list.find(m => info.marker && m.marker === info.marker);
    this._selectMeeple(meeple);

    let markerList = [info.marker, ...info.over];
    let cellIndex = markerList.find(item => item && item.cellIndex != null)?.cellIndex ?? null;
    this._selectCell(cellIndex);
    let fromBin = markerList.find(item => item === this.resourceBinMarker);
    let fromMarker = (cellIndex == null) ? fromBin : this.cells[cellIndex].marker;
    if (fromMarker) {
      this.current.from = fromMarker;
    }
    else {
      delete this.current.from;
    }

    let resource = meeple && meeple.type === 'resource' ? meeple.name : null;
    if (resource && (cellIndex == null)) {
      this._setTargets(resource);
    }
    else {
      // dragging from a cell
      this._setTargets();
    }

    this.deubgPrint();
  }

  _selectMeeple(meeple) {
    if (meeple) {
      this.current.meeple = meeple;
    }
    else {
      delete this.current.meeple;
    }
    // For all meeples, call update({selected: bool})
    this.meeples.list.forEach(m => m.update({ selected: m === meeple }));
  }

  _selectCell(cellIndex) {
    for (let i = 0; i < 16; i++) {
      this._setCellUx(i, 'selected', i === cellIndex);
    }
    if (cellIndex != null) {
      this.current.cellIndex = cellIndex;
    }
    else {
      delete this.current.cellIndex;
    }
  }

  _setTargets(resource = null) {
    let targets = this.tiny.canDoResource();
    if (resource && targets) {
      this.current.targets = new Set(targets.map(t => t.position));
    }
    else {
      delete this.current.targets;
    }

    for (let i = 0; i < 16; i++) {
      this._setCellUx(i, 'target', this.current.targets && this.current.targets.has(i));
    }
  }

  onMarkersDrag(info) {
    console.log(`ggg onMarkersDrag ${Object.keys(info)}`);
    this.deubgPrint();
    this.dragging = {};
  }

  onMarkersDragging(info) {
    console.log(`ggg onMarkersDragging ${Object.keys(info)}`);
    if (info.marker) {
      const meeple = this.meeples.list.find(m => m.marker === info.marker);
      if (meeple) {
        this.meeples.updateRect(meeple, info.marker.rect);
      }
      this.dragging.startPos = info.startPos;
      this.dragging.position = info.position;
      this.dragging.over = info.over;
    }

    let markerList = [info.marker, ...info.over];
    let cellIndex = markerList.find(item => item && item.cellIndex != null)?.cellIndex ?? null;
    this._selectCell(cellIndex);

    this.deubgPrint();
  }

  onMarkersDrop(info) {
    console.log(`ggg onMarkersDrop ${Object.keys(info)}`);
    let meeple = this.current.meeple;
    if (meeple) {
      if (meeple.type === 'resource') {
        if (
          this.current.cellIndex != null &&
          this.current.targets &&
          this.current.targets.has(this.current.cellIndex)
        ) {
          let command = `resource ${meeple.name} ${this.current.cellIndex}`;
          this._doTinyCommand(command);
        }
        else {
          let marker = meeple.marker;
          if (marker) {
            let returnTo = this.current.from || this.resourceBinMarker;
            let rect = this.markers.getDestinationRect(
              returnTo,
              marker.rect
            );
            this.markers.setRect(marker, rect);
            this.meeples.sendToRect(meeple, rect);
          }
        }
      }
    }
    this.current.last = {};
    if (this.current.meeple) {
      this.current.last.meeple = this.current.meeple;
    }
    if (this.current.cellIndex != null) {
      this.current.last.cellIndex = this.current.cellIndex;
    }
    if (this.current.marker) {
      this.current.last.marker = this.current.marker;
    }

    this.dragging = null;
    this._selectMeeple();
    this._selectCell();
    this._setTargets();
    this.deubgPrint();

  }

  onMarkersUp(info) {
    console.log(`ggg onMarkersUp ${Object.keys(info)}`);
    this.deubgPrint();
  }

  onMarkersClick(info) {
    console.log(`ggg onMarkersClick ${Object.keys(info)}`);
    this.deubgPrint();
  }
}
