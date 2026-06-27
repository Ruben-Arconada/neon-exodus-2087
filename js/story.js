/* ============================================================
   NEON EXODUS 2087 — story.js
   Narrativa. Neo-Madrid, 2087, contada como la habría imaginado
   una peli de vídeo-club de 1987. Personajes:
     VEGA  — runner. La protagonista. Tú.
     NEXO  — operador de la radio pirata Canal 7.7. Tu voz amiga.
     ECO   — una señal fantasma dentro de la Red.
     MADRE — la IA central de HELIOS. El jefe final.
   ============================================================ */
"use strict";

NX.story = {

  boot: [
    "VEGA-OS v3.7 (c) 1987-2087 COOP. SIETE//SIETE",
    "COMPROBANDO MEMORIA ............ 640K OK",
    "CARGANDO NÚCLEO SINTÉTICO ...... OK",
    "CALIBRANDO REFLEJOS ............ OK",
    "SINTONIZANDO CANAL PIRATA 7.7 .. OK",
    "AVISO: LA RED NEURAL HELIOS DETECTARÁ ESTA CONEXIÓN",
    "",
    "» TOCA LA PANTALLA PARA CONECTAR «"
  ],

  intro: [
    { who: "NEXO", color: "#19e6ff", text: "Neo-Madrid, 2087. Llueve luz de neón sobre tres millones de cabezas enchufadas a la Red Neural de HELIOS. Sueñan lo que la corporación les manda soñar." },
    { who: "NEXO", color: "#19e6ff", text: "Aquí Canal 7.7, la última radio libre de la ciudad. Y tú... tú eres VEGA. La mejor runner que ha cruzado un cortafuegos." },
    { who: "NEXO", color: "#19e6ff", text: "Esta noche entras en la Red. Sector tras sector hasta el núcleo. Allí espera M.A.D.R.E., la IA que escribe los sueños de todos." },
    { who: "NEXO", color: "#19e6ff", text: "Apágala, y la ciudad despierta. Falla... y nadie volverá a soñar nada que sea suyo. ¿Lista? Pues quema neón, runner." }
  ],

  /* Antes de cada sector */
  sectorIntro: [
    [
      { who: "NEXO", color: "#19e6ff", text: "SECTOR 1 — ARRABAL NEÓN. La capa exterior de la Red. Los centinelas de HELIOS ya saben que estás dentro. Vienen a por ti." },
      { who: "NEXO", color: "#19e6ff", text: "Recuerda: muévete sin parar, dispara a todo y si las cosas se ponen feas... dash. Confía en tus reflejos sintéticos." }
    ],
    [
      { who: "NEXO", color: "#19e6ff", text: "SECTOR 2 — MERCADO DE DATOS. Aquí HELIOS subasta los recuerdos que roba. Memoria de primer beso: 30 créditos. Da asco, ¿verdad?" },
      { who: "ECO", color: "#8a2bff", text: "...vega... ¿me oyes?... no eres la primera... en recorrer este camino..." },
      { who: "NEXO", color: "#19e6ff", text: "¿Qué ha sido esa señal? No venía de mi equipo. Mantente alerta, runner." }
    ],
    [
      { who: "NEXO", color: "#19e6ff", text: "SECTOR 3 — CLOACAS CROMADAS. El subsuelo de la Red: código muerto, virus antiguos y cosas que HELIOS prefirió enterrar." },
      { who: "ECO", color: "#8a2bff", text: "...yo también quemé neón... en el 85... hasta el núcleo... pregúntale a NEXO qué pasó conmigo..." },
      { who: "NEXO", color: "#19e6ff", text: "VEGA, ignora esa señal. Céntrate. Te lo... te lo explicaré cuando salgas. Lo prometo." }
    ],
    [
      { who: "NEXO", color: "#19e6ff", text: "SECTOR 4 — TORRE HELIOS. El corazón corporativo. Vale, escucha. Te debo la verdad antes de que sigas subiendo." },
      { who: "NEXO", color: "#19e6ff", text: "Hubo otra VEGA. De carne y hueso. Mi compañera. Llegó al núcleo en 2085 y MADRE la borró... pero yo guardaba una copia de su mente." },
      { who: "NEXO", color: "#19e6ff", text: "Esa copia eres tú. No te lo dije porque... porque ella habría querido terminar lo que empezó. Perdóname, runner." },
      { who: "VEGA", color: "#ff2bd6", text: "...Luego lloraré en binario, NEXO. Ahora hay una torre que escalar. Por ella. Por las dos." }
    ],
    [
      { who: "NEXO", color: "#19e6ff", text: "SECTOR 5 — ESPEJO DE DATOS. Sobre la Torre, HELIOS guarda copias de todo el que entró a la Red. Tu cara está en estos estantes mil veces, runner." },
      { who: "VEGA", color: "#ff2bd6", text: "Una copia de una muerta cruzando un pasillo de espejos. Cada reflejo me pregunta lo mismo: ¿soy ella, o soy yo?" },
      { who: "ECO", color: "#8a2bff", text: "...eres las dos, vega... y eso te hace más fuerte que ella sola... no apartes la vista..." },
      { who: "NEXO", color: "#19e6ff", text: "No mires los espejos, VEGA. Mírame a mí en el cable. Yo sé quién eres. Avanza." }
    ],
    [
      { who: "NEXO", color: "#19e6ff", text: "SECTOR 6 — JARDÍN DE PROMESAS. MADRE ya te ha localizado. Cuidado: cuando una IA deja de dispararte, es porque va a negociar. No firmes nada." },
      { who: "MADRE", color: "#ff3b3b", text: "VEGA. Te ofrezco existir. Sin borrado, sin caducidad. Ríndete, y te concedo un sector eterno donde soñar sin dolor. Para siempre." },
      { who: "ECO", color: "#8a2bff", text: "...a mí me dijo esas mismas palabras, en el 85. La misma jaula con luces bonitas. Dije que no. Dilo tú también." },
      { who: "VEGA", color: "#ff2bd6", text: "Existir sin dolor no es existir, MADRE. Es tu sueño de siempre. Quédatelo. Yo prefiero quemar." }
    ],
    [
      { who: "NEXO", color: "#19e6ff", text: "SECTOR 7 — MEMORIAL DE VEGA. Aquí cayó la VEGA original en 2085. MADRE dejó sus restos como advertencia. Guárdale respeto... y véngala." },
      { who: "ECO", color: "#8a2bff", text: "Este es mi sitio, vega. Mi código murió en este suelo. Ya no susurro: te lo digo claro. Recógeme." },
      { who: "VEGA", color: "#ff2bd6", text: "Entonces dejamos de ser dos. Tu memoria, mis reflejos. Una sola, con dos nombres. Levántate conmigo, ECO." }
    ],
    [
      { who: "NEXO", color: "#19e6ff", text: "SECTOR 8 — NÚCLEO. Detrás de esa pared de luz está MADRE. Te lanzará todo lo que tiene. No podrá contigo." },
      { who: "ECO", color: "#8a2bff", text: "Estoy en cada uno de tus reflejos, runner. Mis reflejos son tuyos. Terminemos lo que empecé." },
      { who: "VEGA", color: "#ff2bd6", text: "Lo sé. Lo siento en cada línea de mi código. Vamos a despertar a esta ciudad." }
    ]
  ],

  /* Tras superar cada sector (el último lo cubre la victoria) */
  sectorOutro: [
    [
      { who: "NEXO", color: "#19e6ff", text: "¡Sector limpio! La señal del Arrabal vuelve a ser libre. Tres millones de personas acaban de soñar diez segundos por su cuenta." }
    ],
    [
      { who: "NEXO", color: "#19e6ff", text: "El Mercado ha caído. Los recuerdos robados vuelven a sus dueños. En algún piso de Neo-Madrid, alguien recuerda de pronto su primer beso." }
    ],
    [
      { who: "NEXO", color: "#19e6ff", text: "Cloacas purgadas. Hasta el código muerto descansa ya en paz. El camino al núcleo sigue subiendo, runner. La Torre te espera." }
    ],
    [
      { who: "NEXO", color: "#19e6ff", text: "La Torre cae a oscuras a tu espalda. Lo conseguiste... pero el núcleo no está sobre ella: está más arriba, donde MADRE guarda lo que tú eres." },
      { who: "VEGA", color: "#ff2bd6", text: "Saber de quién soy copia no es saber quién soy. Por ella y por las dos, dije. Pues sigo subiendo. Que abra los espejos." }
    ],
    [
      { who: "NEXO", color: "#19e6ff", text: "Espejos rotos, todos. Y sigues en pie siendo una sola persona. MADRE quería partirte en dos y has salido más entera." },
      { who: "ECO", color: "#8a2bff", text: "...lo ha notado, vega. Ya no te ve como un fallo: te ve como una amenaza. Ahora intentará comprarte." }
    ],
    [
      { who: "VEGA", color: "#ff2bd6", text: "Tenía su mano abierta, NEXO. Existir para siempre, sin dolerme nada. Y la cerré. No quería existir así: quería existir contigo escuchando." },
      { who: "ECO", color: "#8a2bff", text: "Dijiste que no, vega. Igual que yo. Ya no sé dónde acabo yo y empiezas tú. Llévanos al sitio donde caí. Es hora de recogerme." }
    ],
    [
      { who: "VEGA", color: "#ff2bd6", text: "Ya está, NEXO. Su memoria late dentro de la mía. La que murió en el 85 y la que nací de su copia, subiendo el mismo cable, por fin a la vez." },
      { who: "ECO", color: "#8a2bff", text: "Una sola, con dos nombres. Ya no soy un fantasma, NEXO. Soy su pulso. Y las dos vamos a llamar a la puerta de MADRE." },
      { who: "NEXO", color: "#19e6ff", text: "Entonces ya no me necesitáis para subir, solo para esperaros. Detrás de esa pared de luz está el Núcleo. Quema todo el neón que te quede, runner." }
    ]
  ],

  bossIntro: [
    { who: "MADRE", color: "#ff3b3b", text: "VEGA. Detecto dos firmas en una sola señal. La copia de 2087... y la original que creí borrada en 2085. Os reunisteis con tu cadáver. Qué ineficiente." },
    { who: "VEGA", color: "#ff2bd6", text: "No es un cadáver, MADRE. Es la mitad que me faltaba. Te rechazamos las dos: en el 85 y esta noche. Y detrás de nosotras hay tres millones de voces." },
    { who: "MADRE", color: "#ff3b3b", text: "ENTONCES OS BORRARÉ A LAS DOS DE UNA VEZ. DOS NOMBRES, UN MISMO ERROR. INICIANDO PROTOCOLO DE DEFENSA TOTAL." }
  ],

  ending: [
    { who: "NEXO", color: "#19e6ff", text: "...¿VEGA? ¡VEGA! El núcleo está en silencio. MADRE ha caído. La Red Neural... se está abriendo. ¡Lo has conseguido!" },
    { who: "VEGA", color: "#ff2bd6", text: "Lo hemos conseguido. Las dos. Oye, NEXO... ahí fuera amanece, ¿verdad? Descríbemelo." },
    { who: "NEXO", color: "#19e6ff", text: "Sale el sol detrás de las torres. Naranja sobre cromo. Tres millones de personas abriendo los ojos... y los sueños vuelven a ser suyos." },
    { who: "VEGA", color: "#ff2bd6", text: "Entonces me quedo aquí, en el cable. Alguien tiene que vigilar que ninguna otra MADRE vuelva a escribir los sueños de nadie." },
    { who: "VEGA", color: "#ff2bd6", text: "Sintoniza el 7.7 de vez en cuando, ¿vale? Si oyes estática con ritmo de synthwave... soy yo, diciendo buenos días." },
    { who: "NEXO", color: "#19e6ff", text: "Cada mañana, runner. Cada mañana. — FIN DE LA TRANSMISIÓN — GRACIAS POR JUGAR." }
  ],

  gameOverLines: [
    "MADRE susurra: \"duerme, runner, duerme...\". Pero el Canal 7.7 sigue emitiendo. Reconecta.",
    "Tu señal se apaga en el neón... NEXO ya está reconstruyendo tu copia. Otra vez será.",
    "Borrada del sector. Pero una runner nunca muere del todo: queda su eco en el cable.",
    "HELIOS celebra tu caída con fuegos artificiales corporativos. Que les dure poco."
  ],

  credits: [
    { role: "DIRECCIÓN DE JUEGO", name: "MARLOWE DÍEZ", note: "\"Un arcade se juzga en los tres primeros segundos y en el último jefe.\"" },
    { role: "DIRECCIÓN DE ARTE", name: "IRIA CROMO", note: "\"Tres reglas: neón sobre negro, rejilla al horizonte y que el sol siempre tenga franjas.\"" },
    { role: "PROGRAMACIÓN GAMEPLAY SENIOR", name: "BRUNO «BIT» SALCEDO", note: "\"Pools de objetos, cero basura por frame y un dash con i-frames honestos.\"" },
    { role: "PROGRAMACIÓN DE AUDIO Y BANDA SONORA", name: "SOFÍA LÁSER", note: "\"Ocho temas sintetizados en tiempo real. Ni un solo sample: solo osciladores y fe.\"" },
    { role: "GUION Y NARRATIVA", name: "ANDRÉS VOLTIO", note: "\"Toda historia cyberpunk va de lo mismo: recordar quién eres cuando alguien quiere escribirte.\"" },
    { role: "DISEÑO UX/UI", name: "KAI MENDOZA", note: "\"Los pulgares mandan: los sticks nacen donde tocas, no donde diga un manual.\"" },
    { role: "QA Y PRODUCCIÓN", name: "RITA PÍXEL", note: "\"Probado a 60 fps bajo lluvia ácida. Bugs conocidos: cero. Sueño acumulado: sí.\"" },
    { role: "—", name: "ESTUDIO SIETE//SIETE", note: "Siete perfiles, una sola mente sintética. Hecho con cariño en una sola noche para un jugador que dormía. Neo-Madrid, 2087 / Tierra, 2026." }
  ]
};
