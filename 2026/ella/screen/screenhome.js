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

  this._setFullBleedBackground();

    this.celest = new Celest(this.parent, 360, 640);
    this.celest.init();

    //this.celest.outer.style.backgroundColor = '#4568';
    this.celest.inner.style.backgroundColor = '#fdb4';

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
      buttons: [ {
          text: '≡',
          onClick: () => this.params.program.goto('main'),
        },
      ],
    });
  }

  _setFullBleedBackground() {
    if (!this._bgImg) {
      this._bgImg = document.createElement('img');
      this._bgImg.src = './data/bg00.png';
      Object.assign(this._bgImg.style, {
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        objectPosition: 'center',
        zIndex: '-1',
        pointerEvents: 'none',
      });
      document.body.appendChild(this._bgImg);
    }
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

    this.titleRect = this._makeTitle(pad, top, innerW, titleH);

    this.artRect = this._makeArt(pad, top + titleH + gap, innerW, artH);

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

  _makeTitle(pad, top, innerW, titleH) {
    let titleRect = this.ux.div({
      parent: this.body,
      size: [innerW, titleH],
      position: [pad, top],
      text: 'BOAT GAME',
    });

    Object.assign(titleRect.style, {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      fontSize: 'calc(44 * var(--logic-h, 1px))',
      fontWeight: 400,
      color: '#fff',
      letterSpacing: '0.13em',
      textShadow: '0 6px 32px #000b, 0 2px 0 #1a1a1a, 0 0px 1px #fff8',
      fontFamily: '"Nunito", "Quicksand", "Fredoka", "Baloo 2", "Arial Rounded MT Bold", "Arial", sans-serif',
      background: 'none',
      textAlign: 'center',
      lineHeight: 1.05,
      textTransform: 'uppercase',
      filter: 'drop-shadow(0 2px 0 #0af8) drop-shadow(0 0 8px #00f6)',
      userSelect: 'none',
      width: '100%',
      height: '100%',
      paddingTop: 'calc(2 * var(--logic-h, 1px))',
    });
    return titleRect;
  }

  _makeArt(pad, y, innerW, artH) {
    let artRect = this.ux.div({
      parent: this.body,
      size: [innerW, artH],
      position: [pad, y],
    });
    const img = document.createElement('img');
    img.src = './data/title02.png';
    Object.assign(img.style, {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
      display: 'block',
      borderRadius: 'calc(8 * var(--logic-h, 1px))',
      boxShadow: '0 4px 24px #0006',
      background: 'rgba(0,0,0,0.08)',
    });
    artRect.appendChild(img);
    return artRect;
  }
}