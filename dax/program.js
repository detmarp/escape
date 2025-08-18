import Dax from './dax.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this.makePage();
    this.makeContents();
  }

  makePage() {
    this.container = document.createElement('div');
    this.container.style.padding = '4px';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.alignItems = 'flex-start';
    this.container.style.margin = '0';

    this.canvas1 = document.createElement('canvas');
    this.canvas1.width = 40;
    this.canvas1.height = 40;
    const inlineText = document.createElement('span');
    inlineText.textContent = 'Here is some 3D [';
    const afterInlineText = document.createElement('span');
    afterInlineText.textContent = '].';
    const inlineContainer = document.createElement('div');
    inlineContainer.style.display = 'flex';
    inlineContainer.style.alignItems = 'center';
    inlineContainer.appendChild(inlineText);
    inlineContainer.appendChild(this.canvas1);
    inlineContainer.appendChild(afterInlineText);
    this.container.appendChild(inlineContainer);

    this.parent.appendChild(this.container);
  }

  makeContents() {

    const canvas2 = document.createElement('canvas');
    canvas2.width = 400;
    canvas2.height = 200;
    canvas2.style.border = '1px solid #222';
    this.container.appendChild(canvas2);

    const canvas3Wrapper = document.createElement('div');
    canvas3Wrapper.style.display = 'inline-block';
    canvas3Wrapper.style.resize = 'both';
    canvas3Wrapper.style.overflow = 'auto';
    canvas3Wrapper.style.border = '1px solid #222';
    const w = 600;
    const h = 300;
    canvas3Wrapper.style.width = `${w}px`;
    canvas3Wrapper.style.height = `${h}px`;
    canvas3Wrapper.style.position = 'relative';
    canvas3Wrapper.appendChild(document.createElement('canvas'));
    const canvas3 = canvas3Wrapper.firstChild;
    canvas3.style.display = 'block';
    canvas3.style.width = '100%';
    canvas3.style.height = '100%';

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      if (canvas3.width !== width || canvas3.height !== height) {
        canvas3.width = width;
        canvas3.height = height;
        canvas3.style.width = '100%';
        canvas3.style.height = '100%';
      }
      }
    });
    resizeObserver.observe(canvas3Wrapper);
    this.container.appendChild(canvas3Wrapper);

    const dax = new Dax(this.canvas1);
    dax.junk.justDoIt(this.canvas1);

    dax.ez.doIt2(canvas2);
    dax.start();

    const dax2 = new Dax(canvas3);
    dax2.ez.add("cube");
    dax2.ez.position(0, 1, 0);
    dax2.ez.add("groundgrid");
    dax2.start();
  }
}