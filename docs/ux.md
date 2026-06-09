# Documento de UX/UI — NEON EXODUS 2087
**Kai Mendoza · Diseño UX/UI · Estudio Siete//Siete**

## Principio
Los pulgares mandan. El juego se diseñó primero para una mano izquierda y una
derecha sobre un iPhone en vertical u horizontal, y después para el teclado.

## Controles táctiles
- **Sticks flotantes:** el joystick nace *donde apoyas el pulgar*, no en un
  círculo fijo que obliga a mirar abajo. Mitad izquierda mueve, mitad derecha apunta.
- **Apuntar es opcional:** sin stick derecho, autoapuntado con predicción de
  tiro al enemigo más cercano. El juego nunca castiga jugar con un solo pulgar.
- **Dash:** doble toque en la mitad izquierda (o ESPACIO / doble clic). Zona
  grande, gesto natural, sin botón diminuto en mitad del fuego cruzado.
- **Hitbox del jugador al 70%:** lo que parece esquivar, esquiva. La cámara
  lenta de la injusticia no existe en este juego.

## Jerarquía de pantalla (en combate)
1. Tu nave (el trazo más brillante).
2. Balas enemigas (aditivas, con halo).
3. Enemigos (formas con color semántico).
4. HUD (esquinas, nunca el centro).

## Texto y legibilidad
- Todo el texto en DOM con `clamp()` tipográfico: nítido en retina, escalable.
- Terminal narrativo: primer toque completa la línea, segundo avanza. Regla
  sagrada: **nunca** obligues a leer al ritmo de la máquina de escribir.
- Telegrafía de aparición (0,8 s de hexágono creciente) antes de cada enemigo:
  la sorpresa está permitida, la emboscada invisible no.

## Accesibilidad y respeto
- Filtro CRT y sacudida de pantalla desactivables en Opciones.
- Autopausa al perder el foco; pausa siempre a un toque (esquina superior derecha).
- Récords y ajustes en `localStorage`: respetan tu configuración entre sesiones.
- Safe areas de iOS: nada interactivo bajo el Dynamic Island ni la barra inferior.
