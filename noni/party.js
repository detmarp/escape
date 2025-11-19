export default class Party {
  constructor(parent) {
    this.parent = parent;
    // Ensure parent is positioned relative for absolute children
    this.divs = [];
    for (let i = 0; i < 200; i++) {
      const div = document.createElement('div');
      div.style.width = '5px';
      div.style.height = '5px';
      div.style.position = 'absolute';
      div.style.margin = '0';
      // Random saturated color in HSL
      const hue = Math.floor(Math.random() * 360);
      div.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
      this.divs.push(div);
      this.parent.appendChild(div);
    }
  }

  draw(time, scale = 1) {
    return;
    for (let i = 0; i < this.divs.length; i++) {
      const x = Math.random() * 540 * scale;
      const y = Math.random() * 960 * scale;
      this.divs[i].style.left = `${x}px`;
      this.divs[i].style.top = `${y}px`;
      this.divs[i].style.transform = `scale(${scale})`;
    }
  }
}