# astra.js

A minimal utility for instantly setting up a full-screen, non-zoomable, mobile-friendly web app with zero boilerplate.

## Features
- Applies all essential styles via JavaScript (no CSS needed)
- Prevents zoom, scrolling, and unwanted gestures
- Sets the document title from code
- Designed for easy reuse in any project

## Usage
In your app (e.g., `boreal/program.js`):

```js
import Astra from '../astra/astra.js';

// Initialize Astra with your app title
new Astra('Boreal').init();
```

Now build your app logic as usual—Astra handles all the setup!
