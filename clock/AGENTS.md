# a clock web app

A fun web app presenting many diffent clock variations.


## phase 1 — skeleton (complete)

Static web app, ES modules, no build tools.

Files:
* `index.html` — centered layout, white background, dark grey sans text
* `main.js` — entry point, instantiates and runs Program
* `program.js` — creates Clock, passes DOM element
* `clock.js` — RAF loop, displays local `hh:mm:ss.ff`

## phase 2 — screen switching + URL params

Two modes:
* **menu** — no URL param (`?clock=` absent)
* **sub screen** — URL param present, e.g. `?clock=one`

### navigation
* A single tap/click toggles between menu and sub screen
* Menu cycles through sub screens on each tap (`one` → `two` → `one` → …)
* Sub screen tap returns to menu
* URL updates in place (`history.replaceState`) on every mode change

### URL param
* Key: `clock`, value: sub screen name (e.g. `?clock=one`)
* On page load, if param is present and valid → go straight to that sub screen
* Invalid or absent param → menu

### sub screens (placeholder for now)
* Two screens: `one`, `two`
* Each shows its name centred on the page
* Small unstyled clock (`hh:mm:ss.ff`) in the upper left

## phase 3 — screen class architecture (complete)

Pure refactor, no visible change.

### files
* `clock.js` — owns RAF loop, screen list, URL param, `goto(name='menu')`
* `menu.js` — `constructor(goto, screens)`, `draw(now)`
* `one.js` / `two.js` — `constructor(goto, screens, canvas=null)`, `draw(now)`
* `subscreen.js` — shared helper, creates full-size canvas, wires tap-to-menu
* `program.js` — slim, just instantiates Clock and calls `run()`

### conventions
* `clock.js` statically imports `menu.js`, dynamically imports sub screens by name
* All screen constructors: `constructor(goto, screens, canvas=null)` — consistent signature
* Screens reconstructed on each `goto()` call
* Single RAF in `clock.js`; calls `current.draw(now)` each frame, `now` is a `Date`
* `Date.getHours()` = local, `Date.getUTCHours()` = UTC — one object, screens choose

## phase 4 — menu grid + canvas shell (complete)

### intent
* Menu shows a responsive grid of live square canvas tiles
* Thin grey border on each tile
* Tap a tile → full screen sub screen for that clock
* Tap outside any tile → random sub screen
* Sub screen: single large square canvas centred, tap anywhere → menu

### canvas
* All canvases logical 400×400, `devicePixelRatio` applied to pixel dimensions
* Sub screens: canvas fills viewport square
* Tiles: canvas fills tile cell

### tile grid layout waypoints
* width 320 — 3 columns with minimal margins and minimal padding
* width ~500 - 4 columns, with tile size set to allow for a little margin and padding
* width ~800 - maybe 5 columns, tiles approx 150 pixels, with decent margins and padding
* width ~1000 - around here go to the max 6 columns, but the tile width will still be < 200
* very wide window, > 1340 say - 6 columns with tiels at max 200 width