/* ============================================================
   NEON EXODUS 2087 — gamecenter.js  (OPCIONAL)
   Puente con Apple Game Center. Es 100% OPCIONAL y a prueba de
   fallos: si no hay plugin de Game Center instalado (que es el
   caso por defecto), NO hace absolutamente nada — ni en web ni en
   la app. Solo se activa si detecta el plugin en Capacitor.

   Para activarlo de verdad hay que instalar un plugin nativo en el
   Mac (ver IOS-DEPLOY.md, sección Game Center). Mientras tanto este
   archivo es inofensivo y deja el cableado listo.

   Engancha en NX.ui.showGameOver / showVictory (que reciben la
   puntuación) para enviar el marcador, sin tocar el motor del juego.
   ============================================================ */
"use strict";
(function () {
  var Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;

  var P = Cap.Plugins || {};
  // Soporta los nombres de plugin más habituales; si ninguno existe, no-op.
  var GC = P.CapacitorGameConnect || P.GameConnect || P.GameServices || P.CapacitorGameServices || null;
  if (!GC) return;

  var LEADERBOARD_ID = "com.clickcomun.neonexodus.highscores";
  var signedIn = false;

  function signIn() {
    if (signedIn) return Promise.resolve();
    var fn = GC.signIn || GC.login || GC.authenticate;
    if (!fn) return Promise.resolve();
    return Promise.resolve(fn.call(GC, {})).then(function () { signedIn = true; }).catch(function () {});
  }

  function submit(score) {
    if (!score || score <= 0) return;
    signIn().then(function () {
      try {
        if (GC.submitScore) {
          // game-connect: { leaderboardID, totalScoreAmount }
          GC.submitScore({ leaderboardID: LEADERBOARD_ID, totalScoreAmount: Math.floor(score) });
        } else if (GC.reportScore) {
          GC.reportScore({ leaderboardId: LEADERBOARD_ID, score: Math.floor(score) });
        }
      } catch (e) {}
    });
  }

  // Sin auto-login al arrancar: Apple penaliza los prompts de inicio de sesión
  // no solicitados. El signIn se hace de forma perezosa al enviar la 1.ª puntuación.

  // Envuelve los puntos donde el juego ya conoce la puntuación final
  function wrap(name) {
    if (!window.NX || !NX.ui || !NX.ui[name]) { return false; }
    var orig = NX.ui[name];
    NX.ui[name] = function (score) {
      try { submit(score); } catch (e) {}
      return orig.apply(this, arguments);
    };
    return true;
  }
  function wireUp() {
    var ok = wrap("showGameOver") && wrap("showVictory");
    if (!ok) setTimeout(wireUp, 300);
  }
  wireUp();

  // Expone una API mínima por si quieres un botón "ver marcadores"
  window.NX = window.NX || {};
  NX.gc = {
    showLeaderboard: function () {
      try {
        var fn = GC.showLeaderboard || GC.showLeaderboards;
        if (fn) fn.call(GC, { leaderboardID: LEADERBOARD_ID });
      } catch (e) {}
    }
  };
})();
