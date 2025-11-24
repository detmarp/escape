export default class Markers {
  constructor(delegate = null) {
    this.delegate = delegate;
    this.markers = [];
    this.id = 0;
    this.map = {};
  }

  add(params = {}) {
    let id = this.id++;
    let marker = { id, ...params };

    if (params.rect) {
      this.setRect(marker, params.rect);
    } else {
      this.setPositionSize(marker,
        params.position || [0, 0],
        params.size || [20, 20]
      );
    }

    this.markers.push(marker);
    this.map[id] = marker;
    return marker;
  }

  remove(id) {
    let marker = this.map[id];
    if (!marker) {
      return;
    }
    if (this.dragging && this.dragging.marker === marker) {
      this.dragging.marker.dragging = false;
      this.dragging = null;
    }
    this.markers = this.markers.filter(m => m !== marker);
    delete this.map[id];
  }

  setRect(marker, rect) {
    rect = rect.map(v => Math.round(v));
    marker.rect = [...rect];
    let [x, y, w, h] = rect;
    marker.position = [x + Math.floor(w / 2), y + Math.floor(h / 2)];
    marker.size = [w, h];
  }

  setPositionSize(marker, position, size) {
    const [w, h] = size ? size : (marker.size || [20, 20]);
    const [x, y] = position;
    marker.position = [x, y];
    marker.size = [w, h];
    marker.rect = [x - (w >> 1), y - (h >> 1), w, h];
  }

  moveToTop(marker) {
    this.markers = this.markers.filter(m => m !== marker);
    this.markers.push(marker);
  }

  onFinger(action, pos) {
    // Action is one of: 'hover', 'down', 'drag', 'up'
    //console.log(`mmm ${action} at (${pos[0]}, ${pos[1]})`);

    const over = [];
    let probe = this.dragging && this.dragging.marker ? this.dragging.marker.position : pos;
    for (const marker of this.markers) {
      if (marker.rect) {
        const [x, y, w, h] = marker.rect;
        marker.over = probe[0] >= x && probe[0] < x + w && probe[1] >= y && probe[1] < y + h;
        if (marker.over) {
          over.push(marker);
        }
      }
    }
    this.top = over.length > 0 ? over[over.length - 1] : null;

    if (action === 'hover') {
      this.callDelegate('onMarkersHover', {
        marker: this.top,
        position: [...pos],
        over: [...over],
      });
    }
    else {
      if (over.length > 0) {
        over.pop();
      }
    }

    if (action === 'down') {
      this.lastDownTime = Date.now();
      if (this.tapped) {
        this.tapped.tapped = null;
      }
      this.tapped = this.top;
      if (this.top) {
        this.tapped.tapped = true;
        if (!this.tapped.fixed) {
          this.moveToTop(this.tapped);
        }
      }

      let params = {
        marker: this.tapped,
        position: [...pos],
        over: [...over],
      };
      this.callDelegate('onMarkersTap', params);

      this.down = [...pos];
    }

    if (action === 'drag') {
      if (!this.dragging) {
        this.dragging = {
          marker: this.tapped,
          startPos: [...this.down],
        };
        if (this.tapped) {
          this.dragging.anchorPos = [...this.tapped.position];
        }
        if (this.tapped) {
          this.tapped.dragging = true;
        }
        this.callDelegate('onMarkersDrag', {
          marker: this.tapped,
          startPos: [...this.down],
          position: [...pos],
          over: [...over],
        });
      }

      if (this.dragging && this.dragging.marker) {
        if (!this.dragging.marker.fixed) {
          const [startX, startY] = this.dragging.startPos;
          const [anchorX, anchorY] = this.dragging.anchorPos;
          const [currX, currY] = pos;
          const delta = [currX - startX, currY - startY];
          const newPos = [anchorX + delta[0], anchorY + delta[1]];
          this.dragging.marker.position = newPos.map(Math.round);
          const [w, h] = this.dragging.marker.size;
          this.dragging.marker.rect = [
            this.dragging.marker.position[0] - Math.floor(w / 2),
            this.dragging.marker.position[1] - Math.floor(h / 2),
            w,
            h
          ];
        }
        this.dragging.endPos = [...pos];
        this.callDelegate('onMarkersDragging', {
          marker: this.dragging.marker,
          startPos: [...this.dragging.startPos],
          position: [...pos],
          over: [...over],
        });
      }
    }

    if (action === 'up') {
      let marker;
      if (this.dragging) {
        if (this.dragging.marker) {
          marker = this.dragging.marker;
          this.dragging.marker.dragging = false;
          this.callDelegate('onMarkersDrop', {
            marker: this.dragging.marker,
            startPos: [...this.dragging.startPos],
            position: [...pos],
            over: [...over],
          });
        }
        this.dragging = null;
      }
      else {
          if (this.lastDownTime) {
          const duration = Date.now() - this.lastDownTime;
          this.lastDownTime = null;
          if (duration < 250) {
            this.callDelegate('onMarkersClick', {
              marker: this.tapped,
              position: [...pos],
            });
          }
        }
      }
      let params = {
        marker: marker,
        position: [...pos],
        over: [...over],
      };
      this.callDelegate('onMarkersUp', params);
    }
  }

  callDelegate(method, params, defaultValue) {
    if (params && params.marker == null) {
      delete params.marker;
    }

    // see if the marker has a delegate
    if (params && params.marker && params.marker.delegate) {
      let func = params.marker.delegate[method];
      if (typeof func === 'function') {
        func.call(params.marker.delegate, params);
      }
      else {
        func = params.marker.delegate.onMarkers;
        if (typeof func === 'function') {
            func.call(params.marker.delegate, method.slice(9).toLowerCase(), params);
        }
      }
    }

    // Call the top-level delegate
    if (this.delegate && typeof this.delegate[method] === 'function') {
      return this.delegate[method](params);
    }
    return defaultValue;
  }

  getDestinationRect(targetMarker, startRect, hintSize) {
    // Returns a rect to place in target
    let size = startRect ? startRect.slice(2) : (
      hintSize ? [...hintSize] : [20, 20]
    );
    let position = [];
    for (let d = 0; d < 2; d++) {
      let s = size[d];
      let min = targetMarker.rect[d];
      let max = min + targetMarker.rect[d + 2] - s;
      let space = max - min;
      let x = (max + min) / 2;
      if (space > 0) {
        if (startRect) {
          x = startRect[d];
        }
        else {
          x = min + (Math.random() * space);
        }
        // clamp away from edges
        x = Math.max(x, min);
        x = Math.min(x, max);
        position[d] = x;
      }
    }
    return [position[0], position[1], size[0], size[1]];
  }

  debugDraw(parent) {
    parent.innerHTML = '';

    function box(parent, params = {}) {
      return;
      let div = document.createElement('div');
      parent.appendChild(div);

      div.style.position = 'relative';
      div.style.whiteSpace = 'pre-wrap';

      div.style.pointerEvents = 'none';

      if (params.rect) {
        let rect = params.rect;
        div.style.position = 'absolute';
        div.style.left = `calc(var(--scale) * ${rect[0]}px)`;
        div.style.top = `calc(var(--scale) * ${rect[1]}px)`;
        div.style.width = `calc(var(--scale) * ${rect[2]}px)`;
        div.style.height = `calc(var(--scale) * ${rect[3]}px)`;
      }
      else {
        div.style.width = '100%';
        div.style.height = '100%';
      }

      if (params.background) {
        div.style.backgroundColor = params.background;
      }
      if (params.border) {
        div.style.border = `calc(var(--scale) * ${params.borderWidth || 1}px) solid ${params.border}`;
      }

      if (params.text) {
        div.textContent = params.text;
      }
      return div;
    }

    box(parent, {
      border: 'red',
      background: '#ffcccc80',
    });
    for (let marker of this.markers) {
      let color = '#0040dd';
      if (marker.over) {
        color = '#00ffff';
      }
      if (marker.tapped) {
        color = '#eeeeee';
      }
      if (marker.dragging) {
        color = '#ffff00';
      }

      box(parent, {
        rect: marker.rect,
        border: color,
        background: '#ccccff20',
        text: `id: ${marker.id}`,
      });

      if (this.dragging) {
        if (this.dragging.startPos && this.dragging.endPos) {
          const [x1, y1] = this.dragging.startPos;
          const [x2, y2] = this.dragging.endPos;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          const line = box(parent, {
            rect: [
              midX - length / 2,
              midY - 0.5,
              length,
              1
            ],
            background: '#ff8000',
          });
          if (line) {
            // in case we commented out the box func above
            line.style.transformOrigin = 'center center';
            line.style.transform = `rotate(${angle}deg)`;
          }
        }
      }
    }
  }
}
