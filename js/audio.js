/* ============================================================
   NEON EXODUS 2087 — audio.js
   Audio: sintetizador synthwave 100% procedural (Web Audio).
   Sin samples: bombo, caja, charles, bajo, arpegio, pad y lead
   se generan con osciladores y ruido. Un tema por sector.
   ============================================================ */
"use strict";

NX.audio = (function () {
  var ctx = null;
  var master, musicBus, sfxBus, noiseBuf;
  var musicOn = true, sfxOn = true;

  /* --- Canciones (compositor) ---------------------------------
     prog: progresión de 4 acordes (semitonos sobre la raíz, modo menor).
     Cada acorde dura un compás de 16 semicorcheas.                 */
  var SONGS = {
    title:  { bpm: 96,  root: 45, prog: [0, -4, -7, -2], mood: 0.55, lead: false },
    sector0:{ bpm: 118, root: 45, prog: [0, 8, 3, 10],   mood: 0.7,  lead: true  },
    sector1: { bpm: 120, root: 43, prog: [0, 5, 8, 7], mood: 0.62, lead: true, swing: 0.16, // Mercado: groove nocturno, pluck líder
      drums: { kick:[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0], snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1], hat:[1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0], openHat:[0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0] },
      bass:     [0,-1,0,12,0,-1,7,-1,5,-1,5,7,0,-1,7,8],
      arpShape: [0,3,7,3,10,7,12,7,0,3,8,3,7,3,10,7],
      riff:     [12,-1,10,-1,8,-1,7,-1,5,-1,7,8,-1,10,-1,-1],
      extra: { voice: "pluck", pattern:[0,-1,-1,3,-1,7,-1,5,-1,3,-1,0,-1,10,-1,-1] } },
    sector2: { bpm: 96, root: 41, prog: [0, 3, -2, 5], mood: 0.45, lead: true, swing: 0, // Cloacas: dub industrial, bajo + stab
      drums: { kick:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0], snare:[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], hat:[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1], openHat:[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0] },
      bass:     [0,-1,-1,-1,0,-1,-1,3,-2,-1,-1,-1,3,-1,-1,0],
      arpShape: [0,-1,7,-1,-1,-1,10,-1,0,-1,7,-1,-1,3,-1,-1],
      riff:     [-1,-1,-1,-1,7,-1,-1,-1,-1,-1,3,-1,-1,-1,-1,-1],
      extra: { voice: "stab", pattern:[-1,-1,0,-1,-1,-1,-1,3,-1,-1,-1,-1,7,-1,-1,-1] } },
    sector3: { bpm: 134, root: 47, prog: [0, 8, 5, 7], mood: 0.88, lead: true, swing: 0, // Torre: dramático marcial, stab + lead heroico
      drums: { kick:[1,0,0,0,1,0,0,1,1,0,0,0,1,0,1,0], snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hat:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], openHat:[0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0] },
      bass:     [0,0,12,0,0,0,12,0,5,5,12,5,7,7,12,7],
      arpShape: [0,3,7,12,3,7,12,15,7,12,15,19,12,15,19,22],
      riff:     [12,-1,-1,15,-1,19,-1,-1,22,-1,19,-1,24,-1,15,-1],
      extra: { voice: "stab", pattern:[-1,-1,-1,0,-1,-1,-1,7,-1,-1,-1,3,-1,-1,8,-1] } },
    sector4:{ bpm: 138, root: 44, prog: [0, 1, 0, -2],   mood: 0.95, lead: true  },
    sector5: { bpm: 128, root: 43, prog: [0, -2, -5, -2], mood: 0.7, lead: true, swing: 0.12, // Espejo: hipnótico, bell en espejo
      drums: { kick:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0], snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hat:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], openHat:[0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0] },
      bass:     [0,-1,7,-1,12,-1,7,-1,0,-1,7,-1,12,-1,7,-1],
      arpShape: [0,5,7,12,15,12,7,5,0,5,7,12,15,12,7,5],
      riff:     [12,-1,10,7,10,12,-1,15,15,-1,12,10,7,10,-1,12],
      extra: { voice: "bell", pattern:[0,7,12,15,-1,-1,-1,-1,15,12,7,0,-1,-1,-1,-1] } },
    sector6: { bpm: 116, root: 41, prog: [0, 3, -1, 4], mood: 0.75, lead: true, swing: 0.24, // Jardín: seductor, swing alto, pluck coqueto
      drums: { kick:[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0], snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hat:[0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0], openHat:[0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0] },
      bass:     [0,-1,0,-1,7,-1,-1,5,0,-1,0,3,4,-1,-1,7],
      arpShape: [0,3,7,10,12,10,7,3,5,8,12,8,5,3,7,10],
      riff:     [-1,12,-1,10,12,-1,8,-1,10,-1,7,-1,8,10,-1,-1],
      extra: { voice: "pluck", pattern:[-1,12,-1,15,-1,10,-1,12,-1,7,-1,8,-1,10,-1,12] } },
    sector7: { bpm: 130, root: 42, prog: [0, 5, 3, 7], mood: 0.85, lead: true, swing: 0.06, // Memorial: himno cálido, bell ascendente
      drums: { kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0], snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,1], hat:[1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1], openHat:[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1] },
      bass:     [0,-1,0,7,0,-1,7,-1,0,-1,0,7,12,-1,7,-1],
      arpShape: [0,7,12,7,3,10,12,15,0,7,12,15,17,15,12,7],
      riff:     [7,-1,12,-1,15,-1,12,-1,10,12,15,-1,17,-1,19,-1],
      extra: { voice: "bell", pattern:[12,-1,-1,15,-1,-1,17,-1,12,-1,-1,15,-1,17,-1,19] } },
    boss:   { bpm: 148, root: 42, prog: [0, 6, 1, 7],    mood: 1.0,  lead: true  },
    ending: { bpm: 84,  root: 48, prog: [0, -4, -7, -5], mood: 0.4,  lead: false }
  };

  var song = null;
  var step = 0, nextStepTime = 0, timerId = null;
  var LOOKAHEAD = 0.12, INTERVAL = 30;

  function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function ensureCtx() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = musicOn ? 0.6 : 0; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = sfxOn ? 0.8 : 0; sfxBus.connect(master);
    // Búfer de ruido blanco compartido (caja, charles, explosiones)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  function unlock() {
    if (!ensureCtx()) return;
    if (ctx.state === "suspended") ctx.resume();
  }

  /* --- Voces de batería --------------------------------------- */
  function kick(t) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.13);
    g.gain.setValueAtTime(0.95, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(g); g.connect(musicBus);
    o.start(t); o.stop(t + 0.25);
  }

  function snare(t) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf;
    f.type = "bandpass"; f.frequency.value = 1900; f.Q.value = 0.8;
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    s.connect(f); f.connect(g); g.connect(musicBus);
    s.start(t); s.stop(t + 0.2);
    // cuerpo tonal ochentero (caja con reverb de compuerta simulada)
    var o = ctx.createOscillator(), g2 = ctx.createGain();
    o.type = "triangle"; o.frequency.value = 190;
    g2.gain.setValueAtTime(0.25, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g2); g2.connect(musicBus);
    o.start(t); o.stop(t + 0.14);
  }

  function hat(t, open) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf;
    f.type = "highpass"; f.frequency.value = 7500;
    var dur = open ? 0.18 : 0.05;
    g.gain.setValueAtTime(open ? 0.22 : 0.16, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(musicBus);
    s.start(t); s.stop(t + dur + 0.02);
  }

  /* --- Voces melódicas ----------------------------------------- */
  function bass(midi, t, dur) {
    var o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.value = midiToFreq(midi);
    f.type = "lowpass";
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(220, t + dur);
    g.gain.setValueAtTime(0.34, t);
    g.gain.setValueAtTime(0.3, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(f); f.connect(g); g.connect(musicBus);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function arp(midi, t, dur) {
    var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = "square"; o.frequency.value = midiToFreq(midi);
    f.type = "lowpass"; f.frequency.value = 3400;
    g.gain.setValueAtTime(0.085, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(f); f.connect(g); g.connect(musicBus);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function pad(rootMidi, t, dur) {
    var freqs = [rootMidi, rootMidi + 3, rootMidi + 7, rootMidi + 12];
    for (var i = 0; i < freqs.length; i++) {
      for (var dt = -1; dt <= 1; dt += 2) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sawtooth";
        o.frequency.value = midiToFreq(freqs[i]) * (1 + dt * 0.0035);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.028, t + dur * 0.25);
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        var f = ctx.createBiquadFilter();
        f.type = "lowpass"; f.frequency.value = 1300;
        o.connect(f); f.connect(g); g.connect(musicBus);
        o.start(t); o.stop(t + dur + 0.05);
      }
    }
  }

  function lead(midi, t, dur) {
    var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = "sawtooth"; o.frequency.value = midiToFreq(midi);
    // vibrato analógico
    var v = ctx.createOscillator(), vg = ctx.createGain();
    v.frequency.value = 5.6; vg.gain.value = 5;
    v.connect(vg); vg.connect(o.frequency);
    f.type = "lowpass"; f.frequency.value = 2600;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.085, t + 0.03);
    g.gain.setValueAtTime(0.085, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(f); f.connect(g); g.connect(musicBus);
    o.start(t); o.stop(t + dur + 0.05);
    v.start(t); v.stop(t + dur + 0.05);
  }

  /* --- Voces nuevas (identidad instrumental por sector) -------- */
  // pluck: punteo corto y brillante (mercado, jardín)
  function pluck(midi, t, dur) {
    var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = "triangle"; o.frequency.value = midiToFreq(midi);
    f.type = "lowpass";
    f.frequency.setValueAtTime(4200, t);
    f.frequency.exponentialRampToValueAtTime(1400, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(f); f.connect(g); g.connect(musicBus);
    o.start(t); o.stop(t + dur + 0.02);
  }
  // stab: acorde menor corto y agresivo (cloacas, torre)
  function stab(midi, t, dur) {
    var f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = "lowpass";
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(3000, t + 0.02);
    f.frequency.exponentialRampToValueAtTime(600, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    var ch = [0, 3, 7];
    for (var c = 0; c < ch.length; c++) {
      var o = ctx.createOscillator();
      o.type = "sawtooth"; o.frequency.value = midiToFreq(midi + ch[c]);
      o.connect(f); o.start(t); o.stop(t + dur + 0.02);
    }
    f.connect(g); g.connect(musicBus);
  }
  // bell: campana FM cristalina (espejo, memorial)
  function bell(midi, t, dur) {
    var car = ctx.createOscillator(), g = ctx.createGain();
    var mod = ctx.createOscillator(), modG = ctx.createGain();
    var f0 = midiToFreq(midi);
    car.type = "sine"; car.frequency.value = f0;
    mod.type = "sine"; mod.frequency.value = f0 * 2;          // ratio 2:1
    modG.gain.setValueAtTime(f0 * 2.5, t);                    // índice de modulación decreciente
    modG.gain.exponentialRampToValueAtTime(1, t + dur * 0.6);
    mod.connect(modG); modG.connect(car.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.075, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    car.connect(g); g.connect(musicBus);
    car.start(t); car.stop(t + dur + 0.05);
    mod.start(t); mod.stop(t + dur + 0.05);
  }

  /* --- Secuenciador --------------------------------------------
     64 pasos = 4 compases. Cada compás usa un acorde de la
     progresión. Patrones fijos con variación pseudo-aleatoria
     estable (basada en el paso) para que el tema respire.        */
  var ARP_SHAPE = [0, 7, 12, 7, 3, 7, 12, 15, 0, 7, 12, 7, 3, 10, 7, 15];
  var LEAD_RIFF = [12, -1, 15, -1, 12, 10, -1, 7, -1, -1, 8, 10, -1, 7, -1, -1];

  function scheduleStep(s, t) {
    var bar = (s >> 4) & 3;            // 0..3
    var i = s & 15;                    // semicorchea dentro del compás
    var chord = song.prog[bar];
    var root = song.root + chord;
    var spb = 60 / song.bpm;           // segundos por negra
    var s16 = spb / 4;
    // Patrones por canción (si no, el tema principal compartido):
    var arpShape = song.arpShape || ARP_SHAPE;
    var riff = song.riff || LEAD_RIFF;

    // Swing: retrasa las semicorcheas impares (shuffle por canción)
    var sw = song.swing ? (song.swing < 0 ? 0 : (song.swing > 0.4 ? 0.4 : song.swing)) : 0;
    if (sw && (i & 1)) t += sw * s16;

    // Batería: patrón por canción o el fijo por defecto
    if (song.drums) {
      var dr = song.drums;
      if (dr.kick[i]) kick(t);
      if (dr.snare[i]) snare(t);
      if (dr.hat[i]) hat(t, false);
      if (dr.openHat[i]) hat(t, true);
    } else {
      if (i % 4 === 0) kick(t);
      if (song.mood > 0.8 && i === 14) kick(t);        // empuje extra en temas intensos
      if (i === 4 || i === 12) snare(t);
      if (i % 2 === 0) hat(t, false);
      if (i === 10) hat(t, true);
    }

    // Bajo: patrón por canción (-1 = silencio) o las corcheas con octava por defecto
    if (song.bass) {
      var bv = song.bass[i];
      if (bv >= 0) bass(root + bv - 12, t, s16 * 1.8);
    } else if (i % 2 === 0) {
      var b = (i % 8 === 6) ? root + 12 : root;
      bass(b - 12, t, s16 * 1.8);
    }

    // Arpegio: semicorcheas continuas (-1 = silencio, para texturas dispersas)
    if (arpShape[i] >= 0) arp(root + arpShape[i], t, s16 * 0.9);

    // Pad al cambio de acorde
    if (i === 0) pad(root + 12, t, spb * 4);

    // Voz extra por canción: pluck / stab / bell (-1 = silencio)
    if (song.extra && song.extra.voice !== "none") {
      var ev = song.extra.pattern[i];
      if (ev >= 0) {
        if (song.extra.voice === "pluck") pluck(root + ev + 12, t, s16 * 1.1);
        else if (song.extra.voice === "stab") stab(root + ev, t, s16 * 0.9);
        else if (song.extra.voice === "bell") bell(root + ev + 12, t, spb * 1.6);
      }
    }

    // Lead: riff en compases 3 y 4
    if (song.lead && bar >= 2) {
      var n = riff[i];
      if (n >= 0) lead(root + 12 + n, t, s16 * 1.6);
    }
  }

  function scheduler() {
    if (!ctx || !song) return;
    var s16 = (60 / song.bpm) / 4;
    while (nextStepTime < ctx.currentTime + LOOKAHEAD) {
      scheduleStep(step, Math.max(nextStepTime, ctx.currentTime + 0.005));
      nextStepTime += s16;
      step = (step + 1) % 64;
    }
  }

  function playSong(name) {
    if (!ensureCtx()) return;
    var s = SONGS[name];
    if (!s) return;
    if (song === s && timerId) return;  // ya suena
    song = s;
    step = 0;
    nextStepTime = ctx.currentTime + 0.06;
    if (!timerId) timerId = setInterval(scheduler, INTERVAL);
  }

  function stopMusic() {
    song = null;
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  /* --- Efectos de sonido --------------------------------------- */
  function blip(fa, fb, dur, type, vol) {
    if (!ctx || !sfxOn) return;
    var t = ctx.currentTime;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(fa, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, fb), t + dur);
    g.gain.setValueAtTime(vol || 0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function boom(dur, vol, freq) {
    if (!ctx || !sfxOn) return;
    var t = ctx.currentTime;
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf;
    f.type = "lowpass";
    f.frequency.setValueAtTime(freq || 2200, t);
    f.frequency.exponentialRampToValueAtTime(120, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus);
    s.start(t); s.stop(t + dur + 0.05);
  }

  var lastShot = 0;
  var sfx = {
    shoot: function () {
      if (!ctx) return;
      if (ctx.currentTime - lastShot < 0.045) return; // antispam de QA
      lastShot = ctx.currentTime;
      blip(880, 220, 0.08, "square", 0.07);
    },
    enemyShoot: function () { blip(330, 110, 0.12, "sawtooth", 0.05); },
    hit: function () { blip(520, 160, 0.06, "triangle", 0.1); },
    explode: function () { boom(0.3, 0.3); blip(240, 40, 0.25, "sawtooth", 0.12); },
    bigExplode: function () { boom(0.8, 0.5, 1400); blip(160, 28, 0.7, "sawtooth", 0.2); },
    hurt: function () { boom(0.25, 0.35, 900); blip(200, 60, 0.3, "square", 0.18); },
    dash: function () { blip(180, 720, 0.16, "sawtooth", 0.1); },
    pickup: function () { blip(523, 1046, 0.09, "square", 0.14); setTimeout(function(){ blip(784, 1568, 0.12, "square", 0.12); }, 70); },
    bomb: function () { boom(1.1, 0.55, 3000); },
    spawn: function () { blip(60, 300, 0.25, "sine", 0.07); },
    ui: function () { blip(660, 880, 0.05, "square", 0.1); },
    typeTick: function () { blip(990, 880, 0.018, "square", 0.025); },
    // Tecleo de terminal antiguo (arranque): clic corto con pitch variable
    terminalTick: function () {
      if (!ctx || !sfxOn) return;
      var f = 360 + Math.random() * 240;
      blip(f, f * 0.7, 0.02, "square", 0.05);
    },
    // Encendido de terminal ochentero: golpe + zumbido del tubo + flyback + beeps
    terminalOn: function () {
      if (!ctx || !sfxOn) return;
      var t = ctx.currentTime;
      boom(0.55, 0.4, 520);                                   // "thunk" de encendido
      var o = ctx.createOscillator(), g = ctx.createGain();   // zumbido grave con wobble (CRT)
      o.type = "sine";
      o.frequency.setValueAtTime(64, t);
      o.frequency.linearRampToValueAtTime(122, t + 0.28);
      o.frequency.linearRampToValueAtTime(108, t + 0.95);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.3, t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.15);
      o.connect(g); g.connect(sfxBus);
      o.start(t); o.stop(t + 1.25);
      var w = ctx.createOscillator(), wg = ctx.createGain();  // silbido de flyback (agudo, suave)
      w.type = "triangle"; w.frequency.value = 8200;
      wg.gain.setValueAtTime(0.0001, t);
      wg.gain.exponentialRampToValueAtTime(0.013, t + 0.18);
      wg.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
      w.connect(wg); wg.connect(sfxBus);
      w.start(t); w.stop(t + 1.35);
      setTimeout(function () { blip(523, 523, 0.07, "square", 0.13); }, 720);  // beeps de OK
      setTimeout(function () { blip(784, 784, 0.10, "square", 0.14); }, 880);
    },
    bossRoar: function () { blip(110, 35, 0.9, "sawtooth", 0.3); boom(0.9, 0.4, 700); },
    gameover: function () {
      var notes = [392, 330, 262, 196];
      notes.forEach(function (f, k) { setTimeout(function(){ blip(f, f * 0.5, 0.5, "triangle", 0.2); }, k * 260); });
    },
    fanfare: function () {
      var notes = [523, 659, 784, 1046, 784, 1046];
      notes.forEach(function (f, k) { setTimeout(function(){ blip(f, f, 0.22, "square", 0.16); }, k * 130); });
    }
  };

  /* --- API ------------------------------------------------------ */
  return {
    unlock: unlock,
    playSong: playSong,
    stopMusic: stopMusic,
    sfx: sfx,
    setMusic: function (on) {
      musicOn = on;
      if (ctx) musicBus.gain.value = on ? 0.6 : 0;
    },
    setSfx: function (on) {
      sfxOn = on;
      if (ctx) sfxBus.gain.value = on ? 0.8 : 0;
    },
    duck: function () { // baja el volumen un instante (pausa, golpe gordo)
      if (!ctx) return;
      musicBus.gain.cancelScheduledValues(ctx.currentTime);
      musicBus.gain.setValueAtTime(musicOn ? 0.18 : 0, ctx.currentTime);
      musicBus.gain.linearRampToValueAtTime(musicOn ? 0.6 : 0, ctx.currentTime + 1.2);
    }
  };
})();
