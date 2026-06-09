# Documento de audio — NEON EXODUS 2087
**Sofía Láser · Programación de audio y banda sonora · Estudio Siete//Siete**

## Principio
Ni un solo sample. Toda la banda sonora y los efectos se sintetizan en tiempo
real con Web Audio: osciladores, ruido blanco y filtros. Como en 1987, pero
sin alquilar el estudio.

## La banda (sintética)
- **Bombo:** seno con caída 150→38 Hz en 130 ms.
- **Caja:** ruido por paso-banda (1,9 kHz) + cuerpo triangular a 190 Hz, imitando la *gated reverb* de los 80.
- **Charles:** ruido por paso-alto a 7,5 kHz; abierto en la segunda mitad del compás.
- **Bajo:** sierra + paso-bajo con barrido 900→220 Hz por nota. Corcheas con salto de octava.
- **Arpegio:** cuadrada, semicorcheas continuas, patrón 0-7-12-7-3-7-12-15.
- **Pad:** ocho sierras desafinadas ±0,35% (cuatro notas × dos voces). La niebla del tema.
- **Lead:** sierra con vibrato LFO a 5,6 Hz; entra solo en los compases 3 y 4 de cada vuelta.

## Discografía (8 temas)
| Tema | BPM | Carácter |
|---|---|---|
| Título | 96 | promesa, escaparate |
| Arrabal Neón | 118 | cabeza fuera, pies dentro |
| Mercado de Datos | 124 | codicia con purpurina |
| Cloacas Cromadas | 112 | claustrofobia verde |
| Torre Helios | 132 | ascensor a la guerra |
| Núcleo | 138 | última puerta |
| M.A.D.R.E. | 148 | progresión 0-6-1-7: la napolitana y el tritono hacen el trabajo sucio |
| Amanecer analógico | 84 | exhalar |

## Secuenciador
Planificador con *lookahead* de 120 ms sobre `AudioContext.currentTime` y bucle
de 64 pasos (4 compases × 16 semicorcheas). El `setInterval` solo encola; el
reloj manda. Jamás programes música con `setTimeout` a pelo.

## Mezcla y reglas
- Buses separados: música 0,6 / efectos 0,8 / master 0,85.
- *Ducking* automático al pausar y en momentos gordos.
- El disparo del jugador tiene antispam de 45 ms: a 6,6 disparos/s sin él, el mix se come al resto.
- iOS exige gesto para desbloquear audio: el primer toque (arranque) crea y reanuda el contexto.
