/* Copia los archivos web del juego a www/ para que Capacitor los
   empaquete. La raíz del repo se mantiene intacta (GitHub Pages sigue
   sirviendo desde ahí); www/ es solo el "build" para la app iOS. */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "www");

const FILES = ["index.html"];
const DIRS = ["css", "js"];

function rmrf(p) { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); }
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name), d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

rmrf(OUT);
fs.mkdirSync(OUT, { recursive: true });
for (const f of FILES) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
for (const d of DIRS) copyDir(path.join(ROOT, d), path.join(OUT, d));

console.log("www/ sincronizado:", [...FILES, ...DIRS.map(d => d + "/")].join(", "));
