const START = { redes: 40, bienestar: 50, responsabilidad: 50 };

const SITUATIONS = [
  {
    showFriend: false,
    text: "📱 Te llega una notificación mientras haces la tarea.",
    a: { label: "Revisar redes", d: { redes: 12, bienestar: -8, responsabilidad: -8 } },
    b: { label: "Ignorar y seguir", d: { redes: -8, bienestar: 8, responsabilidad: 8 } }
  },
  {
    showFriend: true,
    text: "💬 Tus amigos están hablando en el grupo. Quieres enterarte de todo.",
    a: { label: "Entrar al chat", d: { redes: 12, bienestar: -4, responsabilidad: -8 } },
    b: { label: "Escribir después de estudiar", d: { redes: -6, bienestar: 6, responsabilidad: 10 } }
  },
  {
    showFriend: false,
    text: "🍜 Estás comiendo y aparece un video corto en el celular.",
    a: { label: "Ver el video", d: { redes: 10, bienestar: -8, responsabilidad: -4 } },
    b: { label: "Dejar el celular y comer", d: { redes: -8, bienestar: 10, responsabilidad: 4 } }
  },
  {
    showFriend: false,
    text: "😴 Tienes sueño, pero quieres seguir usando el celular.",
    a: { label: "Un rato más…", d: { redes: 12, bienestar: -12, responsabilidad: -4 } },
    b: { label: "Dormir ahora", d: { redes: -10, bienestar: 12, responsabilidad: 6 } }
  },
  {
    showFriend: false,
    text: "📚 Tienes una tarea pendiente para mañana.",
    a: { label: "Posponerla por redes", d: { redes: 12, bienestar: -6, responsabilidad: -12 } },
    b: { label: "Hacerla ahora", d: { redes: -8, bienestar: 6, responsabilidad: 12 } }
  },
  {
    showFriend: true,
    text: "🚶 Un amigo te invita a salir mientras estás en redes.",
    a: { label: "Quedarme en el celular", d: { redes: 10, bienestar: -8, responsabilidad: -6 } },
    b: { label: "Salir un rato", d: { redes: -10, bienestar: 12, responsabilidad: 4 } }
  }
];

const ENDINGS = {
  good: {
    title: "🏆 Uso equilibrado",
    text: "Controlaste tu tiempo en redes. Dormiste, estudiaste y también conectaste con otras personas. Las redes sirven mejor cuando no mandan ellas."
  },
  bad: {
    title: "📱 Uso excesivo",
    text: "El celular ocupó gran parte del día. La tarea, el descanso y las salidas quedaron atrás. Un aviso: el scroll infinito no avisa cuándo parar."
  },
  mid: {
    title: "⚖️ Necesitas encontrar un equilibrio",
    text: "Hubo aciertos y distracciones. No se trata de borrar las redes, sino de elegir cuándo usarlas. Mañana puedes empezar con un límite pequeño."
  }
};

const KEITH = {
  good: {
    title: "🏆 Uso equilibrado",
    text: "<strong>Keith:</strong> ¡Lo lograste! Usaste las redes sin dejar atrás el sueño, la tarea y a tus amigos. Así se hace: el celular es una herramienta, no el jefe del día. ¡Felicidades!"
  },
  bad: {
    title: "📱 Uso excesivo",
    text: "<strong>Keith:</strong> Hoy las redes ganaron. Te dejo 3 consejos:<br>1) Silencia avisos mientras estudias.<br>2) Nada de celular en la cama ni en la comida.<br>3) Queda con alguien en persona al menos un rato. Mañana puedes intentarlo otra vez."
  }
};

const el = (id) => document.getElementById(id);
let stats, step;

const music = { on: false, vol: 0.7 };

function applyVolume() {
  const v = Math.min(1, music.vol);
  el("bgm").volume = v * 0.7;
  const p = el("piano");
  p.volume = v * 0.32;
  p.playbackRate = 0.86;
}

function setMusic(on) {
  music.on = on;
  applyVolume();
  el("btn-music").textContent = on ? "♪ ON" : "♪ OFF";
  ["bgm", "piano"].forEach((id) => {
    const a = el(id);
    if (on) a.play().catch(() => {});
    else a.pause();
  });
}

