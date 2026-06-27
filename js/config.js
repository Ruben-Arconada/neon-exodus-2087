/* ============================================================
   NEON EXODUS 2087 — config.js
   Diseño de juego: constantes, balance y utilidades comunes.
   Todo el juego vive en el espacio de nombres NX.
   ============================================================ */
"use strict";

window.NX = {};

NX.VERSION = "1.0.0";
NX.SAVE_KEY = "nx2087_save_v1";

/* Utilidades --------------------------------------------------- */
NX.rand = function (a, b) { return a + Math.random() * (b - a); };
NX.randInt = function (a, b) { return Math.floor(NX.rand(a, b + 1)); };
NX.pick = function (arr) { return arr[(Math.random() * arr.length) | 0]; };
NX.clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
NX.lerp = function (a, b, t) { return a + (b - a) * t; };
NX.dist2 = function (ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
NX.angleTo = function (ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); };
NX.TAU = Math.PI * 2;

/* Paletas por sector (dirección de arte) ----------------------- */
/* [fondo, horizonte/sol, rejilla, acento1, acento2] */
NX.PALETTES = [
  { bg: "#0a0014", sun: "#ff2bd6", grid: "#19e6ff", a1: "#ff2bd6", a2: "#19e6ff", sky: "#1b0533" }, // Arrabal Neón
  { bg: "#120800", sun: "#ffd319", grid: "#ff7a18", a1: "#ffd319", a2: "#19e6ff", sky: "#2b1003" }, // Mercado de Datos
  { bg: "#001408", sun: "#2bff88", grid: "#19ffe0", a1: "#2bff88", a2: "#ccff2b", sky: "#03260f" }, // Cloacas Cromadas
  { bg: "#14000a", sun: "#ff3b3b", grid: "#8a2bff", a1: "#ff3b3b", a2: "#ff2bd6", sky: "#2b0314" }, // Torre Helios
  { bg: "#02060f", sun: "#3a6cff", grid: "#2bb8ff", a1: "#6c8cff", a2: "#a9d8ff", sky: "#06122e" }, // Espejo de Datos
  { bg: "#06121a", sun: "#17c7c0", grid: "#1fe0cf", a1: "#2bf0d6", a2: "#c7a4ff", sky: "#031f24" }, // Jardín de Promesas
  { bg: "#160a06", sun: "#ffb066", grid: "#ff8fae", a1: "#ffc98a", a2: "#d6a0ff", sky: "#2b1410" }, // Memorial de Vega
  { bg: "#08001c", sun: "#f4f0ff", grid: "#8a2bff", a1: "#b388ff", a2: "#19e6ff", sky: "#160338" }  // Núcleo MADRE
];

/* Jugador ------------------------------------------------------ */
NX.PLAYER = {
  radius: 11,
  speed: 215,          // px/s a escala 1
  hpMax: 100,
  fireRate: 0.15,      // s entre disparos
  bulletSpeed: 560,
  bulletDmg: 1,
  dashSpeed: 640,
  dashTime: 0.22,
  dashCooldown: 1.1,
  hurtInvuln: 0.9,
  contactDamage: 18    // daño que recibe por contacto con enemigo
};

/* Mejoras (UX: iconos hexagonales con letra) ------------------- */
NX.POWERUPS = {
  TRIPLE: { letter: "T", color: "#19e6ff", dur: 9, label: "TRIPLE" },
  RAPID:  { letter: "R", color: "#ffd319", dur: 9, label: "RÁPIDO" },
  SHIELD: { letter: "E", color: "#2bff88", dur: 8, label: "ESCUDO" },
  BOMB:   { letter: "B", color: "#ff3b3b", dur: 0, label: "BOMBA" },
  SLOWMO: { letter: "L", color: "#ff2bd6", dur: 5, label: "T-BALA" },
  MED:    { letter: "+", color: "#f4f0ff", dur: 0, label: "VIDA" }
};
NX.POWERUP_DROP = 0.13;
NX.POWERUP_LIFE = 9;     // s en el suelo

/* Enemigos ----------------------------------------------------- */
NX.ENEMIES = {
  drone:    { hp: 2,  speed: 95,  radius: 12, score: 100, color: "#ff2bd6" },
  spinner:  { hp: 3,  speed: 120, radius: 11, score: 150, color: "#19e6ff", fireRate: 1.7, bulletSpeed: 165 },
  tank:     { hp: 11, speed: 38,  radius: 21, score: 350, color: "#ffd319", fireRate: 2.4, bulletSpeed: 140 },
  wraith:   { hp: 4,  speed: 150, radius: 12, score: 250, color: "#8a2bff", teleportEvery: 2.6 },
  splitter: { hp: 5,  speed: 70,  radius: 16, score: 200, color: "#2bff88" },
  mini:     { hp: 1,  speed: 150, radius: 7,  score: 50,  color: "#2bff88" },
  turret:   { hp: 8,  speed: 0,   radius: 15, score: 300, color: "#ff7a18", fireRate: 2.1, bulletSpeed: 175 },
  // — Sectores 5-7: enemigos-firma y mini-jefes (no llevan boss:true) —
  mirror:      { hp: 5,   speed: 130, radius: 12, score: 280,   color: "#b388ff", fireRate: 1.6, bulletSpeed: 170 }, // reflejo de VEGA (te imita con retardo)
  leech:       { hp: 6,   speed: 55,  radius: 14, score: 320,   color: "#8a2bff" },                                   // sonda de MADRE: te ancla, no dispara
  echo_warden: { hp: 70,  speed: 48,  radius: 30, score: 2500,  color: "#8a2bff" },                                   // mini-jefe (2 fases) del Jardín
  vega_prime:  { hp: 110, speed: 60,  radius: 34, score: 6000,  color: "#f4f0ff" },                                   // mini-jefe: la VEGA original (2 fases)
  boss:        { hp: 300, speed: 42,  radius: 52, score: 10000, color: "#f4f0ff" }
};
NX.ENEMY_BULLET_R = 5;
NX.SPAWN_TELEGRAPH = 0.8;  // s de aviso antes de materializarse

/* Combo -------------------------------------------------------- */
NX.COMBO_WINDOW = 3.2;     // s sin matar para perder combo
NX.COMBO_STEP = 5;         // bajas por nivel de multiplicador
NX.COMBO_MAX = 8;

/* Render ------------------------------------------------------- */
NX.MAX_DPR = 2;
NX.STAR_COUNT = 70;
NX.GRID_SPEED = 42;
