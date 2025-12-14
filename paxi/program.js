export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    // Create elements
    const header = document.createElement('h1');
    header.textContent = 'Welcome to Paxi';

    const text = document.createElement('p');
    text.textContent = 'This is a simple counter demo.';

    const counter = document.createElement('span');
    counter.textContent = '0';
    counter.style.margin = '0 1em';

    const button = document.createElement('button');
    button.textContent = 'Increment';

    let count = 0;
    button.addEventListener('click', () => {
      count++;
      counter.textContent = String(count);
    });

    const container = document.createElement('div');
    container.appendChild(header);
    container.appendChild(text);
    container.appendChild(button);
    container.appendChild(counter);

    // Clear parent and add container
    this.parent.body.innerHTML = '';
    this.parent.body.appendChild(container);
  }
}