function clamp(n) {
  return Math.max(0, Math.min(100, n));
}

function paintStats() {
  for (const k of Object.keys(stats)) {
    const bar = el("bar-" + k);
    bar.style.width = stats[k] + "%";
  }
}

function setText(html) {
  const panel = el("panel");
  panel.style.animation = "none";
  void panel.offsetWidth;
  panel.style.animation = "";
  el("text").innerHTML = html;
}

function buttons(items) {
  const box = el("choices");
  box.innerHTML = "";
  items.forEach((item) => {
    const b = document.createElement("button");
    b.className = item.cls;
    b.textContent = item.label;
    b.onclick = item.fn;
    box.appendChild(b);
  });
}

function startScreen() {
  el("game").dataset.screen = "start";
  el("hud").classList.add("hidden");
  el("buddy").classList.add("hidden");
  el("keith-tag").classList.add("hidden");
  setText("EQUILIBRIO DIGITAL<br><small>Una noche. Un celular. Tú decides.</small>");
  buttons([{ cls: "btn-start", label: "▶ JUGAR", fn: () => { setMusic(true); intro(); } }]);
}

function intro() {
  el("game").dataset.screen = "intro";
  el("hud").classList.remove("hidden");
  setText("Eres un estudiante. Keith te observa y, al final del día, te dirá cómo te fue. Elige con calma: cada decisión mueve un poco tus estadísticas.");
  buttons([{ cls: "btn-next", label: "▶ EMPEZAR", fn: () => show(0) }]);
}

function show(i) {
  el("game").dataset.screen = "play";
  step = i;
  const s = SITUATIONS[i];
  el("buddy").classList.toggle("hidden", !s.showFriend);
  el("keith-tag").classList.add("hidden");
  setText(s.text);
  buttons([
    { cls: "btn-a", label: s.a.label, fn: () => choose(s.a.d) },
    { cls: "btn-b", label: s.b.label, fn: () => choose(s.b.d) }
  ]);
}

function choose(delta) {
  for (const k of Object.keys(delta)) stats[k] = clamp(stats[k] + delta[k]);
  paintStats();
  if (step + 1 < SITUATIONS.length) show(step + 1);
  else ending();
}

function showKeith(on) {
  el("buddy").classList.toggle("hidden", !on);
  el("keith-tag").classList.toggle("hidden", !on);
}

function clearConfetti() {
  el("confetti").innerHTML = "";
}

function throwConfetti() {
  const box = el("confetti");
  box.innerHTML = "";
  const colors = ["#ff3cac", "#2de2e6", "#ffe566", "#7dff9a", "#fff"];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "%";
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 0.8 + "s";
    p.style.animationDuration = 1.6 + Math.random() * 1.2 + "s";
    box.appendChild(p);
  }
}

function ending() {
  let key = "mid";
  if (stats.redes <= 40 && stats.bienestar >= 60 && stats.responsabilidad >= 60) key = "good";
  else if (stats.redes >= 70 || (stats.redes >= 60 && stats.responsabilidad <= 40)) key = "bad";

  el("game").dataset.screen = "end-" + key;
  clearConfetti();

  if (key === "good") {
    showKeith(true);
    throwConfetti();
    const e = KEITH.good;
    setText(`<div class="ending"><h2>${e.title}</h2><p>${e.text}</p></div>`);
  } else if (key === "bad") {
    showKeith(true);
    const e = KEITH.bad;
    setText(`<div class="ending"><h2>${e.title}</h2><p>${e.text}</p></div>`);
  } else {
    showKeith(false);
    const e = ENDINGS.mid;
    setText(`<div class="ending"><h2>${e.title}</h2><p>${e.text}</p></div>`);
  }

  buttons([{ cls: "btn-again", label: "Reiniciar", fn: boot }]);
}

function boot() {
  stats = { ...START };
  step = 0;
  clearConfetti();
  showKeith(false);
  paintStats();
  startScreen();
}

boot();
el("btn-music").onclick = () => setMusic(!music.on);
el("vol-music").oninput = () => {
  music.vol = Number(el("vol-music").value) / 100;
  applyVolume();
};
