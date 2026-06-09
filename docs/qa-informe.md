# Informe de QA y cierre de producción — NEON EXODUS 2087
**Rita Píxel · QA y producción · Estudio Siete//Siete**
**Fecha de cierre:** madrugada del 9 de junio de 2026 · **Veredicto: APTO PARA LANZAMIENTO**

## Matriz de pruebas (Chromium headless, viewport iPhone 14 Pro Max 430×932)
| Caso | Resultado |
|---|---|
| Arranque → boot → título | ✅ |
| Cómo jugar / Opciones / Créditos y vuelta | ✅ |
| Alternar CRT, música, efectos, sacudida (persisten) | ✅ |
| Intro narrativa y salto de diálogo | ✅ |
| Combate sector 1 con autoapuntado (modo táctil) | ✅ bot de QA lo supera en ~20 s, 88 HP |
| Oleadas, combos, mejoras, telegrafía | ✅ |
| Jefe: 3 fases, barra de vida, esbirros | ✅ |
| Victoria → final → créditos → récord guardado | ✅ |
| Muerte → game over → reintentar sector | ✅ |
| Pausa manual + autopausa al perder foco | ✅ |
| Rendimiento | ✅ 61 fps, 0 errores de consola |
| Sintaxis de los 9 módulos (`node --check`) | ✅ |

## Incidencias encontradas y resueltas durante la noche
1. **Ritmo de bajas lento** — el autoapuntado disparaba a la posición actual del
   enemigo; los drones zigzagueantes esquivaban media ráfaga. *Arreglo:*
   predicción de tiro (apuntar a donde estará). Bajas por minuto ×3.
2. **Jefe esponja** — 420 PV ≈ 67 s de pelea en el peor caso. *Arreglo:* 300 PV
   y balas del jugador a 560 px/s. La pelea queda en 35–50 s con tensión real.
3. **El sol no salía** — el skyline tapaba el sol de franjas, crimen de lesa
   estética. *Arreglo:* sol 35% más grande y elevado, edificios más bajos.

## Riesgos conocidos (aceptados)
- La música requiere un primer toque (política de autoplay de iOS): el arranque
  ya pide «toca para conectar», así que el desbloqueo es invisible.
- En Safari real no se ha podido probar esta noche (no hay iPhone en el
  contenedor): el juego usa solo APIs estándar con soporte iOS 12+.

## Nota de producción
Alcance respetado: nada de lo prometido en el GDD se recortó. Las siete
personas de este estudio caben en una sola IA, pero el *crunch* de una noche
fue igual de épico. Que lo disfrutes, jugador. — R.P.
