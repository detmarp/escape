export default class HarpUI {
  constructor(program) {
    this.program = program;
    this.info = null;
    this.appUI = this.program.ui
  }

  run() {
    this.info = this.appUI.addText();
    this.updateInfo();
  }

  draw() {
    this.updateInfo();
  }

  updateInfo() {
    if (!this.info || !this.program || !this.program.canvas) {
      return;
    }

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const canvasW = this.program.canvas?.canvas?.width ?? 0;
    const canvasH = this.program.canvas?.canvas?.height ?? 0;
    const frame = this.program.scene.dax?.frame ?? 'N/A';
    this.info.textContent =
      `Window:  ${winW} x ${winH}\n` +
      `Canvas:  ${canvasW} x ${canvasH}\n` +
      `Frame #: ${frame}`;
    this.info.style.whiteSpace = 'pre';
  }
}
