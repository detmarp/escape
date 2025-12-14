import TinyBot from './tinybot.js';
import UxElement from './uxelement.js';
import Meeples from './meeples.js';
import Markers from './markers.js';
import Party from './party.js';
import CardArea from './cardarea.js';
import InfoArea from './infoarea.js';
import Swatches from './swatches.js';

export default class ScreenGame {
  constructor(program) {
    this.program = program;
    this.tiny = program.tiny;
    this.container = program.container;
    this.parent = this.container.inner;
    this.uxe = new UxElement(this.parent);
    this.editMode = false;
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
    }

    this.markers._logGestures = this.program.saveData.data.loggestures;
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
    //console.log(`aaa Action: ${JSON.stringify(action)}`);
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
    this.box.style.overflow = 'visible';
    this.box.style.background = 'linear-gradient(135deg, #f0debcff 0%, #e0d8b0 100%)';

    this.backgroundLayer = this.uxe.box(this.box);
    this.backgroundLayer.style.overflow = 'visible';

    this.boardLayer = this.uxe.box(this.box);
    this.boardLayer.style.overflow = 'visible';

    this.meepleLayer = this.uxe.box(this.box);
    this.meepleLayer.style.overflow = 'visible';

    this.overlayLayer = this.uxe.box(this.box);
    this.overlayLayer.style.overflow = 'visible';

    this.particleLayer = this.uxe.box(this.box);
    this.particleLayer.style.overflow = 'visible';

    this._makeHeader();
    this._makeBoardArea();
    this.meeples = new Meeples(this.meepleLayer);
    this._makeControls();
    this._makeBins();
    this._makeCards();
    this._makeParticles();

