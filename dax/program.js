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

    const helloText = document.createElement('div');
    helloText.textContent = 'hello';
    container.appendChild(helloText);

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    canvas.style.border = '1px solid #222';
    container.appendChild(canvas);

    const afterText = document.createElement('div');
    afterText.textContent = 'another line of text';
    container.appendChild(afterText);

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
    canvas3Wrapper.style.width = '300px';
    canvas3Wrapper.style.height = '300px';
    canvas3Wrapper.style.position = 'relative';
    canvas3Wrapper.appendChild(document.createElement('canvas'));
    const canvas3 = canvas3Wrapper.firstChild;
    canvas3.width = 300;
    canvas3.height = 300;
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
    import('./dax.js').then(module => {
      const dax = new module.default();
      dax.junk.justDoIt(canvas);
      dax.ez.justDoIt(canvas2);
      dax.ez.doIt2(canvas3);
    });
  }
}