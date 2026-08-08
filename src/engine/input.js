// Input. Keyboard first, with a touch d-pad that only appears if the device
// actually reports touch — school Chromebooks are frequently touchscreens,
// and a kid on a 2-in-1 should not have to find the keyboard.

const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  KeyZ: 'confirm', Space: 'confirm', Enter: 'confirm',
  KeyX: 'cancel', Escape: 'cancel', Backspace: 'cancel',
  KeyN: 'notebook', Tab: 'notebook',
  ShiftLeft: 'run', ShiftRight: 'run',
  // Taking a position on a disputed claim, in the notebook.
  Digit1: 'pos1', Numpad1: 'pos1',
  Digit2: 'pos2', Numpad2: 'pos2',
  Digit3: 'pos3', Numpad3: 'pos3',
};

export class Input {
  constructor() {
    this.held = new Set();
    this.pressed = new Set();   // cleared once per frame after being read

    addEventListener('keydown', (e) => {
      const a = KEYMAP[e.code];
      if (!a) return;
      // Stop the page scrolling out from under the game.
      e.preventDefault();
      if (!this.held.has(a)) this.pressed.add(a);
      this.held.add(a);
    });

    addEventListener('keyup', (e) => {
      const a = KEYMAP[e.code];
      if (!a) return;
      e.preventDefault();
      this.held.delete(a);
    });

    // Losing focus mid-walk should not leave a direction stuck down.
    addEventListener('blur', () => { this.held.clear(); });
  }

  /** Bind on-screen buttons. Each element carries data-act="up|confirm|...". */
  bindTouch(root) {
    const press = (a) => { if (!this.held.has(a)) this.pressed.add(a); this.held.add(a); };
    const release = (a) => this.held.delete(a);

    for (const el of root.querySelectorAll('[data-act]')) {
      const a = el.dataset.act;
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture(e.pointerId); press(a); });
      el.addEventListener('pointerup', (e) => { e.preventDefault(); release(a); });
      el.addEventListener('pointercancel', () => release(a));
      el.addEventListener('lostpointercapture', () => release(a));
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }

  isDown(a) { return this.held.has(a); }

  /** True once per physical press. */
  justPressed(a) { return this.pressed.has(a); }

  /** Call at the end of each frame. */
  endFrame() { this.pressed.clear(); }

  /** The direction currently being requested, or null. */
  direction() {
    if (this.held.has('up')) return 'up';
    if (this.held.has('down')) return 'down';
    if (this.held.has('left')) return 'left';
    if (this.held.has('right')) return 'right';
    return null;
  }
}
