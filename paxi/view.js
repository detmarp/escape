export default class View {
  constructor(parent, paxi) {
    this.parent = parent;
    this.paxi = paxi;
    this.n = 0;
    this.parent.innerHTML = '';
    this.textElem = document.createElement('div');
    this.textElem.textContent = 'View: 0';
    this.parent.appendChild(this.textElem);

    this.restartBtn = document.createElement('button');
    this.restartBtn.textContent = 'Restart';
    this.restartBtn.onclick = () => {
      if (this.paxi && typeof this.paxi.onNewGame === 'function') {
        this.paxi.onNewGame();
      }
    };
    this.parent.appendChild(this.restartBtn);
  }

  work() {
    this.n++;
    this.textElem.textContent = 'View: ' + this.n;
  }
}