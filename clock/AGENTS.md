# a clock web app

A fun web app presenting many diffent clock variations.

## coding in phases
We're going to code this in phases. first the rough skeleton.

Second will be the screen and url var concept

Third will be the menu page and sub screens system

Fourth will be the actual read coding - the individual sub screen canvas based mini apps.

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