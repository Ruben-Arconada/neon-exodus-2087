/* ============================================================
   NEON EXODUS 2087 — ui.js
   UX/UI: gestión de pantallas DOM, secuencia de arranque,
   terminal narrativo con efecto máquina de escribir, HUD
   y menús. El texto vive en el DOM para que se lea nítido
   en pantallas retina (decisión de UX).
   ============================================================ */
"use strict";

NX.ui = (function () {
  var $ = function (id) { return document.getElementById(id); };

  var screens = ["screen-boot", "screen-title", "screen-howto", "screen-options",
    "screen-credits", "screen-story", "screen-pause", "screen-gameover", "screen-victory"];

  function show(id) {
    for (var i = 0; i < screens.length; i++) {
      $(screens[i]).classList.toggle("hidden", screens[i] !== id);
    }
  }
  function hideAll() { show("__none__"); }

  function showHud(on) { $("hud").classList.toggle("hidden", !on); }

  /* ---------- Secuencia de arranque ---------- */
  function bootSequence(onDone) {
    show("screen-boot");
    var el = $("boot-text");
    el.textContent = "";
    var lines = NX.story.boot;
    var li = 0, done = false;

    function nextLine() {
      if (li >= lines.length) { done = true; return; }
      el.textContent += lines[li] + "\n";
      li++;
      setTimeout(nextLine, li >= lines.length - 1 ? 400 : NX.rand(120, 380));
    }
    nextLine();

    function go() {
      $("screen-boot").removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", goKey);
      onDone();
    }
    function goKey(e) { if (!e.repeat) go(); }
    $("screen-boot").addEventListener("pointerdown", go);
    window.addEventListener("keydown", goKey);
  }

  /* ---------- Terminal narrativo ---------- */
  var dlg = { lines: null, idx: 0, charIdx: 0, timer: null, onDone: null, typing: false };

  function playDialogue(lines, onDone) {
    dlg.lines = lines;
    dlg.idx = 0;
    dlg.onDone = onDone;
    show("screen-story");
    typeLine();
  }

  function typeLine() {
    var line = dlg.lines[dlg.idx];
    $("story-speaker").textContent = "» " + line.who;
    $("story-speaker").style.color = line.color;
    $("story-text").textContent = "";
    dlg.charIdx = 0;
    dlg.typing = true;
    clearInterval(dlg.timer);
    dlg.timer = setInterval(function () {
      dlg.charIdx += 1;
      $("story-text").textContent = line.text.slice(0, dlg.charIdx);
      if (dlg.charIdx % 3 === 0) NX.audio.sfx.typeTick();
      if (dlg.charIdx >= line.text.length) {
        clearInterval(dlg.timer);
        dlg.typing = false;
      }
    }, 24);
  }

  function advanceDialogue() {
    if (!dlg.lines) return;
    if (dlg.typing) {
      // primer toque: completa la línea (regla sagrada de UX)
      clearInterval(dlg.timer);
      $("story-text").textContent = dlg.lines[dlg.idx].text;
      dlg.typing = false;
      return;
    }
    dlg.idx++;
    NX.audio.sfx.ui();
    if (dlg.idx >= dlg.lines.length) {
      var cb = dlg.onDone;
      dlg.lines = null;
      hideAll();
      if (cb) cb();
    } else {
      typeLine();
    }
  }

  /* ---------- HUD ---------- */
  function pad6(n) { n = Math.floor(n); var s = "" + n; while (s.length < 6) s = "0" + s; return s; }

  function setScore(v) { $("hud-score").textContent = pad6(v); }
  function setCombo(mult, kills) {
    $("hud-combo").textContent = mult > 1 ? ("COMBO ×" + mult) : "";
  }
  function setSector(name) { $("hud-sector").textContent = name; }
  function setWave(txt) { $("hud-wave").textContent = txt; }
  function setHP(frac) {
    var f = $("hud-hp-fill");
    f.style.width = (NX.clamp(frac, 0, 1) * 100) + "%";
    f.style.background = frac < 0.3
      ? "linear-gradient(90deg,#ff3b3b,#ff7a18)"
      : "linear-gradient(90deg,#19e6ff,#2bff88)";
  }
  function setPower(txt, color) {
    var el = $("hud-power");
    el.textContent = txt || "";
    if (color) el.style.color = color;
  }
  function showBoss(on) { $("boss-bar").classList.toggle("hidden", !on); }
  function setBossHp(frac) { $("boss-hp-fill").style.width = (NX.clamp(frac, 0, 1) * 100) + "%"; }

  /* ---------- Título / fin ---------- */
  function setHiscore(v) {
    $("title-hiscore").textContent = v > 0 ? ("RÉCORD  " + pad6(v)) : "SIN RÉCORD — ESCRIBE LA HISTORIA";
  }

  function showGameOver(score, isRecord) {
    $("go-score").textContent = pad6(score);
    $("go-flavor").textContent = NX.pick(NX.story.gameOverLines);
    $("go-record").classList.toggle("hidden", !isRecord);
    show("screen-gameover");
  }

  function showVictory(score, isRecord) {
    $("v-score").textContent = pad6(score);
    $("v-record").classList.toggle("hidden", !isRecord);
    show("screen-victory");
  }

  /* ---------- Créditos ---------- */
  function buildCredits() {
    var box = $("credits-body");
    box.innerHTML = "";
    NX.story.credits.forEach(function (c) {
      var d = document.createElement("div");
      d.className = "credit";
      var role = document.createElement("div"); role.className = "role"; role.textContent = c.role;
      var name = document.createElement("div"); name.className = "name"; name.textContent = c.name;
      var note = document.createElement("div"); note.className = "note"; note.textContent = c.note;
      d.appendChild(role); d.appendChild(name); d.appendChild(note);
      box.appendChild(d);
    });
  }

  /* ---------- Opciones ---------- */
  function refreshOptions(s) {
    $("o-music").textContent = "MÚSICA: " + (s.music ? "SÍ" : "NO");
    $("o-sfx").textContent = "EFECTOS: " + (s.sfx ? "SÍ" : "NO");
    $("o-crt").textContent = "FILTRO CRT: " + (s.crt ? "SÍ" : "NO");
    $("o-shake").textContent = "VIBRACIÓN PANTALLA: " + (s.shake ? "SÍ" : "NO");
    document.body.classList.toggle("no-crt", !s.crt);
  }

  /* ---------- Enlaces de botones ---------- */
  function bind() {
    buildCredits();

    function on(id, fn) {
      $(id).addEventListener("click", function (e) {
        e.preventDefault();
        NX.audio.unlock();
        NX.audio.sfx.ui();
        fn();
      });
    }

    on("m-start", function () { NX.game.newRun(); });
    on("m-howto", function () { show("screen-howto"); });
    on("m-options", function () { show("screen-options"); });
    on("m-credits", function () { show("screen-credits"); });

    var backs = document.querySelectorAll("[data-back]");
    for (var i = 0; i < backs.length; i++) {
      backs[i].addEventListener("click", function (e) {
        e.preventDefault();
        NX.audio.sfx.ui();
        NX.game.backToMenuScreen();
      });
    }

    on("o-music", function () { NX.game.toggleSetting("music"); });
    on("o-sfx", function () { NX.game.toggleSetting("sfx"); });
    on("o-crt", function () { NX.game.toggleSetting("crt"); });
    on("o-shake", function () { NX.game.toggleSetting("shake"); });
    on("o-wipe", function () { NX.game.wipeRecords(); });

    on("btn-pause", function () { NX.game.togglePause(); });
    on("p-resume", function () { NX.game.togglePause(); });
    on("p-restart", function () { NX.game.retrySector(); });
    on("p-quit", function () { NX.game.quitToTitle(); });

    on("go-retry", function () { NX.game.retrySector(); });
    on("go-title", function () { NX.game.quitToTitle(); });
    on("v-credits", function () { show("screen-credits"); });
    on("v-title", function () { NX.game.quitToTitle(); });

    $("screen-story").addEventListener("pointerdown", function (e) {
      e.preventDefault();
      advanceDialogue();
    });
    window.addEventListener("keydown", function (e) {
      if (!e.repeat && (e.code === "Enter" || e.code === "Space")) {
        if (dlg.lines) advanceDialogue();
      }
    });
  }

  return {
    show: show, hideAll: hideAll, showHud: showHud,
    bootSequence: bootSequence,
    playDialogue: playDialogue,
    setScore: setScore, setCombo: setCombo, setSector: setSector, setWave: setWave,
    setHP: setHP, setPower: setPower, showBoss: showBoss, setBossHp: setBossHp,
    setHiscore: setHiscore, showGameOver: showGameOver, showVictory: showVictory,
    refreshOptions: refreshOptions,
    bind: bind,
    inDialogue: function () { return !!dlg.lines; }
  };
})();
