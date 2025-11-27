import TinyBot from './tinybot.js';
import UxElement from './uxelement.js';
import Meeples from './meeples.js';
import Markers from './markers.js';
import Party from './party.js';
import CardArea from './cardarea.js';
import InfoArea from './infoarea.js';

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
    //console.log(`ccc0 ${JSON.stringify(m)}`);
  }

  run() {
    this._rebuild();

    this._doTinyCommand('setup');
  }

  work() {
    if (this.actions) {
      let next = this.actions.next();
      if (next.done) {
        this._onActionsComplete();
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

  _onActionsComplete() {
    this.actions = null;
    this.pauseInput = false;
    this.infoArea.update();
    this.program.saveCurrent(this.program.tiny);
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

    this._makeHeader();
    this._makeBoardArea();
    this._makeControls();
    this._makeBins();
    this._makeCards();
    //this._makePieces();
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
    let boardbackground = this.uxe.box(this.box, {
      rect: [0, 48, 540, 744],
    });
    boardbackground.style.background = 'linear-gradient(135deg, #f0debcff 0%, #e0d8b0 100%)';

    let boardRow = this.uxe.box(this.box, {
      rect: [0, 54, 540, 400],
      row: true,
    });
    this.leftSideBar = this.uxe.box(boardRow, {
      rect: [8, 0, 54, 400],
      border: '#000000',
    });
    this.leftSideBar.style.display = 'flex';
    this.leftSideBar.style.flexDirection = 'column';
    this.leftSideBar.style.alignItems = 'center';
    this.leftSideBar.style.gap = `${4 * this.uxe.scale}px`;
    if (true) {
      this.editButton = this.uxe.box(this.leftSideBar, {
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
    this.infoArea = new InfoArea(this.box, this);
    this._refreshControls();
  }

  _refreshControls() {
    // // buttons
    // this.controlRow.innerHTML = '';
    // this.uxe.button(this.controlRow, { text: 'Bot', onClick: () => {
    //   let bot = new TinyBot(this.tiny);
    //   bot.makeMove();
    //   this._rebuild();
    // }});
    // if (this.tiny.command.undos.length > 0) {
    //   this.uxe.button(this.controlRow, { text: 'Undo', onClick: () => {
    //     this._doTinyCommand('undo');
    //     this._rebuild();
    //   }});
    // }
    // if (this.tiny.pending) {
    //   this.uxe.button(this.controlRow, { text: 'End turn', onClick: () => {
    //     this._doTinyCommand('endturn');
    //   }});
    // }

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
      //border: '#000000',
      row: true,
    });

    let controlsY = 464 + 48 + 8;
    let resourceRect = [0, controlsY, 240, 224];
    this.resourceBinMarker = this.markers.add({rect: resourceRect, fixed: true,});
    this.resourceBinMarker.bin = true;
    this.uxe.bin(this.parent, {
      rect: resourceRect,
    });

    let buildingRect = [240, controlsY, 300, 224];
    this.buildingBinMarker = this.markers.add({rect: buildingRect, fixed: true,});
    this.buildingBinMarker.bin = true;
    this.uxe.bin(this.parent, {
      rect: buildingRect,
    });

    // buildings
    let hand = this.tiny.getHand();
    for (let i = 0; i < hand.length; i++) {
      let card = hand[i];
      let category = card.category;
      let rect = this.markers.getDestinationRect(
        this.buildingBinMarker,
        null,
        [80, 80]
      );
      let marker = this.markers.add({
        rect: rect,
      });
      let meeple = this.meeples.add({
        name: category,
        rect: rect,
      });
      meeple.marker = marker;
    }
  }

  _makeCards() {
    let y = 464 + 48 + 8 + 224
    let cardArea = this.uxe.box(this.box, {
      rect: [0, y, 540, 216],
    });
    this.cardArea = new CardArea(cardArea, this);
  }

  _getResourcePool() {
    //let resources = this.program.factory.deck.resourceList;
    let resources = this.tiny.getResources();
    return resources;
  }

  _makeParticles() {
    this.particles = this.uxe.box(this.parent, {
      rect: [0, 0, 540, 960],
      clickthrough: true,
    });
    this.party = new Party(this.particles);
  }

  _refresh() {
    this._refreshControls();
  }

  onFinger(action, pos, pos2) {
    this.markers.onFinger(action, pos);
  }

  _setEditMode(editMode) {
    this.editMode = editMode;
  }

  _action_updatepool(action) {
    let rect = this.markers.getDestinationRect(
      this.resourceBinMarker,
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

  _action_unresource(action) {
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
    let meeple = this.meeples.list.find(m => info.marker && m.marker === info.marker);
    this._selectMeeple(meeple);

    let overMarkerList = [info.marker, ...info.over];
    let cellIndex = overMarkerList.find(item => item && item.cellIndex != null)?.cellIndex ?? null;
    this._selectCell(cellIndex);
    let fromBin = overMarkerList.find(item => item && item.bin);
    let fromMarker = (cellIndex == null) ? fromBin : this.cells[cellIndex].marker;
    if (fromMarker) {
      this.current.from = fromMarker;
    }
    else {
      delete this.current.from;
    }
    delete this.current.undo;

    // resource selection setup
    this._setTargets();
    let resource = meeple && meeple.type === 'resource' ? meeple.name : null;
    if (resource) {
      if (cellIndex == null) {
        this._setTargets(resource);
      }
      else {
        // dragging from a cell
        if (this.tiny.canUndo(cellIndex, 'resource')) {
          this._setTargets(resource, true);
          this.current.undo = true;
        }
      }
    }

    // building selection setup
    let building = meeple && meeple.type === 'building' ? meeple.name : null;
    if (building) {
      const card = this.program.tiny.hand.cards.find(card => card.category === building);
      if (card) {
        this.cardArea.show(card.category);
      }
    }

    this.deubgPrint();
  }

  selectMeepleByName(name) {
    const meeple = this.meeples.list.find(m => m.name === name);
    this._selectMeeple(meeple);
  }

  _selectMeeple(meeple) {
    if (meeple) {
      this.current.meeple = meeple;
      if (meeple && meeple.parentNode) {
        meeple.parentNode.appendChild(meeple);
      }
      if (meeple.marker) {
        this.markers.moveToTop(meeple.marker);
      }
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

  selectcard(card) {
  }

  _setTargets(resource, undo) {
    let targets = this.tiny.canDoResource(null, resource, undo);
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
    if (this.current.undo) {
      // pretend we picked from the resource bin
      this.current.from = this.resourceBinMarker;

      // undo last, to begin dragging
      let command = `undo resource ${this.current.cellIndex}`;
      this._doTinyCommand(command);
      delete this.current.undo;
    }

    this.deubgPrint();
    this.dragging = {};
  }

  onMarkersDragging(info) {
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
    let meeple = this.current.meeple;
    if (meeple) {
      let marker = meeple.marker;
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
      if (meeple.type === 'building') {
        if (marker) {
          let returnTo = this.current.from || this.buildingBinMarker;
          let rect = this.markers.getDestinationRect(
            returnTo,
            marker.rect
          );
          this.markers.setRect(marker, rect);
          this.meeples.sendToRect(meeple, rect);
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
    this.deubgPrint();
  }

  onMarkersClick(info) {
    this.deubgPrint();
  }
}
