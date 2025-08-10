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
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.border = '1px solid #222';
    container.appendChild(canvas);

    const afterText = document.createElement('div');
    afterText.textContent = 'another line of text';
    container.appendChild(afterText);

    this.parent.appendChild(container);

    import('./dax.js').then(module => {
      const Dax = module.default;
      const dax = new Dax();
      if (dax.junk && typeof dax.junk.justDoIt === 'function') {
      dax.junk.justDoIt(canvas);
      }
    });
  }
}