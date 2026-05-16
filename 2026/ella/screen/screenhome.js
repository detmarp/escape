import Ux2 from '../ux2.js';
import Celest from '../../celest/celest.js';

export default class ScreenHome {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
  }

  init() {
    ScreenHome.count++;

    this.celest = new Celest(this.parent, 360, 640);
    this.celest.init();

    this.celest.outer.style.backgroundColor = '#456';
    this.celest.inner.style.backgroundColor = '#fdb';

    this.ux = new Ux2(this.celest.inner);

    this.canContinue = true;

    this._makeHeader();
    this._makeBody();
  }

  term() {
  }

  work(dt, time, frame) {
  }

  _makeHeader() {
    this.header = this.ux.header({
      parent: this.celest.inner,
      onhome: () => this.params.program.goto('main')
    });
  }

  _makeBody() {
    const inset = 20;
    const headerH = 30;
    const bodyW = 360 - inset * 2;
    const bodyY = headerH + inset;
    const bodyH = 640 - bodyY - inset;

    this.body = this.ux.div({
      parent: this.celest.inner,
      size: [bodyW, bodyH],
      position: [inset, bodyY],
      color: '#d96e00',
      border: '#8a3f00',
    });

    const pad = 16;
    const innerW = bodyW - pad * 2;
    const top = pad;
    const titleH = 70;
    const artH = 250;
    const continueH = 60;
    const gap = 14;

    // Fixed play rect height
    const playRectH = 60;
    let playY;
    if (this.canContinue) {
      // Space below continue
      const afterContinue = top + titleH + gap + artH + gap + continueH + gap;
      const spaceBelow = bodyH - pad - afterContinue;
      // Center play rect in the space below continue
      playY = afterContinue + Math.max(0, (spaceBelow - playRectH) / 2);
    } else {
      // Space below art
      const afterArt = top + titleH + gap + artH + gap;
      const spaceBelow = bodyH - pad - afterArt;
      // Center play rect in the space below art
      playY = afterArt + Math.max(0, (spaceBelow - playRectH) / 2);
    }

    this.titleRect = this.ux.div({
      parent: this.body,
      size: [innerW, titleH],
      position: [pad, top],
      border: '#3a2000',
      text: 'title',
    });

    this.artRect = this.ux.div({
      parent: this.body,
      size: [innerW, artH],
      position: [pad, top + titleH + gap],
      border: '#3a2000',
      text: 'game art',
    });

    if (this.canContinue) {
      this.continueRect = this.ux.div({
        parent: this.body,
        size: [innerW, continueH],
        position: [pad, top + titleH + gap + artH + gap],
        border: '#3a2000',
        text: 'continue',
        onclick: () => this.params.program.goto('game'),
        cursor: 'pointer',
      });
    } else {
      this.continueRect = null;
    }

    this.playRect = this.ux.div({
      parent: this.body,
      size: [innerW, playRectH],
      position: [pad, playY],
      border: '#3a2000',
      text: 'play',
      onclick: () => this.params.program.goto('setup'),
      cursor: 'pointer',
    });
  }
}