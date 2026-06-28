/* Generador de capturas de marketing para App Store.
   Lleva el juego a escenas concretas y captura a la resolución exacta
   pedida. Uso: node scripts/shots.js <logicalW> <logicalH> <dpr> <carpeta>
   Ej. 6.9": node scripts/shots.js 440 956 3 resources/screenshots/6.9
   Las dimensiones de salida = logicalW*dpr x logicalH*dpr. */
const { chromium } = require('playwright');
const fs = require('fs');

const W = parseInt(process.argv[2] || '440', 10);
const H = parseInt(process.argv[3] || '956', 10);
const DPR = parseInt(process.argv[4] || '3', 10);
const OUT = process.argv[5] || 'resources/screenshots/6.9';
const URL = process.env.GAME_URL || 'http://127.0.0.1:8090/index.html';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function newGame(page) {
  await page.evaluate(() => { try { NX.game.quitToTitle(); } catch (e) {} });
  await sleep(300);
}

// Salta diálogos tocando hasta que aparezca el HUD
async function skipDialogue(page) {
  for (let i = 0; i < 24; i++) {
    await page.mouse.click(W / 2, H / 2);
    await sleep(110);
    if (await page.isVisible('#hud')) return true;
  }
  return false;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: DPR });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL);
  await sleep(1500);
  await page.keyboard.press('Enter'); // boot -> title
  await sleep(700);

  // 1) TÍTULO
  await page.evaluate(() => { try { NX.game.quitToTitle(); } catch (e) {} });
  await sleep(700);
  await page.screenshot({ path: `${OUT}/1-titulo.png` });

  // 2) COMBATE con combo y mejoras visibles
  await page.click('#m-start');
  await sleep(400);
  await skipDialogue(page);
  await sleep(800);
  await page.evaluate(() => {
    const p = NX.world.player;
    // escena vistosa: enemigos variados alrededor, combo alto, power-up activo
    NX.world.enemies.length = 0; NX.world.portals.length = 0;
    const w = window.innerWidth, h = window.innerHeight;
    NX.entities.materialize('drone', w * 0.25, h * 0.30);
    NX.entities.materialize('drone', w * 0.70, h * 0.22);
    NX.entities.materialize('spinner', w * 0.80, h * 0.45);
    NX.entities.materialize('splitter', w * 0.20, h * 0.55);
    NX.entities.materialize('tank', w * 0.50, h * 0.18);
    NX.entities.dropPowerup(w * 0.40, h * 0.60, 'TRIPLE');
    p.power = 'TRIPLE'; p.powerT = 9;
    // disparar un poco para llenar de balas y partículas
    for (let i = 0; i < 8; i++) NX.entities && NX.world.pbullets.push({ x: p.x, y: p.y - i * 30, vx: 0, vy: -560, dmg: 1, r: 4, life: 1.4 });
  });
  // dejar correr ~0.4s para que haya balas/partículas en vuelo
  await page.evaluate(() => { NX.input.state.touchMode = true; NX.input.state.move.x = 0.3; NX.input.state.move.y = -0.2; });
  await sleep(450);
  await page.screenshot({ path: `${OUT}/2-combate.png` });

  // 3) JEFE — forzamos el jefe directamente (escena épica determinista)
  await newGame(page);
  await page.click('#m-start');
  await sleep(400);
  await skipDialogue(page);
  await sleep(500);
  await page.evaluate(() => {
    const w = window.innerWidth, h = window.innerHeight;
    NX.world.enemies.length = 0; NX.world.portals.length = 0; NX.world.ebullets.length = 0;
    const b = NX.entities.materialize('boss', w * 0.5, h * 0.20);
    b.hp = b.hpMax * 0.6; b.phase = 1;
    NX.ui.showBoss(true); NX.ui.setBossHp(0.6);
    NX.ui.setSector('SECTOR 8 // NÚCLEO M.A.D.R.E.');
    NX.ui.setWave('PROTOCOLO DE DEFENSA TOTAL');
    const p = NX.world.player; p.x = w * 0.5; p.y = h * 0.78;
    NX.input.state.touchMode = true; NX.input.state.move.x = -0.3; NX.input.state.move.y = 0.1;
  });
  // dejamos que el jefe genere su propio patrón de balas en espiral
  await sleep(1500);
  await page.screenshot({ path: `${OUT}/3-jefe.png` });

  // 4) TERMINAL NARRATIVO
  await newGame(page);
  await page.click('#m-start');
  await sleep(1400); // deja escribir parte del diálogo de intro
  await page.screenshot({ path: `${OUT}/4-historia.png` });

  // 5) VICTORIA — disparamos la secuencia real de fin con el jefe forzado
  await newGame(page);
  await page.click('#m-start');
  await sleep(400);
  await skipDialogue(page);
  await sleep(500);
  await page.evaluate(() => {
    const w = window.innerWidth, h = window.innerHeight;
    NX.world.enemies.length = 0; NX.world.portals.length = 0; NX.world.ebullets.length = 0;
    // puntuación vistosa antes del final
    for (let i = 0; i < 40; i++) NX.game.onEnemyKilled({ score: 350, x: w / 2, y: h / 2 });
    const b = NX.entities.materialize('boss', w * 0.5, h * 0.2);
    b.hp = 1;
    NX.game.onBossDefeated(b); // dispara: explosión -> diálogo final -> pantalla de victoria
  });
  await sleep(2400); // espera el later(2000) interno antes del diálogo final
  await skipDialogue(page); // el diálogo de victoria no muestra HUD, pero por si acaso
  for (let i = 0; i < 16; i++) { await page.mouse.click(W / 2, H / 2); await sleep(170); if (await page.isVisible('#screen-victory')) break; }
  await sleep(500);
  await page.screenshot({ path: `${OUT}/5-victoria.png` });

  await browser.close();
  const files = fs.readdirSync(OUT);
  console.log(`[${W}x${H} @${DPR}x = ${W*DPR}x${H*DPR}] →`, files.join(', '), '| errores:', errors.length ? errors : 'ninguno');
})().catch(e => { console.error('FALLO:', e); process.exit(2); });
