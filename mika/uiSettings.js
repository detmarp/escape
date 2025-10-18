export default class UiSettings {
  constructor(parent, program) {
    this.parent = parent;
    this.program = program;
  }

  _render() {
    this.parent.textContent = '';
    const title = document.createElement('h1');
    title.textContent = 'Main Menu';
    this.parent.appendChild(title);

    const startButton = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.addEventListener('click', () => {
      this.program.gotoMode('game');
    });
    this.parent.appendChild(startButton);

    const settingsButton = document.createElement('button');
    settingsButton.textContent = 'Settings';
    settingsButton.addEventListener('click', () => {
      this.program.gotoMode('settings');
    });
    this.parent.appendChild(settingsButton);
  }
}