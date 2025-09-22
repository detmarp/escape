export default class HarpUI {
  constructor(appUI, program) {
    this.appUI = appUI;
    this.program = program;
    this.info = null;
  }

  run() {
    this.info = this.appUI.addText();
    this.updateInfo();
  }

  updateInfo() {
    if (this.info && this.program && this.program.canvas) {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const canvasW = this.program.canvas?.canvas?.width ?? 0;
      const canvasH = this.program.canvas?.canvas?.height ?? 0;
      this.info.textContent =
        `Window:\n  ${winW} x ${winH}\n` +
        `Canvas:\n  ${canvasW} x ${canvasH}`;
      this.info.style.whiteSpace = 'pre';
    }
    console.log('Window dimensions:', window.innerWidth, window.innerHeight);
    console.log('Canvas dimensions:', this.program.canvas?.canvas?.width, this.program.canvas?.canvas?.height);
  }
}
