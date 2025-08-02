let lineCount = 0;

function run() {
  const addButton = document.getElementById('addButton');
  const clearButton = document.getElementById('clearButton');
  const scrollArea = document.getElementById('scrollArea');

  addButton.addEventListener('click', () => {
    addLines();
  });

  clearButton.addEventListener('click', () => {
    clearText();
  });

  function addLines() {
    for (let i = 1; i <= 10; i++) {
      lineCount++;
      const lineDiv = document.createElement('div');
      lineDiv.className = 'text-line';
      lineDiv.textContent = `Line ${lineCount}`;
      scrollArea.appendChild(lineDiv);
    }

    scrollArea.scrollTop = scrollArea.scrollHeight;
  }

  function clearText() {
    scrollArea.innerHTML = '';
    lineCount = 0;
  }

  addLines();
}

document.addEventListener('DOMContentLoaded', run);