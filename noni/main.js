document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    run();
  });
});

async function run() {
  await _checkReset();

  const { default: Program } = await import('./program.js');
  const program = new Program(document.body);
  program.run();
}

async function _checkReset() {
  // /?reset in URL -- to clear saved data
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('reset')) {
    const { default: Program } = await import('./program.js');
    Program.clearSavedData();
    urlParams.delete('reset');
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    window.history.replaceState({}, '', newUrl);
  }
}