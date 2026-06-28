# Plan de lanzamiento — NEON EXODUS 2087 (App Store + Google Play)

> Documento de producción de Estudio Siete//Siete. Sintetiza los hallazgos de los 8 miembros del panel, deduplicados y verificados contra el repo real. Listo para retomar en local.
> Fecha de corte: 2026-06-28. Versión objetivo: 1.0.0 / versionCode 1.

## 0. Veredicto ejecutivo

- **iOS: casi listo (amarillo).** Plataforma montada, firma de pago (Team E446EVZA4R, bundle `com.clickcomun.neonexodus`), ficha redactada en `IOS-DEPLOY.md`, privacidad cero-datos. Faltan 4 fixes pequeños de cumplimiento + QA en dispositivo real. **Puede ir a TestFlight esta semana.**
- **Android: no listo (rojo).** No existe `android/`, ni cuenta Play Console, ni keystore, ni assets de tienda. Es un proyecto entero (esfuerzo L).
- **Estrategia: dos velocidades.** Enviar iOS ya; abrir Play Console HOY (la verificación de identidad de cuentas nuevas tarda días = camino crítico).
- **Riesgo nº1 silencioso:** nunca se ha probado en dispositivo real ni en Safari (`docs/qa-informe.md` admite solo Chromium headless). No se firma ningún envío sin la matriz en hardware real.
- **Riesgo 4.2 (Apple):** mitigado por diseño. Hay 8 sectores, 9 arquetipos de enemigo y 3 jefes en `js/levels.js`, más integración nativa (háptica, pausa background, offline 100%). Es inequívocamente una app de juego. PERO hay que verificar EN DEVICE que la háptica y la pausa nativa funcionan de verdad, y arreglar la incoherencia de cifras de la ficha.

---

## 1. BLOQUEANTES — AMBAS TIENDAS

- [ ] **(S) Corregir 5 → 8 sectores en toda la documentación y ficha.** Verificado: `js/levels.js` tiene 8 sectores (Arrabal, Mercado, Cloacas, Torre Helios, Espejo de Datos, Jardín de Promesas, Memorial de Vega, Núcleo M.A.D.R.E.) + 2 mini-jefes + jefe final 3 fases. Pero dicen "5":
  - `IOS-DEPLOY.md:159` (notas al revisor en inglés — invita a Apple a verificar un dato falso), `IOS-DEPLOY.md:219`
  - `README.md:7`
  - `docs/narrativa.md:5` y `:20` ("Estructura (5 sectores)" — reescribir con los 8 reales)
  - `docs/gdd.md` (describe 5 sectores y jefe en sector 5 — reescribir tabla de estructura con 8 sectores, mini-jefes mirror/leech/echo_warden/vega_prime)
  - Riesgo: Apple 2.3 Metadata Inexacta / Google Play Metadatos Engañosos.
- [ ] **(S) Publicar la política de privacidad como página web HTTPS.** Hoy solo `docs/privacidad.md` en crudo (verificado: no existe `privacidad.html`). Convertir a HTML con el estilo del sitio y publicar en el GitHub Pages ya activo → `https://ruben-arconada.github.io/neon-exodus-2087/privacidad.html`. Usar esa URL en ambas fichas (Apple la exige en ASC; Google en ficha + Data safety).
- [ ] **(M) QA en DISPOSITIVO REAL (gate de release, NO negociable).** `docs/qa-informe.md:33-34` confiesa solo Chromium headless. Matriz mínima: iPhone real (ya disponible), 1 iPhone pequeño (SE/13 mini), iPad (si se mantiene universal), 2-3 Android reales gama baja/alta. Casos: primer toque desbloquea audio, interrupción por llamada/Siri, background→retorno (audio y pausa), rotación en mitad del jefe, batería baja, memoria, localStorage bloqueado en modo privado. Criterio de salida: 0 crashes en N partidas completas, 60fps estable con pantalla llena de balas, récord persiste tras reinstalar.
- [ ] **(M) Onboarding jugable en la primera partida.** Hoy la única ayuda es texto estático (`index.html` screen-howto, solo accesible manualmente; `js/ui.js:182`). Los sticks son invisibles hasta que tocas (`js/fx.js` drawSticks). Doble riesgo: percepción 4.2 (revisor táctil que no entiende los controles en 5s) + retención D1. Fix: overlay de controles la PRIMERA vez (flag en localStorage junto a hiscore/settings en `js/main.js`), o micro-tutorial no bloqueante en Sector 1 oleada 1 reutilizando `fx.textPop`: "MUEVE / APUNTA / DASH". Mayor ROI antes de enviar.
- [x] **(S) Identidad de publisher FIJADA (2026-06-28).** Bundle id / applicationId = **`com.clickcomun.neonexodus`** en iOS y Android (namespace real de Click Comunicación, igual que WoWeLike `com.clickcomun.wowelike2`). Se descartó `com.estudiosietesiete.*` (era lore del juego, no la empresa). Es el id PERMANENTE para ambas tiendas.
- [ ] **(S) Email de soporte en ambas fichas.** Hoy solo aparece `jackito777@gmail.com` en `docs/privacidad.md`. Ambas tiendas lo exigen en la ficha.

