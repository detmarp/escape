import Dax from './dax.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this.makePage();
  }

  makePage() {
    const container = document.createElement('div');
    container.style.padding = '4px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-start';
    container.style.margin = '0';

    const canvas1 = document.createElement('canvas');
    canvas1.width = 40;
    canvas1.height = 40;
    const inlineText = document.createElement('span');
    inlineText.textContent = 'Here is some 3D [';
    const afterInlineText = document.createElement('span');
    afterInlineText.textContent = '].';
    const inlineContainer = document.createElement('div');
    inlineContainer.style.display = 'flex';
    inlineContainer.style.alignItems = 'center';
    inlineContainer.appendChild(inlineText);
    inlineContainer.appendChild(canvas1);
    inlineContainer.appendChild(afterInlineText);
    container.appendChild(inlineContainer);

    this.parent.appendChild(container);

    const canvas2 = document.createElement('canvas');
    canvas2.width = 400;
    canvas2.height = 200;
    canvas2.style.border = '1px solid #222';
    container.appendChild(canvas2);

    // Use the HTML <div contenteditable="true" style="resize: both; overflow: auto;"> trick for a native resize handle.
    // The diagonal triangle is shown when CSS 'resize: both' is applied and 'overflow: auto' is set.
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
    // Listen for resize events on the wrapper and adjust the canvas size accordingly
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
    container.appendChild(canvas3Wrapper);

    const dax = new Dax();
    dax.junk.justDoIt(canvas1);
    dax.ez.doIt2(canvas2);

    const dax2 = new Dax();
    dax2.ez.start(canvas3);
    dax2.ez.add("cube");
    dax2.ez.position(0, 1, 0);
    dax2.ez.add("groundgrid");
  }
}