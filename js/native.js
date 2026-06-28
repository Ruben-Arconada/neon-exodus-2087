/* ============================================================
   NEON EXODUS 2087 — native.js
   Puente opcional con Capacitor (solo activo dentro de la app iOS).
   En web es un no-op total: detecta window.Capacitor y, si existe,
   añade vibración háptica, oculta el splash y gestiona el ciclo de
   vida nativo. No toca nada del juego si corre en navegador.
   Refuerza la "funcionalidad mínima" que exige la guía 4.2 de Apple.
   ============================================================ */
"use strict";
(function () {
  var Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;

  var Plugins = Cap.Plugins || {};
  var Haptics = Plugins.Haptics;
  var SplashScreen = Plugins.SplashScreen;
  var StatusBar = Plugins.StatusBar;
  var App = Plugins.App;

  // Oculta la pantalla de carga una vez el juego está listo
  function hideSplash() { try { SplashScreen && SplashScreen.hide(); } catch (e) {} }
  if (document.readyState === "complete") setTimeout(hideSplash, 600);
  else window.addEventListener("load", function () { setTimeout(hideSplash, 600); });

  // Barra de estado en estilo claro sobre fondo oscuro
  try { StatusBar && StatusBar.setStyle({ style: "DARK" }); } catch (e) {}

  // Pausa el juego cuando la app pasa a segundo plano
  try {
    App && App.addListener && App.addListener("appStateChange", function (st) {
      if (!st.isActive && window.NX && NX.game && NX.game.togglePause) {
        try { if (NX.game.isRunning && NX.game.isRunning()) NX.game.togglePause(); } catch (e) {}
      }
    });
  } catch (e) {}

  // Botón Atrás de Android: nunca cerrar la app de golpe (lo exige Google Play).
  // Jugando -> pausa; en cualquier otra pantalla -> vuelve al título.
  try {
    App && App.addListener && App.addListener("backButton", function () {
      try {
        if (window.NX && NX.game) {
          if (NX.game.isRunning && NX.game.isRunning() && NX.game.togglePause) { NX.game.togglePause(); return; }
          if (NX.game.quitToTitle) { NX.game.quitToTitle(); return; }
        }
      } catch (e) {}
    });
  } catch (e) {}

  // Háptica: engancha en los SFX existentes sin tocar el motor
  function hook(obj, name, impact) {
    if (!obj || !obj[name] || !Haptics) return;
    var orig = obj[name];
    obj[name] = function () {
      try { Haptics.impact({ style: impact }); } catch (e) {}
      return orig.apply(this, arguments);
    };
  }
  function wire() {
    if (!window.NX || !NX.audio || !NX.audio.sfx) { setTimeout(wire, 300); return; }
    var s = NX.audio.sfx;
    hook(s, "hurt", "HEAVY");
    hook(s, "bigExplode", "HEAVY");
    hook(s, "explode", "LIGHT");
    hook(s, "pickup", "LIGHT");
    hook(s, "bomb", "HEAVY");
  }
  wire();
})();