## 2. BLOQUEANTES — SOLO iOS

- [ ] **(S) Añadir `ITSAppUsesNonExemptEncryption`.** Verificado AUSENTE en `ios/App/App/Info.plist`. Sin él cada subida queda en "Missing Compliance". Añadir `<key>ITSAppUsesNonExemptEncryption</key><false/>`.
- [ ] **(S) Crear `ios/App/App/PrivacyInfo.xcprivacy`.** Verificado AUSENTE. La app usa UserDefaults vía localStorage del WKWebView (Required Reason API CA92.1). Sin el manifest → avisos ITMS-91053/91054. Contenido: `NSPrivacyTracking=false`, `NSPrivacyCollectedDataTypes` vacío, `NSPrivacyAccessedAPITypes` con CA92.1 (UserDefaults). Verificar tras `cap sync` que sigue en el target.
- [ ] **(S) Decisión iPad.** `Info.plist` declara orientaciones `~ipad` y `project.pbxproj` fija `TARGETED_DEVICE_FAMILY = "1,2"` (universal), pero NO hay capturas de iPad. Apple puede exigir capturas iPad 12.9" y probará en iPad. O **recortar a iPhone-only** (`TARGETED_DEVICE_FAMILY = 1`, quitar orientaciones ipad) o generar capturas iPad + testear layout. Recomendado para v1.0: iPhone-only (menos superficie de fallo y de assets).
- [ ] **(S) Alinear deployment target.** `project.pbxproj` fija `IPHONEOS_DEPLOYMENT_TARGET = 13.0` pero `IOS-DEPLOY.md` sección 2 dice 14.0. Unificar a una sola cifra (sugerido 14.0). Nota menor: `UIRequiredDeviceCapabilities` declara `armv7` (32-bit) — revisar, los dispositivos iOS modernos son arm64.
- [ ] **(M) Verificar puente nativo EN DEVICE (háptica + pausa).** `js/native.js:42` llama `Haptics.impact({ style: "HEAVY" })` con string crudo en vez del enum `ImpactStyle.Heavy`; los wrappers de @capacitor/app y /haptics no se inyectan vía `<script>` en el bundle. La pausa por `appStateChange` y la háptica pueden quedar en no-op silencioso (tragado por try/catch). Son justo las features que vendemos para 4.2. Confirmar que vibran/pausan de verdad; si no, bundlear los wrappers oficiales o ajustar al formato del bridge. (Parte del QA en device, listado aparte por su peso para 4.2.)

## 3. BLOQUEANTES — SOLO Android (la plataforma no existe)

