export default class AppUI {
  constructor(container, program) {
    this.container = container;
    this.program = program;
  }

  run() {
    // Clear previous UI
    this.container.innerHTML = "";

    // Basic styles for overlay UI
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

    // Counter state
    let count1 = 0;
    let count2 = 0;

    // Helper to create a button
    const button = (label, onClick) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      Object.assign(btn.style, {
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
      });
      // Only use click, prevent double increment on touch devices
      btn.addEventListener("click", e => { e.stopPropagation(); onClick && onClick(e); });
      return btn;
    };

    // UI container
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

    // Text fields
    this.text1 = this.text("Count 1: 0");
    this.text2 = this.text("Count 2: 0");

    // Add UI elements
    this.ui.appendChild(button("Button 1", () => {
      count1++;
      this.text1.textContent = `Count 1: ${count1}`;
    }));
    this.ui.appendChild(this.text1);
    this.ui.appendChild(button("Button 2", () => {
      count2++;
      this.text2.textContent = `Count 2: ${count2}`;
    }));
    this.ui.appendChild(this.text2);

    // Enable pointer events only for buttons
    Array.from(this.ui.children).forEach(el => {
      if (el.tagName === "BUTTON") el.style.pointerEvents = "auto";
    });

    this.container.appendChild(this.ui);
  }

  // Public method to add a text item to the UI
  text(content) {
    const txt = document.createElement("div");
    txt.textContent = content;
    Object.assign(txt.style, {
      fontSize: "1em",
      margin: "10px 0 0 10px",
      color: "#fff",
      background: "#eee",
      borderRadius: "0",
      padding: "2px 8px",
      pointerEvents: "none",
      userSelect: "none",
      display: "block",
      textShadow: "1px 1px 4px #222",
      whiteSpace: "pre-wrap",
    });
    if (this.ui) this.ui.appendChild(txt);
    return txt;
  }
}
