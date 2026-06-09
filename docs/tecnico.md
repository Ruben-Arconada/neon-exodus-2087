# Documento técnico — NEON EXODUS 2087
**Bruno «Bit» Salcedo · Programación gameplay senior · Estudio Siete//Siete**

## Stack
HTML5 + Canvas 2D + Web Audio. **Cero dependencias, cero build.** Nueve
módulos en scripts clásicos bajo el espacio de nombres `NX` — funciona desde
cualquier servidor estático y desde `file://`.

```
js/config.js    constantes, balance, utilidades
js/audio.js     sintetizador y secuenciador
js/input.js     sticks virtuales + teclado/ratón
js/fx.js        partículas, sacudidas, fondo synthwave
js/story.js     todo el texto del juego
js/entities.js  jugador, 8 enemigos, balas, colisiones
js/levels.js    sectores y director de oleadas
js/ui.js        pantallas DOM, terminal, HUD
js/main.js      bucle, máquina de estados, guardado
```

## Decisiones que importan
- **Pool de partículas fijo (420)** con índice circular: cero asignaciones por frame en el camino caliente.
- **`dt` con tope a 33 ms:** una pestaña congelada no teletransporta enemigos al volver.
- **Escala `S = clamp(min(w,h)/420, 0.8, 1.6)`:** velocidades y radios consistentes del iPhone al monitor.
- **`devicePixelRatio` con tope a 2:** en un panel 3× se renderiza a 2× — nadie nota la diferencia, la GPU sí.
- **Colisiones círculo-círculo con distancia al cuadrado:** sin `sqrt` en los bucles; con ~150 entidades no hace falta rejilla espacial.
- **Token de ejecución (`runToken`)** que invalida todo `setTimeout` pendiente al reiniciar o salir: adiós a los callbacks zombis, la fuente clásica de bugs de estado en arcades.
- **Tiempo-bala asimétrico:** el mundo va al 35%, la jugadora al 75%. La fantasía es ser rápida, no que todo sea lento.

## iOS (el cliente juega en iPhone 14 Pro Max)
- `viewport-fit=cover` + `safe-area-inset-*` en HUD y menús (el Dynamic Island no tapa nada).
- `touch-action: none`, `overscroll-behavior: none`, `position: fixed` en body y `preventDefault` en los manejadores táctiles: sin scroll-rebote, sin zoom por doble toque.
- `apple-mobile-web-app-capable`: añadido a pantalla de inicio, corre a pantalla completa real.
- Autopausa con `visibilitychange`: nadie muere en segundo plano.

## Rendimiento medido (QA)
61 fps estables en viewport 430×932 bajo Chromium headless con combate activo,
sin errores de consola en todo el recorrido boot→título→historia→combate→jefe→
victoria/derrota.
