document.addEventListener('DOMContentLoaded', () => {
  let lineCount = 0;

  // Get DOM elements
  const addButton = document.getElementById('addButton');
  const clearButton = document.getElementById('clearButton');
  const scrollArea = document.getElementById('scrollArea');

  // Add text button functionality
  addButton.addEventListener('click', () => {
    addLines();
  });

  // Clear button functionality
  clearButton.addEventListener('click', () => {
    clearText();
  });

  // Function to add 10 lines of text
  function addLines() {
    for (let i = 1; i <= 10; i++) {
      lineCount++;
      const lineDiv = document.createElement('div');
      lineDiv.className = 'text-line';
      lineDiv.textContent = `Line ${lineCount}`;
      scrollArea.appendChild(lineDiv);
    }

    // Auto-scroll to bottom to show new content
    scrollArea.scrollTop = scrollArea.scrollHeight;
  }

  // Function to clear all text
  function clearText() {
    scrollArea.innerHTML = '';
    lineCount = 0;
  }

  // Add some initial content to demonstrate scrolling
  addLines();
});