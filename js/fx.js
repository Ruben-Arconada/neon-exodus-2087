/* ============================================================
   NEON EXODUS 2087 — fx.js
   Arte técnico: partículas, sacudidas, destellos y el fondo
   synthwave (estrellas, sol de franjas, skyline procedural y
   rejilla en perspectiva que avanza hacia el horizonte).
   ============================================================ */
"use strict";

NX.fx = (function () {

  /* --- Partículas (pool fijo, cero basura por frame) ----------- */
  var MAXP = 420;
  var parts = [];
  for (var i = 0; i < MAXP; i++) {
    parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, size: 2, color: "#fff", drag: 1 });
  }
  var pIdx = 0;

  function spawn(x, y, vx, vy, life, size, color, drag) {
    var p = parts[pIdx];
    pIdx = (pIdx + 1) % MAXP;
    p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy;
    p.life = life; p.maxLife = life; p.size = size; p.color = color;
    p.drag = drag || 0.98;
  }

  function burst(x, y, color, n, speed, size) {
    n = n || 14; speed = speed || 180; size = size || 3;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * NX.TAU;
      var s = speed * (0.3 + Math.random() * 0.9);
      spawn(x, y, Math.cos(a) * s, Math.sin(a) * s,
        0.35 + Math.random() * 0.45, size * (0.6 + Math.random() * 0.8), color, 0.94);
    }
  }

  function sparks(x, y, color, n) {
    for (var i = 0; i < (n || 5); i++) {
      var a = Math.random() * NX.TAU;
      var s = 60 + Math.random() * 120;
      spawn(x, y, Math.cos(a) * s, Math.sin(a) * s, 0.2 + Math.random() * 0.2, 2, color, 0.92);
    }
  }

  /* --- Textos flotantes (puntuaciones, avisos) ----------------- */
  var texts = [];
  function textPop(x, y, str, color, big) {
    texts.push({ x: x, y: y, str: str, color: color, life: 0.9, big: !!big });
    if (texts.length > 24) texts.shift();
  }

  /* --- Ondas expansivas ---------------------------------------- */
  var rings = [];
  function ring(x, y, color, maxR) {
    rings.push({ x: x, y: y, r: 6, maxR: maxR || 90, color: color, life: 1 });
    if (rings.length > 16) rings.shift();
  }

  /* --- Sacudida y destello ------------------------------------- */
  var shakeT = 0, shakeMag = 0, shakeOn = true;
  function shake(mag, dur) {
    if (!shakeOn) return;
    shakeMag = Math.max(shakeMag, mag);
    shakeT = Math.max(shakeT, dur);
  }
  var flashA = 0, flashColor = "#fff";
  function flash(color, a) { flashColor = color; flashA = Math.max(flashA, a); }

  /* --- Fondo ----------------------------------------------------
     Skyline determinista por sector (semilla LCG) para que cada
     fase tenga su silueta propia y reconocible.                   */
  var stars = [];
  function makeStars(w, h) {
    stars.length = 0;
    for (var i = 0; i < NX.STAR_COUNT; i++) {
      stars.push({ x: Math.random() * w, y: Math.random() * h * 0.55, s: Math.random() * 1.6 + 0.4, tw: Math.random() * NX.TAU });
    }
  }

  var skyline = [], skylineSeed = -1;
  function lcg(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function makeSkyline(seed, w, h) {
    skylineSeed = seed;
    skyline.length = 0;
    var rnd = lcg(seed * 7919 + 13);
    var x = -20;
    while (x < w + 40) {
      var bw = 24 + rnd() * 60;
      var bh = 24 + rnd() * (h * 0.11);
      var win = rnd() > 0.35;
      skyline.push({ x: x, w: bw, h: bh, win: win, antenna: rnd() > 0.7 });
      x += bw + 4 + rnd() * 14;
    }
  }

  var gridScroll = 0;

  function drawBackground(ctx, w, h, dt, t, pal, intensity, sectorIdx) {
    if (stars.length === 0) makeStars(w, h);
    if (skylineSeed !== sectorIdx) makeSkyline(sectorIdx + 1, w, h);

    var horizon = h * 0.42;

    // Cielo degradado
    var sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "#020008");
    sky.addColorStop(1, pal.sky);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizon);

    // Estrellas que parpadean
    ctx.fillStyle = "#cfd8ff";
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      var a = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + st.tw));
      ctx.globalAlpha = a * 0.8;
      ctx.fillRect(st.x, st.y, st.s, st.s);
    }
    ctx.globalAlpha = 1;

    // Sol synthwave con franjas
    var sunR = Math.min(w, h) * 0.23;
    var sunX = w * 0.5, sunY = horizon - sunR * 0.55;
    var sg = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
    sg.addColorStop(0, pal.sun);
    sg.addColorStop(1, pal.a1);
    ctx.save();
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, NX.TAU);
    ctx.clip();
    ctx.fillStyle = sg;
    ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR * 2);
    // franjas horizontales que suben
    ctx.fillStyle = "#020008";
    var stripeShift = (t * 14) % 18;
    for (var sY = sunY - sunR + stripeShift; sY < sunY + sunR; sY += 18) {
      var frac = (sY - (sunY - sunR)) / (sunR * 2);
      var sh = 1 + frac * 7;
      if (frac > 0.45) ctx.fillRect(sunX - sunR, sY, sunR * 2, sh);
    }
    ctx.restore();
    // halo del sol
    ctx.globalAlpha = 0.22 + 0.05 * Math.sin(t * 2);
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 1.35, 0, NX.TAU);
    ctx.fillStyle = pal.sun;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Skyline (dos capas de parallax)
    ctx.fillStyle = "#06001a";
    for (var k = 0; k < skyline.length; k++) {
      var b = skyline[k];
      ctx.fillRect(b.x, horizon - b.h, b.w, b.h);
      if (b.antenna) ctx.fillRect(b.x + b.w * 0.5 - 1, horizon - b.h - 14, 2, 14);
    }
    // ventanas encendidas
    for (var k2 = 0; k2 < skyline.length; k2++) {
      var b2 = skyline[k2];
      if (!b2.win) continue;
      ctx.fillStyle = (k2 % 2 === 0) ? pal.a1 : pal.a2;
      ctx.globalAlpha = 0.5;
      for (var wy = horizon - b2.h + 6; wy < horizon - 8; wy += 11) {
        for (var wx = b2.x + 4; wx < b2.x + b2.w - 4; wx += 10) {
          if (((wx * 13 + wy * 7 + k2 * 31) % 17) < 5) ctx.fillRect(wx, wy, 3, 4);
        }
      }
      ctx.globalAlpha = 1;
    }

    // Suelo
    var gnd = ctx.createLinearGradient(0, horizon, 0, h);
    gnd.addColorStop(0, pal.sky);
    gnd.addColorStop(0.25, pal.bg);
    gnd.addColorStop(1, "#01000a");
    ctx.fillStyle = gnd;
    ctx.fillRect(0, horizon, w, h - horizon);

    // Rejilla en perspectiva
    gridScroll += dt * NX.GRID_SPEED * (0.7 + intensity * 0.6);
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    // verticales que convergen en el punto de fuga
    var vp = sunX;
    for (var gx = -10; gx <= 10; gx++) {
      ctx.beginPath();
      ctx.moveTo(vp + gx * 26, horizon);
      ctx.lineTo(vp + gx * (w * 0.16), h);
      ctx.stroke();
    }
    // horizontales con avance exponencial (sensación de velocidad)
    var rows = 14;
    var cycle = gridScroll % 1;
    for (var r = 0; r < rows; r++) {
      var f = (r + cycle) / rows;
      var gy = horizon + Math.pow(f, 2.6) * (h - horizon);
      ctx.globalAlpha = 0.12 + f * 0.45;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // línea de horizonte brillante
    ctx.strokeStyle = pal.a1;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(w, horizon);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /* --- Actualización + render de partículas -------------------- */
  function update(dt) {
    for (var i = 0; i < MAXP; i++) {
      var p = parts[i];
      if (!p.on) continue;
      p.life -= dt;
      if (p.life <= 0) { p.on = false; continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= p.drag; p.vy *= p.drag;
    }
    for (var j = texts.length - 1; j >= 0; j--) {
      texts[j].life -= dt;
      texts[j].y -= 36 * dt;
      if (texts[j].life <= 0) texts.splice(j, 1);
    }
    for (var k = rings.length - 1; k >= 0; k--) {
      var rg = rings[k];
      rg.life -= dt * 2.2;
      rg.r = NX.lerp(rg.r, rg.maxR, dt * 7);
      if (rg.life <= 0) rings.splice(k, 1);
    }
    if (shakeT > 0) { shakeT -= dt; if (shakeT <= 0) shakeMag = 0; }
    if (flashA > 0) flashA = Math.max(0, flashA - dt * 2.4);
  }

  function draw(ctx) {
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < MAXP; i++) {
      var p = parts[i];
      if (!p.on) continue;
      var a = p.life / p.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
    }
    for (var k = 0; k < rings.length; k++) {
      var rg = rings[k];
      ctx.globalAlpha = Math.max(0, rg.life) * 0.8;
      ctx.strokeStyle = rg.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(rg.x, rg.y, rg.r, 0, NX.TAU);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    for (var j = 0; j < texts.length; j++) {
      var tx = texts[j];
      ctx.globalAlpha = Math.min(1, tx.life * 2);
      ctx.fillStyle = tx.color;
      ctx.font = (tx.big ? "bold 22px " : "bold 14px ") + '"Courier New", monospace';
      ctx.textAlign = "center";
      ctx.fillText(tx.str, tx.x, tx.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  }

  function drawFlash(ctx, w, h) {
    if (flashA <= 0) return;
    ctx.globalAlpha = flashA;
    ctx.fillStyle = flashColor;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  function getShake() {
    if (shakeT <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() * 2 - 1) * shakeMag,
      y: (Math.random() * 2 - 1) * shakeMag
    };
  }

  /* --- Joysticks virtuales -------------------------------------- */
  function drawSticks(ctx) {
    var st = NX.input.state;
    var list = [st.lStick, st.rStick];
    for (var i = 0; i < 2; i++) {
      var s = list[i];
      if (!s) continue;
      var col = i === 0 ? "#19e6ff" : "#ff2bd6";
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.ax, s.ay, NX.input.STICK_RADIUS, 0, NX.TAU);
      ctx.stroke();
      var dx = s.x - s.ax, dy = s.y - s.ay;
      var len = Math.hypot(dx, dy);
      var m = Math.min(len, NX.input.STICK_RADIUS);
      var nx = len > 0 ? dx / len : 0, ny = len > 0 ? dy / len : 0;
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(s.ax + nx * m, s.ay + ny * m, 20, 0, NX.TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function reset() {
    for (var i = 0; i < MAXP; i++) parts[i].on = false;
    texts.length = 0;
    rings.length = 0;
    shakeT = 0; shakeMag = 0; flashA = 0;
  }

  function onResize() { stars.length = 0; skylineSeed = -1; }

  return {
    burst: burst, sparks: sparks, textPop: textPop, ring: ring,
    shake: shake, flash: flash,
    update: update, draw: draw, drawFlash: drawFlash, drawBackground: drawBackground,
    drawSticks: drawSticks, getShake: getShake, reset: reset, onResize: onResize,
    setShake: function (on) { shakeOn = on; }
  };
})();
