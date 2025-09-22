export default class AppUI {
  constructor(parent, program) {
    this.container = document.createElement("div");
    parent.appendChild(this.container);
    this.program = program;
  }

  run() {
    this.clear();
    Object.assign(this.container.style, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      pointerEvents: "none",
      userSelect: "none",
      zIndex: 10,
    });
    this._tempTest();
  }

  _tempTest() {
    let count1 = 0;
    let count2 = 0;
    this.ui = document.createElement("div");
    Object.assign(this.ui.style, {
      position: "absolute",
      top: "0",
      left: "0",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      pointerEvents: "none",
      gap: "0",
    });
    this.text1 = this.addText("Count 1: 0");
    this.text2 = this.addText("Count 2: 0");
    this.ui.appendChild(this.addButton("Button 1", () => {
      count1++;
      this.text1.textContent = `Count 1: ${count1}`;
    }));
    this.ui.appendChild(this.text1);
    this.ui.appendChild(this.addButton("Button 2", () => {
      count2++;
      this.text2.textContent = `Count 2: ${count2}`;
    }));
    this.ui.appendChild(this.text2);
    Array.from(this.ui.children).forEach(el => {
      if (el.tagName === "BUTTON") el.style.pointerEvents = "auto";
    });
    this.container.appendChild(this.ui);
  }

  addText(content) {
    const txt = document.createElement("div");
    txt.textContent = content;
    Object.assign(txt.style, {
      fontSize: "0.8em",
      fontFamily: "monospace",
      fontWeight: "normal",
      margin: "8px 0 0 10px",
      color: "#fff",
      background: "rgba(32,32,32,0.3)",
      borderRadius: "4px",
      padding: "2px 10px",
      pointerEvents: "none",
      userSelect: "none",
      WebkitUserSelect: "none",
      display: "block",
      textShadow: "0 1px 2px #000, 0 0 1px #fff",
      whiteSpace: "pre-wrap",
    });
    if (this.ui) this.ui.appendChild(txt);
    return txt;
  }

  addButton(label, onClick) {
    const btn = document.createElement("button");
    btn.textContent = label;
    const baseStyle = {
      fontSize: "1em",
      margin: "10px 0 0 10px",
      padding: "8px 18px",
      borderRadius: "4px",
      border: "1.5px solid #444",
      background: "#fff",
      color: "#222",
      boxShadow: "none",
      pointerEvents: "auto",
      cursor: "pointer",
      outline: "none",
      display: "block",
      userSelect: "none",
      WebkitUserSelect: "none",
      transition: "background 0.15s, box-shadow 0.15s",
    };
    Object.assign(btn.style, baseStyle);
    btn.addEventListener("mouseenter", () => {
      btn.style.background = "#e0e0e0";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = baseStyle.background;
    });
    btn.addEventListener("pointerdown", () => {
      btn.style.background = "#d0d0d0";
    });
    btn.addEventListener("pointerup", () => {
      btn.style.background = baseStyle.background;
      btn.blur();
    });
    btn.addEventListener("focus", () => {
      btn.style.boxShadow = "0 0 0 2px #888";
    });
    btn.addEventListener("blur", () => {
      btn.style.boxShadow = baseStyle.boxShadow;
    });
    btn.addEventListener("click", e => {
      e.stopPropagation();
      onClick && onClick(e);
      btn.blur();
    });
    return btn;
  }

  clear() {
    this.container.innerHTML = "";
  }
}
