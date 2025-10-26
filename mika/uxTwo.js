export default class UxTwo {
  constructor() {
  }

  addToggle(parent, labelText, initialState, onChange) {
    const container = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = initialState;
    checkbox.id = `checkbox-${labelText.replace(/\s+/g, '-').toLowerCase()}`;
    checkbox.addEventListener('change', (event) => {
      onChange(event.target.checked);
    });

    const label = document.createElement('label');
    label.textContent = labelText;
    label.htmlFor = checkbox.id;
    // clicking the label should toggle the checkbox and trigger the onChange
    label.addEventListener('click', (ev) => {
      // Prevent double-handling if the browser already toggles the checkbox via htmlFor
      // We'll toggle the checked state explicitly and fire the change event so callers
      // always see the change.
      ev.preventDefault();
      checkbox.checked = !checkbox.checked;
      // dispatch a native change event so the existing listener runs
      const changeEvent = new Event('change', { bubbles: true });
      checkbox.dispatchEvent(changeEvent);
    });

    container.appendChild(checkbox);
    container.appendChild(label);
    parent.appendChild(container);
  }

  addText(parent, text) {
    const p = document.createElement('p');
    p.textContent = text;
    parent.appendChild(p);
  }

  addButton(parent, label, onClick) {
    const button = document.createElement('button');
    button.textContent = label;
    button.addEventListener('click', onClick.bind(this));
    parent.appendChild(button);
    return button;
  }
}
