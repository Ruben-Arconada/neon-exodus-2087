/* ============================================================
   NEON EXODUS 2087 — input.js
   UX/Controles: dos joysticks virtuales flotantes (móvil),
   doble toque a la izquierda = dash. WASD + ratón en escritorio.
   Los sticks "nacen" donde apoyas el pulgar: nada de zonas fijas
   incómodas (decisión de UX tras pruebas en iPhone).
   ============================================================ */
"use strict";

NX.input = (function () {
  var canvas = null;

  var state = {
    move: { x: 0, y: 0 },            // vector normalizado [-1..1]
    aim: { x: 0, y: 0, active: false },
    dash: false,                     // petición de dash (se consume)
    touchMode: false,
    // datos para dibujar los sticks
    lStick: null,                    // {ax, ay, x, y}
    rStick: null
  };

  var keys = {};
  var mouse = { x: 0, y: 0, seen: false };
  var lPointer = -1, rPointer = -1;
  var lastLeftTap = 0;
  var STICK_RADIUS = 56;
  var DEAD = 8;

  function isLeft(x) { return x < window.innerWidth * 0.5; }

  function onTouchStart(e) {
    e.preventDefault();
    state.touchMode = true;
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (isLeft(t.clientX) && lPointer === -1) {
        lPointer = t.identifier;
        state.lStick = { ax: t.clientX, ay: t.clientY, x: t.clientX, y: t.clientY };
        var now = performance.now();
        if (now - lastLeftTap < 280) state.dash = true;
        lastLeftTap = now;
      } else if (!isLeft(t.clientX) && rPointer === -1) {
        rPointer = t.identifier;
        state.rStick = { ax: t.clientX, ay: t.clientY, x: t.clientX, y: t.clientY };
      }
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (t.identifier === lPointer && state.lStick) {
        state.lStick.x = t.clientX; state.lStick.y = t.clientY;
      } else if (t.identifier === rPointer && state.rStick) {
        state.rStick.x = t.clientX; state.rStick.y = t.clientY;
      }
    }
  }

  function onTouchEnd(e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (t.identifier === lPointer) { lPointer = -1; state.lStick = null; }
      if (t.identifier === rPointer) { rPointer = -1; state.rStick = null; }
    }
  }

  function stickVector(st) {
    var dx = st.x - st.ax, dy = st.y - st.ay;
    var len = Math.hypot(dx, dy);
    if (len < DEAD) return { x: 0, y: 0 };
    var m = Math.min(1, len / STICK_RADIUS);
    return { x: (dx / len) * m, y: (dy / len) * m };
  }

  function onKey(e, down) {
    if (e.repeat) return;
    keys[e.code] = down;
    if (down && (e.code === "Space")) { state.dash = true; e.preventDefault(); }
    if (down && (e.code === "Escape" || e.code === "KeyP")) {
      if (NX.game) NX.game.togglePause();
    }
  }

  /* Recalcula move/aim cada frame (lo llama el bucle principal) */
  function poll(playerX, playerY) {
    // MOVER
    if (state.lStick) {
      var v = stickVector(state.lStick);
      state.move.x = v.x; state.move.y = v.y;
    } else {
      var mx = 0, my = 0;
      if (keys.KeyA || keys.ArrowLeft) mx -= 1;
      if (keys.KeyD || keys.ArrowRight) mx += 1;
      if (keys.KeyW || keys.ArrowUp) my -= 1;
      if (keys.KeyS || keys.ArrowDown) my += 1;
      var l = Math.hypot(mx, my) || 1;
      state.move.x = mx / l; state.move.y = my / l;
      if (mx === 0 && my === 0) { state.move.x = 0; state.move.y = 0; }
    }
    // APUNTAR
    if (state.rStick) {
      var a = stickVector(state.rStick);
      if (a.x || a.y) {
        var al = Math.hypot(a.x, a.y);
        state.aim.x = a.x / al; state.aim.y = a.y / al; state.aim.active = true;
      } else {
        state.aim.active = false;
      }
    } else if (!state.touchMode && mouse.seen) {
      var dx = mouse.x - playerX, dy = mouse.y - playerY;
      var dl = Math.hypot(dx, dy);
      if (dl > 4) { state.aim.x = dx / dl; state.aim.y = dy / dl; state.aim.active = true; }
      else state.aim.active = false;
    } else {
      state.aim.active = false;
    }
  }

  function consumeDash() {
    var d = state.dash;
    state.dash = false;
    return d;
  }

  function init(cv) {
    canvas = cv;
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });
    window.addEventListener("keydown", function (e) { onKey(e, true); });
    window.addEventListener("keyup", function (e) { onKey(e, false); });
    window.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.seen = true;
    });
    // doble clic = dash en escritorio
    canvas.addEventListener("dblclick", function (e) { e.preventDefault(); state.dash = true; });
    // que iOS no haga zoom con doble toque sobre el canvas
    document.addEventListener("gesturestart", function (e) { e.preventDefault(); });
  }

  return { init: init, poll: poll, consumeDash: consumeDash, state: state, STICK_RADIUS: STICK_RADIUS };
})();