    this._refresh();
  }

  _makeHeader() {
    let header = this.uxe.headerBar(this.backgroundLayer, {
      onLeftClick: () => { this.program.goto.to('main'); },
      streak: 0,
      score: 22,
    });
  }

  _makeBoardArea() {
    let boardRow = this.uxe.box(this.boardLayer, {
      rect: [0, 54, 540, 400],
      row: true,
    });
    boardRow.style.overflow = 'visible';

    this.leftSideBar = this.uxe.box(boardRow, {
      rect: [8, 0, 54, 400],
      //border: '#000000',
    });
    this.leftSideBar.style.display = 'flex';
    this.leftSideBar.style.flexDirection = 'column';
    this.leftSideBar.style.alignItems = 'center';
    this.leftSideBar.style.gap = `${4 * this.uxe.scale}px`;
    if (false) {
      this.editButton = this.uxe.box(this.leftSideBar, {
        size: [48, 40],
        border: '#000000',
        radius: 4,
        text: 'Edit\noff',
      });
    }

    let board = this.uxe.box(boardRow, {
      rect: [66, -4, 408, 408],
      background: '#885b35ff',
      radius: 8,
    });

    let scoreArea = this.uxe.box(boardRow, {
      rect: [478, 0, 54, 400],
      //border: '#000000',
      //text: 'score',
    });


    this.layer2 = this.uxe.box(this.boardLayer, {
      rect: [0, 0, 540, 960],
    });
    this.layer2.style.pointerEvents = 'none';

    this.boardMarkers = this.uxe.box(this.boardLayer, {
      rect: [70, 54, 400, 400],
    });
  }

  _makeControls() {
    this.infoArea = new InfoArea(this.backgroundLayer, this);
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
          overlay: this.overlayLayer,
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
    let controls = this.uxe.box(this.backgroundLayer, {
      rect: [0, y, 540, 224],
      //border: '#000000',
      row: true,
    });

    let controlsY = 464 + 48 + 8;
    let resourceRect = [0, controlsY, 240, 224];
    this.resourceBinMarker = this.markers.add({rect: resourceRect, fixed: true,});
    this.resourceBinMarker.bin = true;
    this.uxe.bin(this.backgroundLayer, {
      rect: resourceRect,
    });

    let buildingRect = [240, controlsY, 300, 224];
    this.buildingBinMarker = this.markers.add({rect: buildingRect, fixed: true,});
    this.buildingBinMarker.bin = true;
    this.uxe.bin(this.backgroundLayer, {
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
    let cardArea = this.uxe.box(this.backgroundLayer, {
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
    this.particles = this.uxe.box(this.particleLayer, {
      rect: [0, 0, 540, 960],
      clickthrough: true,
    });
    this.party = new Party(this.particles);
  }

  _refresh() {
  }

  onFinger(action, pos, pos2) {
    this.markers.onFinger(action, pos);
  }

  _setEditMode(editMode) {
    this.editMode = editMode;
  }

  _action_updatepool(action) {
    let spot = this.resourceBinMarker;
    this._makeResourceMarker(action.resource, spot);
  }

  _action_setuppool(action) {
    this._action_updatepool(action);
  }

  _action_setupresource(action) {
    this._makeResourceMarker(action.resource, this.cells[action.index].marker);
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
    // There might be a meeple at this cell still
    let cell = this.cells[action.cellIndex];
    let meeple = this.meeples.list.find(m => m.marker && m.marker === cell.marker);
    if (meeple) {
    }
  }

  _makeResourceMarker(resource, inMarker) {
    let rect = this.markers.getDestinationRect(
      inMarker,
      null,
      [80, 80]
    );
    let marker = this.markers.add({
      rect: rect,
    });
    let meeple = this.meeples.add({
      name: resource,
      rect: rect,
    });
    meeple.marker = marker;
  }

  _highlightPlacement(checkCell, clicked) {
    // Choose a placement index to highlight
    /*
      dragging resource
        if over legal cell
          filter to that cell
      tap cell, with resource in it
        filter to placements with that resource index
        -click- cycle this list
      tap building in bin, or card
        filter to placements with that building
        -click- cycle this list
      drag building over cell with resource in it
        filter *if * this cell is for this building type

>>> either cell in question -
      OR building category
    */
    this.placement ||= {};
    if (checkCell && (this.current.cellIndex == this.placement.cellIndex)) {
      return;
    }

    //console.log(`ppp time to check placements ${Date.now()}`);
    //console.log(`    ${JSON.stringify(Object.keys(this.current))}`);

    let hint;
    if (this.current.meeple) {
      //console.log(`    ${JSON.stringify(this.current.meeple.type)}`);
      if (this.current.meeple.type === 'resource') {
        if (this.current.cellIndex != null) {
          hint = {
            index: this.current.cellIndex,
            resource: this.current.meeple.name,
          };
        }
      }
      else if (this.current.meeple.type === 'building') {
        hint = {
          index: this.current.cellIndex,
          building: this.current.meeple.name,
        };
      }
      //console.log(`ppp 9 ${JSON.stringify(hint)}`);
    }

    let placements = this.tiny.getBuildingPlacements(hint);
    //console.log(`    ${placements.length} placements`);

    // if there are palcements, but we have a hint then try a filter
    if (placements.length > 0 && hint) {
      let filtered = [];
      if (hint.index) {
        filtered = placements.filter(p => p.resourceIndexes && p.resourceIndexes.includes(hint.index));
      }
      if (filtered.length > 0) {
        placements = filtered;
      }
      if (hint.building) {
        filtered = placements.filter(p => p.card && p.card.category === hint.building);
      }
      if (filtered.length > 0) {
        placements = filtered;
      }
    }

    this.placement.cellIndex = this.current.cellIndex;
    this.placement.placements = placements;
    this.placement.index = (this.placement.index ?? 0) % this.placement.placements.length;

    // Update ux
    let p = this.placement.placements[this.placement.index];
    let color;
    if (p) {
      let swatches = new Swatches()
      let s = swatches.getSwatch(p.card.category);
      color = s.color;
    }
    for (let i = 0; i < 16; i++) {
      let c = p && p.resourceIndexes.includes(i) ? color : null;
      this._setCellUx(i, 'building', c);
    }
//card: card,
//                rotation: r,
//                resourceIndexes: resourceIndexes,
  }

  _getPlacementsForCategory(building, cell = null) {
    // Returns an array of placements
    let placements = this.tiny.getBuildingPlacements();
    placements = placements.filter(p => p.card && p.card.category === building);
    // If cell is given, filter to placements that include that cell
    if (cell != null) {
      placements = placements.filter(p => p.resourceIndexes && p.resourceIndexes.includes(cell));
    }
    return placements;
  }

  onMarkersHover(info) {
    ///console.log(`ggg onMarkersHover ${Object.keys(info)}`);
  }

  onMarkersTap(info) {
    let meeple = this.meeples.list.find(m => info.marker && m.marker === info.marker);
    if (meeple || !info.marker) {
      this._selectMeeple(meeple);
    }

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
          this._setTargets(resource, null, true);
          this.current.undo = true;
        }
      }
    }
    else {
      let building = meeple && meeple.type === 'building' ? meeple.name : null;
      if (building) {
        this._setTargets(null, building);
      }
      else {
        this._setTargets();
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

    this._highlightPlacement();

    this.deubgPrint();
  }

  selectMeepleByName(name) {
    //console.log(`mmm 000 selectMeepleByName ${name}`);
    const meeple = this.meeples.list.find(m => m.name === name);
    this._selectMeeple(meeple);
  }

  _selectMeeple(meeple) {
    //console.log(`mmm 111 _selectMeeple ${meeple ? meeple.name : 'null'}`);
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

    this._highlightPlacement(true);
  }

  selectcard(card) {
  }

  _setTargets(resource, building, undo) {
    if (resource) {
      let targets = this.tiny.canDoResource(null, resource, undo);
      if (resource && targets) {
        this.current.targets = new Set(targets.map(t => t.position));
      }
      else {
        delete this.current.targets;
      }
    }
    else {
      let placements = this._getPlacementsForCategory(building);
      let targets = new Set();
      placements.forEach(p => {
        if (p.resourceIndexes) {
          p.resourceIndexes.forEach(idx => targets.add(idx));
        }
      });
      if (targets.size > 0) {
        this.current.targets = targets;
      } else {
        delete this.current.targets;
      }
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
      let onTarget = (
        this.current.cellIndex != null &&
        this.current.targets &&
        this.current.targets.has(this.current.cellIndex)
      );

      if (onTarget) {
        // Dropping piece on board - make the move
        if (meeple.type === 'resource') {
          let command = `resource ${meeple.name} ${this.current.cellIndex}`;
          this._doTinyCommand(command);
        }
        else if (meeple.type === 'building') {
          let placements = this._getPlacementsForCategory(meeple.name, this.current.cellIndex);
          let placement = placements.length > 0 ? placements[0] : null;
          if (placement) {
            let command = `building ${meeple.name} ${this.current.cellIndex}`;
            command += ' ' + placement.resourceIndexes.join(' ');
            this._doTinyCommand(command);
          }
        }
      }
      else {
        // move not allowed - return marker
        let marker = meeple.marker;
        if (marker) {
          let returnTo;
          if (meeple.type === 'resource') {
            returnTo = this.current.from || this.resourceBinMarker;
          }
          else if (meeple.type === 'building') {
            returnTo = this.current.from || this.buildingBinMarker;
          }
          if (returnTo) {
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
    this.deubgPrint();
  }

  onMarkersClick(info) {
    this.deubgPrint();
    this._highlightPlacement(null, true);
  }
}
