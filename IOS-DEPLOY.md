# 📱 NEON EXODUS 2087 → App Store (cuenta de desarrollador individual)

Guía paso a paso para publicar el juego en la App Store envolviéndolo con
**Capacitor** (el juego corre dentro de un WKWebView nativo, con el mismo
código que ya funciona). Todo el andamiaje ya está en el repo; los pasos
marcados con 🍏 **solo se pueden hacer en un Mac con Xcode**.

---

## 0. Lo que necesitas
- ✅ Cuenta **Apple Developer Program** activa (individual, 99 €/año) — ya la tienes.
- 🍏 Un **Mac con Xcode 15+** instalado (App Store → Xcode).
- [Node.js 18+](https://nodejs.org) y [CocoaPods](https://cocoapods.org) (`sudo gem install cocoapods`).

---

## 1. En el Mac: clonar y preparar (terminal)

```bash
git clone https://github.com/Ruben-Arconada/neon-exodus-2087.git
cd neon-exodus-2087
git checkout claude/fable5-80s-cyberpunk-game-qn7iro

npm install                 # instala Capacitor
npm run build               # copia el juego a www/
npx cap add ios             # genera el proyecto Xcode en ios/
npm run assets              # genera iconos y splash desde resources/icon.png
npx cap sync ios            # copia web + plugins al proyecto nativo
```

> **Validado:** las dependencias de Capacitor 6 resuelven sin conflictos
> (core/ios/cli 6.2.1, haptics 6.0.3) y el repo trae `package-lock.json` para
> instalación reproducible.
>
> `npm run assets` usa `@capacitor/assets`, que depende de `sharp` (binario
> nativo). En macOS instala sin problema. Si fallara, alternativa manual:
> abre `ios/App/App/Assets.xcassets/AppIcon.appiconset` en Xcode y arrastra
> `resources/icon.png` (1024×1024) — Xcode 14+ acepta icono de un solo tamaño.

---

## 2. 🍏 Abrir en Xcode

```bash
npx cap open ios
```

En Xcode, panel izquierdo → selecciona el proyecto **App** → pestaña
**Signing & Capabilities**:

1. **Team:** elige tu cuenta de desarrollador (tu nombre / tu Apple ID).
   Si no aparece: Xcode → *Settings → Accounts → +* y añade tu Apple ID.
2. **Bundle Identifier:** cambia `com.estudiosietesiete.neonexodus` por uno
   tuyo único, p. ej. `com.<tuapellido>.neonexodus`. **Apúntalo**, lo
   necesitarás en App Store Connect.
3. Marca **Automatically manage signing** (deja que Xcode cree los perfiles).

Ajustes recomendados (pestaña **General**):
- **Display Name:** `Neon Exodus`
- **Deployment Target:** iOS 14.0 o superior.
- **Device Orientation:** deja Portrait y Landscape marcados (el juego se adapta).

---

## 3. 🍏 Probar en tu iPhone real (instalación por cable)
Esto es lo que harás para **probar y dar feedback** antes del despliegue.

1. Conecta el iPhone 14 Pro Max por cable y desbloquéalo. Si pregunta, pulsa
   **Confiar en este ordenador**.
2. En Xcode, arriba (junto al nombre del esquema), selecciona tu iPhone como
   destino en lugar de un simulador.
3. Pulsa ▶ (Run). Xcode compila, firma con tu cuenta e instala la app.
4. Primera vez: el iPhone pedirá *confiar* en tu certificado de desarrollador →
   **Ajustes → General → VPN y gestión de dispositivos** → confía en tu perfil.
5. Abre la app desde la pantalla de inicio. ¡A jugar y anotar feedback!

Atajo por terminal (equivalente al botón Run, sin abrir Xcode):
```bash
npx cap run ios --target="<ID-de-tu-iPhone>"
# lista los dispositivos disponibles:
xcrun xctrace list devices
```

> Como tu cuenta de desarrollador es **de pago**, el perfil de aprovisionamiento
> dura **1 año** (con cuenta gratis caducaría a los 7 días). No necesitas subir
> nada a App Store para esta prueba por cable.
>
> **Alternativa para iterar feedback sin cable: TestFlight.** Tras el primer
> *Archive + Upload* (sección 5), instalas builds nuevas desde la app
> **TestFlight** en el iPhone, y puedes invitar a más probadores por email. Es
> el mejor circuito de feedback una vez tengas la cuenta de ASC creada.

---

## 4. App Store Connect — crear la ficha
En [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Apps → +**:

- **Plataforma:** iOS
- **Nombre:** `Neon Exodus 2087` (debe ser único en toda la App Store; si está
  cogido, prueba `Neon Exodus: 2087` o añade un subtítulo).
- **Idioma principal:** Español (España)
- **Bundle ID:** el mismo que pusiste en Xcode (aparecerá en la lista).
- **SKU:** cualquier código interno, p. ej. `NEONEXODUS2087`.

Rellena la ficha:
- **Subtítulo:** "Arcade synthwave de Neo-Madrid"
- **Descripción:** usa la del bloque de abajo 👇
- **Palabras clave:** `synthwave,arcade,retro,cyberpunk,shooter,neon,80s,naves`
- **Categoría:** Juegos → Primaria: *Arcade*, Secundaria: *Acción*.
- **Capturas (obligatorias):** ✅ **ya generadas** en el repo, en
  `resources/screenshots/`. Apple (2025-2026) solo exige **un set de 6,9"**
  (1320×2868 px) y reescala solo al resto de iPhones. Sube las 5 de
  `resources/screenshots/6.9/` (título, combate, jefe, historia, victoria).
  También dejé el set de 6,5" (1242×2688) por si lo prefieres. Reglas: PNG/JPG
  RGB, **sin transparencia ni esquinas redondeadas**, 1 a 10 por tamaño. Para
  regenerarlas: `npm run build` y `node scripts/shots.js 440 956 3 resources/screenshots/6.9`
  (con el juego servido en `http://127.0.0.1:8090`).
- **Clasificación por edad:** responde el cuestionario; este juego es
  violencia de dibujos/fantasía leve → suele quedar **9+** o **12+**.
- **Política de privacidad:** Apple exige una URL. El juego **no recoge datos**
  (todo es `localStorage` local). Puedes publicar una página simple; te he
  dejado una plantilla en `docs/privacidad.md`.
- **Privacidad de la app (App Privacy):** marca **"No se recopilan datos"**.
- **Precio:** Gratis (o el que quieras).

---

## 5. 🍏 Subir el binario
En Xcode: destino **Any iOS Device (arm64)** → menú **Product → Archive**.
Cuando termine se abre el **Organizer** → **Distribute App** →
**App Store Connect** → **Upload**. Deja las opciones por defecto y firma.

En 5–15 min el build aparece en App Store Connect (pestaña **TestFlight** y
luego seleccionable en la versión). Asígnalo a la versión 1.0 y pulsa
**Add for Review → Submit**.

---

## 6. Revisión de Apple (24–48 h normalmente)
- El mayor riesgo es la directriz **4.2 (Minimum Functionality)**: Apple
  rechaza apps que sean "solo una web". Mitigaciones **ya incluidas** en el
  juego: funciona 100 % **offline** (todo el contenido va en el bundle, nada
  se carga desde una URL remota — éste es el disparador nº1 de rechazo),
  vibración **háptica nativa** (`js/native.js`), pausa al ir a segundo plano,
  splash nativo y diseño app-like (icono, safe-area, controles táctiles).
- **Notas para el revisor (pégalas en "Notes for Review", en inglés):**

```
App Review Team:

This is a native arcade game (twin-stick shooter) built with an HTML5 Canvas
engine and packaged with Capacitor. It is NOT a repackaged website or a web
clipping, and it does NOT load any remote web content.

ALL game assets (code, art, audio, levels, music) are bundled inside the app.
The game is fully playable OFFLINE — no internet connection is required at any
point. You can verify this by launching the app in Airplane Mode.

The game offers genuine, lasting entertainment: 5 sectors, 8 enemy types, a
3-phase final boss, a combo system, power-ups and local high scores. There is
no browser UI, address bar or web navigation anywhere.

Native device integrations not available in Safari:
- Core Haptics: tactile feedback on hits, explosions and pickups.
- Offline local persistence of high scores and settings.

Thank you for reviewing.
```

- Si **pese a todo** lo rechazan por 4.2, el refuerzo más potente es añadir
  **Game Center** (marcadores online). Ver la sección 7. Corrige antes de
  apelar: la mayoría de apelaciones se deniegan si la app realmente infringe.

---

## 7. (OPCIONAL) Game Center — solo si te rechazan por 4.2

> ⚠️ **Realidad verificada (jun 2026):** los plugins de Game Center para
> Capacitor van por detrás. `@openforge/capacitor-game-connect` (5.0.2) declara
> peer de **Capacitor 5**, y `@openforge/capacitor-game-services` (1.1.2) de
> **Capacitor 4**. Este proyecto usa **Capacitor 6**, así que tienes dos vías:

**Vía A (recomendada, menos fricción):** instalar el plugin forzando la
resolución de peers y probar en tu Mac:
```bash
npm install @openforge/capacitor-game-connect --legacy-peer-deps
npx cap sync ios
```
**Vía B (máxima compatibilidad):** fijar el proyecto a Capacitor 5
(`npm i @capacitor/core@5 @capacitor/ios@5 @capacitor/cli@5`) y luego instalar
el plugin. Más estable con el plugin, pero retrocede una versión mayor.

**El cableado JS ya está hecho:** `js/gamecenter.js` detecta el plugin y, si
está, hace login y envía la puntuación al cerrar partida/victoria
(leaderboard `com.estudiosietesiete.neonexodus.highscores`). Sin plugin es
inofensivo (no-op), por eso no rompe nada ahora.

**Pasos nativos (en el Mac):**
1. Xcode → target *App* → **Signing & Capabilities → + Capability → Game Center**.
2. App Store Connect → tu app → **Features → Game Center** → actívalo y crea un
   **Leaderboard** con ID `com.estudiosietesiete.neonexodus.highscores` (o el
   que prefieras; si lo cambias, ajústalo también en `js/gamecenter.js`).
3. **Crítico:** los leaderboards deben **enviarse a revisión junto al binario**
   (añádelos a la versión antes de *Submit*), o el revisor no los verá.
4. Verifica los nombres exactos de métodos del plugin contra su README (la API
   puede variar entre versiones); `gamecenter.js` ya contempla las variantes
   más comunes (`submitScore` / `reportScore`).

---

## Descripción lista para copiar

```
Neo-Madrid, 2087. La IA M.A.D.R.E. escribe los sueños de tres millones de
personas. Tú eres VEGA, la mejor runner que ha cruzado un cortafuegos, y esta
noche entras en la Red para apagarla.

NEON EXODUS 2087 es un arcade de acción synthwave inspirado en el cyberpunk de
los 80: dispara, esquiva con el dash y encadena combos a través de 5 sectores
hasta un jefe final de 3 fases, todo bañado en neón, rejillas infinitas y una
banda sonora retro generada en tiempo real.

• Controles táctiles pensados para el pulgar (con autoapuntado opcional)
• 8 tipos de enemigo y un jefe final memorable
• Combos, mejoras y récords locales
• Banda sonora synthwave y efectos 100% sintetizados
• Funciona sin conexión · sin anuncios · sin recogida de datos

Quema neón, runner.
```

---

## Actualizar la app en el futuro
Cuando cambies el juego:
```bash
npm run build && npx cap sync ios
```
sube el número de versión/build en Xcode, **Archive** y **Distribute** otra vez.