- [ ] **(L) Montar la plataforma.** En Mac con Android Studio + JDK 17: `npm run build`, añadir `@capacitor/android`, `npx cap add android`, `npx cap sync android`. Añadir scripts `cap:add-android` y `cap:sync-android` a `package.json` (hoy solo hay variantes iOS). Versionar `android/` (hoy `.gitignore` no lo contempla).
- [ ] **(S) Abrir cuenta Google Play Console (CAMINO CRÍTICO — empezar YA).** Alta en play.google.com/console, pagar 25 USD único, completar verificación de identidad (tarda días). Decidir Personal vs Organización ANTES (condiciona el package id permanente).
- [ ] **(M) Generar keystore de subida + Play App Signing.** `keytool` RSA 2048, validez 25+ años. Backup cifrado FUERA del repo (si se pierde, no se puede volver a actualizar la app nunca). Configurar `signingConfigs release` en `android/app/build.gradle` leyendo de `keystore.properties` NO versionado. Añadir `*.keystore` y `keystore.properties` a `.gitignore`.
- [ ] **(S) Fijar target API level.** En `android/variables.gradle`: `compileSdk`/`targetSdk` = 35 (Android 15) o el mínimo vigente al enviar; `minSdk` 23+. Probar arranque en emulador Android 15. Generar `./gradlew bundleRelease` (Google exige AAB, no APK).
- [ ] **(M) Assets de ficha Play (NINGUNO existe).** Crear `resources/play/`:
  - `icon-512.png` (PNG 32-bit CON alpha; el actual `resources/icon.png` es 1024 SIN alpha — `sips -z 512 512`)
  - `feature-1024x500.png` (obligatorio; reutilizar lockup de captura 1-titulo y/o `og.png`)
  - Capturas teléfono en ratio válido: las 6.9 actuales son **1320x2868 (~9:19.5), FUERA del 9:16 máximo de Play** (verificado) → regenerar a 1080x1920 con `scripts/shots.js`, mínimo 2, ideal 4-8.
  - Icono adaptativo (foreground símbolo cian centrado en safe-zone 66% + background rejilla #0a0014) en `resources/android/`.
- [ ] **(S) Data safety + IARC en Play Console.** Data safety: "No data collected / No data shared" (coherente con `docs/privacidad.md`), sin opción de borrado, enlazar URL de privacidad. Cuestionario IARC: violencia fantasía → PEGI 7-12 / Teen. Coherente con la clasificación Apple (9+/12+).
- [ ] **(S) Cablear botón Atrás del sistema.** Sin `android/` no se puede; al montarla, `App.addListener('backButton')` en `js/native.js` → `togglePause` en combate / volver en submenús. Hoy cerraría la app de golpe = rechazo seguro y mala UX.
- [ ] **(M) QA de rendimiento 60fps honesto.** `neonStroke` aplica `shadowBlur` por entidad/bala con `globalCompositeOperation='lighter'`; con 110 balas + enemigos en GPU Android gama media es lo primero que tira de 60fps. Medir ANTES de prometer fecha; si cae, cachear glifos de bala en offscreen o bajar shadowBlur.
- [ ] **(S) Closed/internal testing previo.** Google obliga a cuentas personales nuevas a un periodo de closed testing con testers antes de pasar a producción. Planificar.
- [ ] **(M) Verificar audio en WebView Android.** Mayor latencia que iOS; envelopes cortos (sfx.shoot 80ms) pueden desfasar. Probar resume tras background, considerar `AudioContext({latencyHint:'interactive'})`. Actualizar `docs/audio.md` (hoy solo habla de iOS).

## 4. RECOMENDABLES (should-have, alto impacto)

- [ ] **(S) Reanudar/resincronizar AudioContext al volver de background (AMBAS).** `js/main.js:345` (visibilitychange) y `js/native.js:30` (appStateChange) solo hacen `togglePause()`, nunca `ctx.resume()`. En iOS/Android el contexto pasa a 'suspended'; al volver → "música ametralladora" o silencio. Es justo lo que prueba un revisor que minimiza y reabre. Exponer `audio.resync()`: `ctx.resume()` + `nextStepTime = ctx.currentTime + 0.06`.
- [ ] **(S) Parar el `setInterval` del scheduler en background (AMBAS).** `js/audio.js:323` (playSong) solo se limpia en `stopMusic()`; en suspensión sigue 33x/seg quemando batería. `clearInterval` + `ctx.suspend()` al ir a background; reanudar resincronizado al volver.
- [ ] **(S) Congelar también el estado 'story' en background (AMBAS).** `js/main.js:346` y `native.js:32` solo pausan en `state==='play'`. Si sales durante un diálogo o intro de jefe, el rAF y los timers de `ui.playDialogue` siguen → se pierden beats de historia. Parar el timer de diálogo y no avanzar dt cuando `document.hidden`.
- [ ] **(S) Desarmar el auto-login de Game Center (iOS).** `js/gamecenter.js:50` hace `setTimeout(signIn, 1500)`; en cuanto se active el plugin lanzaría un prompt de login no solicitado al abrir (Apple penaliza). Mover `signIn()` a acción explícita (botón "CLASIFICACIÓN").
- [ ] **(M) Localización al inglés (AMBAS).** Hoy 100% español (`index.html lang='es'`, `js/ui.js`, `js/story.js`). El synthwave/cyberpunk tiene su mayor audiencia en EE.UU./UK/Asia; sin inglés los algoritmos de descubrimiento penalizan. Refactor mínimo a `NX.strings[lang]` con fallback 'es' + `navigator.language`, traducir story.js + ui.js + index.html + privacidad.md, y fichas es-ES + en-US en ambas tiendas. La regla "no inglés innecesario" de `narrativa.md:36` es de TONO interno, no política de distribución.
- [ ] **(M) Dificultad (FÁCIL/NORMAL/DURO) (AMBAS).** 0 referencias a difficulty (verificado). Escalar hpMax, contactDamage, fireRate enemigo y POWERUP_DROP por un factor en `js/config.js`. Multiplica valor percibido y replayability casi gratis.
- [ ] **(M) Continuar / checkpoint por sector (AMBAS).** Hoy el save (`js/main.js` load/save) solo guarda hiscore y settings; cerrar la app en sector 6 pierde todo. Guardar `maxSectorAlcanzado` y ofrecer "CONTINUAR" en el título. Crítico para sesiones móviles interrumpidas.
- [ ] **(M) Resultados de fin de sector/partida con desglose (AMBAS).** kills, mejor combo, graze, tiempo, bono. Refuerza maestría y el argumento de profundidad ante 4.2.
- [ ] **(S) Reparar o eliminar `#rotate-hint` (AMBAS).** Existe en `index.html` pero 0 referencias en js (verificado, UI muerta). Togglearlo en orientationchange o eliminarlo si se bloquea orientación.
- [ ] **(S) Política de AVAudioSession + interrupciones (iOS).** Documentar que el audio respeta el interruptor de silencio (categoría ambient) y reanudar `ctx` tras 'interruption ended' (llamada/Siri). Anotar en `IOS-DEPLOY.md`.
- [ ] **(S) Sincronizar versión 1.0.0/versionCode 1 en los 3 sitios.** `package.json` marca 1.0.0; reflejar en `CFBundleShortVersionString`/build (iOS) y `versionName`/`versionCode` (Android).
- [ ] **(S) Recapturar frame 4-historia (iOS):** la captura corta a media palabra ("tres millones de cab|"); parece bug en la ficha.
- [ ] **(M) Captions de marketing en las capturas (AMBAS):** "8 SECTORES", "JEFE FINAL DE 3 FASES", "AUDIO 100% PROCEDURAL". Conservar una limpia gameplay-only por si el revisor la prefiere.
- [ ] **(S) Crear `ANDROID-DEPLOY.md`** espejo de `IOS-DEPLOY.md` (ficha, short/full description, Data safety, IARC).

## 5. NICE-TO-HAVE (post-v1.0 / v1.1)

- Modo arcade infinito/horda tras la campaña (techo de score para leaderboard).
- Logros locales en localStorage ("sector sin daño", "combo x8", "sin bomba").
- App Preview video (iOS 1080x1920, 15-30s) y vídeo promocional Play.
- Limitador/compresor suave en el master (DynamicsCompressorNode) y fade-out en `stopMusic`.
- Mapa de Neo-Madrid que se ilumina al liberar sectores en el título.
- Variante de icono monocroma/tinted para iOS 18.
- Escalar DEAD/STICK_RADIUS por densidad de pantalla (`js/input.js`) para tablets.
- Pausar el rAF a 30fps en 'pause'/'title' para ahorrar batería.
- Reservar el nombre "Neon Exodus 2087" en ambas tiendas cuanto antes.

## 6. QUÉ SOBRA (recortar)

- [ ] Set de capturas 6.5" (`resources/screenshots/6.5/`, 1242x2688): Apple solo exige 6.9" y reescala.
- [ ] `neon-exodus-2087.html` (monolítico 135KB autogenerado) versionado: generar bajo demanda, añadir a `.gitignore`.
- [ ] Game Center / `gamecenter.js` fuera del alcance v1.0: peers Capacitor 4/5 vs el 6 del proyecto; sacarlo del index.html del build y reservar como plan B SI Apple rechaza por 4.2.
- [ ] Auto-login de GC (`gamecenter.js:50`): quitar el disparo automático ya.
- [ ] `splash.png` claro (light): contradice la marca neón; mantener solo `splash-dark.png`.
- [ ] Analítica/crash reporting/ads de terceros en v1.0: romperían la fortaleza cero-datos.
- [ ] Cifras frágiles en las notas al revisor: que sean exactas o argumentar 4.2 por offline+háptica+pausa+narrativa.
- [ ] Doble fuente de verdad de UI (`index.html` vs `neon-exodus-2087.html`): mantener solo el generado por script.
- [ ] Menciones PWA "Añádelo a tu pantalla de inicio" en screen-howto: condicionar a web o recortar en el build nativo.
- [ ] Bonos +25/+5 sumados al score en vivo: separarlos en el desglose de fin de sector.

---

## 7. PIPELINE PUNTA A PUNTA

### 7.A — Apple App Store (código → revisión)

1. **Código:** corregir 5→8 sectores; onboarding sector 1; fixes audio resume; desarmar auto-login GC; congelar 'story' en background.
2. **Info.plist (`ios/App/App/Info.plist`):** añadir `ITSAppUsesNonExemptEncryption=false`; decidir iPad (recomendado iphone-only → `TARGETED_DEVICE_FAMILY=1`); revisar `armv7`.
3. **Privacy manifest:** crear `ios/App/App/PrivacyInfo.xcprivacy` (CA92.1 UserDefaults, sin tracking, sin datos).
4. **Build:** `npm run build` → `npx cap sync ios` → `npx cap open ios`. Alinear `MARKETING_VERSION=1.0.0`, `CURRENT_PROJECT_VERSION=1`, deployment target 14.0.
5. **Firma:** Team E446EVZA4R ya configurado; Automatic Signing. Archive en Xcode.
6. **QA EN DEVICE (gate):** matriz de hardware real; confirmar háptica + pausa nativa + audio resume + sin crash al arrancar.
7. **Assets/ficha:** subir set 6.9" (recapturar 4-historia); App Privacy = "No se recopilan datos"; URL de privacidad publicada; descripción/keywords de `IOS-DEPLOY.md` con cifras corregidas; clasificación 9+/12+.
8. **Envío:** Archive → App Store Connect (TestFlight primero) → notas al revisor 4.2 (offline + háptica + pausa + narrativa, cifras exactas) → enviar a revisión.

### 7.B — Google Play (cuenta → producción)

1. **HOY (camino crítico):** abrir Play Console + 25 USD + verificación de identidad. Fijar identidad de publisher y package id permanente.
2. **Plataforma:** `npm run build` → `npx cap add android` → `npx cap sync android`. Versionar `android/`; añadir scripts a `package.json`.
3. **Target API:** `android/variables.gradle` compileSdk/targetSdk 35, minSdk 23+. Arranque en emulador Android 15.
4. **Firma:** generar keystore (RSA 2048, 25+ años, backup cifrado fuera del repo); `signingConfigs release` desde `keystore.properties` (gitignored); activar Play App Signing.
5. **Build release:** `./gradlew bundleRelease` → `.aab`.
6. **QA EN DEVICE:** 2-3 Android reales (gama baja/alta); 60fps con balas, botón Atrás, audio resume, latencia, crash al arrancar.
7. **Assets/ficha:** `resources/play/` (icon-512 con alpha, feature-1024x500, capturas 1080x1920 9:16, icono adaptativo); short (80c) + full (4000c) description (base `IOS-DEPLOY.md`, cifras corregidas); URL de privacidad.
8. **Cumplimiento:** Data safety ("No data collected/shared") + cuestionario IARC.
9. **Envío:** internal/closed testing (obligatorio para cuentas nuevas) → recoger feedback → producción (rollout escalonado).

---

## 8. Orden recomendado de ataque (resumen)

1. (Hoy) Abrir Play Console + verificación de identidad. Fijar identidad de publisher y monetización (Gratis sin ads/IAP en 1.0).
2. (Día 1) Fixes S transversales: 5→8 sectores, publicar privacidad.html, ITSApp + PrivacyInfo, decisión iPad, deployment target, desarmar auto-login GC.
3. (Días 1-2) Onboarding sector 1 + fixes de audio background.
4. (Días 2-3) QA iOS en dispositivo real → TestFlight → enviar iOS a revisión.
5. (Paralelo) Montar `android/`, keystore, targetSdk 35, AAB, assets Play, Data safety/IARC.
6. (Después) QA Android en device + closed testing → producción.

> Decisiones de negocio a cerrar antes de empezar: identidad de publisher (organización vs persona → package id permanente), monetización (recomendado Gratis sin ads/IAP en 1.0), y alcance de dispositivos (iPhone-only recomendado para v1.0).

---

## 9. Anexo — Hecho ya en esta sesión (2026-06-28)

Adelantados varios fixes **S** del plan (commit incluido):

- [x] **Incoherencia 5→8 sectores corregida** en `README.md`, `docs/narrativa.md`, `docs/gdd.md` e `IOS-DEPLOY.md` (incl. las notas al revisor de Apple). Ya no se invita a verificar un dato falso.
- [x] **Política de privacidad publicada como página HTTPS:** `privacidad.html` (servida por GitHub Pages). URL para ambas fichas: **https://ruben-arconada.github.io/neon-exodus-2087/privacidad.html**
- [x] **Game Center:** quitado el auto-login al arrancar (`js/gamecenter.js`); el login pasa a ser perezoso (solo al enviar puntuación). Evita el prompt no solicitado que penaliza Apple.
- [x] **Botón Atrás de Android cableado** (`js/native.js`): jugando → pausa; en menús → vuelve al título; nunca cierra la app de golpe (requisito de Google Play). Listo para cuando se monte `android/`.

## 10. Anexo — Toolchain Android verificado en ESTA Mac (2026-06-28)

Buenas noticias para Google Play: **el entorno de build de Android ya existe y está probado** en esta máquina (lo usa el proyecto hermano `WoWeLike-inhouse`, también Capacitor 6). El bloqueante "Android desde cero" es solo de proyecto/cuenta, **no de herramientas**.

- ✅ **JDK 17** (Homebrew `openjdk 17.0.19`, `/opt/homebrew/opt/openjdk@17/...`). Nota: `/usr/libexec/java_home -V` solo muestra Java 8 — NO lista el JDK keg-only de brew; no te fíes de ese comando.
- ✅ **Android SDK** en `~/Library/Android/sdk` con `platforms;android-35`, `build-tools;35.0.0`, `platform-tools`, licencias aceptadas.
- ✅ **Receta probada** (de WoWeLike): AGP `8.13.1`, Gradle wrapper `8.13`, `compileSdk/targetSdk = 35`, `minSdk 22`, `JavaVersion.VERSION_17`. AAB con `JAVA_HOME=<openjdk17> ANDROID_HOME=~/Library/Android/sdk ./gradlew :app:bundleRelease --no-daemon`. Patrón de firma: `signingConfigs.release` leyendo keystore/contraseñas de propiedades de Gradle (vía `-P…` o `~/.gradle/gradle.properties`, fuera del repo). Script de referencia: `WoWeLike-inhouse/infra/android-build.sh`.

**Pasos concretos para Neon Exodus en Android** (cuando se aborde): `npm i @capacitor/android && npx cap add android` → ajustar `android/variables.gradle` a compile/target 35 → crear **keystore PROPIO** (NO reutilizar `clickcomun-keystore.jks`, cuyo certificado está a nombre de Xerintel) → cablear `signingConfigs` → `npm run build && npx cap sync android` → `bundleRelease`. Solo falta, además, la **cuenta de Google Play Console** (~25 USD, abrir cuanto antes por la verificación de identidad).

---

## 11. Progreso (sesión 2, 2026-06-28) — Android montado y iOS al día

**Cuenta de Google Play: YA EXISTE** (Click Comunicación) → bloqueante de cuenta descartado.

Hecho y commiteado en esta sesión:
- [x] **Plataforma Android + AAB FIRMADO.** `@capacitor/android` + `cap add android`; compile/target SDK **35**, AGP 8.13.1 / Gradle 8.13; `applicationId com.clickcomun.neonexodus` (igual que iOS); versionCode 1 / versionName 1.0.0. Keystore de SUBIDA propio en `android/keystore/` (FUERA del repo; contraseña en `keystore/info.md` — **haz backup**). Salida: `android/app/build/outputs/bundle/release/app-release.aab` (~13 MB, firmado, verificado).
- [x] **Iconos/splash de Android** (`npm run assets` ya hace iOS + Android). Build reproducible: `npm run android:aab` (script `scripts/android-build.sh`).
- [x] **iOS cumplimiento:** `ITSAppUsesNonExemptEncryption=false`; **iPhone-only** (quitadas orientaciones iPad + `TARGETED_DEVICE_FAMILY="1"`); `PrivacyInfo.xcprivacy` creado (UserDefaults CA92.1).
- [x] `ios/` y `android/` ahora **versionadas** (su `.gitignore` excluye Pods/build/keystore).

Pasos manuales que quedan (no automatizables desde aquí):
- [ ] **Android → Play:** crear la app en Play Console (Click Comunicación), activar **Play App Signing**, subir `app-release.aab` a *Internal testing*, **Data safety** ("no se recogen datos") + **IARC**, ficha (de `IOS-DEPLOY.md`, cifras ya corregidas), URL de privacidad (ya publicada), y **assets de Play** (feature graphic 1024×500 + capturas 9:16).
- [ ] **iOS → PrivacyInfo:** en Xcode, arrastrar `ios/App/App/PrivacyInfo.xcprivacy` al target **App** (marcar *Target Membership*); luego **Product → Archive** → TestFlight (firma e Info.plist ya listos).
- [ ] **QA en dispositivo real** (iOS y Android) antes de producción.

---

## 12. Visión de producto (dirección futura) — Colección de mini-juegos cyberpunk

**Idea (2026-06-28):** NEON EXODUS 2087 pasa a ser **uno de los mini-juegos** dentro de una **app-colección de temática cyberpunk/synthwave**: muchos mini-juegos atractivos, **precio económico**, para quien le gusta la estética. Hub central que lanza cada juego, identidad neón común.

**Por qué creo que es mejor que apps sueltas (valoración):**
- **Más valor percibido por poco dinero** → mejor conversión a precio bajo que un juego suelto.
- **Menos fricción de tienda:** una sola ficha, una revisión, un cuestionario de privacidad/IARC en lugar de N. Y esquiva con holgura la directriz **4.2** de Apple (una colección es claramente "app de verdad").
- **Reutiliza la tecnología** ya probada (Canvas 2D, audio 100% procedural, wrapper Capacitor, pipeline de build/firma de este repo) → cada mini-juego es barato de añadir.
- **Retención y "feature":** variedad + "mini-juego nuevo cada mes" da motivo para volver y para que las tiendas lo destaquen.
- **Marca coherente:** todo bajo el sello neón de Click Comunicación.

**Riesgos a vigilar:**
- **Alcance:** "muchos juegos muy atractivos" es mucho trabajo. Mejor **lanzar pocos (3–5) muy pulidos** que 15 mediocres (si no, se percibe como shovelware). Crecer con actualizaciones.
- **Aislamiento técnico:** cada mini-juego debe ser autónomo (su propio namespace, como `NX` aquí) para que uno no rompa a otro. Diseñar un "shell/launcher" + módulos.
- **Calidad sostenida** > cantidad.

**Monetización (recomendación):** mantener el sello **sin anuncios y sin datos** (es vuestra mayor fortaleza y aprueba rápido). Opción preferida: **gratis con 1–2 mini-juegos de muestra + 1 compra única barata** (p. ej. 2,99 €) que desbloquea toda la colección. Alternativa: de pago directo barato. Evitar ads/analítica en v1 (rompería el "App Privacy = sin datos").

**Impacto en este lanzamiento — DECISIÓN TOMADA (2026-06-28):**
- ✅ **Se publica NEON EXODUS en SOLITARIO ya**, como está (flagship independiente), conservando su id `com.clickcomun.neonexodus`. Empezamos a aprender/recoger reseñas/crear público sin esperar a la colección.
- Más adelante **la colección incluirá este juego**, y NEON EXODUS hará de **gancho/escaparate**: cuando la colección exista, se añade (en una actualización) una llamada **discreta** desde el propio juego — entrada "MÁS JUEGOS · COLECCIÓN" en el menú de título y/o un teaser tras la victoria — que **abra la ficha de la colección en la tienda**.
- La colección tendrá **su propio id** (`com.clickcomun.<colección>`), independiente del de NEON. Fijar ese nombre/id antes de crear esa app (es permanente).
- Modelo sugerido: **NEON gratis** (gancho) → **colección de pago** barata. El flagship gratis es el mejor anuncio de la colección, y valida la temática/audiencia antes de invertir en muchos juegos.
- **Importante (anti-4.2 / offline):** esa llamada debe **abrir la URL de la tienda EXTERNAMENTE** (Capacitor Browser / `window.open`), nunca cargar contenido remoto dentro del juego, para no romper el "100% offline / sin datos". Se añade cuando la colección esté publicada, no ahora.

---

## 13. Decisión de precio (2026-06-28)

**NEON EXODUS 2087: GRATIS — 0 €, sin anuncios, sin IAP (v1.0).** Su papel es gancho/adquisición (alcance + reseñas + ranking + validar la estética + base de fans), no ingreso. El precio afecta sobre todo vía **volumen**, no vía comisión: cualquier precio hunde las descargas que alimentan el embudo. Gratis hace creíble el sello "sin ads / sin datos / offline" y neutraliza el "campaña corta para lo que cuesta".

**Colección cyberpunk (futura): GRATIS + 1 compra única de desbloqueo a 2,99 €** (rango 1,99–3,99; banda baja si salen pocos juegos). Estructura: 1–2 mini-juegos de muestra gratis + compra única que desbloquea todo. **Pago único, NO suscripción.** Aquí está el ingreso real (al 85%). *Precio a validar en los primeros meses (cambiarlo es reversible e inmediato).*

**Economía (comisión 15%, IVA gestionado por la tienda):**
- Neto por venta: 0,99 € → ~0,70 € · 1,99 € → ~1,40 € · **2,99 € → ~2,10 €**.
- Al 30% sin SBP: 0,99 € → ~0,57 € · 1,99 € → ~1,15 € · 2,99 € → ~1,73 €.

**Acciones derivadas:**
- [ ] Inscribir la cuenta Apple en el **Small Business Program YA** (el 15% NO es automático; sin inscribirse, Apple cobra 30% → pierdes ~0,13–0,37 €/venta).
- [ ] Google Play: 15% automático sobre el primer 1M USD/año (sin acción).
- [ ] Mantener NEON **sin IAP ni ads** para conservar "App Privacy = no se recogen datos".
- [ ] Fijar el id permanente `com.clickcomun.<coleccion>` antes de crear la app de la colección.

**Incertidumbres:** sin analítica (por privacidad) el embudo solo se mide por proxies (instalaciones/ventas/reseñas); los netos son aproximados (el IVA varía por país UE).

**Precio CONFIRMADO (2026-06-28):** NEON EXODUS = **gratis** (acordado con el usuario).

---

## 14. Cuentas y nombre de editor (2026-06-28)

- **Apple: cuenta INDIVIDUAL** (Team `E446EVZA4R`, "Ruben Martínez Arconada"). ⚠️ Implicación: en la App Store el **vendedor/desarrollador se muestra con el NOMBRE PERSONAL**, no "Click Comunicación". Para mostrar la marca haría falta una **cuenta de Organización** de Apple (requiere número **D-U-N-S** gratuito + verificación, tarda días/semanas). El **Small Business Program (15%)** SÍ está disponible para cuentas individuales.
- **Google Play: Click Comunicación** (cuenta de empresa) → ahí el editor SÍ sale como la marca.
- **Consecuencia de marca:** si NEON sale en la cuenta individual de Apple y la colección bajo Click Comunicación, habría **dos nombres de editor distintos** entre apps/tiendas. Para coherencia, lo ideal sería una cuenta de **Organización de Apple para todo**. Mover una app de individual → organización después es posible (transferencia de app) pero con fricción.
- **DECISIÓN pendiente del usuario:**
  - (a) **Lanzar NEON ya** en la cuenta individual de Apple (rápido; aparece tu nombre personal en la App Store), o
  - (b) **Tramitar D-U-N-S / cuenta Organización** de Apple antes de publicar en iOS (coherencia de marca de cara a la colección). El D-U-N-S se puede ir pidiendo **en paralelo** (es gratis) sin frenar Android.
- **Cómo funciona el cambio individual → organización (NO es automático):**
  - No se puede "convertir" la cuenta individual en organización. Se crea una cuenta de **Organización NUEVA** (Apple ID/Team aparte, con su D-U-N-S).
  - Para llevar NEON a esa organización hay que hacer una **Transferencia de app (App Transfer)** en App Store Connect: es **manual** y tiene condiciones (la app debe tener al menos una versión publicada, sin ciertas capacidades/entitlements problemáticos, ambas cuentas en regla y la receptora acepta). **Conserva el mismo bundle id** (`com.clickcomun.neonexodus`) **y las reseñas/valoraciones**.
  - Conclusión: lanzar ahora en individual **no es un callejón sin salida** (es transferible después), pero es un trámite, no un interruptor. Si la marca importa desde el día 1, sale más cómodo tener la organización **antes** de publicar.