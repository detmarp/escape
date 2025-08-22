// Helper class to help render the shell
export default class DrawShell {
  constructor(shell, dax) {
    this.shell = shell;
    this.dax = dax;

    this.colors = {
      pent: [
        0xe63c3c, // rgb(230,60,60) - Soft Red
        0xe66e28, // rgb(230,110,40) - Warm Orange
        0x8c6450, // rgb(140,100,80) - Soft Brown
        0xdcaa28, // rgb(220,170,40) - Muted Yellow
        0xa0c83c, // rgb(160,200,60) - Yellow-Green
        0x3ca03c, // rgb(60,160,60) - True Green
        0x3caa96, // rgb(60,170,150) - Teal
        0x46aadc, // rgb(70,170,220) - Baby Blue
        0x4682c8, // rgb(70,130,200) - Soft Blue
        0x6e5abe, // rgb(110,90,190) - Muted Indigo
        0xa050b4, // rgb(160,80,180) - Violet
        0xf078a0  // rgb(240,120,160) - Pink
      ]
    };
  }

  _pentColor(i) {
    return this.colors.pent[i % this.colors.pent.length];
  }

  make3d() {
    for (let i = 0; i < 1000; i++) {
      const color = this._pentColor(i);
      this.dax.ez.nextColor(color);
      this.dax.ez.add("ball");
      const x = Math.random() * 20 - 10;
      const y = Math.random() * 20 - 10;
      const z = Math.random() * 20 - 10;
      this.dax.ez.position(x, y, z);
    };
  }
}