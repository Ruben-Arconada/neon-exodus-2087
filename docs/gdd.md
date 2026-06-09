# Documento de diseño — NEON EXODUS 2087
**Marlowe Díez · Dirección de juego · Estudio Siete//Siete**

## Visión
Un arcade de acción tipo *twin-stick* que se sienta como una recreativa de 1987
imaginando el 2087: sesiones cortas, lectura instantánea, puntuación con combos
y un jefe final que se recuerde. Una partida completa dura entre 15 y 25 minutos.

## Pilares
1. **Tres segundos para entenderlo.** Te mueves, disparas solo, esquivas. Todo lo demás es profundidad opcional.
2. **El neón es información.** Cada color significa algo: magenta persigue, cian orbita, amarillo aguanta, violeta aparece donde no debe.
3. **La muerte nunca es culpa del juego.** Telegrafía de apariciones, i-frames honestos en el dash, hitbox del jugador reducida un 30%.

## Bucle principal
Esquivar → disparar → encadenar combo → recoger mejora → liberar sector → respirar con la historia → repetir con más presión.

## Estructura
| Sector | Nombre | Enemigo nuevo | Oleadas |
|---|---|---|---|
| 1 | Arrabal Neón | drone, spinner, splitter | 3 |
| 2 | Mercado de Datos | turret | 4 |
| 3 | Cloacas Cromadas | wraith | 4 |
| 4 | Torre Helios | tank | 4 |
| 5 | Núcleo M.A.D.R.E. | jefe (3 fases) | 2 + jefe |

## Sistemas
- **Combo:** ×1 a ×8. Cada 5 bajas sin recibir daño sube el multiplicador; un golpe lo resetea. Riesgo/recompensa puro.
- **Dash:** 0,22 s invulnerable, 1,1 s de recarga. Esquivar balas con el dash da puntos de estilo (*graze*).
- **Mejoras:** TRIPLE, RÁPIDO, ESCUDO, BOMBA, TIEMPO-BALA y VIDA. 13% de probabilidad al destruir un enemigo.
- **Jefe:** M.A.D.R.E., 3 fases (anillos → espiral + esbirros → desesperación). Entre fases se limpia la pantalla de balas: el respiro es parte del combate.

## Decisiones de mesa
- Autoapuntado con predicción de tiro cuando no usas el stick derecho: en móvil, apuntar es opcional, sobrevivir no.
- Tope de 13 enemigos y 110 balas enemigas simultáneas: legibilidad y 60 fps antes que caos barato.
- Reintentar repite el sector con la puntuación con la que entraste: castigo justo, frustración mínima.
