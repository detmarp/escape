import UxElement from './uxelement.js';
import Swatches from './swatches.js';

// helper class for screengame
// draws and manages the button bar
export default class InfoArea {
  constructor(parent, screengame) {
    this.parent = parent;
    this.screengame = screengame;
    this.tiny = screengame.tiny;
    this.uxe = new UxElement(this.parent);

    let y = 462;
    this.row = this.uxe.box(this.box, {
      rect: [0, y, 540, 48],
      //border: '#c5a575ff',
      row: true,
    });
    this.row.style.paddingLeft = '8px';
    this.row.style.gap = '12px';
    this.row.style.justifyContent = 'center';
    this.row.style.alignItems = 'center';

    this.uxe.headerInfo(this.row, {
      text: 'Info Area',
    });
    this.uxe.headerButton(this.row, {
      text: 'Info Area',
    });
    this.uxe.headerInfo(this.row, {
      text: 'Info Area',
    });
  }
}