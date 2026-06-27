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
git clone https://github.com/Ruben-Arconada/Linklub.git
cd Linklub
git checkout claude/fable5-80s-cyberpunk-game-qn7iro

npm install                 # instala Capacitor
npm run build               # copia el juego a www/
npx cap add ios             # genera el proyecto Xcode en ios/
npm run assets              # genera iconos y splash desde resources/icon.png
npx cap sync ios            # copia web + plugins al proyecto nativo
```

> Si `npm run assets` se queja, instala la herramienta: `npm i -D @capacitor/assets`
> y vuelve a ejecutarlo. Usa `resources/icon.png` (1024×1024) y `resources/splash.png`.

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

## 3. 🍏 Probar en tu iPhone real
Conecta el iPhone 14 Pro Max por cable, selecciónalo arriba como destino y
pulsa ▶ (Run). La primera vez el teléfono pedirá *confiar* en tu certificado:
Ajustes → General → VPN y gestión de dispositivos → confía en tu perfil.

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
- **Capturas (obligatorias):** necesitas las de 6,9" (iPhone 16 Pro Max,
  1320×2868) **y** 6,5". Genera nuevas desde tu iPhone (botón lateral + subir
  volumen) o pídeme que te las renderice a esas resoluciones exactas.
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
  rechaza apps que sean "solo una web". Mitigaciones ya incluidas: funciona
  100 % **offline**, vibración **háptica nativa** (`js/native.js`), pausa al
  ir a segundo plano y splash nativo. Si aun así lo rechazan, la respuesta
  habitual que funciona es añadir **Game Center** (marcadores) — pídemelo y lo
  integro.
- En las notas para el revisor escribe: *"Juego de acción arcade nativo
  basado en HTML5 Canvas, funciona sin conexión, sin cuentas ni recogida de
  datos."*

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
