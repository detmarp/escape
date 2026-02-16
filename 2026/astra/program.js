import Astra from './astra.js';

export default class Program {
  constructor(parent = document.body) {
    this.parent = parent;
    const title = 'Astra';
    let astra = new Astra();
    astra.setTitle(title);
    astra.setFixedFullscreen();
  }

  run() {
    const pre = document.createElement('pre');
    pre.textContent = `This page is initted using astra.js

Astra is a lightweight class that transforms web pages into fullscreen app-like experiences by disabling browser scrolling and mobile gestures.

It's meant to be non-scrollable, nonzoomable,
a nice fixed window to do a web or mobile app.
`;
    pre.style.fontFamily = 'monospace';
    pre.style.fontSize = '1.1em';
    pre.style.margin = '2em auto';
    pre.style.maxWidth = '90vw';
    pre.style.background = '#f8f8f8';
    pre.style.padding = '1em';
    pre.style.borderRadius = '8px';
    pre.style.boxShadow = '0 2px 8px #0001';
    document.body.appendChild(pre);
  }
}
