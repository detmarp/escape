import Chat from './chat.js';
import ChatLocal from './chatlocal.js';
import Output from './output.js';

export default class MainScreen {
  constructor(parent) {
    this.parent = parent;
    this.output = new Output();

    this.chatLocal = new ChatLocal();
    this.localPending = true;
    this.chatLocal.setup();
  }

  _startChat(prompt) {
    if (this.chatLocal.loaded) {
      this.chat = this.chatLocal;
    } else {
      this.chat = new Chat();
      this.chat.hint = this.chatLocal.status;
    }

    this.chat.setup();
    this.chat.start(prompt, (output, isFinal) => {
      if (isFinal) {
        this.output.append(output);
      } else {
        this.output.update(output);
      }

      this.largeTextArea.textContent = this.output.history;
      this.largeTextArea.scrollTop = this.largeTextArea.scrollHeight;
      this.shortTextArea.textContent = this.output.current
      this.shortTextArea.scrollTop = this.shortTextArea.scrollHeight;
    });
  }

  create() {
    const div = document.createElement('div');
    // Create a container for the buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';

    // Create 4 buttons with inline callbacks (unrolled)
    const btn1 = document.createElement('button');
    btn1.textContent = 'Button 1';
    btn1.onclick = () => {
      this._startChat("Hello");
    };
    buttonContainer.appendChild(btn1);

    const btn2 = document.createElement('button');
    btn2.textContent = 'Button 2';
    btn2.onclick = () => {
      this._startChat("Hi");
    };
    buttonContainer.appendChild(btn2);

    const btn3 = document.createElement('button');
    btn3.textContent = 'Button 3';
    btn3.onclick = () => {
      this._startChat("Hey");
    };
    buttonContainer.appendChild(btn3);

    const btn4 = document.createElement('button');
    btn4.textContent = 'Button 4';
    btn4.onclick = () => {
      this._startChat("Greetings");
    };
    buttonContainer.appendChild(btn4);

    div.appendChild(buttonContainer);

    // Large text display area
    this.largeTextArea = document.createElement('div');
    this.largeTextArea.style.marginTop = '20px';
    this.largeTextArea.style.height = '200px';
    this.largeTextArea.style.border = '1px solid #ccc';
    this.largeTextArea.style.padding = '10px';
    this.largeTextArea.style.overflowY = 'auto';
    this.largeTextArea.style.resize = 'vertical';
    this.largeTextArea.style.whiteSpace = 'pre-wrap';
    this.largeTextArea.textContent = '';
    div.appendChild(this.largeTextArea);

    // Short text display area
    this.shortTextArea = document.createElement('div');
    this.shortTextArea.style.marginTop = '10px';
    this.shortTextArea.style.height = '100px';
    this.shortTextArea.style.border = '1px solid #ccc';
    this.shortTextArea.style.padding = '5px';
    this.shortTextArea.style.overflowY = 'auto';
    this.shortTextArea.style.resize = 'vertical';
    this.shortTextArea.style.whiteSpace = 'pre-wrap';
    this.shortTextArea.textContent = '';
    div.appendChild(this.shortTextArea);

    // Stop button (greyed out)
    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop';
    stopButton.disabled = true;
    stopButton.style.marginTop = '20px';
    div.appendChild(stopButton);
    this.parent.appendChild(div);
    return div;
  }
}