/* ============================================================
   NEON EXODUS 2087 — main.js
   Núcleo: bucle de juego, máquina de estados, puntuación,
   combos, guardado local y coordinación de todos los módulos.
   ============================================================ */
"use strict";

NX.game = (function () {
  var canvas, ctx;
  var W = 0, H = 0, DPR = 1;

  var state = "boot";   // boot | title | story | play | pause | gameover | victory
  var time = 0;
  var lastFrame = 0;

  var settings = { music: true, sfx: true, crt: true, shake: true };
  var hiscore = 0;

  var score = 0, sectorStartScore = 0;
  var comboKills = 0, comboT = 0, mult = 1;
  var sectorIdx = 0;
  var boss = null;
  var runToken = 0;     // invalida timeouts pendientes al reiniciar/salir
  var menuReturn = "title";

  /* ---------- Guardado ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(NX.SAVE_KEY);
      if (raw) {
        var d = JSON.parse(raw);
        hiscore = d.hiscore || 0;
        if (d.settings) settings = Object.assign(settings, d.settings);
      }
    } catch (e) { /* almacenamiento bloqueado: jugamos sin guardar */ }
  }
  function save() {
    try {
      localStorage.setItem(NX.SAVE_KEY, JSON.stringify({ hiscore: hiscore, settings: settings }));
    } catch (e) { /* sin persistencia */ }
  }

  function applySettings() {
    NX.audio.setMusic(settings.music);
    NX.audio.setSfx(settings.sfx);
    NX.fx.setShake(settings.shake);
    NX.ui.refreshOptions(settings);
  }

  /* ---------- Lienzo ---------- */
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, NX.MAX_DPR);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    NX.fx.onResize();
  }

  /* ---------- Temporizador con token ---------- */
  function later(ms, fn) {
    var tk = runToken;
    setTimeout(function () { if (tk === runToken) fn(); }, ms);
  }

  /* ---------- Flujo de partida ---------- */
  function goTitle() {
    runToken++;
    state = "title";
    menuReturn = "title";
    boss = null;
    NX.ui.showHud(false);
    NX.ui.showBoss(false);
    NX.ui.setHiscore(hiscore);
    NX.ui.show("screen-title");
    NX.fx.reset();
    NX.audio.playSong("title");
  }

  function newRun() {
    runToken++;
    score = 0; sectorStartScore = 0;
    comboKills = 0; comboT = 0; mult = 1;
    sectorIdx = 0;
    state = "story";
    NX.ui.showHud(false);
    NX.audio.stopMusic();
    var lines = NX.story.intro.concat(NX.story.sectorIntro[0]);
    NX.ui.playDialogue(lines, function () { startSector(0); });
  }

  function startSector(idx) {
    runToken++;
    sectorIdx = idx;
    sectorStartScore = score;
    boss = null;
    comboKills = 0; comboT = 0; mult = 1;
    NX.fx.reset();
    NX.entities.resetWorld(W, H);
    NX.levels.start(idx);
    NX.ui.hideAll();
    NX.ui.showHud(true);
    NX.ui.showBoss(false);
    NX.ui.setSector(NX.levels.current().name);
    NX.ui.setScore(score);
    NX.ui.setCombo(1, 0);
    NX.ui.setHP(1);
    NX.audio.playSong(NX.levels.current().song);
    state = "play";
  }

  function nextSector() {
    var nxt = sectorIdx + 1;
    state = "story";
    NX.ui.showHud(false);
    var lines = NX.story.sectorOutro[sectorIdx].concat(NX.story.sectorIntro[nxt]);
    NX.ui.playDialogue(lines, function () { startSector(nxt); });
  }

  function retrySector() {
    score = sectorStartScore;
    startSector(sectorIdx);
  }

  function quitToTitle() {
    goTitle();
  }

  function togglePause() {
    if (state === "play") {
      state = "pause";
      menuReturn = "pause";
      NX.audio.duck();
      NX.ui.show("screen-pause");
    } else if (state === "pause") {
      state = "play";
      menuReturn = "title";
      NX.ui.hideAll();
    }
  }

  function backToMenuScreen() {
    if (menuReturn === "pause" && state === "pause") NX.ui.show("screen-pause");
    else if (menuReturn === "victory") NX.ui.show("screen-victory");
    else NX.ui.show("screen-title");
  }

  /* ---------- Puntuación y combo ---------- */
  function addScore(points, x, y) {
    var total = points * mult;
    score += total;
    NX.ui.setScore(score);
    if (x !== undefined) {
      NX.fx.textPop(x, y, "+" + total, mult > 1 ? "#ff2bd6" : "#ffd319", mult >= 4);
    }
  }

  function bumpCombo() {
    comboKills++;
    comboT = NX.COMBO_WINDOW;
    var newMult = Math.min(NX.COMBO_MAX, 1 + Math.floor(comboKills / NX.COMBO_STEP));
    if (newMult !== mult) {
      mult = newMult;
      if (mult > 1) {
        NX.fx.textPop(W * 0.5, H * 0.3, "COMBO ×" + mult, "#ff2bd6", true);
        NX.audio.sfx.pickup();
      }
    }
    NX.ui.setCombo(mult, comboKills);
  }

  /* ---------- Callbacks del mundo ---------- */
  var api = {
    onEnemyKilled: function (e) {
      bumpCombo();
      addScore(e.score, e.x, e.y);
    },
    onGraze: function () {
      addScore(5);
    },
    onPlayerHurt: function () {
      comboKills = 0; comboT = 0;
      if (mult > 1) NX.fx.textPop(W * 0.5, H * 0.34, "COMBO PERDIDO", "#ff3b3b", false);
      mult = 1;
      NX.ui.setCombo(1, 0);
    },
    onPlayerDeath: function () {
      NX.ui.showBoss(false);
      NX.audio.stopMusic();
      NX.audio.sfx.gameover();
      var isRecord = score > hiscore;
      if (isRecord) { hiscore = score; save(); }
      later(1700, function () {
        state = "gameover";
        NX.ui.showHud(false);
        NX.ui.showGameOver(score, isRecord);
      });
    },
    onPowerup: function (type) {
      addScore(25);
    },
    onWaveStart: function (n, total) {
      NX.ui.setWave("OLEADA " + n + " / " + total);
      NX.fx.textPop(W * 0.5, H * 0.26, "OLEADA " + n, "#19e6ff", true);
    },
    onSectorCleared: function () {
      addScore(500);
      NX.fx.textPop(W * 0.5, H * 0.3, "SECTOR LIBERADO +500", "#2bff88", true);
      NX.audio.sfx.fanfare();
      later(1400, nextSector);
    },
    onBossStart: function () {
      state = "story";
      NX.ui.showHud(false);
      NX.audio.duck();
      NX.ui.playDialogue(NX.story.bossIntro, function () {
        state = "play";
        NX.ui.showHud(true);
        NX.audio.playSong("boss");
        NX.audio.sfx.bossRoar();
        boss = NX.entities.materialize("boss", W * 0.5, H * 0.22);
        NX.ui.showBoss(true);
        NX.ui.setBossHp(1);
        NX.ui.setWave("PROTOCOLO DE DEFENSA TOTAL");
        NX.fx.shake(10, 0.8);
        NX.fx.flash("#8a2bff", 0.4);
      });
    },
    onBossHp: function (frac) { NX.ui.setBossHp(frac); },
    onBossPhase: function (phase) {
      NX.fx.textPop(W * 0.5, H * 0.3, phase === 1 ? "MADRE: «INSOLENTE.»" : "MADRE: «¡¡BASTA!!»", "#ff3b3b", true);
    },
    onBossDefeated: function (e) {
      NX.levels.bossDefeated();
      boss = null;
      addScore(NX.ENEMIES.boss.score, e.x, e.y);
      NX.ui.showBoss(false);
      NX.entities.clearHostiles();
      NX.audio.stopMusic();
      NX.audio.sfx.bigExplode();
      NX.fx.flash("#ffffff", 0.85);
      NX.fx.shake(18, 1.0);
      var isRecord = score > hiscore;
      if (isRecord) { hiscore = score; save(); }
      later(2000, function () {
        state = "story";
        NX.ui.showHud(false);
        NX.audio.playSong("ending");
        NX.ui.playDialogue(NX.story.ending, function () {
          state = "victory";
          menuReturn = "victory";
          NX.audio.sfx.fanfare();
          NX.ui.showVictory(score, isRecord);
        });
      });
    },
    isRunning: function () { return state === "play"; }
  };

  /* ---------- Ajustes ---------- */
  function toggleSetting(key) {
    settings[key] = !settings[key];
    save();
    applySettings();
  }
  function wipeRecords() {
    hiscore = 0;
    save();
    NX.ui.setHiscore(0);
    NX.audio.sfx.hurt();
  }

  /* ---------- Bucle principal ---------- */
  function frame(ts) {
    requestAnimationFrame(frame);
    if (!lastFrame) lastFrame = ts;
    var dt = Math.min((ts - lastFrame) / 1000, 0.033);
    lastFrame = ts;
    time += dt;

    var palIdx = (state === "play" || state === "pause" || state === "gameover") ? sectorIdx : 0;
    var pal = NX.PALETTES[NX.clamp(palIdx, 0, NX.PALETTES.length - 1)];

    if (state === "play") {
      NX.levels.update(dt, W, H);
      NX.entities.update(dt, W, H);
      NX.fx.update(dt);

      if (comboT > 0) {
        comboT -= dt;
        if (comboT <= 0 && comboKills > 0) {
          comboKills = 0; mult = 1;
          NX.ui.setCombo(1, 0);
        }
      }

      var p = NX.world.player;
      if (p) {
        NX.ui.setHP(p.hp / NX.PLAYER.hpMax);
        var fxs = [];
        if (p.power) fxs.push(NX.POWERUPS[p.power].label + " " + Math.ceil(p.powerT));
        if (p.shield > 0) fxs.push("ESCUDO " + Math.ceil(p.shield));
        if (p.slowmoT > 0) fxs.push("T-BALA " + Math.ceil(p.slowmoT));
        NX.ui.setPower(fxs.join("  "), p.power ? NX.POWERUPS[p.power].color : "#2bff88");
      }
    } else if (state === "title" || state === "victory" || state === "story") {
      NX.fx.update(dt);
    }

    /* --- render --- */
    var shake = NX.fx.getShake();
    ctx.save();
    ctx.translate(shake.x, shake.y);

    var intensity = state === "play" ? Math.min(1, mult / 4) : 0.3;
    NX.fx.drawBackground(ctx, W, H, dt, time, pal, intensity, palIdx);

    if (state === "play" || state === "pause" || state === "gameover") {
      NX.entities.draw(ctx, time);
      NX.fx.draw(ctx);
      if (state === "play") NX.fx.drawSticks(ctx);
    } else {
      NX.fx.draw(ctx);
    }

    ctx.restore();
    NX.fx.drawFlash(ctx, W, H);
  }

  /* ---------- Arranque ---------- */
  function init() {
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    load();
    applySettings();
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", function () { setTimeout(resize, 300); });

    NX.input.init(canvas);
    NX.ui.bind();

    // autopausa al perder el foco (regla de QA: nunca mueras en segundo plano)
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && state === "play") togglePause();
    });

    // primer gesto: desbloquear audio en iOS
    var unlockOnce = function () {
      NX.audio.unlock();
      document.removeEventListener("pointerdown", unlockOnce);
      document.removeEventListener("keydown", unlockOnce);
    };
    document.addEventListener("pointerdown", unlockOnce);
    document.addEventListener("keydown", unlockOnce);

    NX.ui.bootSequence(function () {
      NX.audio.unlock();
      goTitle();
    });

    requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* API pública */
  api.newRun = newRun;
  api.retrySector = retrySector;
  api.quitToTitle = quitToTitle;
  api.togglePause = togglePause;
  api.backToMenuScreen = backToMenuScreen;
  api.toggleSetting = toggleSetting;
  api.wipeRecords = wipeRecords;
  return api;
})();
