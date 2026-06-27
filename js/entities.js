/* ============================================================
   NEON EXODUS 2087 — entities.js
   Gameplay: jugador, enemigos, balas, mejoras y colisiones.
   Geometría neón pura: cada enemigo es una forma reconocible
   a primera vista (regla de oro de la dirección de arte).
   ============================================================ */
"use strict";

NX.world = {
  player: null,
  enemies: [],
  pbullets: [],
  ebullets: [],
  powerups: [],
  portals: []   // telegrafías de aparición
};

NX.entities = (function () {
  var W = NX.world;
  var scale = 1;

  function S() { return scale; }

  /* ---------------- Jugador ---------------- */
  function makePlayer(w, h) {
    return {
      x: w * 0.5, y: h * 0.72,
      vx: 0, vy: 0,
      angle: -Math.PI / 2,
      hp: NX.PLAYER.hpMax,
      radius: NX.PLAYER.radius * scale,
      fireT: 0,
      dashT: 0, dashCd: 0, dashDx: 0, dashDy: 0,
      invuln: 1.2,
      shield: 0,
      power: null, powerT: 0,    // TRIPLE / RAPID
      slowmoT: 0,
      tether: 0,                 // anclaje del leech (0..1): reduce la velocidad de VEGA
      trail: [],
      alive: true
    };
  }

  function resetWorld(w, h) {
    scale = NX.clamp(Math.min(w, h) / 420, 0.8, 1.6);
    W.player = makePlayer(w, h);
    W.enemies.length = 0;
    W.pbullets.length = 0;
    W.ebullets.length = 0;
    W.powerups.length = 0;
    W.portals.length = 0;
  }

  function clearHostiles() {
    W.enemies.length = 0;
    W.ebullets.length = 0;
    W.portals.length = 0;
  }

  /* ---------------- Aparición con telegrafía ---------------- */
  function queueSpawn(type, x, y) {
    W.portals.push({ type: type, x: x, y: y, t: NX.SPAWN_TELEGRAPH });
    NX.audio.sfx.spawn();
  }

  function spawnEdge(type, w, h) {
    // entra por un borde aleatorio, lejos del jugador
    var p = W.player, x, y, tries = 0;
    do {
      var side = NX.randInt(0, 3);
      if (side === 0) { x = NX.rand(30, w - 30); y = 40; }
      else if (side === 1) { x = NX.rand(30, w - 30); y = h - 40; }
      else if (side === 2) { x = 30; y = NX.rand(60, h - 60); }
      else { x = w - 30; y = NX.rand(60, h - 60); }
      tries++;
    } while (p && NX.dist2(x, y, p.x, p.y) < 150 * 150 * scale * scale && tries < 8);
    queueSpawn(type, x, y);
  }

  function materialize(type, x, y) {
    var def = NX.ENEMIES[type];
    var e = {
      type: type,
      x: x, y: y, vx: 0, vy: 0,
      hp: def.hp, hpMax: def.hp,
      radius: def.radius * scale,
      speed: def.speed * scale,
      score: def.score,
      color: def.color,
      fireT: NX.rand(0.4, def.fireRate || 2),
      angle: Math.random() * NX.TAU,
      spin: NX.rand(-3, 3),
      t: 0,
      hitFlash: 0,
      // específicos
      orbitDir: Math.random() < 0.5 ? 1 : -1,
      teleT: def.teleportEvery || 0,
      phase: 0, attackT: 0, spiralA: 0, moveT: 0, tx: x, ty: y
    };
    if (type === "boss") { e.hp = e.hpMax = NX.ENEMIES.boss.hp; }
    W.enemies.push(e);
    NX.fx.ring(x, y, def.color, 60 * scale);
    NX.fx.burst(x, y, def.color, 10, 130, 2.5);
    return e;
  }

  /* ---------------- Balas ---------------- */
  function pShoot(p, dirX, dirY) {
    var spd = NX.PLAYER.bulletSpeed * scale;
    var rapid = p.power === "RAPID";
    var dmg = NX.PLAYER.bulletDmg;
    var dirs = [[dirX, dirY]];
    if (p.power === "TRIPLE") {
      var a = Math.atan2(dirY, dirX);
      dirs = [[dirX, dirY],
        [Math.cos(a - 0.22), Math.sin(a - 0.22)],
        [Math.cos(a + 0.22), Math.sin(a + 0.22)]];
    }
    for (var i = 0; i < dirs.length; i++) {
      W.pbullets.push({
        x: p.x + dirs[i][0] * p.radius * 1.4,
        y: p.y + dirs[i][1] * p.radius * 1.4,
        vx: dirs[i][0] * spd, vy: dirs[i][1] * spd,
        dmg: dmg, r: 4 * scale, life: 1.4
      });
    }
    p.fireT = NX.PLAYER.fireRate * (rapid ? 0.55 : 1);
    NX.audio.sfx.shoot();
    NX.fx.sparks(p.x + dirX * p.radius * 1.6, p.y + dirY * p.radius * 1.6, "#fff", 2);
  }

  function eShoot(e, tx, ty, speed, spread) {
    var a = NX.angleTo(e.x, e.y, tx, ty) + (spread || 0);
    W.ebullets.push({
      x: e.x, y: e.y,
      vx: Math.cos(a) * speed * scale, vy: Math.sin(a) * speed * scale,
      r: NX.ENEMY_BULLET_R * scale, color: e.color, life: 7
    });
  }

  function eShootAngle(e, a, speed, color) {
    W.ebullets.push({
      x: e.x, y: e.y,
      vx: Math.cos(a) * speed * scale, vy: Math.sin(a) * speed * scale,
      r: NX.ENEMY_BULLET_R * scale, color: color || e.color, life: 7
    });
  }

  /* ---------------- Mejoras ---------------- */
  function dropPowerup(x, y, forceType) {
    var keys = Object.keys(NX.POWERUPS);
    var type = forceType || NX.pick(keys);
    W.powerups.push({ type: type, x: x, y: y, t: NX.POWERUP_LIFE, r: 13 * scale });
  }

  function applyPowerup(p, type) {
    var def = NX.POWERUPS[type];
    NX.audio.sfx.pickup();
    NX.fx.textPop(p.x, p.y - 26, def.label, def.color, true);
    NX.fx.ring(p.x, p.y, def.color, 70 * scale);
    if (type === "MED") {
      p.hp = Math.min(NX.PLAYER.hpMax, p.hp + 35);
    } else if (type === "SHIELD") {
      p.shield = def.dur;
    } else if (type === "BOMB") {
      bomb(p);
    } else if (type === "SLOWMO") {
      p.slowmoT = def.dur;
    } else {
      p.power = type; p.powerT = def.dur;
    }
    NX.game.onPowerup(type);
  }

  function bomb(p) {
    NX.audio.sfx.bomb();
    NX.fx.flash("#ffffff", 0.55);
    NX.fx.shake(14, 0.5);
    NX.fx.ring(p.x, p.y, "#ff3b3b", Math.max(window.innerWidth, window.innerHeight));
    W.ebullets.length = 0;
    for (var i = W.enemies.length - 1; i >= 0; i--) {
      var e = W.enemies[i];
      if (e.type === "boss") { damageEnemy(e, 14, i); continue; }
      damageEnemy(e, 10, i);
    }
  }

  /* ---------------- Daño ---------------- */
  function damageEnemy(e, dmg, idx) {
    e.hp -= dmg;
    e.hitFlash = 0.08;
    if (e.hp > 0) {
      NX.audio.sfx.hit();
      if (e.type === "boss") NX.game.onBossHp(e.hp / e.hpMax);
      return false;
    }
    // muerte
    var i = (idx !== undefined) ? idx : W.enemies.indexOf(e);
    if (i >= 0) W.enemies.splice(i, 1);
    NX.fx.burst(e.x, e.y, e.color, e.type === "boss" ? 80 : 20, e.type === "boss" ? 360 : 200, 3.5);
    NX.fx.ring(e.x, e.y, e.color, e.radius * 4);
    NX.fx.shake(e.type === "tank" || e.type === "boss" ? 9 : 4, 0.18);
    if (e.type === "boss") {
      NX.audio.sfx.bigExplode();
      NX.game.onBossDefeated(e);
      return true;
    }
    NX.audio.sfx.explode();
    NX.game.onEnemyKilled(e);
    if (e.type === "splitter") {
      for (var k = 0; k < 3; k++) {
        var m = materialize("mini", e.x + NX.rand(-14, 14), e.y + NX.rand(-14, 14));
        m.hitFlash = 0;
      }
    }
    if (Math.random() < NX.POWERUP_DROP) dropPowerup(e.x, e.y);
    return true;
  }

  function hurtPlayer(p, dmg) {
    if (p.invuln > 0 || p.dashT > 0 || !p.alive) return;
    if (p.shield > 0) {
      NX.fx.ring(p.x, p.y, "#2bff88", 50 * scale);
      NX.audio.sfx.hit();
      p.invuln = 0.35;
      return;
    }
    p.hp -= dmg;
    p.invuln = NX.PLAYER.hurtInvuln;
    NX.audio.sfx.hurt();
    NX.fx.flash("#ff2030", 0.32);
    NX.fx.shake(11, 0.35);
    NX.fx.burst(p.x, p.y, "#ff3b3b", 16, 220);
    NX.game.onPlayerHurt();
    if (p.hp <= 0) {
      p.hp = 0;
      p.alive = false;
      NX.fx.burst(p.x, p.y, "#19e6ff", 60, 320, 4);
      NX.fx.ring(p.x, p.y, "#19e6ff", 200 * scale);
      NX.audio.sfx.bigExplode();
      NX.game.onPlayerDeath();
    }
  }

  /* ---------------- IA enemiga ---------------- */
  function updateEnemy(e, dt, w, h, p) {
    e.t += dt;
    e.angle += e.spin * dt;
    if (e.hitFlash > 0) e.hitFlash -= dt;
    var def = NX.ENEMIES[e.type];

    switch (e.type) {
      case "drone":
      case "mini": {
        var a = NX.angleTo(e.x, e.y, p.x, p.y);
        // ligera ondulación para que el enjambre no sea una fila india
        a += Math.sin(e.t * 3 + e.spin * 10) * 0.25;
        e.vx = NX.lerp(e.vx, Math.cos(a) * e.speed, dt * 4);
        e.vy = NX.lerp(e.vy, Math.sin(a) * e.speed, dt * 4);
        break;
      }
      case "spinner": {
        // orbita al jugador a media distancia y dispara
        var want = 150 * scale;
        var d = Math.sqrt(NX.dist2(e.x, e.y, p.x, p.y)) || 1;
        var toP = NX.angleTo(e.x, e.y, p.x, p.y);
        var tangent = toP + Math.PI / 2 * e.orbitDir;
        var radial = (d - want) * 0.02;
        e.vx = Math.cos(tangent) * e.speed + Math.cos(toP) * radial * e.speed;
        e.vy = Math.sin(tangent) * e.speed + Math.sin(toP) * radial * e.speed;
        e.fireT -= dt;
        if (e.fireT <= 0) {
          e.fireT = def.fireRate;
          eShoot(e, p.x, p.y, def.bulletSpeed);
          NX.audio.sfx.enemyShoot();
        }
        break;
      }
      case "tank": {
        var ta = NX.angleTo(e.x, e.y, p.x, p.y);
        e.vx = Math.cos(ta) * e.speed;
        e.vy = Math.sin(ta) * e.speed;
        e.fireT -= dt;
        if (e.fireT <= 0) {
          e.fireT = def.fireRate;
          for (var s = -1; s <= 1; s++) eShoot(e, p.x, p.y, def.bulletSpeed, s * 0.3);
          NX.audio.sfx.enemyShoot();
        }
        break;
      }
      case "wraith": {
        e.teleT -= dt;
        if (e.teleT <= 0) {
          e.teleT = def.teleportEvery;
          NX.fx.burst(e.x, e.y, e.color, 12, 160);
          var na = Math.random() * NX.TAU;
          var nd = NX.rand(110, 190) * scale;
          e.x = NX.clamp(p.x + Math.cos(na) * nd, 20, w - 20);
          e.y = NX.clamp(p.y + Math.sin(na) * nd, 20, h - 20);
          NX.fx.ring(e.x, e.y, e.color, 50 * scale);
          e.lunge = 0.55; // tras teletransportarse, embiste
        }
        if (e.lunge > 0) {
          e.lunge -= dt;
          var la = NX.angleTo(e.x, e.y, p.x, p.y);
          e.vx = Math.cos(la) * e.speed * 1.7;
          e.vy = Math.sin(la) * e.speed * 1.7;
        } else {
          e.vx *= 0.92; e.vy *= 0.92;
        }
        break;
      }
      case "splitter": {
        var sa = NX.angleTo(e.x, e.y, p.x, p.y);
        e.vx = Math.cos(sa) * e.speed;
        e.vy = Math.sin(sa) * e.speed;
        break;
      }
      case "turret": {
        e.vx = 0; e.vy = 0;
        e.fireT -= dt;
        if (e.fireT <= 0) {
          e.fireT = def.fireRate;
          // ráfaga de 3 con retardo
          var self = e;
          for (var b = 0; b < 3; b++) {
            (function (k) {
              setTimeout(function () {
                if (W.enemies.indexOf(self) >= 0 && W.player && W.player.alive && NX.game.isRunning()) {
                  eShoot(self, W.player.x, W.player.y, def.bulletSpeed);
                  NX.audio.sfx.enemyShoot();
                }
              }, k * 130);
            })(b);
          }
        }
        break;
      }
      case "mirror": {
        // reflejo de VEGA: la persigue con ~0.3 s de retardo y dispara telegrafiado
        if (!e.ghost) e.ghost = [];
        e.ghost.unshift({ x: p.x, y: p.y });
        if (e.ghost.length > 18) e.ghost.pop();
        var mt = e.ghost[e.ghost.length - 1];
        var mang = NX.angleTo(e.x, e.y, mt.x, mt.y);
        e.vx = NX.lerp(e.vx, Math.cos(mang) * e.speed, dt * 4);
        e.vy = NX.lerp(e.vy, Math.sin(mang) * e.speed, dt * 4);
        e.fireT -= dt;
        if (e.fireT <= 0.8) e.aiming = true;        // telegrafía honesta de 0.8 s
        if (e.fireT <= 0) {
          e.fireT = def.fireRate;
          e.aiming = false;
          eShoot(e, p.x, p.y, def.bulletSpeed);
          NX.audio.sfx.enemyShoot();
        }
        break;
      }
      case "leech": {
        // sonda de MADRE: no dispara, te ANCLA con un haz (te ralentiza)
        var ld = Math.sqrt(NX.dist2(e.x, e.y, p.x, p.y)) || 1;
        var lwant = 170 * scale;
        var lang = NX.angleTo(e.x, e.y, p.x, p.y);
        if (ld > lwant) {
          e.vx = Math.cos(lang) * e.speed;
          e.vy = Math.sin(lang) * e.speed;
          e.lockT = 0.8; e.tether = false;          // fuera de rango: re-arma el aviso
        } else {
          e.vx *= 0.9; e.vy *= 0.9;
          if (p.dashT > 0) {
            e.lockT = 0.8; e.tether = false;        // el dash rompe el anclaje
          } else {
            e.lockT = (e.lockT === undefined ? 0.8 : e.lockT) - dt;
            if (e.lockT <= 0) {
              e.tether = true;
              p.tether = Math.max(p.tether || 0, 1); // ancla: jugador al 60% de velocidad
            }
          }
        }
        break;
      }
      case "echo_warden":
      case "vega_prime": updateMiniBoss(e, dt, w, h, p); break;
      case "boss": updateBoss(e, dt, w, h, p); break;
    }

    e.x += e.vx * dt;
    e.y += e.vy * dt;
    if (e.type !== "boss") {
      e.x = NX.clamp(e.x, 14, w - 14);
      e.y = NX.clamp(e.y, 14, h - 14);
    }
  }

  /* ---------------- Jefe: M.A.D.R.E. ---------------- */
  function updateBoss(e, dt, w, h, p) {
    var frac = e.hp / e.hpMax;
    var phase = frac > 0.66 ? 0 : (frac > 0.33 ? 1 : 2);
    if (phase !== e.phase) {
      e.phase = phase;
      NX.audio.sfx.bossRoar();
      NX.fx.flash("#8a2bff", 0.4);
      NX.fx.shake(12, 0.6);
      NX.fx.ring(e.x, e.y, "#f4f0ff", 300 * scale);
      W.ebullets.length = 0;            // respiro al cambiar de fase (decisión de diseño)
      NX.game.onBossPhase(phase);
    }

    // movimiento: deriva lenta hacia puntos aleatorios de la mitad superior
    e.moveT -= dt;
    if (e.moveT <= 0) {
      e.moveT = NX.rand(2.4, 4);
      e.tx = NX.rand(w * 0.2, w * 0.8);
      e.ty = NX.rand(h * 0.16, h * 0.42);
    }
    var ma = NX.angleTo(e.x, e.y, e.tx, e.ty);
    var md = Math.sqrt(NX.dist2(e.x, e.y, e.tx, e.ty));
    var spd = e.speed * (1 + phase * 0.5) * Math.min(1, md / 60);
    e.vx = NX.lerp(e.vx, Math.cos(ma) * spd, dt * 2);
    e.vy = NX.lerp(e.vy, Math.sin(ma) * spd, dt * 2);

    e.attackT -= dt;
    var cap = 110; // límite de balas enemigas en pantalla (QA: rendimiento y justicia)

    if (phase === 0) {
      // anillos de 14 balas + tríada apuntada
      if (e.attackT <= 0) {
        e.attackT = 1.9;
        if (W.ebullets.length < cap) {
          for (var i = 0; i < 14; i++) eShootAngle(e, (i / 14) * NX.TAU + e.t, 120, "#ff2bd6");
        }
        for (var s = -1; s <= 1; s++) eShoot(e, p.x, p.y, 175, s * 0.22);
        NX.audio.sfx.enemyShoot();
      }
    } else if (phase === 1) {
      // espiral continua + invoca esbirros
      e.spiralA += dt * 3.4;
      if (e.attackT <= 0) {
        e.attackT = 0.13;
        if (W.ebullets.length < cap) {
          eShootAngle(e, e.spiralA, 140, "#8a2bff");
          eShootAngle(e, e.spiralA + Math.PI, 140, "#19e6ff");
        }
      }
      e.minionT = (e.minionT || 4) - dt;
      if (e.minionT <= 0) {
        e.minionT = 4.5;
        queueSpawn("drone", NX.rand(40, w - 40), NX.rand(40, h * 0.4));
        queueSpawn("mini", NX.rand(40, w - 40), NX.rand(40, h * 0.4));
      }
    } else {
      // desesperación: doble espiral + ráfagas apuntadas
      e.spiralA += dt * 4.6;
      if (e.attackT <= 0) {
        e.attackT = 0.11;
        if (W.ebullets.length < cap) {
          eShootAngle(e, e.spiralA, 150, "#ff3b3b");
          eShootAngle(e, -e.spiralA + 1.3, 150, "#ffd319");
        }
      }
      e.aimT = (e.aimT || 1.4) - dt;
      if (e.aimT <= 0) {
        e.aimT = 1.4;
        for (var s2 = -2; s2 <= 2; s2++) eShoot(e, p.x, p.y, 200, s2 * 0.14);
        NX.audio.sfx.enemyShoot();
      }
    }
    e.x = NX.clamp(e.x, e.radius, w - e.radius);
    e.y = NX.clamp(e.y, e.radius, h * 0.6);
  }

  /* ---------------- Mini-jefes: Centinela (echo_warden) y VEGA original (vega_prime)
     Dos fases por HP (>50% / <=50%). NO llevan boss:true: mueren por la rama
     normal de damageEnemy, así la cadena de sectores sigue su curso.        */
  function updateMiniBoss(e, dt, w, h, p) {
    var frac = e.hp / e.hpMax;
    var phase = frac > 0.5 ? 0 : 1;
    if (phase !== e.phase) {
      e.phase = phase;
      NX.audio.sfx.bossRoar();
      NX.fx.flash(e.color, 0.35);
      NX.fx.shake(9, 0.4);
      NX.fx.ring(e.x, e.y, e.color, 220 * scale);
      W.ebullets.length = 0;            // respiro al cambiar de fase
    }
    var cap = 90;                        // tope propio de balas (deja margen bajo el 110 global)

    if (e.type === "echo_warden") {
      // EL CENTINELA: deriva lenta + anillos de "cláusulas"
      e.moveT -= dt;
      if (e.moveT <= 0) {
        e.moveT = NX.rand(2.2, 3.4);
        e.tx = NX.rand(w * 0.25, w * 0.75);
        e.ty = NX.rand(h * 0.18, h * 0.4);
      }
      var ma = NX.angleTo(e.x, e.y, e.tx, e.ty);
      var md = Math.sqrt(NX.dist2(e.x, e.y, e.tx, e.ty));
      var espd = e.speed * Math.min(1, md / 60);
      e.vx = NX.lerp(e.vx, Math.cos(ma) * espd, dt * 2);
      e.vy = NX.lerp(e.vy, Math.sin(ma) * espd, dt * 2);

      e.attackT -= dt;
      if (e.attackT <= 0) {
        if (phase === 0) {
          e.attackT = 2.0;
          NX.fx.ring(e.x, e.y, e.color, e.radius * 3);
          if (W.ebullets.length < cap)
            for (var i = 0; i < 12; i++) eShootAngle(e, (i / 12) * NX.TAU + e.t, 110, "#8a2bff");
        } else {
          e.attackT = 1.4;
          NX.fx.ring(e.x, e.y, e.color, e.radius * 3);
          if (W.ebullets.length < cap)
            for (var j = 0; j < 14; j++) eShootAngle(e, (j / 14) * NX.TAU - e.t, 120, "#8a2bff");
          for (var s = -1; s <= 1; s++) eShoot(e, p.x, p.y, 175, s * 0.22);
        }
        NX.audio.sfx.enemyShoot();
      }
    } else {
      // LA VEGA ORIGINAL: dos recuerdos
      if (phase === 0) {
        // RECUERDO 1 «La última carrera»: persecución + embestidas telegrafiadas
        e.dashT = (e.dashT === undefined ? 2.2 : e.dashT) - dt;
        if (e.windup > 0) {
          e.windup -= dt;
          e.vx *= 0.85; e.vy *= 0.85;               // se detiene antes de embestir
          if (e.windup <= 0) {
            var ca = NX.angleTo(e.x, e.y, e.chargeX, e.chargeY);
            e.vx = Math.cos(ca) * e.speed * 2.6;
            e.vy = Math.sin(ca) * e.speed * 2.6;
            e.charge = 0.45;
          }
        } else if (e.charge > 0) {
          e.charge -= dt;                            // mantiene el impulso de la embestida
        } else {
          var va = NX.angleTo(e.x, e.y, p.x, p.y);
          e.vx = NX.lerp(e.vx, Math.cos(va) * e.speed, dt * 3);
          e.vy = NX.lerp(e.vy, Math.sin(va) * e.speed, dt * 3);
          if (e.dashT <= 0) {
            e.dashT = 2.2;
            e.windup = 0.8;                          // telegrafía honesta (0.8 s)
            e.chargeX = p.x; e.chargeY = p.y;
            NX.fx.ring(e.x, e.y, "#f4f0ff", e.radius * 2.4);
          }
        }
        e.shootT = (e.shootT === undefined ? 1.8 : e.shootT) - dt;
        if (e.shootT <= 0) {
          e.shootT = 1.8;
          if (W.ebullets.length < cap)
            for (var k = -2; k <= 2; k++) eShoot(e, p.x, p.y, 150, k * 0.15);
          NX.audio.sfx.enemyShoot();
        }
      } else {
        // RECUERDO 2 «El último no»: se planta + espiral doble + ráfaga apuntada
        e.moveT -= dt;
        if (e.moveT <= 0) {
          e.moveT = NX.rand(2.4, 3.6);
          e.tx = NX.rand(w * 0.3, w * 0.7);
          e.ty = NX.rand(h * 0.2, h * 0.38);
        }
        var ma2 = NX.angleTo(e.x, e.y, e.tx, e.ty);
        var md2 = Math.sqrt(NX.dist2(e.x, e.y, e.tx, e.ty));
        var espd2 = e.speed * Math.min(1, md2 / 60);
        e.vx = NX.lerp(e.vx, Math.cos(ma2) * espd2, dt * 2);
        e.vy = NX.lerp(e.vy, Math.sin(ma2) * espd2, dt * 2);
        e.spiralA += dt * 2.8;
        e.attackT -= dt;
        if (e.attackT <= 0) {
          e.attackT = 0.14;
          if (W.ebullets.length < cap) {
            eShootAngle(e, e.spiralA, 135, "#b388ff");
            eShootAngle(e, -e.spiralA + Math.PI, 135, "#f4f0ff");
          }
        }
        e.aimT = (e.aimT === undefined ? 1.5 : e.aimT) - dt;
        if (e.aimT <= 0) {
          e.aimT = 1.5;
          for (var s2 = -1; s2 <= 1; s2++) eShoot(e, p.x, p.y, 175, s2 * 0.2);
          NX.audio.sfx.enemyShoot();
        }
      }
    }
  }

  /* ---------------- Actualización general ---------------- */
  function update(dt, w, h) {
    var p = W.player;
    if (!p) return;

    // tiempo-bala: el mundo va al 35%, tú al 75% (sensación de poder)
    var worldDt = dt, playerDt = dt;
    if (p.slowmoT > 0) {
      p.slowmoT -= dt;
      worldDt = dt * 0.35;
      playerDt = dt * 0.75;
    }

    /* --- jugador --- */
    if (p.alive) {
      var inp = NX.input.state;
      NX.input.poll(p.x, p.y);

      var tether = p.tether || 0;   // anclaje del frame anterior (leech)
      p.tether = 0;                 // se reacumula en el update de enemigos (corren después)

      if (p.invuln > 0) p.invuln -= playerDt;
      if (p.shield > 0) p.shield -= playerDt;
      if (p.powerT > 0) { p.powerT -= playerDt; if (p.powerT <= 0) p.power = null; }
      if (p.dashCd > 0) p.dashCd -= playerDt;

      if (NX.input.consumeDash() && p.dashCd <= 0) {
        var dx = inp.move.x, dy = inp.move.y;
        if (!dx && !dy) { dx = Math.cos(p.angle); dy = Math.sin(p.angle); }
        var dl = Math.hypot(dx, dy) || 1;
        p.dashDx = dx / dl; p.dashDy = dy / dl;
        p.dashT = NX.PLAYER.dashTime;
        p.dashCd = NX.PLAYER.dashCooldown;
        NX.audio.sfx.dash();
        NX.fx.ring(p.x, p.y, "#19e6ff", 46 * scale);
      }

      if (p.dashT > 0) {
        p.dashT -= playerDt;
        p.vx = p.dashDx * NX.PLAYER.dashSpeed * scale;
        p.vy = p.dashDy * NX.PLAYER.dashSpeed * scale;
        NX.fx.sparks(p.x, p.y, "#19e6ff", 3);
      } else {
        var spd = NX.PLAYER.speed * scale * (1 - 0.4 * tether);
        p.vx = NX.lerp(p.vx, inp.move.x * spd, playerDt * 12);
        p.vy = NX.lerp(p.vy, inp.move.y * spd, playerDt * 12);
      }

      p.x = NX.clamp(p.x + p.vx * playerDt, p.radius, w - p.radius);
      p.y = NX.clamp(p.y + p.vy * playerDt, p.radius, h - p.radius);

      // estela
      p.trail.unshift({ x: p.x, y: p.y });
      if (p.trail.length > 10) p.trail.pop();

      // apuntado y disparo
      var aimX = 0, aimY = 0, wantFire = false;
      if (inp.aim.active) {
        aimX = inp.aim.x; aimY = inp.aim.y; wantFire = true;
      } else {
        // autoapuntado al enemigo más cercano
        var best = null, bd = Infinity;
        for (var i = 0; i < W.enemies.length; i++) {
          var d2 = NX.dist2(p.x, p.y, W.enemies[i].x, W.enemies[i].y);
          if (d2 < bd) { bd = d2; best = W.enemies[i]; }
        }
        if (best) {
          // disparo con predicción: apunta a donde ESTARÁ el enemigo
          var tLead = Math.sqrt(bd) / (NX.PLAYER.bulletSpeed * scale);
          var aa = NX.angleTo(p.x, p.y, best.x + best.vx * tLead, best.y + best.vy * tLead);
          aimX = Math.cos(aa); aimY = Math.sin(aa);
          wantFire = true;
        }
      }
      if (aimX || aimY) p.angle = Math.atan2(aimY, aimX);
      else if (inp.move.x || inp.move.y) p.angle = Math.atan2(inp.move.y, inp.move.x);

      p.fireT -= playerDt;
      if (wantFire && p.fireT <= 0 && p.dashT <= 0) pShoot(p, Math.cos(p.angle), Math.sin(p.angle));
    }

    /* --- portales de aparición --- */
    for (var pi = W.portals.length - 1; pi >= 0; pi--) {
      var po = W.portals[pi];
      po.t -= worldDt;
      if (po.t <= 0) {
        W.portals.splice(pi, 1);
        materialize(po.type, po.x, po.y);
      }
    }

    /* --- enemigos --- */
    for (var ei = W.enemies.length - 1; ei >= 0; ei--) {
      updateEnemy(W.enemies[ei], worldDt, w, h, p);
    }

    /* --- balas del jugador --- */
    for (var bi = W.pbullets.length - 1; bi >= 0; bi--) {
      var b = W.pbullets[bi];
      b.x += b.vx * playerDt; b.y += b.vy * playerDt;
      b.life -= playerDt;
      var dead = b.life <= 0 || b.x < -20 || b.x > w + 20 || b.y < -20 || b.y > h + 20;
      if (!dead) {
        for (var ej = W.enemies.length - 1; ej >= 0; ej--) {
          var en = W.enemies[ej];
          var rr = en.radius + b.r;
          if (NX.dist2(b.x, b.y, en.x, en.y) < rr * rr) {
            NX.fx.sparks(b.x, b.y, en.color, 4);
            damageEnemy(en, b.dmg, ej);
            dead = true;
            break;
          }
        }
      }
      if (dead) W.pbullets.splice(bi, 1);
    }

    /* --- balas enemigas --- */
    for (var eb = W.ebullets.length - 1; eb >= 0; eb--) {
      var ebu = W.ebullets[eb];
      ebu.x += ebu.vx * worldDt; ebu.y += ebu.vy * worldDt;
      ebu.life -= worldDt;
      var gone = ebu.life <= 0 || ebu.x < -30 || ebu.x > w + 30 || ebu.y < -30 || ebu.y > h + 30;
      if (!gone && p.alive) {
        var pr = p.radius * 0.7 + ebu.r;  // hitbox generosa con el jugador (UX)
        if (NX.dist2(ebu.x, ebu.y, p.x, p.y) < pr * pr) {
          if (p.dashT > 0 || p.invuln > 0) {
            // las esquivas con dash puntúan estilo
            if (p.dashT > 0) NX.game.onGraze();
          } else {
            hurtPlayer(p, 12);
            gone = true;
          }
        }
      }
      if (gone) W.ebullets.splice(eb, 1);
    }

    /* --- contacto enemigo-jugador --- */
    if (p.alive && p.dashT <= 0) {
      for (var ck = 0; ck < W.enemies.length; ck++) {
        var ce = W.enemies[ck];
        var cr = ce.radius + p.radius * 0.75;
        if (NX.dist2(ce.x, ce.y, p.x, p.y) < cr * cr) {
          hurtPlayer(p, NX.PLAYER.contactDamage);
          break;
        }
      }
    }

    /* --- mejoras --- */
    for (var pu = W.powerups.length - 1; pu >= 0; pu--) {
      var u = W.powerups[pu];
      u.t -= dt;
      if (u.t <= 0) { W.powerups.splice(pu, 1); continue; }
      if (p.alive) {
        var ur = u.r + p.radius;
        if (NX.dist2(u.x, u.y, p.x, p.y) < ur * ur) {
          W.powerups.splice(pu, 1);
          applyPowerup(p, u.type);
        }
      }
    }
  }

  /* ---------------- Render ---------------- */
  function poly(ctx, x, y, r, n, rot) {
    ctx.beginPath();
    for (var i = 0; i < n; i++) {
      var a = rot + (i / n) * NX.TAU;
      var px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function neonStroke(ctx, color, width, glow) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.shadowColor = color;
    ctx.shadowBlur = glow;
  }

  function drawEnemy(ctx, e, t) {
    var c = e.hitFlash > 0 ? "#ffffff" : e.color;
    ctx.save();
    ctx.translate(e.x, e.y);
    switch (e.type) {
      case "drone":
        ctx.rotate(Math.atan2(e.vy, e.vx) + Math.PI / 2);
        neonStroke(ctx, c, 2, 10);
        ctx.beginPath();
        ctx.moveTo(0, -e.radius);
        ctx.lineTo(e.radius * 0.85, e.radius);
        ctx.lineTo(0, e.radius * 0.45);
        ctx.lineTo(-e.radius * 0.85, e.radius);
        ctx.closePath();
        ctx.stroke();
        break;
      case "mini":
        neonStroke(ctx, c, 2, 8);
        poly(ctx, 0, 0, e.radius, 3, e.angle);
        ctx.stroke();
        break;
      case "spinner":
        ctx.rotate(e.t * 4);
        neonStroke(ctx, c, 2, 10);
        ctx.strokeRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
        ctx.strokeRect(-e.radius * 0.45, -e.radius * 0.45, e.radius * 0.9, e.radius * 0.9);
        break;
      case "tank":
        neonStroke(ctx, c, 3, 12);
        poly(ctx, 0, 0, e.radius, 6, e.t * 0.6);
        ctx.stroke();
        poly(ctx, 0, 0, e.radius * 0.55, 6, -e.t * 0.9);
        ctx.stroke();
        break;
      case "wraith":
        ctx.globalAlpha = 0.55 + 0.45 * Math.sin(e.t * 9);
        neonStroke(ctx, c, 2, 14);
        poly(ctx, 0, 0, e.radius, 4, Math.PI / 4 + e.t * 2);
        ctx.stroke();
        break;
      case "splitter":
        neonStroke(ctx, c, 2, 10);
        ctx.beginPath(); ctx.arc(0, 0, e.radius, 0, NX.TAU); ctx.stroke();
        poly(ctx, 0, 0, e.radius * 0.5, 3, e.t * 3);
        ctx.stroke();
        break;
      case "turret":
        neonStroke(ctx, c, 2.5, 10);
        poly(ctx, 0, 0, e.radius, 5, -Math.PI / 2);
        ctx.stroke();
        if (W.player) {
          var ta = NX.angleTo(e.x, e.y, W.player.x, W.player.y);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ta) * e.radius * 1.5, Math.sin(ta) * e.radius * 1.5);
          ctx.stroke();
        }
        break;
      case "mirror":
        // reflejo del jugador: silueta de nave translúcida blanco-violeta
        if (e.aiming && W.player) {
          var maa = NX.angleTo(e.x, e.y, W.player.x, W.player.y);
          ctx.save();
          ctx.globalAlpha = 0.35 + 0.4 * Math.abs(Math.sin(e.t * 26));
          neonStroke(ctx, c, 1.5, 8);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(maa) * e.radius * 3, Math.sin(maa) * e.radius * 3);
          ctx.stroke();
          ctx.restore();
        }
        ctx.rotate(Math.atan2(e.vy, e.vx) + Math.PI / 2);
        ctx.globalAlpha = 0.5 + 0.35 * Math.sin(e.t * 7);
        neonStroke(ctx, c, 2, 12);
        ctx.beginPath();
        ctx.moveTo(0, -e.radius * 1.4);
        ctx.lineTo(e.radius, e.radius);
        ctx.lineTo(0, e.radius * 0.45);
        ctx.lineTo(-e.radius, e.radius);
        ctx.closePath();
        ctx.stroke();
        break;
      case "leech":
        // hexágono (masa de MADRE) + ojo + haz de anclaje
        if (e.tether && W.player) {
          var lba = NX.angleTo(e.x, e.y, W.player.x, W.player.y);
          var lbd = Math.sqrt(NX.dist2(e.x, e.y, W.player.x, W.player.y));
          ctx.save();
          ctx.globalAlpha = 0.4 + 0.3 * Math.sin(e.t * 8);
          neonStroke(ctx, c, 3, 14);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(lba) * lbd, Math.sin(lba) * lbd);
          ctx.stroke();
          ctx.restore();
        }
        neonStroke(ctx, c, 2.5, 12);
        poly(ctx, 0, 0, e.radius, 6, e.t * 0.4);
        ctx.stroke();
        ctx.shadowBlur = 14; ctx.shadowColor = c;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * (0.22 + 0.06 * Math.sin(e.t * 5)), 0, NX.TAU);
        ctx.fill();
        break;
      case "echo_warden":
        // mini-jefe: hexágono grande con doble anillo + ojo
        var ewf = e.hp / e.hpMax;
        neonStroke(ctx, c, 3, 20);
        poly(ctx, 0, 0, e.radius, 6, e.t * 0.5);
        ctx.stroke();
        neonStroke(ctx, "#c7a4ff", 2, 12);
        poly(ctx, 0, 0, e.radius * 0.66, 6, -e.t * 0.7);
        ctx.stroke();
        ctx.shadowBlur = 22; ctx.shadowColor = c;
        ctx.fillStyle = ewf > 0.5 ? "#c7a4ff" : "#ff3b3b";
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * (0.18 + 0.05 * Math.sin(e.t * 6)), 0, NX.TAU);
        ctx.fill();
        break;
      case "vega_prime":
        // la VEGA original: nave del jugador a gran escala, doble contorno violeta+blanco
        ctx.save();
        ctx.rotate(Math.atan2(e.vy, e.vx) + Math.PI / 2);
        neonStroke(ctx, "#b388ff", 4, 18);
        ctx.beginPath();
        ctx.moveTo(0, -e.radius * 1.5);
        ctx.lineTo(e.radius, e.radius * 1.1);
        ctx.lineTo(0, e.radius * 0.5);
        ctx.lineTo(-e.radius, e.radius * 1.1);
        ctx.closePath();
        ctx.stroke();
        neonStroke(ctx, c, 2, 14);
        ctx.stroke();
        ctx.restore();
        ctx.shadowBlur = 22; ctx.shadowColor = "#ff2bd6";
        ctx.fillStyle = e.phase >= 1 ? "#ff2bd6" : "#f4f0ff";
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * (0.16 + 0.06 * Math.sin(e.t * 5)), 0, NX.TAU);
        ctx.fill();
        break;
      case "boss":
        // estructura giratoria de tres anillos + núcleo-ojo
        var fr = e.hp / e.hpMax;
        neonStroke(ctx, c, 3, 22);
        poly(ctx, 0, 0, e.radius, 8, e.t * 0.5);
        ctx.stroke();
        neonStroke(ctx, "#8a2bff", 2, 14);
        poly(ctx, 0, 0, e.radius * 0.72, 6, -e.t * 0.8);
        ctx.stroke();
        neonStroke(ctx, "#ff2bd6", 2, 14);
        poly(ctx, 0, 0, e.radius * 0.45, 3, e.t * 1.4);
        ctx.stroke();
        // ojo central que se enrojece al perder vida
        ctx.shadowBlur = 26;
        ctx.shadowColor = "#ff3b3b";
        ctx.fillStyle = fr > 0.5 ? "#f4f0ff" : "#ff3b3b";
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * (0.16 + 0.05 * Math.sin(e.t * 6)), 0, NX.TAU);
        ctx.fill();
        break;
    }
    ctx.restore();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  function draw(ctx, t) {
    var p = W.player;

    // portales (telegrafía de aparición)
    for (var pi = 0; pi < W.portals.length; pi++) {
      var po = W.portals[pi];
      var f = 1 - po.t / NX.SPAWN_TELEGRAPH;
      var col = NX.ENEMIES[po.type].color;
      ctx.save();
      ctx.globalAlpha = 0.25 + f * 0.6;
      neonStroke(ctx, col, 2, 12);
      poly(ctx, po.x, po.y, 18 * (1 - f * 0.4) * S(), 6, t * 4);
      ctx.stroke();
      ctx.restore();
      ctx.shadowBlur = 0;
    }

    // mejoras
    for (var pu = 0; pu < W.powerups.length; pu++) {
      var u = W.powerups[pu];
      var def = NX.POWERUPS[u.type];
      var blinkOut = u.t < 2.5 && (Math.floor(u.t * 6) % 2 === 0);
      if (blinkOut) continue;
      ctx.save();
      ctx.translate(u.x, u.y + Math.sin(t * 3 + u.x) * 3);
      neonStroke(ctx, def.color, 2, 14);
      poly(ctx, 0, 0, u.r, 6, t * 1.5);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = def.color;
      ctx.font = "bold " + Math.round(13 * S()) + 'px "Courier New", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(def.letter, 0, 1);
      ctx.restore();
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    // balas enemigas
    ctx.globalCompositeOperation = "lighter";
    for (var eb = 0; eb < W.ebullets.length; eb++) {
      var b = W.ebullets[eb];
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, NX.TAU);
      ctx.fill();
    }
    // balas del jugador
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#19e6ff";
    ctx.shadowBlur = 12;
    for (var pb = 0; pb < W.pbullets.length; pb++) {
      var pbl = W.pbullets[pb];
      ctx.beginPath();
      ctx.arc(pbl.x, pbl.y, pbl.r, 0, NX.TAU);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";

    // enemigos
    for (var ei = 0; ei < W.enemies.length; ei++) drawEnemy(ctx, W.enemies[ei], t);

    // jugador
    if (p && p.alive) {
      // estela
      for (var tr = p.trail.length - 1; tr > 0; tr--) {
        var a = 1 - tr / p.trail.length;
        ctx.globalAlpha = a * 0.3;
        ctx.fillStyle = p.dashT > 0 ? "#19e6ff" : "#ff2bd6";
        ctx.beginPath();
        ctx.arc(p.trail[tr].x, p.trail[tr].y, p.radius * a * 0.8, 0, NX.TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      var blink = p.invuln > 0 && Math.floor(p.invuln * 14) % 2 === 0;
      if (!blink) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle + Math.PI / 2);
        neonStroke(ctx, "#19e6ff", 2.5, 16);
        ctx.beginPath();
        ctx.moveTo(0, -p.radius * 1.5);
        ctx.lineTo(p.radius, p.radius * 1.1);
        ctx.lineTo(0, p.radius * 0.5);
        ctx.lineTo(-p.radius, p.radius * 1.1);
        ctx.closePath();
        ctx.stroke();
        // cabina
        ctx.fillStyle = "#ff2bd6";
        ctx.shadowColor = "#ff2bd6";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, -p.radius * 0.2, p.radius * 0.32, 0, NX.TAU);
        ctx.fill();
        // motor
        ctx.fillStyle = "#ffd319";
        ctx.shadowColor = "#ffd319";
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 30);
        ctx.beginPath();
        ctx.arc(0, p.radius * 0.95, p.radius * 0.3, 0, NX.TAU);
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // escudo
      if (p.shield > 0) {
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 8);
        neonStroke(ctx, "#2bff88", 2, 14);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2, 0, NX.TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    }
  }

  return {
    resetWorld: resetWorld,
    clearHostiles: clearHostiles,
    spawnEdge: spawnEdge,
    queueSpawn: queueSpawn,
    materialize: materialize,
    dropPowerup: dropPowerup,
    update: update,
    draw: draw,
    scale: S
  };
})();
