document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    run();
  });
});

async function run() {
  // Check for reset parameter early
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('reset')) {
    // Clear saved data
    const { default: Program } = await import('./program.js');
    Program.clearSavedData();

    // Remove 'reset' parameter from URL without reload
    urlParams.delete('reset');
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    window.history.replaceState({}, '', newUrl);
  }

  const { default: Program } = await import('./program.js');
  const program = new Program(document.body);
  program.run();
}