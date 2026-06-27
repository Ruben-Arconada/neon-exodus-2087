/* Regenera neon-exodus-2087.html (versión monolítica autocontenida) a partir
   de index.html + css/ + js/. Así el standalone deja de ser un tercer origen
   de verdad editado a mano: se reconstruye desde las fuentes modulares.

   Uso:  node scripts/build-standalone.js   (o `npm run standalone`)            */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "neon-exodus-2087.html");

let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

// 1) Inlinar la hoja de estilos
html = html.replace(
  /<link rel="stylesheet" href="css\/style\.css">/,
  function () {
    var css = fs.readFileSync(path.join(ROOT, "css", "style.css"), "utf8");
    return "<style>\n" + css + "\n</style>";
  }
);

// 2) Inlinar cada <script src="js/X.js"> en orden, con marcador de sección
var inlined = [];
html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, function (_m, src) {
  var code = fs.readFileSync(path.join(ROOT, src), "utf8");
  inlined.push(src);
  // (función de reemplazo: evita que '$' en el código se interprete como patrón)
  return "<script>\n/* ===== " + src + " ===== */\n" + code + "\n</script>";
});

fs.writeFileSync(OUT, html);
console.log(
  "neon-exodus-2087.html regenerado (" +
  (html.length / 1024).toFixed(1) + " KB) · scripts: " + inlined.join(", ")
);
