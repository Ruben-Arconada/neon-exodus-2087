/* ============================================================
   NEON EXODUS 2087 — levels.js
   Diseño de niveles: 5 sectores, oleadas con ritmo de arcade.
   Curva pensada en mesa: enseñar → mezclar → presionar → jefe.
   ============================================================ */
"use strict";

NX.levels = (function () {

  /* Una oleada es una lista de [tipo, cantidad].                 */
  var SECTORS = [
    {
      name: "SECTOR 1 // ARRABAL NEÓN",
      song: "sector0",
      waves: [
        [["drone", 5]],
        [["drone", 6], ["spinner", 2]],
        [["drone", 7], ["spinner", 3], ["splitter", 1]]
      ]
    },
    {
      name: "SECTOR 2 // MERCADO DE DATOS",
      song: "sector1",
      waves: [
        [["drone", 5], ["turret", 1]],
        [["spinner", 4], ["splitter", 2]],
        [["drone", 7], ["turret", 2], ["spinner", 2]],
        [["splitter", 3], ["drone", 6], ["turret", 1]]
      ]
    },
    {
      name: "SECTOR 3 // CLOACAS CROMADAS",
      song: "sector2",
      waves: [
        [["wraith", 2], ["drone", 4]],
        [["splitter", 3], ["wraith", 2]],
        [["spinner", 3], ["wraith", 3], ["turret", 1]],
        [["drone", 8], ["wraith", 3], ["splitter", 2]]
      ]
    },
    {
      name: "SECTOR 4 // TORRE HELIOS",
      song: "sector3",
      waves: [
        [["tank", 1], ["drone", 5]],
        [["tank", 2], ["spinner", 3]],
        [["wraith", 3], ["tank", 1], ["turret", 2]],
        [["tank", 2], ["splitter", 3], ["spinner", 3], ["drone", 4]]
      ]
    },
    {
      name: "SECTOR 5 // NÚCLEO M.A.D.R.E.",
      song: "sector4",
      waves: [
        [["wraith", 2], ["tank", 1], ["spinner", 3]],
        [["drone", 6], ["tank", 2], ["wraith", 2], ["turret", 2]]
      ],
      boss: true
    }
  ];

  var sector = 0;
  var waveIdx = 0;
  var spawnList = [];      // tipos pendientes de soltar en la oleada actual
  var spawnT = 0;
  var state = "idle";      // idle | spawning | fighting | boss | done
  var MAX_ALIVE = 13;      // tope de enemigos simultáneos (QA: legibilidad y fps)

  function buildSpawnList(waveDef) {
    var list = [];
    for (var i = 0; i < waveDef.length; i++) {
      for (var k = 0; k < waveDef[i][1]; k++) list.push(waveDef[i][0]);
    }
    // barajar para que las mezclas entren intercaladas
    for (var j = list.length - 1; j > 0; j--) {
      var r = (Math.random() * (j + 1)) | 0;
      var tmp = list[j]; list[j] = list[r]; list[r] = tmp;
    }
    return list;
  }

  function start(idx) {
    sector = idx;
    waveIdx = -1;
    state = "spawning";
    nextWave();
  }

  function nextWave() {
    waveIdx++;
    var sec = SECTORS[sector];
    if (waveIdx >= sec.waves.length) {
      if (sec.boss) {
        state = "boss";
        NX.game.onBossStart();
      } else {
        state = "done";
        NX.game.onSectorCleared();
      }
      return;
    }
    spawnList = buildSpawnList(sec.waves[waveIdx]);
    spawnT = 0.6;
    state = "spawning";
    NX.game.onWaveStart(waveIdx + 1, sec.waves.length);
  }

  function update(dt, w, h) {
    if (state === "idle" || state === "done") return;
    var alive = NX.world.enemies.length + NX.world.portals.length;

    if (state === "spawning") {
      spawnT -= dt;
      if (spawnT <= 0 && spawnList.length > 0 && alive < MAX_ALIVE) {
        spawnT = NX.rand(0.4, 0.8);
        NX.entities.spawnEdge(spawnList.pop(), w, h);
      }
      if (spawnList.length === 0) state = "fighting";
    } else if (state === "fighting") {
      if (alive === 0) nextWave();
    } else if (state === "boss") {
      // main.js gestiona la materialización y la muerte del jefe
    }
  }

  function bossDefeated() { state = "done"; }

  return {
    SECTORS: SECTORS,
    start: start,
    update: update,
    bossDefeated: bossDefeated,
    current: function () { return SECTORS[sector]; },
    sectorIndex: function () { return sector; },
    waveNumber: function () { return waveIdx + 1; },
    waveTotal: function () { return SECTORS[sector].waves.length; },
    isBossPhase: function () { return state === "boss"; },
    count: SECTORS.length
  };
})();
